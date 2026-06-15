const ENDPOINT = '/api/auth/login'

Cypress.Commands.add('interceptLogin', () =>
  cy.intercept('POST', ENDPOINT).as('loginApi'),
)

Cypress.Commands.add('interceptGetUsers', () =>
  cy.intercept('GET', /\/api\/users/).as('getUsers'),
)

Cypress.Commands.add('interceptGetUsersAndPatch', (mutator) =>
  cy.intercept('GET', /\/api\/users/, (req) => {
    req.reply((res) => {
      if (typeof mutator === 'function' && res.body) {
        mutator(res.body)
      }
    })
  }).as('getUsersPatched'),
)

Cypress.Commands.add('interceptPatchUser', () =>
  cy.intercept('PATCH', '/api/**').as('patchUser'),
)

Cypress.Commands.add('interceptPutUser', () =>
  cy.intercept('PUT', '/api/**').as('putUser'),
)

Cypress.Commands.add('interceptInvite', () =>
  cy.intercept('POST', '/api/**').as('inviteApi'),
)

Cypress.Commands.add('interceptPasswordChange', () =>
  cy.intercept('POST', '/api/**').as('passwordChange'),
)

Cypress.Commands.add('interceptRotateToken', () =>
  cy.intercept('/api/**').as('rotateRequest'),
)

Cypress.Commands.add('mockApiGet', (fixture, urlPattern) =>
  cy.intercept('GET', urlPattern, { fixture }).as(`mock_${fixture.replace(/\//g, '_')}`),
)

Cypress.Commands.add('mockCountriesLookup', () =>
  cy.intercept('GET', '**/lookups/countries**', { fixture: 'lookups/countries' }).as('countriesLookup'),
)

Cypress.Commands.add('stubPatchResource', (resource) =>
  cy.intercept('PATCH', `**/api/**/${resource}**`, { statusCode: 204, body: {} }).as(`patch_${resource}`),
)

Cypress.Commands.add('stubLoginFailure', (statusCode = 500) =>
  cy.intercept('POST', ENDPOINT, {
    statusCode,
    body: { error: 'Internal Server Error' },
  }).as('loginFail'),
)

Cypress.Commands.add('stubEmptyUsersList', () =>
  cy.intercept('GET', /\/api\/users/, {
    statusCode: 200,
    body: { users: [] },
  }).as('emptyUsers'),
)

Cypress.Commands.add('stubUsersError', (statusCode = 500) =>
  cy.intercept('GET', /\/api\/users/, {
    statusCode,
    body: { message: 'Internal Server Error' },
  }).as('failUsers'),
)

Cypress.Commands.add('interceptSlowUsers', (delayMs = 2000) =>
  cy.intercept('GET', /\/api\/users/, (req) => {
    req.reply((res) => {
      res.delay = delayMs
      return res
    })
  }).as('slowUsers'),
)

Cypress.Commands.add('interceptSlowApi', (delayMs = 2000) =>
  cy.intercept('GET', /\/api\/slow/, (req) => {
    req.reply((res) => {
      res.delay = delayMs
      return res
    })
  }).as('slowApi'),
)

Cypress.Commands.add('interceptWithHeader', (method, url, headerName, headerValue) =>
  cy.intercept(method, url, (req) => {
    req.headers[headerName] = headerValue
  }),
)
