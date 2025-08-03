/*pipeline {
    agent any
    tools { nodejs 'NodeJS_20' }

    environment {
        COMPOSE_PROJECT_NAME = 'psmp'
        // Jenkins global env vars: DATABASE_URL, JWT_SECRET, ORS_API_KEY, STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY
    }

    stages {
        stage('Checkout') {
            steps {
                echo '📥 Cloning repository…'
                git branch: 'main', url: 'https://github.com/w4jih/PMSP.git'
            }
        }

        stage('Generate .env file') {
            steps {
                echo '📝 Generating .env file…'
                bat """
                echo DATABASE_URL=%DATABASE_URL%            >  .env
                echo JWT_SECRET=%JWT_SECRET%               >> .env
                echo ORS_API_KEY=%ORS_API_KEY%             >> .env
                echo STRIPE_SECRET_KEY=%STRIPE_SECRET_KEY% >> .env
                echo STRIPE_PUBLISHABLE_KEY=%STRIPE_PUBLISHABLE_KEY% >> .env
                """
                bat 'dir /b'
            }
        }

        stage('Docker Compose Build') {
            steps {
                echo '🐳 Building Docker images…'
                bat 'docker compose down -v'
                bat 'docker compose up --build -d'
            }
        }

        stage('Run Tests Inside Container') {
            steps {
                echo '🧪 Running tests inside backend container…'
                bat 'docker exec psmp-backend-1 npm test'
            }
        }
    }

    post {
        success { echo '✅ Build & deployment successful!' }
        failure {
            echo '❌ Build failed – cleaning up…'
            bat 'docker compose down || exit 0'
        }
    }
}
*/

pipeline {
    agent any

    options {
        timestamps()
        ansiColor('xterm')
    }

    tools { nodejs 'NodeJS_20' }

    /* Non-secret globals; real secrets come from Global Env Vars above */
    environment {
        COMPOSE_PROJECT_NAME = 'psmp'
    }

    stages {

        stage('Checkout') {
            steps {
                echo '📥 Cloning repository…'
                git branch: 'main', url: 'https://github.com/w4jih/PMSP.git'
            }
        }

        stage('Generate .env file') {
            steps {
                echo '📝 Generating .env file from Jenkins global env vars…'
                bat """
                echo DATABASE_URL=%DATABASE_URL%                     >  .env
                echo JWT_SECRET=%JWT_SECRET%                         >> .env
                echo ORS_API_KEY=%ORS_API_KEY%                       >> .env
                echo STRIPE_SECRET_KEY=%STRIPE_SECRET_KEY%           >> .env
                echo STRIPE_PUBLISHABLE_KEY=%STRIPE_PUBLISHABLE_KEY% >> .env
                """
                bat 'dir /b'     /* proves .env exists */
            }
        }

        stage('Docker Compose Build') {
            steps {
                echo '🐳 Building Docker images…'
                bat 'docker compose down -v'
                bat 'docker compose up --build -d'
            }
        }

        stage('Run Tests Inside Container') {
            steps {
                echo '🧪 Running tests inside backend container…'
                bat 'docker exec psmp-backend-1 npm test'
            }
        }
    }

    post {
        always {
            echo '🧹 Cleaning up containers & volumes…'
            bat 'docker compose down -v || exit 0'
        }
        success { echo '✅ Build & deployment successful!' }
        failure { echo '❌ Build failed!' }
    }
}
