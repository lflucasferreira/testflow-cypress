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

// ─── API helpers ───────────────────────────────────────────────────────────────

/**
 * Authenticated cy.request — fetches a token and attaches it as Bearer header.
 * Usage: cy.apiRequest({ method: 'GET', url: '/api/users' })
 */
Cypress.Commands.add('apiRequest', (options) => {
  cy.request({
    method: 'POST',
    url: '/api/auth/login',
    body: {
      email: Cypress.env('DEMO_EMAIL'),
      password: Cypress.env('DEMO_PASSWORD'),
    },
  }).then(({ body }) => {
    cy.request({
      ...options,
      headers: {
        Authorization: `Bearer ${body.token}`,
        ...options.headers,
      },
    })
  })
})

/**
 * Assert that an object contains expected keys with expected types.
 * schema: { key: 'string' | 'number' | 'boolean' | 'array' | 'object' }
 * Usage: cy.validateSchema(responseBody, { id: 'number', name: 'string' })
 */
Cypress.Commands.add('validateSchema', (obj, schema) => {
  Object.entries(schema).forEach(([key, type]) => {
    expect(obj, 'response body').to.have.property(key)
    if (type === 'array') {
      expect(obj[key], `"${key}"`).to.be.an('array')
    } else {
      expect(typeof obj[key], `"${key}" should be ${type}`).to.eq(type)
    }
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
