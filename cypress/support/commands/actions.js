const { DATA_TABLE, DIALOG } = require('../elements')
const { getA11yOptions } = require('../a11yConfig')

Cypress.Commands.add('checkWizardRadio', (testId) => {
  cy.getByTestId('wizard-panel-2').should('have.class', 'active')
  cy.getByTestId(testId).scrollIntoView().should('be.visible').check()
})

Cypress.Commands.add('checkWizardCheckbox', (testId) => {
  cy.getByTestId(testId).scrollIntoView().should('be.visible').check()
})

Cypress.Commands.add('fillInviteFormAction', ({ name, email, role }) => {
  if (name) cy.getByTestId('invite-name').clear().type(name)
  if (email) cy.getByTestId('invite-email').clear().type(email)
  if (role) cy.getByTestId('invite-role').select(role)
})

Cypress.Commands.add('completeWizardStep1', ({ name, email, dob, country }) => {
  cy.getByTestId('wizard-name').clear().type(name)
  cy.getByTestId('wizard-email').clear().type(email)
  cy.getByTestId('wizard-dob').clear().type(dob)
  cy.getByTestId('wizard-country').select(country)
})

Cypress.Commands.add('completeWizardStep2', ({ framework = 'cypress', role = 'qa', experience = '3' } = {}) => {
  cy.getByTestId('wizard-panel-2').should('have.class', 'active')
  cy.checkWizardRadio(`wizard-fw-${framework}`)
  cy.checkWizardRadio(`wizard-role-${role}`)
  cy.getByTestId('wizard-experience').scrollIntoView().invoke('val', String(experience)).trigger('input')
  cy.checkWizardCheckbox('wizard-terms')
  cy.checkWizardCheckbox('wizard-newsletter')
})

Cypress.Commands.add('completeWizardStep3', () => {
  cy.getByTestId('wizard-review').should('be.visible')
})

Cypress.Commands.add('advanceWizard', () => {
  cy.getByTestId('wizard-next').click()
})

Cypress.Commands.add('fillWizardFlow', (personal, preferences) => {
  cy.section('WIZARD STEP 1 — Personal')
  cy.completeWizardStep1(personal)
  cy.advanceWizard()

  cy.section('WIZARD STEP 2 — Preferences')
  cy.completeWizardStep2(preferences)
  cy.advanceWizard()

  cy.section('WIZARD STEP 3 — Review')
  cy.completeWizardStep3()
  cy.advanceWizard()
})

Cypress.Commands.add('openDropdown', (testId, label) => {
  cy.getByTestId(testId).select(label)
})

Cypress.Commands.add('openDropdownAt', (testId, index) => {
  cy.getByTestId(testId).select(index)
})

Cypress.Commands.add('pickRadio', (hookOrTestId) => {
  cy.getByHook(hookOrTestId).scrollIntoView().should('be.visible').check()
})

Cypress.Commands.add('clickHook', (hookOrTestId) => {
  cy.getByHook(hookOrTestId).click()
})

Cypress.Commands.add('clearField', (hookOrTestId) => {
  cy.getByHook(hookOrTestId).clear()
})

Cypress.Commands.add('assertPlaceholder', (hookOrTestId, text) => {
  cy.getByHook(hookOrTestId).should('have.attr', 'placeholder', text)
})

Cypress.Commands.add('closeDropdownOverlay', () => {
  cy.get('body').click(0, 0)
})

Cypress.Commands.add('selectMenuItem', (hookOrTestId, label) => {
  cy.getByHook(hookOrTestId).contains(label).click()
})

Cypress.Commands.add('skipOnboardingTour', () => {
  cy.window().then((win) => {
    win.localStorage.setItem('onboarding-dismissed', 'true')
  })
})

Cypress.Commands.add('validateSession', (baseUrl) => {
  cy.request(`${baseUrl}/health`).its('status').should('eq', 200)
})

Cypress.Commands.add('checkA11yPage', (context, options = {}) => {
  const preset = options.preset || 'critical'
  const { preset: _ignored, ...axeOptions } = options
  cy.injectAxe()
  cy.checkA11y(context, { ...getA11yOptions(preset), ...axeOptions })
})

Cypress.Commands.add('checkA11yStandard', (context, options = {}) => {
  cy.checkA11yPage(context, { ...options, preset: 'standard' })
})

// Hook map shortcuts
Cypress.Commands.add('clickDialogConfirm', () => cy.clickHook(DIALOG.confirmBtn.testId))
Cypress.Commands.add('clickDialogCancel', () => cy.clickHook(DIALOG.cancelBtn.testId))
Cypress.Commands.add('clickDialogClose', () => cy.clickHook(DIALOG.closeBtn.testId))
Cypress.Commands.add('searchTable', (term) => {
  cy.getByHook(DATA_TABLE.search.testId).clear().type(term)
})
