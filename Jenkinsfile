pipeline {
    agent any

    environment {
        AWS_REGION = 'ap-south-1'

        BACKEND_ECR = '299139630689.dkr.ecr.ap-south-1.amazonaws.com/expense-backend'
        FRONTEND_ECR = '299139630689.dkr.ecr.ap-south-1.amazonaws.com/expense-frontend'
    }

    stages {

        stage('Build Containers') {
            steps {
                sh 'docker-compose build'
            }
        }

        stage('Tag Backend Image') {
            steps {
                sh 'docker tag backend:latest $BACKEND_ECR:latest'
            }
        }

        stage('Tag Frontend Image') {
            steps {
                sh 'docker tag frontend:latest $FRONTEND_ECR:latest'
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

    }
}