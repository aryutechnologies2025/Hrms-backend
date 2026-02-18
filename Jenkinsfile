pipeline {
  agent any

  environment {
    APP_PATH = "/var/www/ayhrms-staging-node-main"
  }

  stages {

    stage("Checkout") {
      steps {
        checkout scm
      }
    }

    stage("Deploy Code (Preserve Uploads)") {
      steps {
        sh """
          rsync -av \
          --exclude='.git' \
          --exclude='node_modules' \
          --exclude='uploads' \
          ./ ${APP_PATH}/
        """
      }
    }

    stage("Install Dependencies") {
      steps {
        sh """
          cd ${APP_PATH}
          npm install --omit=dev
        """
      }
    }

    stage("Restart PM2") {
      steps {
        sh """
          sudo -u aryu_user pm2 restart hrms-staging-api
        """
      }
    }

  }
}

