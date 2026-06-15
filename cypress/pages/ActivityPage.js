class ActivityPage {
  pageRoot() { return cy.getByTestId('page-activity') }
  fetchUsersBtn() { return cy.getByTestId('fetch-users-btn') }
  fetchSlowBtn() { return cy.getByTestId('fetch-slow-btn') }
  apiResult() { return cy.getByTestId('api-result') }
  counterValue() { return cy.getByTestId('counter-value') }
  counterIncrement() { return cy.getByTestId('counter-increment') }
  counterDecrement() { return cy.getByTestId('counter-decrement') }
  counterReset() { return cy.getByTestId('counter-reset') }
  progressStart() { return cy.getByTestId('progress-start') }
  downloadProgress() { return cy.getByTestId('download-progress') }
  loadDynamicBtn() { return cy.getByTestId('load-dynamic-btn') }
  dynamicContent() { return cy.getByTestId('dynamic-content') }

  dropZone() { return cy.getByTestId('drop-zone') }

  visit() {
    cy.visitWithSession('/web/activity.html')
    return this
  }
}

module.exports = new ActivityPage()
