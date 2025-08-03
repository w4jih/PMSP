pipeline {
    agent any

    tools {
        nodejs "NodeJS_20"
    }

    environment {
        COMPOSE_PROJECT_NAME = "psmp"
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
                echo '📝 Generating .env file from Jenkins global environment variables…'

        bat """
                REM --- create the .env file ---
                echo DATABASE_URL=%DATABASE_URL%            >  .env
                echo JWT_SECRET=%JWT_SECRET%               >> .env
                echo ORS_API_KEY=%ORS_API_KEY%             >> .env
                echo STRIPE_SECRET_KEY=%STRIPE_SECRET_KEY% >> .env
                echo STRIPE_PUBLISHABLE_KEY=%STRIPE_PUBLISHABLE_KEY% >> .env
        """

        echo '📂 Workspace after generating .env:'
        bat 'dir /b'
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
    }

    post {
        success {
            echo '✅ Build & Deployment Successful!'
        }
        failure {
            echo '❌ Build or Deployment Failed!'
            bat 'docker compose down'
        }
    }
}
