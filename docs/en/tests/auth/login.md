# Authentication — Login

**Source file:** [`login.cy.js`](../../../../cypress/e2e/auth/login.cy.js)

---

## Purpose

This suite validates the **full authentication flow** of the TestFlow application through the login screen. It covers:

- Form structure and accessibility
- Successful login (pure UI and with API toggle)
- Session persistence in `sessionStorage`
- Rejection of invalid credentials
- HTML5 validation and "Remember me" checkbox behavior
- Route protection and post-login redirect
- Accessibility verification with axe-core

It is the foundation for understanding how [`LoginPage`](../../../../cypress/pages/LoginPage.js) encapsulates reusable selectors and actions.

---

## Prerequisites

| Item | Detail |
|------|--------|
| **TestFlow** | Running at `http://localhost:5050` |
| **Dependencies** | `npm install` at the project root |
| **DEMO credentials** | `DEMO_EMAIL` (`demo@automation.io`) and `DEMO_PASSWORD` (`Demo123!`) in `cypress.env.json` |
| **Fixture** | [`credentials.json`](../../../../cypress/fixtures/credentials.json) with valid/invalid pairs for negative tests |
| **Execution** | `npx cypress run --spec cypress/e2e/auth/login.cy.js` |

---

## Tags used

| Tag | Where it appears | Meaning |
|-----|------------------|---------|
| `@regression` | Main `describe` | Full regression suite |
| `@smoke` | Successful UI login | Critical post-deploy sanity |
| `@critical` | `AUTH_LOGIN_SUCCESS` | Blocks all authenticated usage if it fails |
| `@a11y` | Accessibility test | Validates critical violations with axe |

---

## Cypress concepts

| Concept | Usage in this file |
|---------|-------------------|
| **Page Object** | [`LoginPage`](../../../../cypress/pages/LoginPage.js) — fluent methods (`loginWith`, `shouldRedirectToDashboard`) |
| **`context()`** | Groups tests by theme (structure, valid credentials, invalid, etc.) |
| **`cy.fixture().as()`** | Loads [`credentials.json`](../../../../cypress/fixtures/credentials.json) as alias `@creds` |
| **`function ()` vs arrow** | Tests using `this.creds` use `function` to access Mocha context |
| **`cy.intercept()`** | Spies on `POST /api/auth/login` when "Use API" toggle is active |
| **`cy.window()`** | Inspects `sessionStorage` after login |
| **`cy.checkA11yPage`** | axe-core integration scoped to `[data-testid="login-form"]` |
| **`TC` / `tc()`** | Traceable IDs (`TC-0100`, `TC-0101`) in test titles |

---

## Step-by-step — block by block

### Block 1 — Setup and Page Object

```javascript
import LoginPage from '../../pages/LoginPage'
import { TC, tc } from '../../support/@enums/testCases'

describe('Authentication', { tags: '@regression' }, () => {
  beforeEach(() => {
    LoginPage.visit()
  })
```

- **Given:** each test starts on the login page.
- **When:** `LoginPage.visit()` executes encapsulated `cy.visit`.
- **Then:** clean state — no prior session assumed (except where the test creates one).

---

### Block 2 — Page structure

```javascript
  context('Page structure', () => {
    it(tc(TC.AUTH_LOGIN_FORM, 'renders all form elements'), () => {
      LoginPage.emailInput().should('be.visible')
      LoginPage.passwordInput().should('be.visible')
      LoginPage.submitBtn().should('be.visible').and('not.be.disabled')
      LoginPage.rememberCheckbox().should('exist')
      LoginPage.useApiCheckbox().should('exist')
    })
```

- **Given:** login page loaded.
- **When:** Page Object exposes each field via `data-testid`.
- **Then:** email, password, submit, remember, and use-api exist and submit is not disabled.

**Placeholder and field type:**

```javascript
    it('has correct placeholder text on email field', () => {
      LoginPage.emailInput().should('have.attr', 'placeholder', 'demo@automation.io')
    })

    it('password field masks input', () => {
      LoginPage.passwordInput().should('have.attr', 'type', 'password')
    })
```

- **Given:** form rendered.
- **When:** native HTML attributes are inspected.
- **Then:** placeholder guides the demo user and password uses `type="password"`.

---

### Block 3 — Valid credentials

```javascript
  context('Valid credentials', () => {
    it(tc(TC.AUTH_LOGIN_SUCCESS, 'logs in via UI and redirects to dashboard'), { tags: '@smoke @critical' }, () => {
      LoginPage
        .loginWith(Cypress.env('DEMO_EMAIL'), Cypress.env('DEMO_PASSWORD'))
        .shouldRedirectToDashboard()
    })
```

- **Given:** valid DEMO credentials.
- **When:** email/password are filled and submitted via Page Object.
- **Then:** URL contains `/web/dashboard.html` and `page-dashboard` exists — main happy path.

**Login with intercepted API:**

```javascript
    it('logs in with API toggle enabled', () => {
      cy.section('Setup intercept')
      cy.interceptLogin()

      LoginPage
        .toggleUseApi()
        .loginWith(Cypress.env('DEMO_EMAIL'), Cypress.env('DEMO_PASSWORD'))

      cy.wait('@loginApi').its('response.statusCode').should('eq', 200)
      LoginPage.shouldRedirectToDashboard()
    })
```

- **Given:** "Use API" checkbox enabled and intercept registered as `@loginApi`.
- **When:** login triggers a real request to the backend.
- **Then:** 200 response confirmed before redirect.

**SessionStorage persistence:**

```javascript
    it('sets auth data in sessionStorage after login', () => {
      LoginPage.loginWith(Cypress.env('DEMO_EMAIL'), Cypress.env('DEMO_PASSWORD'))

      cy.window().then((win) => {
        const auth = JSON.parse(win.sessionStorage.getItem('sandbox-auth') ?? 'null')
        expect(auth).to.not.be.null
        expect(auth.email).to.eq(Cypress.env('DEMO_EMAIL'))
      })
    })
```

- **Given:** successful login.
- **When:** `sandbox-auth` is read from `sessionStorage`.
- **Then:** JSON object contains the authenticated user's email.

**Success message before redirect:**

```javascript
    it('shows success message before redirect', () => {
      LoginPage.loginWith(Cypress.env('DEMO_EMAIL'), Cypress.env('DEMO_PASSWORD'))
      cy.get('body').then(($body) => {
        const $result = $body.find('[data-testid="login-result"]')
        if ($result.length && $result.is(':visible')) {
          expect($result.text()).to.include('Login successful')
        }
      })
      LoginPage.shouldRedirectToDashboard()
    })
```

- **Given:** successful login in progress.
- **When:** the result element is conditionally visible.
- **Then:** text includes "Login successful" before dashboard redirect.

---

### Block 4 — Invalid credentials

```javascript
  context('Invalid credentials', () => {
    beforeEach(() => {
      cy.fixture('credentials').as('creds')
    })

    it('shows error for wrong password', function () {
      LoginPage
        .loginWith(this.creds.valid.email, this.creds.invalid.password)
        .shouldShowError('Invalid credentials')
    })

    it('shows error for unknown email', function () {
      LoginPage
        .loginWith(this.creds.invalid.email, this.creds.valid.password)
        .shouldShowError('Invalid credentials')
    })
```

- **Given:** [`credentials.json`](../../../../cypress/fixtures/credentials.json) loaded as `@creds`.
- **When:** valid email with wrong password, or unknown email with valid password.
- **Then:** visible message contains "Invalid credentials" — uses `function ()` for `this.creds`.

**No navigation on failure:**

```javascript
    it('does not navigate away on failed login', function () {
      LoginPage.loginWith(this.creds.invalid.email, this.creds.invalid.password)
      cy.url().should('include', '/web/login.html')
    })
```

- **Given:** completely invalid pair.
- **When:** form is submitted.
- **Then:** user remains on `/web/login.html`.

---

### Block 5 — HTML5 validation and Remember me

```javascript
  context('Form validation', () => {
    it('requires email to not be empty (HTML5 validation)', () => {
      LoginPage.fillPassword(Cypress.env('DEMO_PASSWORD')).submit()
      LoginPage.emailInput().then(($el) => {
        expect($el[0].validity.valid).to.be.false
      })
    })
  })
```

- **Given:** empty email, password filled.
- **When:** submit without filling email.
- **Then:** input `validity.valid` is `false` — native browser validation.

```javascript
  context('Remember me', () => {
    it('checkbox can be checked and unchecked', () => {
      LoginPage.rememberCheckbox().should('not.be.checked')
      LoginPage.toggleRememberMe()
      LoginPage.rememberCheckbox().should('be.checked')
      LoginPage.toggleRememberMe()
      LoginPage.rememberCheckbox().should('not.be.checked')
    })
  })
```

- **Given:** checkbox unchecked initially.
- **When:** two alternating clicks via `toggleRememberMe()`.
- **Then:** checked/unchecked state toggles correctly.

---

### Block 6 — Route protection and a11y

```javascript
  context('Redirect after login', () => {
    it('redirects to login when accessing a protected page unauthenticated', () => {
      cy.visit('/web/team.html')
      cy.url().should('include', '/web/login.html')

      LoginPage.loginWith(Cypress.env('DEMO_EMAIL'), Cypress.env('DEMO_PASSWORD'))
      cy.url().should('not.include', '/web/login.html')
    })
  })
```

- **Given:** unauthenticated user tries to access `/web/team.html`.
- **When:** route guard redirects to login and user authenticates.
- **Then:** user leaves the login screen after valid credentials.

```javascript
  context('Accessibility', () => {
    it('login page has no critical a11y violations', { tags: '@a11y' }, () => {
      cy.checkA11yPage('[data-testid="login-form"]', { preset: 'critical' })
    })
  })
```

- **Given:** login form rendered.
- **When:** axe-core analyzes violations within form scope.
- **Then:** no critical violations — `critical` preset ignores minor rules.

---

## How to run

```bash
# Full login suite
npx cypress run --spec cypress/e2e/auth/login.cy.js

# Smoke/critical only
npx cypress run --spec cypress/e2e/auth/login.cy.js --env grepTags=@critical

# Accessibility tests
npx cypress run --spec cypress/e2e/auth/login.cy.js --env grepTags=@a11y
```

---

## Related references

- Page Object: [`LoginPage.js`](../../../../cypress/pages/LoginPage.js)
- Intercepts: [`cypress/support/commands/interceptions.js`](../../../../cypress/support/commands/interceptions.js)
- Credentials fixture: [`credentials.json`](../../../../cypress/fixtures/credentials.json)
