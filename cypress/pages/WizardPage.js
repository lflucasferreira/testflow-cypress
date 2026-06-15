class WizardPage {
  pageRoot() { return cy.getByTestId('page-wizard') }
  nameInput() { return cy.getByTestId('wizard-name') }
  emailInput() { return cy.getByTestId('wizard-email') }
  dobInput() { return cy.getByTestId('wizard-dob') }
  countrySelect() { return cy.getByTestId('wizard-country') }
  nextBtn() { return cy.getByTestId('wizard-next') }
  backBtn() { return cy.getByTestId('wizard-back') }
  step1() { return cy.getByTestId('wizard-step-1') }
  step2() { return cy.getByTestId('wizard-step-2') }
  step3() { return cy.getByTestId('wizard-step-3') }
  panel1() { return cy.getByTestId('wizard-panel-1') }
  success() { return cy.getByTestId('wizard-success') }
  reviewName() { return cy.getByTestId('review-name') }

  visit() {
    cy.visitWithSession('/web/wizard.html')
    return this
  }

  selectFramework(name) {
    cy.checkWizardRadio(`wizard-fw-${name}`)
    return this
  }

  selectRole(role) {
    cy.checkWizardRadio(`wizard-role-${role}`)
    return this
  }
}

module.exports = new WizardPage()
