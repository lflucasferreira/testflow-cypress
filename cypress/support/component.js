import { mount } from '@cypress/react18'
import 'cypress-axe'
import { mountWithProviders } from '../support/component/mountWithProviders'

Cypress.Commands.add('getByTestId', (testId, options) =>
  cy.get(`[data-testid="${testId}"]`, options),
)

Cypress.Commands.add('getByHook', (hook, options) =>
  cy.get(`[data-cy-hook="${hook}"], [data-testid="${hook}"]`, options),
)

Cypress.Commands.add('assertHookVisible', (hook) =>
  cy.getByHook(hook).should('be.visible'),
)

Cypress.Commands.add('assertHookMissing', (hook) =>
  cy.getByHook(hook).should('not.exist'),
)

Cypress.Commands.add('clickHook', (hookOrTestId) => {
  cy.getByHook(hookOrTestId).click()
})

Cypress.Commands.add('mount', mount)

Cypress.Commands.add('mountWithProviders', (component) => {
  mountWithProviders(component)
})

Cypress.Commands.add('mockCountriesLookup', () =>
  cy.intercept('GET', '**/lookups/countries**', { fixture: 'lookups/countries' }).as('countriesLookup'),
)
