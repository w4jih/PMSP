pipeline {
    agent any

    tools {
        nodejs "NodeJS_20"   // Must match the NodeJS installation name in Jenkins
    }
    

    stages {
        stage('Checkout') {
            steps {
                echo 'Cloning Repository...'
                git branch: 'main', url: 'https://github.com/w4jih/PMSP.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                echo 'Installing npm packages...'
                bat 'npm install'
            }
        }

        stage('Build') {
            steps {
                echo 'Building Next.js backend...'
                bat 'npm run build'
            }
        }

        stage('Prisma Generate') {
            steps {
                bat 'npx prisma generate'
            }
        }

        stage('Prisma Migrations') {
            steps {
                echo 'Running Prisma migrations...'
                bat 'npx prisma migrate deploy'
            }
        }
        stage('Seed Database') {
            steps {
                bat 'npm run seed'
            }
        }

        stage('Tests') {
            steps {
                echo 'Running tests...'
                bat 'npm test'
            }
        }
    }

    post {
        success {
            echo 'Build Successful!'
        }
        failure {
            echo 'Build Failed!'
        }
    }
}
