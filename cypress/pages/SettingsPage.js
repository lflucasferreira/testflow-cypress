class SettingsPage {
  // ── Selectors ──────────────────────────────────────────────────────────────
  pageRoot()          { return cy.getByTestId('page-settings') }
  settingsForm()      { return cy.getByTestId('settings-form') }
  nameInput()         { return cy.getByTestId('settings-name') }
  emailInput()        { return cy.getByTestId('settings-email') }
  titleInput()        { return cy.getByTestId('settings-title') }
  timezoneSelect()    { return cy.getByTestId('settings-timezone') }
  bioTextarea()       { return cy.getByTestId('settings-bio') }
  saveBtn()           { return cy.getByTestId('settings-save') }
  formResult()        { return cy.getByTestId('form-result') }
  fileUpload()        { return cy.getByTestId('file-upload') }
  uploadResult()      { return cy.getByTestId('upload-result') }

  notifSwitch()       { return cy.getByTestId('notifications-switch') }
  switchStatus()      { return cy.getByTestId('switch-status') }
  volumeSlider()      { return cy.getByTestId('volume-slider') }
  volumeValue()       { return cy.getByTestId('volume-value') }
  digestCheckbox()    { return cy.getByTestId('settings-digest') }
  dateInput()         { return cy.getByTestId('settings-date') }

  passwordForm()      { return cy.getByTestId('password-form') }
  currentPassword()   { return cy.getByTestId('password-current') }
  newPassword()       { return cy.getByTestId('password-new') }
  passwordSaveBtn()   { return cy.getByTestId('password-save') }
  passwordResult()    { return cy.getByTestId('password-result') }
  twofaSwitch()       { return cy.getByTestId('twofa-switch') }
  twofaStatus()       { return cy.getByTestId('twofa-status') }
  sessionBadge()      { return cy.getByTestId('session-badge') }

  copyTokenBtn()      { return cy.getByTestId('copy-token-btn') }
  rotateTokenBtn()    { return cy.getByTestId('rotate-token-btn') }
  apiKeyDisplay()     { return cy.getByTestId('api-key-display') }
  tokenResult()       { return cy.getByTestId('token-result') }
  webhookInput()      { return cy.getByTestId('webhook-url') }
  saveWebhookBtn()    { return cy.getByTestId('save-webhook-btn') }
  webhookResult()     { return cy.getByTestId('webhook-result') }

  deleteAccountBtn()  { return cy.getByTestId('delete-account-btn') }

  // ── Actions ────────────────────────────────────────────────────────────────
  fillName(name) {
    this.nameInput().clear().type(name)
    return this
  }

  fillEmail(email) {
    this.emailInput().clear().type(email)
    return this
  }

  saveProfile() {
    this.saveBtn().click()
    return this
  }

  toggleNotifications() {
    this.notifSwitch().click()
    return this
  }

  setSlider(value) {
    this.volumeSlider().invoke('val', value).trigger('input')
    return this
  }

  submitPasswordChange(current, next) {
    this.currentPassword().type(current, { log: false })
    this.newPassword().type(next, { log: false })
    this.passwordSaveBtn().click()
    return this
  }

  toggle2FA() {
    this.twofaSwitch().click()
    return this
  }

  copyToken() {
    this.copyTokenBtn().click()
    return this
  }

  rotateToken() {
    this.rotateTokenBtn().click()
    return this
  }

  saveWebhook(url) {
    this.webhookInput().clear().type(url)
    this.saveWebhookBtn().click()
    return this
  }

  // ── Assertions ─────────────────────────────────────────────────────────────
  shouldShowSaveSuccess() {
    this.formResult()
      .should('be.visible')
      .and('contain.text', 'saved')
    return this
  }

  shouldShowNotificationsOn() {
    this.switchStatus().should('have.text', 'On')
    this.notifSwitch().should('have.attr', 'aria-checked', 'true')
    return this
  }

  shouldShowNotificationsOff() {
    this.switchStatus().should('have.text', 'Off')
    this.notifSwitch().should('have.attr', 'aria-checked', 'false')
    return this
  }

  shouldShowPasswordError(text) {
    this.passwordResult()
      .should('be.visible')
      .and('contain.text', text)
    return this
  }

  shouldShow2FAEnabled() {
    this.twofaStatus().should('have.text', 'Enabled')
    this.twofaSwitch().should('have.attr', 'aria-checked', 'true')
    return this
  }

  shouldShowTokenResult(text) {
    this.tokenResult().should('contain.text', text)
    return this
  }

  shouldShowWebhookSaved() {
    this.webhookResult()
      .should('be.visible')
      .and('contain.text', 'Webhook saved')
    return this
  }
}

export default new SettingsPage()
