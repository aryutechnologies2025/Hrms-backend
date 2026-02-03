pipeline {
  agent any

  environment {
    BASE = "/var/www/ayhrms-staging-node"
    RELEASES = "${BASE}/releases"
    CURRENT = "${BASE}/current"
  }

  stages {

    stage("Checkout") {
      steps {
        checkout scm
      }
    }

    stage("Prepare Release Path") {
      steps {
        script {
          env.TIME = sh(script: "date +%Y%m%d_%H%M%S", returnStdout: true).trim()
          env.RELEASE = "${RELEASES}/${TIME}"
        }
      }
    }

    stage("Create Release") {
      steps {
        sh """
          mkdir -p ${RELEASE}
          rsync -av --delete --exclude='.git' ./ ${RELEASE}/
        """
      }
    }

    stage("Install Dependencies") {
      steps {
        sh """
          cd ${RELEASE}
          npm install --omit=dev
        """
      }
    }

    stage("Activate Release") {
      steps {
        sh """
          ln -sfn ${RELEASE} ${CURRENT}
        """
      }
    }

    stage("Restart PM2 (staging)") {
      steps {
        sh """
          sudo -u aryu_user pm2 reload hrms-staging-api --update-env
        """
      }
    }
  }
}

