# API — Rules engine and TestFlow patterns

This advanced module covers JSON Patch, test builders, service authentication, and mutable intercepts. Source file: [`rules.api.cy.js`](../../../../cypress/e2e/api/rules.api.cy.js).

## Learning objectives

When you finish, you will be able to:

- Build RFC 6902 operations with `JsonPatchBuilder` and factories.
- Distinguish `patchUserViaRules` from `tryPatchUserViaRules` (failOnStatusCode).
- Use `ApiTestPatterns` for read-after-write flows and mandatory fields.
- Configure OAuth-style tokens with `setServiceToken` and `apiWithAuth`.
- Mutate responses in intercepts to simulate edge states in the UI.

## Prerequisites

- Read the auth.api and users.api modules.
- Basic JSON Patch knowledge (op, path, value).
- Service variables in `cypress.env.json` for OAuth mock.

## Imports and dependencies

```javascript
import { JsonPatchBuilder, modifyPatchField } from '../../support/utilities/jsonPatchUtils'
import { ApiTestPatterns } from '../../support/utilities/testPatterns'
import { UserPatchFactory } from '../../support/factories'
import { HTTP_STATUS } from '../../support/@enums/httpStatus'
import { TC, tc } from '../../support/@enums/testCases'
```

The spec integrates patch utilities, data factories, reusable patterns, and HTTP enums — mirroring enterprise project architecture (TestFlow adapted).

## Global setup

```javascript
before(() => {
  cy.setServiceToken()
})
```

Before any context, the service token is obtained and stored in `Cypress.env('SERVICE_TOKEN')`. Contexts that need user auth use `cy.seedAuthToken()` in `beforeEach`.

## Context: JSON Patch utilities

### JsonPatchBuilder

```javascript
const patches = new JsonPatchBuilder()
  .replace('/name', 'Alex')
  .replace('/role', 'admin')
  .build()

expect(patches[0]).to.deep.eq({ op: 'replace', path: '/name', value: 'Alex' })
```

Fluent API for building patch arrays without manual arrays prone to typos.

### modifyPatchField for negative tests

```javascript
const base = UserPatchFactory.createNamePatch('A', 'B', 'C')
const invalid = modifyPatchField(base, '/name', null)
expect(invalid.find((p) => p.path === '/name').value).to.be.null
```

Derives invalid variants from a valid patch — a DRY pattern for negative testing.

## Context: patch vs tryPatch

| Command                 | Behavior                                           |
|-------------------------|----------------------------------------------------|
| `tryPatchUserViaRules`  | `failOnStatusCode: false` — captures 4xx/5xx       |
| `patchUserViaRules`     | Expects success; fails on error                    |

Valid patch accepts varied statuses (`OK`, `NO_CONTENT`, `NOT_FOUND`, `BAD_REQUEST`) depending on the mock. Invalid patch (path `/invalid`, user 999) expects 400, 404, 422, or 500. Use `cy.section` and `cy.task('logJson')` for CI diagnostics.

## Context: executeSuccessfulPatchFlow

Traceable case **TC-0301**:

```javascript
it(tc(TC.API_PATCH_READ_AFTER_WRITE, 'patches user and validates read-after-write with retry'), () => {
  const uniqueName = `PatchFlow ${Date.now()}`
  const patches = UserPatchFactory.createSimpleNamePatch(uniqueName)

  ApiTestPatterns.executeSuccessfulPatchFlow(
    1,
    patches,
    'patchUserViaRules',
    'name',
  )
})
```

The builder executes:

1. PATCH with the provided patches.
2. GET the resource (with retry) until the `name` field reflects the patched value.
3. Read-after-write consistency assertions.

`Date.now()` in the name avoids collisions between parallel runs.

## Context: mandatory field validation

```javascript
ApiTestPatterns.generateMandatoryFieldTests(
  ['/name'],
  basePatch,
  'tryPatchUserViaRules',
  1,
)
```

Dynamically generates tests that remove or nullify mandatory fields — mapped to **TC-0302**. Reduces boilerplate when there are dozens of mandatory fields.

## Context: Dual-service read after write

```javascript
cy.seedAuthToken()
ApiTestPatterns.executeSuccessfulGetFlow('/api/users', (body) => {
  expect(body.users).to.be.an('array').and.have.length.greaterThan(0)
  cy.validateJsonSchema(body.users[0], 'user.json')
})
```

Combines user token seed with authenticated GET and schema validation — a bridge between the auth layer and data layer.

## Context: OAuth and mutable intercept

`setServiceToken` persists the token in `Cypress.env`; `getServiceCredentials` returns `client_id` and `client_secret`. The `interceptGetUsersAndPatch` intercept clears `body.users` on Activity — same empty-list pattern as users.api, but mutating the response instead of a fixed fixture.

## How to run

```bash
npm run cy:run:api
npx cypress run --spec 'cypress/e2e/api/rules.api.cy.js'
npm run cy:run:smoke   # includes apiWithAuth @smoke
```

## Best practices and exercises

Use **factories** for data, **patterns** for long flows, **HTTP enums** instead of magic numbers, and **tryPatch** in negative tests. Exercises: `add` patch, extend mandatory tests to `/email`, map TC-0301/0302 in Jira. If `SERVICE_TOKEN` is undefined, review env vars; read-after-write timeouts indicate retry issues or invalid user ID.

## References

- Spec: [`cypress/e2e/api/rules.api.cy.js`](../../../../cypress/e2e/api/rules.api.cy.js)
- Patterns: [`cypress/support/utilities/testPatterns.js`](../../../../cypress/support/utilities/testPatterns.js)
- JSON Patch utils: [`cypress/support/utilities/jsonPatchUtils.js`](../../../../cypress/support/utilities/jsonPatchUtils.js)
- Factories: [`cypress/support/factories/index.js`](../../../../cypress/support/factories/index.js)
