const { generateCorrelationId } = require('../utilities/generators')
const { HTTP_STATUS } = require('../@enums/httpStatus')

function authHeaders(extra = {}) {
  const token = Cypress.env('AUTH_TOKEN') || Cypress.env('ACCESS_TOKEN')
  return {
    Authorization: token ? `Bearer ${token}` : undefined,
    'Correlation-Id': generateCorrelationId(),
    ...extra,
  }
}

Cypress.Commands.add('patchUserViaRules', (userId, patches) => {
  const isPatchArray = Array.isArray(patches)
  return cy.request({
    method: 'PATCH',
    url: `/api/users/${userId}`,
    body: patches,
    headers: authHeaders({
      'Content-Type': isPatchArray
        ? 'application/json-patch+json'
        : 'application/json',
    }),
    failOnStatusCode: false,
    log: false,
  })
})

Cypress.Commands.add('tryPatchUserViaRules', (patches, userId = 1) =>
  cy.patchUserViaRules(userId, patches),
)

Cypress.Commands.add('getUsersViaProfile', () =>
  cy.request({
    method: 'GET',
    url: '/api/users',
    headers: authHeaders(),
  }),
)

Cypress.Commands.add('patchDisplayNameViaRules', (userId, patches) =>
  cy.patchUserViaRules(userId, patches),
)

Cypress.Commands.add('tryPatchDisplayNameViaRules', (patches) =>
  cy.tryPatchUserViaRules(patches),
)

Cypress.Commands.add('assertPatchSuccess', (response) => {
  expect(response.status).to.be.oneOf([HTTP_STATUS.OK, HTTP_STATUS.NO_CONTENT])
})
