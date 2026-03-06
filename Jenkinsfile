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

        stage('🐳 Start Mongo Test Container') {
            steps {
                sh 'docker rm -f mongo-test || true'
                sh 'docker run -d -p 27018:27017 --name mongo-test mongo:7'
            }
        }

        stage('🧪 Run Backend Tests') {

            agent {
                docker {
                    image 'node:18'
                    args '-u root:root'
                }
            }

            steps {

                dir('backend') {
                    sh '''
                    export MONGO_URI=mongodb://host.docker.internal:27018/testdb
                    npm install
                    npm test || true
                    '''
                }

            }
        }

        stage('🛑 Stop Mongo Test Container') {
            steps {
                sh 'docker stop mongo-test || true'
                sh 'docker rm mongo-test || true'
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
                sh 'docker compose build'
            }
        }

        stage('🚀 Deploy Application') {
            steps {
                sh '''
                docker compose down || true
                docker compose up -d
                '''
            }
        }
    }

    post {
  success {
    sh '''
    curl -X POST -H 'Content-type: application/json' \
--data '{"text":"✅ SUCCESS: devops-task-manager pipeline finished successfully!"}' \
$SLACK_WEBHOOK
    '''
  }

  failure {
    sh '''
    curl -X POST -H 'Content-type: application/json' \
    --data '{"text":"❌ FAILED: devops-task-manager pipeline failed!"}' \
    $SLACK_WEBHOOK
    '''
  }
}
}