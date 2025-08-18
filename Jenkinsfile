pipeline {
  agent any
  options { timestamps() }
  tools { nodejs 'NodeJS_20' }

  environment {
    IMAGE_LOCAL = 'w4jih/pmsp-app:latest'
    KUBE_NS     = 'psmp'
    KUBECONFIG = "C:\Users\jenkins\.kube\config"
    POSTGRES_PASSWORD = 'glace 123'
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
        echo === Resetting Minikube ===
        minikube delete || ver >NUL

        echo === Starting Minikube ===
        minikube start --driver=docker --wait=apiserver,system_pods,default_sa --wait-timeout=6m

        echo === Setting kubeconfig ===
        if not exist %KUBECONFIG% mkdir %KUBECONFIG%
        minikube kubectl -- config view --raw > %KUBECONFIG%

        echo === Minikube status ===
        minikube status

        echo === Checking nodes ===
        kubectl get nodes --kubeconfig=%KUBECONFIG%
        '''
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
        bat 'minikube image ls | findstr w4jih/pmsp-app'
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
        bat 'kubectl rollout status deploy/pmsp-app --timeout=6m'

        echo '🔎 Pods:'
        bat 'kubectl get pods -o wide'

        echo '🧪 Smoke Test via kubectl port-forward'
        powershell '''
          $ErrorActionPreference = "Stop"

          $pf = Start-Process -FilePath "kubectl" `
                -ArgumentList @("-n",$env:KUBE_NS,"port-forward","svc/pmsp-app-service","3001:3000","--address=127.0.0.1") `
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
        bat 'kubectl -n monitoring get deploy,sts,po -o wide'
        bat 'kubectl -n monitoring rollout status deploy -l app.kubernetes.io/name=kube-prometheus-stack-operator --timeout=8m || ver>NUL'
        bat 'kubectl -n monitoring rollout status deploy -l app.kubernetes.io/name=prometheus-operator --timeout=8m'
      }
    }
  }

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
