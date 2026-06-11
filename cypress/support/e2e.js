import './commands'
import 'cypress-axe'
import 'cypress-mochawesome-reporter/register'

// Suppress uncaught exceptions from the app that don't affect the test
Cypress.on('uncaught:exception', (err) => {
  if (err.message.includes('sessionStorage') || err.message.includes('ResizeObserver')) {
    return false
  }
})
