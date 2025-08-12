pipeline {
    agent any

    tools { 
        nodejs "NodeJS_20"
    }

    environment {
        POSTGRES_USER = 'postgres'
        POSTGRES_PASSWORD = 'glace 123'
        POSTGRES_DB = 'mydb'
        DATABASE_URL = 'postgresql://postgres:glace 123@localhost:5433/mydb'
        DOCKER_IMAGE = 'w4jih/pmsp-app'
        DOCKER_TAG = 'latest'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Start PostgreSQL with Docker Compose') {
            steps {
                script {
                    bat 'docker compose down'
                    bat 'docker compose up -d db'
                    bat 'ping -n 15 127.0.0.1 > nul'
                }
            }
        }

        stage('Install Dependencies') {
            steps {
                bat 'npm ci'
            }
        }

        stage('Prisma Generate & Migrate') {
            steps {
                bat 'npx prisma generate'
                bat 'npx prisma migrate deploy'
            }
        }

        stage('Run Tests') {
            steps {
                bat 'npm test'
            }
        }

        stage('Build Docker Image') {
            steps {
                bat """
                    docker build ^
                        --build-arg DATABASE_URL="postgresql://postgres:glace 123@localhost:5433/mydb" ^
                        -t %DOCKER_IMAGE%:%DOCKER_TAG% .
                """
            }
        }

        stage('Start Minikube') {
            steps {
                bat '''
                    echo "=== Starting Minikube ==="
                    mkdir -p $(dirname "$KUBECONFIG")
                    
                    minikube start \
                        --driver=docker \
                        --docker-env HTTP_PROXY=$HTTP_PROXY \
                        --docker-env HTTPS_PROXY=$HTTPS_PROXY

                    minikube kubectl -- config view --raw > "$KUBECONFIG"
                '''
            }
        }

        stage('Test Kubectl') {
            steps {
                bat '''
                    echo "=== Testing kubectl ==="
                    kubectl get nodes
                    kubectl get pods -A
                '''
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                withCredentials([file(credentialsId: 'kubeconfig-cred', variable: 'KUBECONFIG')]) {
                    bat """
                        kubectl apply -f postgres-secret.yaml
                        kubectl apply -f pmsp-app-deployment.yaml
                        kubectl apply -f pmsp-app-service.yaml
                    """
                }
            }
        }
    }

    post {
        always {
            bat 'minikube stop || true'
        }
    }
}
