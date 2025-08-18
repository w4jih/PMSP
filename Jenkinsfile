pipeline {
    agent any

    environment {
        APP_NAME = "monapp"
        IMAGE_NAME = "monimage:latest"
        DOCKER_TLS_VERIFY = "1"
        DOCKER_HOST = "tcp://127.0.0.1:63008"
        DOCKER_CERT_PATH = "C:\Users\21655\.minikube\certs"
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'pipeline', url: 'https://github.com/w4jih/PMSP.git'
            }
        }

        stage('Configure Docker with Minikube') {
            steps {
                powershell '''
                    # Configure Docker to use Minikube's Docker daemon
                    & minikube -p minikube docker-env --shell powershell | Invoke-Expression

                    # Show Docker info to confirm
                    docker ps
                '''
            }
        }

        stage('Build Docker Image') {
            steps {
                powershell '''
                    docker build -t ${env.IMAGE_NAME} .
                    docker images
                '''
            }
        }

        stage('Deploy to Minikube') {
            steps {
                powershell '''
                    # Delete old deployment if exists
                    kubectl delete deployment ${env.APP_NAME} --ignore-not-found=true

                    # Create new deployment with the fresh local image
                    kubectl create deployment ${env.APP_NAME} --image=${env.IMAGE_NAME}

                    # Expose the service on a NodePort (accessible via minikube service)
                    kubectl expose deployment ${env.APP_NAME} --type=NodePort --port=8080
                '''
            }
        }

        stage('Get Service URL') {
            steps {
                powershell '''
                    minikube service ${env.APP_NAME} --url
                '''
            }
        }
    }
}
