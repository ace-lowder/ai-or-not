pipeline {
    agent any

    environment {
        AWS_REGION = 'us-west-2'  // Set your AWS region
        ECR_REPO = '762233763836.dkr.ecr.us-west-2.amazonaws.com/ai-or-not'  // Your ECR repo URL
        DOCKER_IMAGE = "${ECR_REPO}:${env.BUILD_ID}"  // Tag Docker image with the build ID
    }

    stages {
        stage('Build Docker Image') {
            steps {
                script {
                    docker.build(DOCKER_IMAGE)  // Build Docker image
                }
            }
        }

        stage('Push to ECR') {
            steps {
                withCredentials([[$class: 'AmazonWebServicesCredentialsBinding', credentialsId: 'aws-access-key']]) {
                    script {
                        // Echo the access key and secret key for debugging
                        sh '''
                        echo "AWS_ACCESS_KEY_ID: ${AWS_ACCESS_KEY_ID}"
                        echo "AWS_SECRET_ACCESS_KEY: ${AWS_SECRET_ACCESS_KEY}"
                        '''
                        // Log in to ECR
                        sh '''
                        aws configure set aws_access_key_id ${AWS_ACCESS_KEY_ID}
                        aws configure set aws_secret_access_key ${AWS_SECRET_ACCESS_KEY}
                        aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_REPO
                        '''
                        // Push the Docker image to ECR
                        docker.withRegistry("https://${ECR_REPO}", 'aws-access-key') {
                            docker.image(DOCKER_IMAGE).push()
                        }
                    }
                }
            }
        }

        stage('Deploy to ECS') {
            steps {
                script {
                    // Use AWS CLI to update ECS task definition and deploy
                    sh '''
                    aws ecs update-service --cluster ai-or-not-cluster --service ai-or-not-service --force-new-deployment --region $AWS_REGION
                    '''
                }
            }
        }
    }

    post {
        always {
            cleanWs()  // Clean workspace after build
        }
    }
}
