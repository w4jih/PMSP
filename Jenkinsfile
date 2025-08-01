pipeline {
    agent any

    tools {
        nodejs "NodeJS_20"   // Optional, needed only if you lint/test outside Docker
    }

    environment {
        COMPOSE_PROJECT_NAME = "psmp"    // Optional, helps namespace Docker resources
    }

    stages {
        stage('Checkout') {
            steps {
                echo '📥 Cloning Repository...'
                git branch: 'main', url: 'https://github.com/w4jih/PMSP.git'
            }
        }

        stage('Docker Compose Build') {
            steps {
                echo '🐳 Building Docker images...'
                bat 'docker compose down -v'
                bat 'docker compose up --build -d'
            }
        }

        stage('Run Tests Inside Container') {
            steps {
                echo '🧪 Running tests inside backend container...'
                bat 'docker exec psmp-backend-1 npm test'
            }
        }

        // Optional: Linting or vulnerability scanning can go here

        // Optional: Seed DB if not already done inside your container
        // stage('Seed Database') {
        //     steps {
        //         bat 'docker exec psmp-backend-1 npm run seed'
        //     }
        // }
    }

    post {
        success {
            echo '✅ Build & Deployment Successful!'
        }
        failure {
            echo '❌ Build or Deployment Failed!'
            // Optional: clean up containers on failure
            bat 'docker compose down'
        }
    }
}