const ENDPOINT = '/api/auth/login'

Cypress.Commands.add('seedAuthToken', (email, password) => {
  const user = email || Cypress.env('DEMO_EMAIL')
  const pass = password || Cypress.env('DEMO_PASSWORD')

  cy.request({ method: 'POST', url: ENDPOINT, body: { email: user, password: pass }, log: false })
    .then(({ body }) => {
      Cypress.env('AUTH_TOKEN', body.token)
      Cypress.env('ACCESS_TOKEN', body.token)
      return body
    })
})

Cypress.Commands.add('seedComplianceStatus', (status = 'NOT_STARTED') => {
  cy.task('setComplianceFlag', { userId: 'demo-user', flag: status })
  Cypress.env('COMPLIANCE_STATUS', status)
})

Cypress.Commands.add('cancelPendingTickets', (userId = 'demo-user') => {
  cy.task('resetUserProfile', { userId })
})

Cypress.Commands.add('apiSignIn', (credentials = {}) =>
  cy.request({
    method: 'POST',
    url: ENDPOINT,
    body: {
      email: credentials.email || Cypress.env('DEMO_EMAIL'),
      password: credentials.password || Cypress.env('DEMO_PASSWORD'),
      ...credentials,
    },
    log: false,
  }),
)

Cypress.Commands.add('getServiceCredentials', () =>
  cy.wrap({
    client_id: Cypress.env('SERVICE_CLIENT_ID') || 'testflow-client',
    client_secret: Cypress.env('SERVICE_CLIENT_SECRET') || 'testflow-secret',
  }),
)

Cypress.Commands.add('setServiceToken', () => {
  return cy.apiSignIn().then(({ body }) => {
    Cypress.env('SERVICE_TOKEN', body.token)
    return cy.wrap(body.token)
  })
})

Cypress.Commands.add('setBusinessToken', (userId = 'demo-user') => {
  cy.apiSignIn().then(({ body }) => {
    Cypress.env('BUSINESS_TOKEN', body.token)
    Cypress.env('BUSINESS_USER_ID', userId)
  })
})

Cypress.Commands.add('setEnvironment', (env) => {
  Cypress.env('ENV', env)
})

Cypress.Commands.add('getBaseUrl', () =>
  cy.wrap(Cypress.config('baseUrl') || Cypress.env('BASE_URL')),
)

Cypress.Commands.add('visitPage', (path = '/') => {
  cy.getBaseUrl().then((base) => {
    cy.visit(`${base}${path}`)
  })
})
