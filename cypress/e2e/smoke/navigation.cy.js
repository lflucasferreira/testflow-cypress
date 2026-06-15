/**
 * Smoke suite — verifies all authenticated pages load and have no JS errors.
 * Designed to be fast: uses cy.session and checks only the page root.
 */

const PAGES = [
  { path: '/web/dashboard.html', testId: 'page-dashboard', title: 'Dashboard' },
  { path: '/web/team.html', testId: 'page-team', title: 'Team' },
  { path: '/web/settings.html', testId: 'page-settings', title: 'Settings' },
  { path: '/web/components.html', testId: 'page-components', title: 'Components' },
  { path: '/web/activity.html', testId: 'page-activity', title: 'Activity' },
  { path: '/web/advanced.html', testId: 'page-advanced', title: 'Advanced' },
  { path: '/web/wizard.html', testId: 'page-wizard', title: 'Wizard' },
  { path: '/web/states.html', testId: 'page-states', title: 'UI States' },
]

describe('Smoke — page navigation', { tags: '@smoke @regression' }, () => {
  beforeEach(() => {
    cy.createAuthSession()
  })

  PAGES.forEach(({ path, testId, title }) => {
    it(`${title} page loads without error`, { tags: '@smoke' }, () => {
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

  it('navigates from dashboard to team via sidebar', { tags: '@smoke @critical' }, () => {
    cy.getByTestId('nav-team').click()
    cy.getByTestId('page-team').should('exist')
    cy.url().should('include', '/web/team.html')
  })

  it('highlights the active nav link', { tags: '@smoke' }, () => {
    cy.getByTestId('nav-dashboard').should('have.class', 'active')
  })

  it('logout clears session and redirects to login', { tags: '@critical' }, () => {
    cy.getByTestId('nav-logout').click()
    cy.url().should('include', '/web/index.html')
    cy.window().then((win) => {
      expect(win.sessionStorage.getItem('sandbox-auth')).to.be.null
    })
  })
})

describe('Smoke — API health', { tags: '@smoke @api @regression' }, () => {
  it('GET /health returns 200', { tags: '@smoke @api' }, () => {
    cy.request('/health').its('status').should('eq', 200)
  })

  it('POST /api/auth/login returns token', { tags: '@smoke @api @critical' }, () => {
    cy.request({
      method: 'POST',
      url: '/api/auth/login',
      body: { email: Cypress.env('DEMO_EMAIL'), password: Cypress.env('DEMO_PASSWORD') },
    }).then(({ status, body }) => {
      expect(status).to.eq(200)
      expect(body.token).to.not.be.empty
      expect(body.user.email).to.eq(Cypress.env('DEMO_EMAIL'))
    })
  })

  it('GET /api/users returns user array', { tags: '@smoke @api' }, () => {
    cy.request('/api/users').then(({ status, body }) => {
      expect(status).to.eq(200)
      expect(body.users).to.be.an('array').and.have.length.greaterThan(0)
    })
  })

  it('GET /api/errors/404 returns 404 status', () => {
    cy.request({ url: '/api/errors/404', failOnStatusCode: false })
      .its('status').should('eq', 404)
  })

  it('GET /api/errors/422 returns 422 status', () => {
    cy.request({ url: '/api/errors/422', failOnStatusCode: false })
      .its('status').should('eq', 422)
  })
})
