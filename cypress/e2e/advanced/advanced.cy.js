import AdvancedPage from '../../pages/AdvancedPage'
import { VIEWPORTS } from '../../support/@enums/viewports'

describe('Advanced — iframe, shadow DOM, external links', { tags: '@regression' }, () => {
  beforeEach(() => {
    AdvancedPage.visit()
    AdvancedPage.pageRoot().should('exist')
  })

  it('renders shadow DOM section', { tags: '@smoke' }, () => {
    cy.section('Shadow DOM')
    AdvancedPage.sectionShadow().should('be.visible')
    AdvancedPage.shadowHost().should('exist')
  })

  it('accesses content inside shadow root', () => {
    AdvancedPage.shadowHost().shadow().find('*').should('have.length.at.least', 1)
  })

  it('loads demo iframe', () => {
    cy.section('Iframe')
    AdvancedPage.demoIframe()
      .should('be.visible')
      .and('have.attr', 'src')
  })

  it('shows external link with target blank', () => {
    AdvancedPage.externalLink()
      .should('have.attr', 'href')
      .and('include', 'http')
  })

  it('renders shadow section at mobile viewport', { tags: '@smoke' }, () => {
    cy.viewport(VIEWPORTS.MOBILE.width, VIEWPORTS.MOBILE.height)
    AdvancedPage.sectionShadow().should('be.visible')
    cy.viewport(VIEWPORTS.DESKTOP.width, VIEWPORTS.DESKTOP.height)
  })

  it('navigates with page finish button', () => {
    cy.getByTestId('page-finish-btn').click()
    cy.url().should('not.include', '/web/advanced.html')
  })
})
