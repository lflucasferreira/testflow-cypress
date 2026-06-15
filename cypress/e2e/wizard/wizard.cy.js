import WizardPage from '../../pages/WizardPage'
import { WizardDataFactory } from '../../support/factories'

describe('Wizard — multi-step flow', { tags: '@regression' }, () => {
  beforeEach(() => {
    cy.visitWithSession('/web/wizard.html')
    WizardPage.pageRoot().should('exist')
  })

  it('shows step 1 by default', { tags: '@smoke' }, () => {
    WizardPage.panel1().should('be.visible')
    WizardPage.step1().should('have.class', 'active')
  })

  it('validates required fields on step 1', () => {
    cy.getByTestId('wizard-next').click()
    cy.getByTestId('wizard-step1-error').should('be.visible')
  })

  it('maps country fixture codes to wizard select options', () => {
    cy.mockCountriesLookup()
    cy.task('readFixture', 'lookups/countries.json').then(({ countries }) => {
      const canada = countries.find((c) => c.code === 'CA')
      expect(canada).to.exist
      cy.getByTestId('wizard-country').select('ca')
      cy.getByTestId('wizard-country').should('have.value', 'ca')
    })
  })

  it('completes all wizard sections', { tags: '@critical' }, () => {
    const personal = WizardDataFactory.createPersonalStep()
    const prefs = WizardDataFactory.createPreferencesStep()

    cy.section('PERSONAL INFO')
    cy.completeWizardStep1(personal)
    cy.advanceWizard()
    cy.getByTestId('wizard-step-1').should('have.class', 'done')

    cy.section('PREFERENCES')
    cy.completeWizardStep2(prefs)
    cy.advanceWizard()
    cy.getByTestId('wizard-step-2').should('have.class', 'done')

    cy.section('CONFIRMATION')
    cy.completeWizardStep3()
    cy.advanceWizard()

    cy.getByTestId('wizard-success').should('be.visible')
    cy.getByTestId('wizard-success-message').should('not.be.empty')
    cy.getByTestId('review-name').should('contain.text', personal.name)
  })

  it('navigates back from step 2 to step 1', () => {
    const personal = WizardDataFactory.createPersonalStep()
    cy.completeWizardStep1(personal)
    cy.advanceWizard()
    cy.getByTestId('wizard-back').click()
    WizardPage.panel1().should('be.visible')
  })

  it('restarts wizard after completion', () => {
    const personal = WizardDataFactory.createPersonalStep()
    cy.fillWizardFlow(personal, WizardDataFactory.createPreferencesStep())
    cy.getByTestId('wizard-restart').click()
    WizardPage.panel1().should('be.visible')
  })
})

describe('Wizard — accessibility', { tags: '@a11y @regression' }, () => {
  beforeEach(() => {
    cy.visitWithSession('/web/wizard.html')
    WizardPage.pageRoot().should('exist')
  })

  it('wizard page has no critical a11y violations', () => {
    cy.checkA11yPage(undefined, { preset: 'critical' })
  })
})
