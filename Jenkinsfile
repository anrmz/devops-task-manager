pipeline {
    agent any

    

    environment {
        // Slack webhook — add SLACK_WEBHOOK in Jenkins Credentials
        SONAR_TOKEN   = credentials('sonar-token')
        COMPOSE_FILE  = 'docker-compose.yml'
        APP_NAME      = 'devops-task-manager'
    }


    options {
        timeout(time: 30, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '10'))
        disableConcurrentBuilds()
    }

    triggers {
        // Triggered automatically via GitHub Webhook
        githubPush()
    }

    stages {

        // ──────────────────────────────────────────
        // Stage 1 – Checkout
        // ──────────────────────────────────────────
        stage('📥 Checkout') {
            steps {
                echo '⬇️  Checking out source code...'
                checkout scm
                sh 'git log -1 --pretty=format:"%h - %an: %s"'
            }
        }

        // ──────────────────────────────────────────
        // Stage 2 – Install Dependencies
        // ──────────────────────────────────────────
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

        // ──────────────────────────────────────────
        // Stage 3 – Run Tests
        // ──────────────────────────────────────────
        stage('🧪 Run Tests') {
            steps {
                dir('backend') {
                    echo '🧪 Running backend tests...'
                    sh 'npm test'
                }
            }
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

        // ──────────────────────────────────────────
        // Stage 4 – SonarQube Analysis
        // ──────────────────────────────────────────
        stage('🔍 SonarQube Analysis') {
            steps {
                echo '🔍 Running SonarQube code quality analysis...'
                withSonarQubeEnv('SonarQube') {
                    sh '''
                        sonar-scanner \
                            -Dsonar.projectKey=devops-task-manager \
                            -Dsonar.sources=. \
                            -Dsonar.exclusions=**/node_modules/**,**/build/**,**/dist/** \
                            -Dsonar.token=${SONAR_TOKEN}
                    '''
                }
            }
        }

        // ──────────────────────────────────────────
        // Stage 5 – Build Docker Images
        // ──────────────────────────────────────────
        stage('🐳 Build Docker Images') {
            steps {
                echo '🐳 Building Docker images...'
                sh 'docker compose build --no-cache'
            }
        }

        // ──────────────────────────────────────────
        // Stage 6 – Deploy with Docker Compose
        // ──────────────────────────────────────────
        stage('🚀 Deploy') {
            steps {
                echo '🚀 Deploying application with Docker Compose...'
                sh '''
                    docker compose down --remove-orphans
                    docker compose up -d
                    echo "⏳ Waiting for services to start..."
                    sleep 15
                    docker compose ps
                '''
            }
        }
    }

    // ──────────────────────────────────────────
    // Post-build – Slack Notifications
    // ──────────────────────────────────────────
    post {
        success {
            echo '✅ Pipeline succeeded!'
            sh """
                curl -X POST -H 'Content-type: application/json' \
                --data '{
                    "text": "✅ *${APP_NAME}* pipeline *PASSED* on branch `${env.BRANCH_NAME}` — Build #${env.BUILD_NUMBER}",
                    "attachments": [{
                        "color": "#36a64f",
                        "fields": [
                            {"title": "Branch", "value": "${env.BRANCH_NAME}", "short": true},
                            {"title": "Build", "value": "#${env.BUILD_NUMBER}", "short": true},
                            {"title": "Duration", "value": "${currentBuild.durationString}", "short": true},
                            {"title": "URL", "value": "${env.BUILD_URL}", "short": false}
                        ]
                    }]
                }' \
                ${SLACK_WEBHOOK}
            """
        }

        failure {
            echo '❌ Pipeline failed!'
            sh """
                curl -X POST -H 'Content-type: application/json' \
                --data '{
                    "text": "❌ *${APP_NAME}* pipeline *FAILED* on branch `${env.BRANCH_NAME}` — Build #${env.BUILD_NUMBER}",
                    "attachments": [{
                        "color": "#e01e5a",
                        "fields": [
                            {"title": "Branch", "value": "${env.BRANCH_NAME}", "short": true},
                            {"title": "Build", "value": "#${env.BUILD_NUMBER}", "short": true},
                            {"title": "Stage failed", "value": "${currentBuild.currentResult}", "short": true},
                            {"title": "URL", "value": "${env.BUILD_URL}", "short": false}
                        ]
                    }]
                }' \
                ${SLACK_WEBHOOK}
            """
        }

        always {
            cleanWs()
        }
    }
}
