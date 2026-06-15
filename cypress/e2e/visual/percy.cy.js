import { TC, tc } from '../../support/@enums/testCases'

describe('Visual — Percy snapshots', { tags: '@visual @regression' }, () => {
  it(tc(TC.VISUAL_LOGIN, 'login page baseline'), { tags: '@visual' }, () => {
    cy.visit('/web/login.html')
    cy.getByTestId('login-email').should('be.visible')
    cy.percySnapshot('Login Page')
  })

  it(tc(TC.VISUAL_DASHBOARD, 'dashboard baseline'), { tags: '@visual' }, () => {
    cy.visitWithSession('/web/dashboard.html')
    cy.getByTestId('page-dashboard').should('exist')
    cy.percySnapshot('Dashboard')
  })

  it(tc(TC.VISUAL_COMPONENTS, 'components page baseline'), { tags: '@visual' }, () => {
    cy.visitWithSession('/web/components.html')
    cy.getByTestId('page-components').should('exist')
    cy.percySnapshot('Components Page')
  })
})
