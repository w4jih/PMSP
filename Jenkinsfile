
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


    stage('Ensure Minikube Running') {
      steps {
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
        // Recreate secrets each run to keep them fresh
        bat '''
kubectl -n %KUBE_NS% delete secret backend-secrets --ignore-not-found
kubectl -n %KUBE_NS% create secret generic backend-secrets ^
  --from-literal=POSTGRES_PASSWORD="%POSTGRES_PASSWORD%" ^
  --from-literal=JWT_SECRET="%JWT_SECRET%" ^
  --from-literal=ORS_API_KEY="%ORS_API_KEY%" ^
  --from-literal=STRIPE_SECRET_KEY="%STRIPE_SECRET_KEY%" ^
  --from-literal=STRIPE_PUBLISHABLE_KEY="%STRIPE_PUBLISHABLE_KEY%" ^
  --from-literal=DATABASE_URL="postgresql://postgres:%POSTGRES_PASSWORD%@postgres.%KUBE_NS%.svc.cluster.local:5432/mydb?schema=public"
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
        bat 'kubectl -n %KUBE_NS% rollout status deploy/backend --timeout=180s'
        echo '🔎 Pods:'
        bat 'kubectl -n %KUBE_NS% get pods -o wide'
        echo '🌐 Service URL (Minikube):'
        bat 'minikube service backend -n %KUBE_NS% --url'
      }
    }
  }

  post {
    success { echo '✅ Deploy to Minikube succeeded.' }
    failure {
      echo '❌ Deploy failed. Recent events:'
      bat 'kubectl -n %KUBE_NS% get events --sort-by=.lastTimestamp | tail -n 50'
    }
  }
}

