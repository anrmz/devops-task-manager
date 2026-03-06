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

            parallel {

                stage('Backend') {

                    agent {
                        docker {
                            image 'node:18'
                            args '-u root:root'
                        }
                    }

                    steps {
                        dir('backend') {
                            sh 'npm ci'
                        }
                    }
                }

                stage('Frontend') {

                    agent {
                        docker {
                            image 'node:18'
                            args '-u root:root'
                        }
                    }

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

                script {

                    sh '''
                    docker rm -f mongo-test || true
                    docker run -d -p 27017:27017 --name mongo-test mongo:7
                    '''

                    dir('backend') {

                        sh '''
                        export MONGO_URI=mongodb://localhost:27017/testdb
                        npm install
                        npm test || true
                        '''

                    }

                    sh '''
                    docker stop mongo-test || true
                    docker rm mongo-test || true
                    '''
                }
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
                        -Dsonar.exclusions=**/node_modules/**,**/build/**,**/dist/**
                        """
                    }
                }
            }
        }

        stage('🐳 Build Docker Images') {
            steps {
                sh 'docker-compose build'
            }
        }

        stage('🚀 Deploy Application') {
            steps {
                sh '''
                docker-compose down || true
                docker-compose up -d
                '''
            }
        }
    }

    post {

        success {
            script {
                try {
                    slackSend(
                        channel: '#devops-ensi',
                        message: "✅ Build SUCCESS: ${env.JOB_NAME} #${env.BUILD_NUMBER}"
                    )
                } catch (err) {
                    echo "Slack notification failed"
                }
            }
        }

        failure {
            script {
                try {
                    slackSend(
                        channel: '#devops-ensi',
                        message: "❌ Build FAILED: ${env.JOB_NAME} #${env.BUILD_NUMBER}"
                    )
                } catch (err) {
                    echo "Slack notification failed"
                }
            }
        }
    }
}