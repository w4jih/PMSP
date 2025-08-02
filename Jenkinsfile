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
                    --build-arg DATABASE_URL=%DATABASE_URL% ^
                    -t %DOCKER_IMAGE%:%DOCKER_TAG% .
                """
            }
        }

        stage('Push to Docker Hub') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'docker-hub-cred', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    bat """
                        docker login -u %DOCKER_USER% -p %DOCKER_PASS%
                        docker push %DOCKER_IMAGE%:%DOCKER_TAG%
                        docker logout
                    """
                }
            }
        }

        stage('Deploy to Server') {
            steps {
                bat """
                    docker compose down
                    docker pull %DOCKER_IMAGE%:%DOCKER_TAG%
                    docker compose up -d
                """
            }
        }
    }

    post {
        always {
            bat 'docker compose down'
        }
    }
}
