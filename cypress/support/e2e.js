import './commands'
import 'cypress-axe'

// Suppress uncaught exceptions from the app that don't affect the test
Cypress.on('uncaught:exception', (err) => {
  if (err.message.includes('sessionStorage') || err.message.includes('ResizeObserver')) {
    return false
  }
})
