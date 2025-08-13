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
        KUBECONFIG = "C:\\Users\\jenkins\\.kube\\config"
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
        bat """
            minikube delete || true
            echo Starting Minikube...
            minikube start --driver=docker

            REM Création du dossier si inexistant
            mkdir C:\\Users\\jenkins\\.kube || true

            REM Export du kubeconfig généré par minikube vers ce dossier
            minikube kubectl -- config view --raw > C:\\Users\\jenkins\\.kube\\config

            echo ======= kubeconfig content =======
            type C:\\Users\\jenkins\\.kube\\config
        """
    }
}

       stage('Test kubectl') {
    steps {
        bat 'kubectl get nodes --kubeconfig=C:\\Users\\jenkins\\.kube\\config'
    }
}
        stage('Deploy to Kubernetes') {
            steps {
                bat """
                    kubectl apply -f postgres-secret.yaml
                    kubectl apply -f pmsp-app-deployment.yaml
                    kubectl apply -f pmsp-app-service.yaml
                """
            }
        }
    }

    post {
        always {
            bat 'docker compose down'
            bat 'minikube stop || true'
        }
    }
}
