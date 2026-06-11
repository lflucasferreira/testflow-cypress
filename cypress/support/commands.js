// ─── Selector helpers ─────────────────────────────────────────────────────────

/** Shorthand for cy.get('[data-testid="..."]') */
Cypress.Commands.add('getByTestId', (testId, options) =>
  cy.get(`[data-testid="${testId}"]`, options)
)

/** Assert a testid element does NOT exist in the DOM */
Cypress.Commands.add('shouldNotExistByTestId', (testId) =>
  cy.get(`[data-testid="${testId}"]`).should('not.exist')
)

// ─── Auth ──────────────────────────────────────────────────────────────────────

/**
 * Full UI login — use when the login flow itself is under test.
 */
Cypress.Commands.add('login', (
  email = Cypress.env('DEMO_EMAIL'),
  password = Cypress.env('DEMO_PASSWORD'),
) => {
  cy.visit('/web/login.html')
  cy.getByTestId('login-email').type(email)
  cy.getByTestId('login-password').type(password, { log: false })
  cy.getByTestId('login-submit').click()
  cy.getByTestId('page-dashboard').should('exist')
})

/**
 * Programmatic login via API — use in beforeEach for non-auth tests (faster).
 * Sets sessionStorage directly so the app considers the user authenticated.
 */
Cypress.Commands.add('loginViaApi', (
  email = Cypress.env('DEMO_EMAIL'),
  password = Cypress.env('DEMO_PASSWORD'),
) => {
  cy.request({ method: 'POST', url: '/api/auth/login', body: { email, password } })
    .then(({ body }) => {
      cy.visit('/web/dashboard.html', {
        onBeforeLoad(win) {
          win.sessionStorage.setItem(
            'sandbox-auth',
            JSON.stringify({ email, name: body.user?.name ?? 'Demo User', token: body.token }),
          )
          win.sessionStorage.setItem('sandbox-token', body.token)
        },
      })
    })
})

/**
 * Navigate to any protected page with auth pre-set (skips dashboard).
 */
Cypress.Commands.add('visitAuthenticated', (path) => {
  cy.request({ method: 'POST', url: '/api/auth/login', body: {
    email: Cypress.env('DEMO_EMAIL'),
    password: Cypress.env('DEMO_PASSWORD'),
  }}).then(({ body }) => {
    cy.visit(path, {
      onBeforeLoad(win) {
        win.sessionStorage.setItem(
          'sandbox-auth',
          JSON.stringify({ email: Cypress.env('DEMO_EMAIL'), name: body.user?.name ?? 'Demo User', token: body.token }),
        )
        win.sessionStorage.setItem('sandbox-token', body.token)
      },
    })
  })
})

// ─── Table helpers ─────────────────────────────────────────────────────────────

/** Return all visible tbody rows of a table */
Cypress.Commands.add('getTableRows', (tableTestId = 'users-table') =>
  cy.getByTestId(tableTestId).find('tbody tr')
)

/** Get a specific cell by row id and field testid prefix */
Cypress.Commands.add('getCell', (rowId, field) =>
  cy.getByTestId(`cell-${field}-${rowId}`)
)
