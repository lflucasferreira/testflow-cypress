# API — Users & Health

This guide documents read tests, health checks, error simulation, and UI/API integration from [`users.api.cy.js`](../../../../cypress/e2e/api/users.api.cy.js).

## Learning objectives

You will learn to:

- Validate REST list responses with JSON schema and email regex.
- Monitor latency on critical endpoints (`/api/users`, `/health`).
- Test controlled error endpoints (404, 422).
- Mock GET responses with fixtures and intercepts on the Activity page.
- Use Cypress tasks to read fixtures from the filesystem.

## Prerequisites

- Schema `user.json` in `cypress/fixtures/schemas/` (used by `cy.validateJsonSchema`).
- Session or public API available for `GET /api/users`.
- Familiarity with `cy.request` and `@smoke` tags.

## Overview

The main `describe` **API — Users & Health** is split into four contexts:

```
GET /api/users          → listing contract
GET /health             → service availability
Error simulation        → /api/errors/* endpoints
Fixture + intercept     → Activity UI with mocks
```

Tags: `@api @regression` on the describe; `@smoke` on health and users status 200.

## Context: GET /api/users

### Shared before hook

As in auth.api, a single request feeds multiple assertions:

```javascript
before(() => {
  cy.request('/api/users').then((r) => { res = r })
})
```

### Contract assertions

| Test                    | What it validates                                 |
|-------------------------|---------------------------------------------------|
| Status 200              | Endpoint accessible                               |
| Duration < 2000 ms      | Acceptable performance                            |
| `body.users` array      | Non-empty list                                    |
| JSON Schema per user    | Structure per `user.json`                         |
| Email regex             | Format `user@domain.tld`                          |

### Schema validation

```javascript
res.body.users.forEach((user) => {
  cy.validateJsonSchema(user, 'user.json')
})
```

The helper uses AJV to ensure each user object matches the schema — required fields, types, and formats. This catches silent breaking changes when the API adds or removes properties.

### Email validation

```javascript
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
expect(user.email).to.match(emailRegex)
```

Complements the schema with a readable business rule — useful when the schema accepts a generic string but the domain requires a specific format.

## Context: GET /health

Health checks are fast and commonly used in smoke pipelines:

```javascript
cy.request('/health').its('status').should('eq', 200)
cy.request('/health').its('duration').should('be.lessThan', 1000)
```

A more aggressive SLA (1000 ms vs 2000 ms for users) reflects the expectation of a minimal response without heavy logic.

## Context: Error simulation endpoints

TestFlow exposes test routes that return predictable errors:

```javascript
cy.request({ url: '/api/errors/404', failOnStatusCode: false })
  .its('status').should('eq', 404)
```

Patterns tested:

- Exact status (404, 422).
- Presence of error message (`message` or `error.message`).

These endpoints let you validate client-side error handlers and logging middleware without depending on real production failures.

## Context: Fixture + intercept on Activity page

This block connects API testing to the user experience on the Activity page.

### beforeEach with session

```javascript
beforeEach(() => {
  cy.visitWithSession('/web/activity.html')
})
```

Each test starts from a consistent authenticated state.

### mockApiGet with fixture

```javascript
cy.mockApiGet('users/empty-list', /\/api\/users/)
cy.getByTestId('fetch-users-btn').click()
cy.wait('@mock_users_empty-list')
cy.getByTestId('api-result').should('contain.text', 'Fetched 0 users')
```

The helper registers an intercept that serves the `users/empty-list` fixture when the UI triggers a fetch. The `@mock_users_empty-list` alias synchronizes the click with the mocked response.

**Why test an empty list?** Edge states (zero records) often break templates that assume `users[0]` exists.

### readFixture task

```javascript
cy.task('readFixture', 'lookups/countries.json').then((data) => {
  expect(data.countries).to.be.an('array').and.have.length.greaterThan(0)
  expect(data.countries[0]).to.include.keys('code', 'name')
})
```

Tasks run in the Cypress Node process — ideal for reading JSON from disk without going through the browser. Validates lookup structure used in other flows.

Activity + mock flow: register intercept → click fetch → wait on alias → assert "Fetched 0 users".

## How to run

```bash
npm run cy:run:api
npx cypress run --spec 'cypress/e2e/api/users.api.cy.js'
npm run cy:run:activity   # Activity page E2E specs (complementary)
```

Related to auth.api (token), rules.api (PATCH), and the `user.json` schema. Use `failOnStatusCode: false` for simulated errors, validate all users with schema, and always `wait` on the mock alias. Exercise: fixture `users/single-user.json` with "Fetched 1 users".

## References

- Spec: [`cypress/e2e/api/users.api.cy.js`](../../../../cypress/e2e/api/users.api.cy.js)
- Intercepts: [`cypress/support/commands/interceptions.js`](../../../../cypress/support/commands/interceptions.js)
- User schema: [`cypress/fixtures/schemas/user.json`](../../../../cypress/fixtures/schemas/user.json)
