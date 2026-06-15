// ─── Selector helpers ─────────────────────────────────────────────────────────

/** Shorthand for cy.get('[data-testid="..."]') */
Cypress.Commands.add('getByTestId', (testId, options) =>
  cy.get(`[data-testid="${testId}"]`, options),
)

/** Slides convention — matches data-cy-hook OR data-testid */
Cypress.Commands.add('getByHook', (hook, options) =>
  cy.get(`[data-cy-hook="${hook}"], [data-testid="${hook}"]`, options),
)

Cypress.Commands.add('assertHookVisible', (hook) =>
  cy.getByHook(hook).should('be.visible'),
)

Cypress.Commands.add('assertHookMissing', (hook) =>
  cy.getByHook(hook).should('not.exist'),
)

/** @deprecated use assertHookMissing */
Cypress.Commands.add('shouldNotExistByTestId', (testId) =>
  cy.get(`[data-testid="${testId}"]`).should('not.exist'),
)

// ─── Auth ──────────────────────────────────────────────────────────────────────

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

/** Alias matching slides naming */
Cypress.Commands.add('signInViaUI', (email, password) => cy.login(email, password))

Cypress.Commands.add('loginViaApi', (
  email = Cypress.env('DEMO_EMAIL'),
  password = Cypress.env('DEMO_PASSWORD'),
) => {
  cy.request({ method: 'POST', url: '/api/auth/login', body: { email, password }, log: false })
    .then(({ body }) => {
      Cypress.env('AUTH_TOKEN', body.token)
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

Cypress.Commands.add('signInViaAPI', (email, password) => cy.loginViaApi(email, password))

Cypress.Commands.add('visitAuthenticated', (path) => {
  cy.request({
    method: 'POST',
    url: '/api/auth/login',
    body: {
      email: Cypress.env('DEMO_EMAIL'),
      password: Cypress.env('DEMO_PASSWORD'),
    },
    log: false,
  }).then(({ body }) => {
    Cypress.env('AUTH_TOKEN', body.token)
    cy.visit(path, {
      onBeforeLoad(win) {
        win.sessionStorage.setItem(
          'sandbox-auth',
          JSON.stringify({
            email: Cypress.env('DEMO_EMAIL'),
            name: body.user?.name ?? 'Demo User',
            token: body.token,
          }),
        )
        win.sessionStorage.setItem('sandbox-token', body.token)
      },
    })
  })
})

Cypress.Commands.add('visitAsUser', (path) => cy.visitAuthenticated(path))

Cypress.Commands.add('createAuthSession', (email, password) => {
  const user = email || Cypress.env('DEMO_EMAIL')
  const pass = password || Cypress.env('DEMO_PASSWORD')
  const cacheAcrossSpecs = Cypress.env('sessionCacheAcrossSpecs') !== false

  cy.session(
    [user, pass, Cypress.env('ENV') || 'local'],
    () => {
      cy.seedAuthToken(user, pass)
      cy.signInViaUI(user, pass)
      cy.url().should('not.include', '/web/login.html')
      cy.skipOnboardingTour()
      cy.getByTestId('page-dashboard').should('exist')
    },
    {
      cacheAcrossSpecs,
      validate() {
        cy.window().then((win) => {
          const auth = win.sessionStorage.getItem('sandbox-auth')
          if (!auth) throw new Error('Session expired')
        })
      },
    },
  )
})

/** Cached auth via cy.session, then navigate to an authenticated page */
Cypress.Commands.add('visitWithSession', (path = '/web/dashboard.html') => {
  cy.createAuthSession()
  cy.visit(path)
  cy.skipOnboardingTour()
})

// ─── API helpers ───────────────────────────────────────────────────────────────

Cypress.Commands.add('apiRequest', (options) => {
  cy.request({
    method: 'POST',
    url: '/api/auth/login',
    body: {
      email: Cypress.env('DEMO_EMAIL'),
      password: Cypress.env('DEMO_PASSWORD'),
    },
    log: false,
  }).then(({ body }) => {
    cy.request({
      ...options,
      headers: {
        Authorization: `Bearer ${body.token}`,
        'Correlation-Id': Cypress._.random(0, 1e16).toString(),
        ...options.headers,
      },
    })
  })
})

Cypress.Commands.add('apiWithAuth', (options) => cy.apiRequest(options))

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

Cypress.Commands.add('assertResponseShape', (obj, schema) => cy.validateSchema(obj, schema))

// ─── Table helpers ─────────────────────────────────────────────────────────────

Cypress.Commands.add('getTableRows', (tableTestId = 'users-table') =>
  cy.getByTestId(tableTestId).find('tbody tr'),
)

Cypress.Commands.add('getTableCell', (rowId, field) =>
  cy.getByTestId(`cell-${field}-${rowId}`),
)

/** @deprecated use getTableCell */
Cypress.Commands.add('getCell', (rowId, field) => cy.getTableCell(rowId, field))

// ─── Modular command groups ────────────────────────────────────────────────────

require('./commands/interceptions')
require('./commands/api-setup')
require('./commands/api-rules')
require('./commands/actions')
