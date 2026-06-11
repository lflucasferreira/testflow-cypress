const { defineConfig } = require('cypress')

module.exports = defineConfig({
  reporter: 'cypress-mochawesome-reporter',
  reporterOptions: {
    charts: true,
    reportPageTitle: 'TestFlow — Cypress Report',
    embeddedScreenshots: true,
    inlineAssets: true,
    saveAllAttempts: false,
    overwrite: false,
    html: false,
    json: true,
    reportDir: 'cypress/reports',
  },

  e2e: {
    baseUrl: 'http://localhost:5050',
    specPattern: 'cypress/e2e/**/*.cy.js',
    supportFile: 'cypress/support/e2e.js',
    fixturesFolder: 'cypress/fixtures',
    screenshotsFolder: 'cypress/screenshots',
    videosFolder: 'cypress/videos',

    viewportWidth: 1280,
    viewportHeight: 800,
    testIsolation: true,

    defaultCommandTimeout: 8000,
    requestTimeout: 10000,
    responseTimeout: 10000,

    retries: {
      runMode: 2,
      openMode: 0,
    },

    setupNodeEvents(on, config) {
      require('cypress-mochawesome-reporter/plugin')(on)
      return config
    },
  },

  env: {
    DEMO_EMAIL: 'demo@automation.io',
    DEMO_PASSWORD: 'Demo123!',
    BASE_URL: 'http://localhost:5050',
  },
})
