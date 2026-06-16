# API — Authentication (POST /api/auth/login)

This module covers contract and integration tests for the login endpoint. The source file is [`auth.api.cy.js`](../../../../cypress/e2e/api/auth.api.cy.js).

## Learning objectives

After this training, you will know how to:

- Validate HTTP responses with `cy.request` without opening the browser.
- Reuse a single response across multiple `it()` blocks with a `before` hook.
- Test invalid credentials and malformed payloads with `failOnStatusCode: false`.
- Combine network interception with UI flow to validate the contract end-to-end.

## Prerequisites

- `DEMO_EMAIL` and `DEMO_PASSWORD` in `cypress.env.json` or CI secrets.
- TestFlow server (or mock) responding on `POST /api/auth/login`.
- Basic knowledge of HTTP status codes (200, 401, 4xx) and JSON format.

## Overview

The spec organizes scenarios into four `context` blocks:

| Context               | Focus                                     |
|-----------------------|-------------------------------------------|
| Valid credentials     | Success contract + reusable token         |
| Invalid credentials   | 401 for wrong password/email              |
| Malformed request     | 4xx for incomplete body                   |
| Intercept — login flow| UI + network (stub and real contract)     |

Global tags: `@api @regression`. Critical cases use `@smoke @api @critical`.

## Context: Valid credentials

### before + multiple asserts pattern

```javascript
let res

before(() => {
  cy.request({ method: 'POST', url: ENDPOINT, body: VALID })
    .then((r) => { res = r })
})
```

A single request feeds multiple tests — reduces server load and ensures consistency. Each `it()` inspects a different aspect of the same response:

- **Status 200** — success code.
- **Content-Type** — header includes `application/json`.
- **Duration** — response in under 2000 ms (performance SLA).
- **Token** — non-empty string in body (`@critical`).
- **User object** — when present, `user.email` is a valid string matching the submitted email.
- **Functional token** — Bearer token authenticates `GET /api/users` with status 200.

The last test proves the token is not merely decorative — it works on subsequent calls.

## Context: Invalid credentials

Basic security tests with `failOnStatusCode: false`:

```javascript
cy.request({
  method: 'POST',
  url: ENDPOINT,
  body: { email: VALID.email, password: 'wrongpassword' },
  failOnStatusCode: false,
}).its('status').should('eq', 401)
```

Without `failOnStatusCode: false`, Cypress would fail on a 401 response. Scenarios covered:

1. Wrong password for valid email → 401.
2. Unknown email → 401.
3. Error body contains non-empty `message` or `error.message`.

The `body.message ?? body.error?.message` pattern tolerates format variations across backends.

## Context: Malformed request

Server input validation:

| Scenario           | Body sent                 | Expected status |
|--------------------|---------------------------|-----------------|
| Empty body         | `{}`                      | 400–422         |
| Missing email      | `{ password }`            | 400–422         |
| Missing password   | `{ email }`               | 400–422         |

Using `.should('be.within', 400, 422)` accommodates APIs that return 400 or 422 for validation — common across different frameworks.

## Context: Intercept — login flow

Here API meets UI. Two complementary scenarios:

### Real network contract

```javascript
cy.intercept('POST', ENDPOINT).as('loginCall')
// ... fill form and click submit
cy.wait('@loginCall').then(({ request, response }) => {
  expect(request.body.email).to.eq(VALID.email)
  expect(response.statusCode).to.eq(200)
  expect(response.body.token).to.be.a('string').and.not.be.empty
})
```

The `login-use-api` toggle enables the mode that calls the real API. The intercept confirms payload and response without mocking the backend.

### 500 error stub

```javascript
cy.intercept('POST', ENDPOINT, {
  statusCode: 500,
  body: { error: 'Internal Server Error' },
}).as('loginFail')
```

After submit, the URL stays on `/web/login.html` — the app does not redirect on failure. If `login-result` is visible, the text must not be empty (user feedback).

**Note:** the password is typed with `{ log: false }` so it does not appear in Cypress logs.

## Commands and constants

```javascript
const ENDPOINT = '/api/auth/login'
const VALID = {
  email: Cypress.env('DEMO_EMAIL'),
  password: Cypress.env('DEMO_PASSWORD'),
}
```

Centralizing endpoint and credentials simplifies maintenance when routes or variables change.

## How to run

```bash
# Full API suite
npm run cy:run:api

# Auth only
npx cypress run --spec 'cypress/e2e/api/auth.api.cy.js'

# API smoke (includes @smoke cases from this file)
npm run cy:run:smoke
```

## Best practices demonstrated

1. **Happy path / sad path separation** — distinct contexts improve readability in Mochawesome reports.
2. **Atomic assertions** — one `it()` per property makes it easy to identify which contract broke.
3. **Downstream token test** — validates the full auth → protected resource cycle.
4. **Intercept + UI** — ensures frontend and backend speak the same contract.

## Practical exercises

1. Add a test for invalid email format (`not-an-email`) expecting 4xx.
2. Stub a 401 response and verify the UI displays an error message.
3. Measure `duration` on invalid credential tests too and document the SLA.
4. Map each `it()` to an Xray case using IDs in `testCases.js` (e.g. `TC-0021`).

## Troubleshooting

| Symptom                         | Likely cause                            |
|---------------------------------|-----------------------------------------|
| 401 on valid credential tests   | Incorrect `DEMO_*` or missing user      |
| Intercept not firing            | API toggle off or different URL         |
| Duration > 2000 ms              | Slow server or CI cold start            |
| Empty token                     | API contract changed (field renamed)    |

## References

- Spec: [`cypress/e2e/api/auth.api.cy.js`](../../../../cypress/e2e/api/auth.api.cy.js)
- UI selector strategy: [`docs/selector-strategy.md`](../../../selector-strategy.md)
- HTTP status enum: [`cypress/support/@enums/httpStatus.js`](../../../../cypress/support/@enums/httpStatus.js)
