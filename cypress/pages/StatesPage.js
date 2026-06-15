class StatesPage {
  pageRoot() { return cy.getByTestId('page-states') }
  skeletonTrigger() { return cy.getByTestId('skeleton-trigger') }
  skeletonContainer() { return cy.getByTestId('skeleton-container') }
  skeletonIdle() { return cy.getByTestId('skeleton-idle') }
  skeletonReset() { return cy.getByTestId('skeleton-reset') }
  errorTrigger() { return cy.getByTestId('error-trigger') }
  errorContainer() { return cy.getByTestId('error-container') }
  successTrigger() { return cy.getByTestId('success-trigger') }
  emptyState() { return cy.getByTestId('empty-state') }
  partialTrigger() { return cy.getByTestId('partial-trigger') }
  partialGrid() { return cy.getByTestId('partial-grid') }

  visit() {
    cy.visitWithSession('/web/states.html')
    return this
  }

  loadSkeletonCards() {
    this.skeletonTrigger().click()
    return this
  }

  triggerError() {
    this.errorTrigger().click()
    return this
  }
}

module.exports = new StatesPage()
