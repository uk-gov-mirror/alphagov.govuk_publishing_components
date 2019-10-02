#!/usr/bin/env groovy

library("govuk")

node {
  govuk.buildProject(
    rubyLintDiff: false,
    beforeTest: {
      stage("Attempt to fix jenkins") {
        sh("bundle install --path /var/lib/jenkins/bundles")
      }
      stage("Install npm dependencies") {
        sh("npm install")
      }
      stage("Lint Javascript and SCSS") {
        sh("npm run lint")
      }
    }
  )
}
