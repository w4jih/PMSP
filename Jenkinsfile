pipeline {
    agent any

    environment {
        REGISTRY = "localhost:5000"
        IMAGE_NAME = "monimage"
        IMAGE_TAG = "latest"
    }

    stages {
        stage('Checkout') {
            steps {
                Checkout scm
            }
        }

        stage('Start Minikube') {
            steps {
                script {
                    // Supprime l'ancien cluster
                    bat 'minikube delete || ver'

                    // Démarre Minikube avec Docker driver et proxy configuré
                    bat '''
                        minikube start --driver=docker ^
                        --docker-env HTTP_PROXY= ^
                        --docker-env HTTPS_PROXY= ^
                        --docker-env NO_PROXY=localhost,127.0.0.1,::1,10.0.0.0/8,172.16.0.0/12,192.168.0.0/16,.svc,.cluster.local ^
                        --wait=apiserver,system_pods,default_sa --wait-timeout=6m
                    '''
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                bat '''
                    docker build -t %REGISTRY%/%IMAGE_NAME%:%IMAGE_TAG% .
                '''
            }
        }

        stage('Push Docker Image') {
            steps {
                bat '''
                    docker push %REGISTRY%/%IMAGE_NAME%:%IMAGE_TAG%
                '''
            }
        }

        stage('Deploy to Minikube') {
            steps {
                script {
                    bat '''
                        kubectl apply -f pmsp-app-deployment.yaml
                        kubectl apply -f pmsp-app-service.yaml
                    '''
                }
            }
        }
    }

    post {
        always {
            bat 'minikube status'
        }
    }
}
