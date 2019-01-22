#!/usr/bin/env groovy

library("govuk@workaround-merge-issues-with-shallow-clones")

node {
  govuk.buildProject(
    rubyLintDiff: false,
    beforeTest: {
      sh("npm install")
    }
  )
}
