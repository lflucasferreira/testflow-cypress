class LoginPage {
  // ── Selectors ──────────────────────────────────────────────────────────────
  emailInput()      { return cy.getByTestId('login-email') }
  passwordInput()   { return cy.getByTestId('login-password') }
  rememberCheckbox(){ return cy.getByTestId('login-remember') }
  useApiCheckbox()  { return cy.getByTestId('login-use-api') }
  submitBtn()       { return cy.getByTestId('login-submit') }
  resultMsg()       { return cy.getByTestId('login-result') }

  // ── Actions ────────────────────────────────────────────────────────────────
  visit() {
    cy.visit('/web/login.html')
    return this
  }

  fillEmail(email) {
    this.emailInput().clear().type(email)
    return this
  }

  fillPassword(password) {
    this.passwordInput().clear().type(password, { log: false })
    return this
  }

  submit() {
    this.submitBtn().click()
    return this
  }

  loginWith(email, password) {
    return this.fillEmail(email).fillPassword(password).submit()
  }

  toggleUseApi() {
    this.useApiCheckbox().then(($el) => $el[0].click())
    return this
  }

  toggleRememberMe() {
    this.rememberCheckbox().click()
    return this
  }

  // ── Assertions ─────────────────────────────────────────────────────────────
  shouldBeOnLoginPage() {
    cy.url().should('include', '/web/login.html')
    return this
  }

  shouldShowError(text) {
    this.resultMsg()
      .should('be.visible')
      .and('contain.text', text)
    return this
  }

  shouldRedirectToDashboard() {
    cy.getByTestId('page-dashboard').should('exist')
    cy.url().should('include', '/web/dashboard.html')
    return this
  }
}

export default new LoginPage()
