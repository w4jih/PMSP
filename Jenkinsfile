pipeline {
    agent any

    tools { 
        nodejs "NodeJS_20"
    }

    environment {
        POSTGRES_USER     = 'postgres'
        POSTGRES_PASSWORD = 'glace 123'
        POSTGRES_DB       = 'mydb'
        DATABASE_URL      = 'postgresql://postgres:glace 123@localhost:5433/mydb'
        DOCKER_IMAGE      = 'w4jih/pmsp-app'
        DOCKER_TAG        = 'latest'
        KUBECONFIG        = "C:\\Users\\jenkins\\.kube\\config"
    }

    stages {

        /* === 1. Récupération du code === */
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        /* === 2. Lancer PostgreSQL via Docker Compose === */
        stage('Start PostgreSQL with Docker Compose') {
            steps {
                script {
                    bat 'docker compose down'
                    bat 'docker compose up -d db'
                    bat 'ping -n 15 127.0.0.1 > nul' // Attente 15s pour DB
                }
            }
        }

        /* === 3. Installer les dépendances NPM === */
        stage('Install Dependencies') {
            steps {
                bat 'npm ci'
            }
        }

        /* === 4. Prisma - Génération & Migration === */
        stage('Prisma Generate & Migrate') {
            steps {
                bat 'npx prisma generate'
                bat 'npx prisma migrate deploy'
            }
        }

        /* === 5. Lancer les tests === */
        stage('Run Tests') {
            steps {
                bat 'npm test'
            }
        }

        /* === 6. Construire l'image Docker === */
        stage('Build Docker Image') {
            steps {
                bat """
                    docker build ^
                        --build-arg DATABASE_URL="postgresql://postgres:glace 123@localhost:5433/mydb" ^
                        -t %DOCKER_IMAGE%:%DOCKER_TAG% .
                """
            }
        }

        /* === 7. Nettoyage + Démarrage Minikube === */
        stage('Start Minikube') {
            steps {
                bat """
                    REM Nettoyage complet Minikube
                    minikube delete --all --purge

                    REM Supprimer le conteneur minikube si existe
                    for /f %%i in ('docker ps -a -q --filter "name=minikube"') do docker rm -f %%i

                    REM Nettoyage volumes
                    docker volume prune -f

                    REM Démarrage du cluster
                    minikube start --driver=docker
                    minikube status

                    REM Préparation du kubeconfig
                    mkdir C:\\Users\\jenkins\\.kube 2>nul
                    minikube kubectl -- config view --raw > C:\\Users\\jenkins\\.kube\\config

                    echo ======= kubeconfig content =======
                    type C:\\Users\\jenkins\\.kube\\config
                """
            }
        }

        /* === 8. Vérifier le cluster === */
        stage('Check Cluster') {
            steps {
                bat 'kubectl config get-contexts --kubeconfig=%KUBECONFIG%'
                bat 'kubectl get nodes --kubeconfig=%KUBECONFIG%'
            }
        }

        /* === 9. Déployer sur Kubernetes === */
        stage('Deploy to Kubernetes') {
            steps {
                bat """
                    kubectl apply -f postgres-secret.yaml --kubeconfig=%KUBECONFIG%
                    kubectl apply -f pmsp-app-deployment.yaml --kubeconfig=%KUBECONFIG%
                    kubectl apply -f pmsp-app-service.yaml --kubeconfig=%KUBECONFIG%
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
