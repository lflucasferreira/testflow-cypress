const { defineConfig } = require('cypress')
const { loadConfig } = require('./cypress/support/loadConfig')
const { registerTasks } = require('./cypress/support/tasks')

const isCI = Boolean(process.env.CI)

module.exports = defineConfig({
  projectId: 'jb6cfs',

  expose: {
    grepFilterSpecs: true,
    grepOmitFiltered: true,
  },

  reporter: 'cypress-mochawesome-reporter',
  reporterOptions: {
    charts: true,
    reportPageTitle: 'TestFlow — Cypress Report',
    embeddedScreenshots: true,
    inlineAssets: true,
    saveAllAttempts: false,
    overwrite: false,
    html: !isCI,
    json: true,
    removeJsonsFolderAfterMerge: false,
    reportDir: 'cypress/reports',
  },

  includeShadowDom: true,
  chromeWebSecurity: false,
  experimentalMemoryManagement: true,
  numTestsKeptInMemory: 1,
  blockHosts: ['*.analytics.com', '*.ads.net'],

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
    pageLoadTimeout: 120000,

    retries: {
      runMode: isCI ? 2 : 0,
      openMode: 0,
    },

    setupNodeEvents(on, config) {
      require('cypress-mochawesome-reporter/plugin')(on)
      require('@bahmutov/cy-grep/src/plugin')(config)
      registerTasks(on)
      return loadConfig(config)
    },
  },

  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
      viteConfig: {
        configFile: 'cypress/vite.config.js',
      },
    },
    specPattern: 'cypress/component/**/*.cy.{jsx,tsx,js}',
    supportFile: 'cypress/support/component.js',
    viewportWidth: 1280,
    viewportHeight: 800,
    setupNodeEvents(on, config) {
      registerTasks(on)
      return loadConfig(config)
    },
  },

  env: {
    DEMO_EMAIL: process.env.CYPRESS_DEMO_EMAIL || 'demo@automation.io',
    DEMO_PASSWORD: process.env.CYPRESS_DEMO_PASSWORD || process.env.DEMO_PASSWORD || 'Demo123!',
    BASE_URL: 'http://localhost:5050',
    ENV: 'local',
    sessionCacheAcrossSpecs: true,
  },
})
