require('./commands')
require('cypress-axe')
require('cypress-mochawesome-reporter/register')
require('cypress-plugin-steps')
require('@bahmutov/cy-grep')()

Cypress.on('uncaught:exception', (err) => {
  if (err.message.includes('sessionStorage') || err.message.includes('ResizeObserver')) {
    return false
  }
})

beforeEach(function () {
  cy.window({ log: false }).then((win) => {
    win.localStorage.setItem('onboarding-dismissed', 'true')
  })
})
