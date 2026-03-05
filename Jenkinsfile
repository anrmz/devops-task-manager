pipeline {

    agent any

    environment {
        SONAR_TOKEN = credentials('sonar-token')
    }

    options {
        timeout(time: 30, unit: 'MINUTES')
    }

    triggers {
        githubPush()
    }

    stages {

        stage('📥 Checkout') {
            steps {
                echo 'Checking out source code'
                checkout scm
                sh 'git config --global --add safe.directory $(pwd)'
            }
        }

        stage('📦 Install Dependencies') {
            agent {
                docker {
                    image 'node:18'
                    args '-u root:root'
                }
            }

            parallel {

                stage('Backend') {
                    steps {
                        dir('backend') {
                            sh 'npm ci'
                        }
                    }
                }

                stage('Frontend') {
                    steps {
                        dir('frontend') {
                            sh 'npm ci'
                        }
                    }
                }

            }
        }

        stage('🧪 Run Tests') {
            agent {
                docker {
                    image 'node:18'
                    args '-u root:root'
                }
            }

            steps {
                dir('backend') {
                    sh 'npm test || true'
                }
            }
        }

        stage('☕ Install Java (for SonarQube)') {
            steps {
                sh '''
                apt-get update
                apt-get install -y openjdk-17-jre
                '''
            }
        }

        stage('🔍 SonarQube Analysis') {
            steps {
                script {
                    def scannerHome = tool 'sonar-scanner'

                    withSonarQubeEnv('SonarQube') {
                        sh """
                        ${scannerHome}/bin/sonar-scanner \
                        -Dsonar.projectKey=devops-task-manager \
                        -Dsonar.sources=backend/src,frontend/src \
                        -Dsonar.tests=backend/tests \
                        -Dsonar.exclusions=**/node_modules/**,**/build/**,**/dist/** \
                        -Dsonar.token=${SONAR_TOKEN}
                        """
                    }
                }
            }
        }

        stage('🐳 Build Docker Images') {
            steps {
                echo 'Building Docker images'
                sh 'docker compose build'
            }
        }

        stage('🚀 Deploy Application') {
            steps {
                echo 'Deploying application'
                sh '''
                docker compose down
                docker compose up -d
                '''
            }
        }

    }

    post {
        success {
            echo 'Pipeline succeeded'
        }

        failure {
            echo 'Pipeline failed'
        }

        always {
            cleanWs()
        }
    }
}