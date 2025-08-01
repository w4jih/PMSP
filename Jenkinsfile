pipeline {
    agent any

    environment {
        POSTGRES_USER = 'postgres'
        POSTGRES_PASSWORD = "glace 123"
        POSTGRES_DB = 'mydb'
        DATABASE_URL = 'postgresql://postgres:glace 123@localhost:5432/mydb'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Start PostgreSQL') {
            steps {
                script {
                    docker.image('postgres:15').withRun("-e POSTGRES_USER=${POSTGRES_USER} -e POSTGRES_PASSWORD='${POSTGRES_PASSWORD}' -e POSTGRES_DB=${POSTGRES_DB} -p 5432:5432") { postgres ->
                        // Wait for PostgreSQL to be ready
                        sh 'sleep 15'
                    }
                }
            }
        }

        stage('Setup Node.js') {
            steps {
                sh 'curl -fsSL https://deb.nodesource.com/setup_20.x | bash -'
                sh 'apt-get install -y nodejs'
                sh 'npm ci'
            }
        }

        stage('Prisma Generate & Migrate') {
            steps {
                sh 'npx prisma generate'
                sh 'npx prisma migrate deploy'
            }
        }

        stage('Run Tests') {
            steps {
                sh 'npm test'
            }
        }
    }
}
