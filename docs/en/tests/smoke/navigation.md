# Smoke — Navigation and API Health

**Source file:** [`navigation.cy.js`](../../../../cypress/e2e/smoke/navigation.cy.js)

---

## Purpose

This **smoke** suite verifies that the TestFlow application is operational after authentication. It covers three complementary dimensions:

1. **Page loading** — each authenticated route opens without error and exposes the expected root element.
2. **Sidebar navigation** — links, active state, and logout behave according to the UI contract.
3. **API health** — critical endpoints respond with the correct status and payload.

The suite is designed to be **fast**: it uses `cy.session` to reuse authentication and checks only the root of each page, without deep flows.

---

## Prerequisites

| Item | Detail |
|------|--------|
| **TestFlow** | Application running at `http://localhost:5050` (or the `baseUrl` configured in `cypress.config.js`) |
| **Dependencies** | `npm install` executed at the project root |
| **Credentials** | `DEMO_EMAIL` and `DEMO_PASSWORD` defined in `cypress.env.json` or Cypress environment variables |
| **Execution** | `npx cypress run --spec cypress/e2e/smoke/navigation.cy.js` or interactive mode via `npx cypress open` |

---

## Tags used

| Tag | Where it appears | Meaning |
|-----|------------------|---------|
| `@smoke` | `describe`, page and API `it` blocks | Fast post-deploy sanity checks |
| `@regression` | All `describe` blocks | Included in the full regression suite |
| `@critical` | Team navigation, login API, logout | Flows that block application usage |
| `@api` | "API health" block | HTTP tests via `cy.request`, no browser |

---

## Cypress concepts

| Concept | Usage in this file |
|---------|-------------------|
| [`cy.session`](../../../../cypress/support/commands.js) | Login cache via `cy.createAuthSession()` — avoids repeating auth POST in every test |
| [`cy.visitWithSession`](../../../../cypress/support/commands.js) | Combines session + visit + onboarding tour skip |
| [`cy.getByTestId`](../../../../cypress/support/commands.js) | Stable selectors via `data-testid` |
| [`cy.request`](https://docs.cypress.io/api/commands/request) | Direct HTTP calls, no UI |
| [`validateJsonSchema`](../../../../cypress/support/commands.js) | Validates response against JSON Schema in [`cypress/fixtures/schemas/`](../../../../cypress/fixtures/schemas/) |
| [`TC` / `tc()`](../../../../cypress/support/@enums/testCases.js) | Traceable IDs (e.g. `TC-0001`) prefixed in test titles |
| `failOnStatusCode: false` | Allows asserting 404/422 status without automatic failure |

---

## Step-by-step — block by block

### Block 1 — Imports and page list

```javascript
import { TC, tc } from '../../support/@enums/testCases'

const PAGES = [
  { path: '/web/dashboard.html', testId: 'page-dashboard', title: 'Dashboard', tcId: TC.SMOKE_DASHBOARD },
  // ... remaining pages
]
```

- **Given:** the project imports test case enums for traceability with Jira/Xray.
- **When:** `PAGES` defines the contract for each route — path, root `testId`, and expected `<title>`.
- **Then:** adding a new page requires only one array entry, without duplicating logic.

---

### Block 2 — Smoke: page loading

```javascript
describe('Smoke — page navigation', { tags: '@smoke @regression' }, () => {
  beforeEach(() => {
    cy.createAuthSession()
  })

  PAGES.forEach(({ path, testId, title, tcId }) => {
    it(tc(tcId, `${title} page loads without error`), { tags: '@smoke' }, () => {
      cy.visit(path)
      cy.getByTestId(testId).should('exist')
      cy.title().should('include', title)
    })
  })
})
```

- **Given:** an authenticated session exists (via internal `cy.session`).
- **When:** the test visits each path and looks up the root element by `data-testid`.
- **Then:** the page exists in the DOM and the browser title contains the expected name — minimal proof of rendering without explicit JS errors (monitored globally in `support/e2e.js`).

**Pages covered:** Dashboard, Team, Settings, Components, Activity, Advanced, Wizard, UI States.

---

### Block 3 — Smoke: sidebar navigation

```javascript
describe('Smoke — sidebar navigation', { tags: '@smoke @regression' }, () => {
  beforeEach(() => {
    cy.visitWithSession('/web/dashboard.html')
    cy.getByTestId('page-dashboard').should('exist')
  })

  it(tc(TC.SMOKE_NAV_TEAM, 'navigates from dashboard to team via sidebar'), { tags: '@smoke @critical' }, () => {
    cy.getByTestId('nav-team').click()
    cy.getByTestId('page-team').should('exist')
    cy.url().should('include', '/web/team.html')
  })
```

- **Given:** an authenticated user is on the dashboard with the sidebar visible.
- **When:** they click the `nav-team` link.
- **Then:** the URL changes to `/web/team.html` and `page-team` appears in the DOM.

**Active link test:**

```javascript
  it(tc(TC.SMOKE_NAV_ACTIVE, 'highlights the active nav link'), { tags: '@smoke' }, () => {
    cy.getByTestId('nav-dashboard').should('have.class', 'active')
  })
```

- **Given:** the dashboard is the current route.
- **When:** the corresponding menu item is inspected.
- **Then:** it has the CSS class `active` — visual navigation feedback.

**Logout test:**

```javascript
  it(tc(TC.SMOKE_LOGOUT, 'logout clears session and redirects to login'), { tags: '@critical' }, () => {
    cy.getByTestId('nav-logout').click()
    cy.url().should('include', '/web/index.html')
    cy.window().then((win) => {
      expect(win.sessionStorage.getItem('sandbox-auth')).to.be.null
    })
  })
```

- **Given:** an active session in `sessionStorage`.
- **When:** the user clicks logout.
- **Then:** they are redirected to login and `sandbox-auth` is removed.

---

### Block 4 — Smoke: API health

```javascript
describe('Smoke — API health', { tags: '@smoke @api @regression' }, () => {
  it(tc(TC.SMOKE_HEALTH, 'GET /health returns 200'), { tags: '@smoke @api' }, () => {
    cy.request('/health').its('status').should('eq', 200)
  })
```

- **Given:** the TestFlow backend is reachable.
- **When:** `GET /health` is executed.
- **Then:** the HTTP status is 200.

**Login via API:**

```javascript
  it(tc(TC.SMOKE_AUTH_LOGIN, 'POST /api/auth/login returns token'), { tags: '@smoke @api @critical' }, () => {
    cy.request({
      method: 'POST',
      url: '/api/auth/login',
      body: { email: Cypress.env('DEMO_EMAIL'), password: Cypress.env('DEMO_PASSWORD') },
    }).then(({ status, body }) => {
      expect(status).to.eq(200)
      cy.validateJsonSchema(body, 'auth-login.json')
      expect(body.user.email).to.eq(Cypress.env('DEMO_EMAIL'))
    })
  })
```

- **Given:** valid DEMO credentials.
- **When:** `POST /api/auth/login` with a JSON body.
- **Then:** response is 200, [`auth-login.json`](../../../../cypress/fixtures/schemas/auth-login.json) schema is valid, and the user email matches.

**User listing:**

```javascript
  it(tc(TC.SMOKE_USERS_LIST, 'GET /api/users returns user array'), { tags: '@smoke @api' }, () => {
    cy.request('/api/users').then(({ status, body }) => {
      expect(status).to.eq(200)
      cy.validateJsonSchema(body, 'users-list.json')
    })
  })
```

- **Given:** endpoint is public or authenticated per sandbox configuration.
- **When:** `GET /api/users`.
- **Then:** array validated against [`users-list.json`](../../../../cypress/fixtures/schemas/users-list.json).

**Error endpoints:**

```javascript
  it(tc(TC.SMOKE_ERROR_404, 'GET /api/errors/404 returns 404 status'), () => {
    cy.request({ url: '/api/errors/404', failOnStatusCode: false })
      .its('status').should('eq', 404)
  })

  it(tc(TC.SMOKE_ERROR_422, 'GET /api/errors/422 returns 422 status'), () => {
    cy.request({ url: '/api/errors/422', failOnStatusCode: false })
      .its('status').should('eq', 422)
  })
```

- **Given:** simulated error routes exist on the backend.
- **When:** request is made with `failOnStatusCode: false`.
- **Then:** Cypress does not abort the test and the asserted status is 404 or 422 respectively.

---

## How to run

```bash
# Full smoke suite
npx cypress run --env grepTags=@smoke

# This file only
npx cypress run --spec cypress/e2e/smoke/navigation.cy.js

# @api tests in this file only
npx cypress run --spec cypress/e2e/smoke/navigation.cy.js --env grepTags=@api
```

---

## Related references

- Page Objects: not used in this suite (direct selectors via `getByTestId`)
- Custom commands: [`cypress/support/commands.js`](../../../../cypress/support/commands.js)
- Test case enums: [`cypress/support/@enums/testCases.js`](../../../../cypress/support/@enums/testCases.js)
