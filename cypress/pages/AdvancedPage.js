class AdvancedPage {
  pageRoot() { return cy.getByTestId('page-advanced') }
  shadowHost() { return cy.getByTestId('shadow-host') }
  demoIframe() { return cy.getByTestId('demo-iframe') }
  externalLink() { return cy.getByTestId('external-link') }
  iframeResult() { return cy.getByTestId('iframe-result') }
  sectionShadow() { return cy.getByTestId('section-shadow') }

  visit() {
    cy.visitWithSession('/web/advanced.html')
    return this
  }

  shadowFind(selector) {
    return this.shadowHost().shadow().find(selector)
  }
}

module.exports = new AdvancedPage()
