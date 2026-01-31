pipeline {
  agent any

  environment {
    BASE = "/var/www/ayhrms-staging-node"
    RELEASES = "${BASE}/releases"
    CURRENT = "${BASE}/current"
    TIME = sh(script: "date +%Y%m%d_%H%M%S", returnStdout: true).trim()
    RELEASE = "${RELEASES}/${TIME}"
  }

  stages {

    stage("Checkout") {
      steps {
        checkout scm
      }
    }

    stage("Create Release") {
      steps {
        sh """
          mkdir -p ${RELEASE}
          rsync -av --delete ./ ${RELEASE}/
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

    stage("Restart PM2") {
      steps {
        sh """
          pm2 restart hrms-staging-api --update-env
        """
      }
    }
  }
}

