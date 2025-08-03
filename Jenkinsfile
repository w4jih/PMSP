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

        stage('Generate .env file') {
            steps {
                echo '📝 Generating .env file from Jenkins global environment variables...'
                writeFile file: '.env', text:""" 
                DATABASE_URL=${env.DATABASE_URL}
                JWT_SECRET=${env.JWT_SECRET}
                ORS_API_KEY=${env.ORS_API_KEY}
                STRIPE_SECRET_KEY=${env.STRIPE_SECRET_KEY}
                STRIPE_PUBLISHABLE_KEY=${env.STRIPE_PUBLISHABLE_KEY}
                """}}

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
