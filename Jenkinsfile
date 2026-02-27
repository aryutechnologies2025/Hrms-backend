pipeline {
  agent any

  environment {
    APP_DIR = "/var/www/ayhrms-node-main"
  }

  stages {

    stage("Checkout Code") {
      steps {
        checkout scm
      }
    }

    stage("Deploy Code Safely") {
      steps {
        sh """
          rsync -av --delete \
            --exclude '.env' \
            --exclude 'uploads' \
            --exclude 'uploads/**' \
            --exclude 'node_modules' \
            ./ ${APP_DIR}/
        """
      }
    }

    stage("Install Dependencies") {
      steps {
        sh """
          cd ${APP_DIR}
          npm install --omit=dev
        """
      }
    }

    stage("Restart PM2") {
      steps {
        sh """
          pm2 restart hrms-live --update-env
        """
      }
    }
  }
}