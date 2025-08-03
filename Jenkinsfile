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

/*  ──────────────────────────────────────────────────────────────────────────────
    CI for PMSP backend – uses secrets stored in Jenkins

    • Works on a Windows agent (uses bat).
    • Uses NodeJS tool named “NodeJS_20”.
    • COMPOSE_PROJECT_NAME = psmp (namespaces containers).
    • Secrets are pulled from Jenkins credentials *or* global env vars.
   ──────────────────────────────────────────────────────────────────────────── */

pipeline {
    agent any

    /* Better logs */
    options {
        timestamps()
        ansiColor('xterm')
    }

    /* Tools installed on the agent */
    tools {
        nodejs 'NodeJS_20'
    }

    /* Non-secret globals */
    environment {
        COMPOSE_PROJECT_NAME = 'psmp'
    }

    stages {

        /* 1 ▸ Checkout source code */
        stage('Checkout') {
            steps {
                echo '📥 Cloning repository…'
                git branch: 'main', url: 'https://github.com/w4jih/PMSP.git'
            }
        }

        /* 2 ▸ Pull secrets & create .env  */
        stage('Generate .env file') {
            /*
               ─────────────────────────────────────────────────────────────────
               Two ways to get secrets:

               A) SIMPLE – you already put them in
                  “Manage Jenkins ▸ Configure System ▸ Global Environment Variables”.
                  Then <env.DATABASE_URL> etc. are automatically available.

               B) SECURE – store each secret as a Credential:

                  • Jenkins ▸ Credentials ▸ (Global) ▸ Add Credential
                      - Kind: “Secret text”
                      - ID  : DB_URL
                      - Secret: postgres://…
                  • Repeat for JWT_SECRET, ORS_API_KEY, STRIPE_SECRET_KEY, …
               ─────────────────────────────────────────────────────────────────
            */
            steps {
                script {
                    /* ----  Credentials binding block  ---- */
                     {
                        /*  Fallback: if you kept using global env vars,
                            the following %VAR% still resolve fine.       */
                        echo '📝 Writing .env …'
                        bat """
                        echo DATABASE_URL=%DB_URL%                     >  .env
                        echo JWT_SECRET=%JWT_SECRET%                   >> .env
                        echo ORS_API_KEY=%ORS_API_KEY%                 >> .env
                        echo STRIPE_SECRET_KEY=%STRIPE_SECRET_KEY%     >> .env
                        echo STRIPE_PUBLISHABLE_KEY=%STRIPE_PUBLISHABLE_KEY% >> .env
                        """

                        /*  Show workspace listing for sanity (but not secrets)  */
                        bat 'echo Workspace contents: & dir /b'
                    }
                }
            }
        }

        /* 3 ▸ Build & start services */
        stage('Docker Compose Build') {
            steps {
                echo '🐳 Building Docker images…'
                bat 'docker compose down -v'
                bat 'docker compose up --build -d'
            }
        }

        /* 4 ▸ Run Jest tests inside the running backend container */
        stage('Run Tests Inside Container') {
            steps {
                echo '🧪 Running tests inside backend container…'
                bat 'docker exec psmp-backend-1 npm test'
            }
        }
    }

    /* Always clean up containers/volumes */
    post {
        always {
            echo '🧹 Cleaning up containers & volumes…'
            bat 'docker compose down -v || exit 0'
        }
        success {
            echo '✅ Build & deployment successful!'
        }
        failure {
            echo '❌ Build failed!'
        }
    }
}
