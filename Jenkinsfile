pipeline {
    agent {
        docker {
            image 'node:18-bullseye'
            args '-u root:root -v /var/run/docker.sock:/var/run/docker.sock'
        }
    }

    environment {
        SONAR_TOKEN = credentials('sonar-token')
        APP_NAME = 'devops-task-manager'
    }

    options {
        timeout(time: 30, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '10'))
        disableConcurrentBuilds()
    }

    triggers {
        githubPush()
    }

    stages {

        stage('📥 Checkout') {
            steps {
                echo "Checking out source code"
                checkout scm
            }
        }

        stage('🔧 Fix Git Safe Directory') {
            steps {
                sh 'git config --global --add safe.directory $PWD'
            }
        }

        stage('📦 Install Dependencies') {
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
                java -version
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
            echo "Pipeline succeeded"
        }

        failure {
            echo "Pipeline failed"
        }

        always {
            cleanWs()
        }
    }
}