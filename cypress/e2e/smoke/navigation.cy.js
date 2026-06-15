/**
 * Smoke suite — verifies all authenticated pages load and have no JS errors.
 * Designed to be fast: uses cy.session and checks only the page root.
 */

import { TC, tc } from '../../support/@enums/testCases'

const PAGES = [
  { path: '/web/dashboard.html', testId: 'page-dashboard', title: 'Dashboard', tcId: TC.SMOKE_DASHBOARD },
  { path: '/web/team.html', testId: 'page-team', title: 'Team', tcId: TC.SMOKE_TEAM },
  { path: '/web/settings.html', testId: 'page-settings', title: 'Settings', tcId: TC.SMOKE_SETTINGS },
  { path: '/web/components.html', testId: 'page-components', title: 'Components', tcId: TC.SMOKE_COMPONENTS },
  { path: '/web/activity.html', testId: 'page-activity', title: 'Activity', tcId: TC.SMOKE_ACTIVITY },
  { path: '/web/advanced.html', testId: 'page-advanced', title: 'Advanced', tcId: TC.SMOKE_ADVANCED },
  { path: '/web/wizard.html', testId: 'page-wizard', title: 'Wizard', tcId: TC.SMOKE_WIZARD },
  { path: '/web/states.html', testId: 'page-states', title: 'UI States', tcId: TC.SMOKE_STATES },
]

describe('Smoke — page navigation', { tags: '@smoke @regression' }, () => {
  beforeEach(() => {
    cy.createAuthSession()
  })

  PAGES.forEach(({ path, testId, title, tcId }) => {
    it(tc(tcId, `${title} page loads without error`), { tags: '@smoke' }, () => {
      cy.visit(path)
      cy.getByTestId(testId).should('exist')
      cy.title().should('include', title)
    })
  })
})

describe('Smoke — sidebar navigation', { tags: '@smoke @regression' }, () => {
  beforeEach(() => {
    cy.visitWithSession('/web/dashboard.html')
    cy.getByTestId('page-dashboard').should('exist')
  })

  it(tc(TC.SMOKE_NAV_TEAM, 'navigates from dashboard to team via sidebar'), { tags: '@smoke @critical' }, () => {
    cy.getByTestId('nav-team').click()
    cy.getByTestId('page-team').should('exist')
    cy.url().should('include', '/web/team.html')
  })

  it(tc(TC.SMOKE_NAV_ACTIVE, 'highlights the active nav link'), { tags: '@smoke' }, () => {
    cy.getByTestId('nav-dashboard').should('have.class', 'active')
  })

  it(tc(TC.SMOKE_LOGOUT, 'logout clears session and redirects to login'), { tags: '@critical' }, () => {
    cy.getByTestId('nav-logout').click()
    cy.url().should('include', '/web/index.html')
    cy.window().then((win) => {
      expect(win.sessionStorage.getItem('sandbox-auth')).to.be.null
    })
  })
})

describe('Smoke — API health', { tags: '@smoke @api @regression' }, () => {
  it(tc(TC.SMOKE_HEALTH, 'GET /health returns 200'), { tags: '@smoke @api' }, () => {
    cy.request('/health').its('status').should('eq', 200)
  })

  it(tc(TC.SMOKE_AUTH_LOGIN, 'POST /api/auth/login returns token'), { tags: '@smoke @api @critical' }, () => {
    cy.request({
      method: 'POST',
      url: '/api/auth/login',
      body: { email: Cypress.env('DEMO_EMAIL'), password: Cypress.env('DEMO_PASSWORD') },
    }).then(({ status, body }) => {
      expect(status).to.eq(200)
      cy.validateJsonSchema(body, 'auth-login.json')
      expect(body.user.email).to.eq(Cypress.env('DEMO_EMAIL'))
    })
  })

  it(tc(TC.SMOKE_USERS_LIST, 'GET /api/users returns user array'), { tags: '@smoke @api' }, () => {
    cy.request('/api/users').then(({ status, body }) => {
      expect(status).to.eq(200)
      cy.validateJsonSchema(body, 'users-list.json')
    })
  })

  it(tc(TC.SMOKE_ERROR_404, 'GET /api/errors/404 returns 404 status'), () => {
    cy.request({ url: '/api/errors/404', failOnStatusCode: false })
      .its('status').should('eq', 404)
  })

  it(tc(TC.SMOKE_ERROR_422, 'GET /api/errors/422 returns 422 status'), () => {
    cy.request({ url: '/api/errors/422', failOnStatusCode: false })
      .its('status').should('eq', 422)
  })
})
