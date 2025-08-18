/*
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

    echo '🧪 Smoke Test via kubectl port-forward'
    powershell '''
      $ErrorActionPreference = "Stop"

      # Start background port-forward: localhost:3001 -> svc/backend:3000
      $pf = Start-Process -FilePath "kubectl" `
            -ArgumentList @("-n",$env:KUBE_NS,"port-forward","svc/backend","3001:3000","--address=127.0.0.1") `
            -WindowStyle Hidden -PassThru

      try {
        # Wait until port-forward is ready (max ~20s)
        $deadline = [DateTime]::UtcNow.AddSeconds(20)
        do {
          Start-Sleep -Seconds 1
          $ok = (Test-NetConnection 127.0.0.1 -Port 3001).TcpTestSucceeded
        } while (-not $ok -and [DateTime]::UtcNow -lt $deadline)

        if (-not $ok) { throw "port-forward did not become ready in time" }

        # Call health endpoint (bypass any system proxy)
        $r = Invoke-WebRequest "http://127.0.0.1:3001/api/health" -UseBasicParsing -TimeoutSec 20 -Proxy $null
        Write-Host "Health:" $($r.StatusCode) $($r.Content)
        if ($r.StatusCode -ne 200) { throw "Health check failed" }
      }
      finally {
        if ($pf -and -not $pf.HasExited) { Stop-Process -Id $pf.Id -Force }
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
*/

pipeline {
  agent any
  options { timestamps() }
  tools { nodejs 'NodeJS_20' }

  environment {
    IMAGE_LOCAL = 'psmp-backend:latest'
    KUBE_NS     = 'psmp'
  }

  stages {

    stage('Checkout') {
      steps {
        echo '📥 Cloning repository…'
        git branch: 'pipeline', url: 'https://github.com/w4jih/PMSP.git'
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
        echo '🚀 Ensuring Minikube…'
        bat '''
minikube delete || ver >NUL
minikube start --driver=docker ^
  --docker-env HTTP_PROXY= ^
  --docker-env HTTPS_PROXY= ^
  --docker-env NO_PROXY=localhost,127.0.0.1,::1,10.0.0.0/8,172.16.0.0/12,192.168.0.0/16,.svc,.cluster.local ^
  --docker-env no_proxy=localhost,127.0.0.1,::1,10.0.0.0/8,172.16.0.0/12,192.168.0.0/16,.svc,.cluster.local ^
  --wait=apiserver,system_pods,default_sa --wait-timeout=6m
'''
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
        bat 'kubectl apply -f postgres-secret.yaml'
        bat 'kubectl apply -f pmsp-app-deployment.yaml'
        bat 'kubectl apply -f pmsp-app-service.yaml'
      }
    }

    stage('Wait for Rollout & Smoke Test') {
      steps {
        echo '⏳ Waiting for rollout…'
        bat 'kubectl -n %KUBE_NS% rollout status deploy/backend --timeout=6m'

        echo '🔎 Pods:'
        bat 'kubectl -n %KUBE_NS% get pods -o wide'

        echo '🧪 Smoke Test via kubectl port-forward'
        powershell '''
          $ErrorActionPreference = "Stop"

          $pf = Start-Process -FilePath "kubectl" `
                -ArgumentList @("-n",$env:KUBE_NS,"port-forward","svc/backend","3001:3000","--address=127.0.0.1") `
                -WindowStyle Hidden -PassThru
          try {
            $deadline = [DateTime]::UtcNow.AddSeconds(25)
            do { Start-Sleep 1; $ok = (Test-NetConnection 127.0.0.1 -Port 3001).TcpTestSucceeded } while (-not $ok -and [DateTime]::UtcNow -lt $deadline)
            if (-not $ok) { throw "port-forward did not become ready in time" }

            $h = Invoke-WebRequest "http://127.0.0.1:3001/api/health" -UseBasicParsing -TimeoutSec 20 -Proxy $null
            if ($h.StatusCode -ne 200) { throw "Health check failed $($h.StatusCode)" }

            $m = Invoke-WebRequest "http://127.0.0.1:3001/api/metrics" -UseBasicParsing -TimeoutSec 20 -Proxy $null
            Write-Host ($m.Content.Substring(0,[Math]::Min(400,$m.Content.Length)))
            if (-not ($m.Content -match "# HELP")) { throw "Metrics endpoint did not return Prometheus exposition format" }
          }
          finally {
            if ($pf -and -not $pf.HasExited) { Stop-Process -Id $pf.Id -Force }
          }
        '''
      }
    }

    /* ===== Monitoring stack: Prometheus Operator + Grafana + ServiceMonitor ===== */

    stage('Install/Upgrade Monitoring Stack') {
  steps {
    echo '📈 Ensuring kube-prometheus-stack is installed…'
    bat '''
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
helm upgrade --install monitoring prometheus-community/kube-prometheus-stack ^
  --namespace monitoring --create-namespace ^
  --set grafana.enabled=true
'''

    // Show what got created (helps future debug)
    bat 'kubectl -n monitoring get deploy,sts,po -o wide'

    // Try label used by recent charts
    bat 'kubectl -n monitoring rollout status deploy -l app.kubernetes.io/name=kube-prometheus-stack-operator --timeout=8m || ver>NUL'

    // Fallback label used by some versions
    bat 'kubectl -n monitoring rollout status deploy -l app.kubernetes.io/name=prometheus-operator --timeout=8m'
  }
}


    /*stage('Apply Monitoring CRs') {
      steps {
        echo '🛰️ Applying ServiceMonitor (and optional alerts)…'
        // Ensure the Service in k8s/backend.yaml has ports.name: http
        bat 'kubectl apply -f monitoring/servicemonitor-backend.yaml'
        // Optional PrometheusRule if you created it:
        bat 'if exist monitoring\\prometheusrule-backend.yaml kubectl apply -f monitoring\\prometheusrule-backend.yaml'
        bat 'kubectl -n monitoring get servicemonitors'
      }
    }

    stage('Verify Prometheus Target') {
      steps {
        echo '🔍 Verifying Prometheus sees backend target…'
        // Quick check that Endpoints exist and port is named http
        bat 'kubectl -n %KUBE_NS% get svc backend -o yaml'
        bat 'kubectl -n %KUBE_NS% get endpoints backend -o wide'
        // Optional: list discovered targets from Prometheus Operator ServiceMonitors
        bat 'kubectl -n monitoring get servicemonitors,prometheusrules'
      }
    }
  }*/

  post {
    success { echo '✅ Deploy to Minikube + Monitoring succeeded.' }
    failure {
      echo '❌ Deploy failed. Recent diagnostics:'
      powershell '''
        Write-Host "---- minikube status"
        minikube status
        Write-Host "`n---- minikube logs --problems"
        minikube logs --problems | Out-String | Write-Host
        Write-Host "`n---- kubectl get pods -A"
        kubectl get pods -A -o wide | Out-String | Write-Host
        Write-Host "`n---- monitoring namespace objects"
        kubectl -n monitoring get all,servicemonitors,prometheusrules | Out-String | Write-Host
      '''
    }
  }
}

