pipeline {

    agent {
        docker {
            image 'node:18'
            args '-u root:root -v /var/run/docker.sock:/var/run/docker.sock'
        }
    }

    environment {
        SONAR_TOKEN  = credentials('sonar-token')
        COMPOSE_FILE = 'docker-compose.yml'
        APP_NAME     = 'devops-task-manager'
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

        // ─────────────────────────────
        // Checkout Source Code
        // ─────────────────────────────
        stage('📥 Checkout') {
            steps {
                echo '⬇️ Checking out source code...'
                checkout scm
            }
        }

        // ─────────────────────────────
        // Fix Git Safe Directory
        // ─────────────────────────────
        stage('🔧 Fix Git Safe Directory') {
            steps {
                sh '''
                git config --global --add safe.directory /var/jenkins_home/workspace/devops-task-manager
                '''
            }
        }

        // ─────────────────────────────
        // Install Dependencies
        // ─────────────────────────────
        stage('📦 Install Dependencies') {

            parallel {

                stage('Backend') {
                    steps {
                        dir('backend') {
                            echo '📦 Installing backend dependencies...'
                            sh 'npm ci'
                        }
                    }
                }

                stage('Frontend') {
                    steps {
                        dir('frontend') {
                            echo '📦 Installing frontend dependencies...'
                            sh 'npm ci'
                        }
                    }
                }

            }
        }

        // ─────────────────────────────
        // Run Tests
        // ─────────────────────────────
        stage('🧪 Run Tests') {
            steps {
                dir('backend') {
                    echo '🧪 Running backend tests...'
                    sh 'npm test || true'
                }
            }
        }

        // ─────────────────────────────
        // SonarQube Analysis
        // ─────────────────────────────
        stage('🔍 SonarQube Analysis') {

            steps {

                echo '🔍 Running SonarQube analysis...'

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

        // ─────────────────────────────
        // Build Docker Images
        // ─────────────────────────────
        stage('🐳 Build Docker Images') {
            steps {
                echo '🐳 Building Docker images...'
                sh 'docker-compose build'
            }
        }

        // ─────────────────────────────
        // Deploy Application
        // ─────────────────────────────
        stage('🚀 Deploy') {
            steps {

                echo '🚀 Deploying application with Docker Compose...'

                sh '''
                docker-compose down
                docker-compose up -d
                '''
            }
        }

    }

    // ─────────────────────────────
    // Post Actions
    // ─────────────────────────────
    post {

        success {
            echo '✅ Pipeline succeeded!'
        }

        failure {
            echo '❌ Pipeline failed!'
        }

        always {
            cleanWs()
        }

    }

}