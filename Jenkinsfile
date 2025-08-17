pipeline {
    agent any

    environment {
        IMAGE_NAME = "monimage"
        IMAGE_TAG = "latest"
        MINIKUBE_PROFILE = "minikube"
        APP_NAME = "monapp"
        DOCKERFILE_PATH = "C:/Users/21655/Desktop/PMSP2/PMSP"
    }

    stages {

        stage('Start Minikube') {
            steps {
                powershell """
                minikube start -p ${env.MINIKUBE_PROFILE} --driver=docker
                & minikube -p ${env.MINIKUBE_PROFILE} docker-env --shell powershell | Invoke-Expression
                """
            }
        }

        stage('Build Docker Image') {
            steps {
                powershell """
                docker build -t ${env.IMAGE_NAME}:${env.IMAGE_TAG} ${env.DOCKERFILE_PATH}
                docker images
                """
            }
        }

        stage('Create Kubernetes Deployment YAML') {
            steps {
                powershell """
                @\"
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${env.APP_NAME}
spec:
  replicas: 1
  selector:
    matchLabels:
      app: ${env.APP_NAME}
  template:
    metadata:
      labels:
        app: ${env.APP_NAME}
    spec:
      containers:
      - name: ${env.APP_NAME}-container
        image: ${env.IMAGE_NAME}:${env.IMAGE_TAG}
        ports:
        - containerPort: 8080
"@ | Out-File -FilePath .\\deployment.yaml -Encoding UTF8
                """
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                powershell """
                kubectl apply -f .\\deployment.yaml
                kubectl get pods
                kubectl expose deployment ${env.APP_NAME} --type=NodePort --port=8080
                minikube service ${env.APP_NAME} --url
                """
            }
        }

    }

    post {
        always {
            echo "Pipeline terminée !"
        }
    }
}
