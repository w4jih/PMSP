pipeline {
    agent any

    environment {
        IMAGE_NAME = "monimage"
        IMAGE_TAG = "latest"
        MINIKUBE_PROFILE = "minikube"
        APP_NAME = "monapp"
        DOCKERFILE_PATH = "C:/Users/21655/Desktop/PMSP2/PMSP"
    }

    stages {

        stage('Start Minikube') {
            steps {
                powershell """
                minikube start -p ${env.MINIKUBE_PROFILE} --driver=docker
                & minikube -p ${env.MINIKUBE_PROFILE} docker-env --shell powershell | Invoke-Expression
                """
            }
        }

        stage('Build Docker Image in Minikube') {
            steps {
                powershell """
                # Build the image inside Minikube's Docker
                docker build -t ${env.IMAGE_NAME}:${env.IMAGE_TAG} ${env.DOCKERFILE_PATH}
                docker images
                """
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                powershell """
                # Supprime l'ancien déploiement si existant
                kubectl delete deployment ${env.APP_NAME} --ignore-not-found
                kubectl delete service ${env.APP_NAME} --ignore-not-found

                # Crée le déploiement avec l'image locale
                kubectl create deployment ${env.APP_NAME} --image=${env.IMAGE_NAME}:${env.IMAGE_TAG}

                # Attendre que le pod soit prêt
                kubectl wait --for=condition=Ready pod -l app=${env.APP_NAME} --timeout=120s

                # Expose le service
                kubectl expose deployment ${env.APP_NAME} --type=NodePort --port=8080

                # Affiche l'URL du service
                minikube service ${env.APP_NAME} --url
                """
            }
        }

    }

    post {
        always {
            echo "Pipeline terminée !"
        }
    }
}
