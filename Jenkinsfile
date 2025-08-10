
//working jenkins file
/*
pipeline {
    agent any

    options {
        timestamps()
        
    }

    tools { nodejs 'NodeJS_20' }

    //Non-secret globals; real secrets come from Global Env Vars above 
    environment {
        COMPOSE_PROJECT_NAME = 'psmp'
    }

    stages {

        stage('Checkout') {
            steps {
                echo '📥 Cloning repository…'
                git branch: 'main', url: 'https://github.com/w4jih/PMSP.git'
            }
        }

        stage('Generate .env file') {
            steps {
                echo '📝 Generating .env file from Jenkins global env vars…'
                bat """
                echo DATABASE_URL=%DATABASE_URL%                     >  .env
                echo JWT_SECRET=%JWT_SECRET%                         >> .env
                echo ORS_API_KEY=%ORS_API_KEY%                       >> .env
                echo STRIPE_SECRET_KEY=%STRIPE_SECRET_KEY%           >> .env
                echo STRIPE_PUBLISHABLE_KEY=%STRIPE_PUBLISHABLE_KEY% >> .env
                """
                bat 'dir /b'     //proves .env exists 
            }
        }

        stage('Docker Compose Build') {
            steps {
                echo '🐳 Building Docker images…'
                bat 'docker compose down -v'
                bat 'docker compose up --build -d'
            }
        }

        stage('Run Tests Inside Container') {
            steps {
                echo '🧪 Running tests inside backend container…'
                bat 'docker exec psmp-backend-1 npm test'
            }
        }
    }

    post {
        always {
            echo '🧹 Cleaning up containers & volumes…'
            bat 'docker compose down -v || exit 0'
        }
        success { echo '✅ Build & deployment successful!' }
        failure { echo '❌ Build failed!' }
    }
}*/


pipeline {
  agent any
  options { timestamps() }
  tools { nodejs 'NodeJS_20' }

  environment {
    IMAGE_LOCAL = 'psmp-backend:latest'
    KUBE_NS = 'psmp'
  }

  stages {
    stage('Checkout') {
      steps {
        echo '📥 Cloning repository…'
        git branch: 'main', url: 'https://github.com/w4jih/PMSP.git'
      }
    }

    stage('Preflight') {
     steps {
       bat 'where docker'
       bat 'docker version'
       bat 'docker ps'
   }
   }

   stage('Docker Proxy Check') {
  steps {
    bat 'docker info | findstr /I proxy'
  }
  }



    stage('Ensure Minikube Running') {
      steps {
        bat '''
minikube delete || ver >NUL
minikube start --driver=docker ^
  --docker-env HTTP_PROXY= ^
  --docker-env HTTPS_PROXY= ^
  --docker-env NO_PROXY=localhost,127.0.0.1,::1,10.0.0.0/8,172.16.0.0/12,192.168.0.0/16,.svc,.cluster.local ^
  --docker-env no_proxy=localhost,127.0.0.1,::1,10.0.0.0/8,172.16.0.0/12,192.168.0.0/16,.svc,.cluster.local ^
  --wait=apiserver,system_pods,default_sa --wait-timeout=6m
'''

        echo '🚀 Starting/ensuring Minikube…'
        bat 'minikube start --driver=docker'
        bat 'kubectl get nodes'
      }
    }

    stage('Build Docker Image') {
      steps {
        echo '🐳 Building backend image…'
        bat 'docker build -t %IMAGE_LOCAL% .'
      }
    }

    stage('Load Image into Minikube') {
      steps {
        echo '📦 Loading image into Minikube…'
        bat 'minikube image load %IMAGE_LOCAL%'
        // Optional: prove it landed in minikube cache
        bat 'minikube image ls | findstr psmp-backend'
      }
    }

    stage('Create Namespace & Secrets') {
  steps {
    echo '🔐 Creating namespace & secrets…'
    bat 'kubectl get ns %KUBE_NS% || kubectl create ns %KUBE_NS%'
    powershell '''
      $ns = $env:KUBE_NS
      $pw = $env:POSTGRES_PASSWORD
      if ([string]::IsNullOrEmpty($pw)) { Write-Error "POSTGRES_PASSWORD is empty"; exit 1 }

      # URL-encode just the password part for the URI
      $pwEnc = [System.Uri]::EscapeDataString($pw)

      $dbUrl = "postgresql://postgres:${pwEnc}@postgres.$ns.svc.cluster.local:5432/mydb?schema=public"

      kubectl -n $ns delete secret backend-secrets --ignore-not-found | Out-Null
      kubectl -n $ns create secret generic backend-secrets `
        --from-literal=POSTGRES_PASSWORD="$pw" `
        --from-literal=JWT_SECRET="$env:JWT_SECRET" `
        --from-literal=ORS_API_KEY="$env:ORS_API_KEY" `
        --from-literal=STRIPE_SECRET_KEY="$env:STRIPE_SECRET_KEY" `
        --from-literal=STRIPE_PUBLISHABLE_KEY="$env:STRIPE_PUBLISHABLE_KEY" `
        --from-literal=DATABASE_URL="$dbUrl"
    '''
  }
}


    stage('Apply Manifests') {
      steps {
        echo '📄 Applying K8s manifests…'
        bat 'kubectl apply -f k8s/namespace.yaml'
        bat 'kubectl apply -f k8s/postgres.yaml'
        bat 'kubectl apply -f k8s/backend.yaml'
      }
    }

    stage('Wait for Rollout & Smoke Test') {
      steps {
        echo '⏳ Waiting for rollout…'
        bat 'kubectl -n %KUBE_NS% rollout status deploy/backend --timeout=6m'
        echo '🔎 Pods:'
        bat 'kubectl -n %KUBE_NS% get pods -o wide'
        echo '🌐 Service URL (Minikube):'
        echo '🌐 Service URL (NodePort) + Smoke Test'
powershell '''
  $ip   = (minikube ip).Trim()
  # If you prefer not to hardcode, fetch the NodePort dynamically:
  $port = (minikube kubectl -- -n $env:KUBE_NS get svc backend -o jsonpath="{.spec.ports[0].nodePort}")
  if (-not $port) { $port = 30080 }   # fallback to your YAML’s nodePort
  $url  = "http://$ip:$port"
  Write-Host "Service URL: $url"

  try {
    $r = Invoke-WebRequest "$url/api/health" -UseBasicParsing -TimeoutSec 20
    Write-Host "Health:" $r.StatusCode $r.Content
    if ($r.StatusCode -ne 200) { throw "Health check failed" }
  } catch {
    Write-Error $_
    exit 1
  }
'''

      }
    }
  }

  post {
  success { echo '✅ Deploy to Minikube succeeded.' }
  failure {
    echo '❌ Deploy failed. Recent diagnostics:'
    powershell '''
      Write-Host "---- minikube status"
      minikube status
      Write-Host "`n---- minikube logs --problems"
      minikube logs --problems | Out-String | Write-Host
      Write-Host "`n---- kubectl get pods -A"
      kubectl get pods -A -o wide | Out-String | Write-Host
    '''
  }
}
}

