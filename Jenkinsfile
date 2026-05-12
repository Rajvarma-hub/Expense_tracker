pipeline {
    agent any

    environment {
        AWS_REGION = 'ap-south-1'
    }

    stages {

        stage('Get Terraform Outputs') {
            steps {
                script {
                    env.BACKEND_ECR = sh(
                        script: "cd terraform && terraform output -raw backend_ecr_url",
                        returnStdout: true
                    ).trim()

                    env.FRONTEND_ECR = sh(
                        script: "cd terraform && terraform output -raw frontend_ecr_url",
                        returnStdout: true
                    ).trim()
                }
            }
        }

        stage('Build Containers') {
            steps {
                sh 'docker-compose build'
            }
        }

        stage('Tag Backend Image') {
            steps {
                sh 'docker tag expense-tracker-pipeline-backend:latest $BACKEND_ECR:latest'
            }
        }

        stage('Tag Frontend Image') {
            steps {
                sh 'docker tag expense-tracker-pipeline-frontend:latest $FRONTEND_ECR:latest'
            }
        }

        stage('Push Backend Image') {
            steps {
                sh 'docker push $BACKEND_ECR:latest'
            }
        }

        stage('Push Frontend Image') {
            steps {
                sh 'docker push $FRONTEND_ECR:latest'
            }
        }

        stage('Deploy To Kubernetes') {
            steps {
                sh 'kubectl apply -f k8s/'
            }
        }
    }
}