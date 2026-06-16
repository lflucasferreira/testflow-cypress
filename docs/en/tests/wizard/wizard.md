# Multi-Step Wizard Tests

**Source file:** [`wizard.cy.js`](../../../../cypress/e2e/wizard/wizard.cy.js)

---

## Purpose

This module validates the **Wizard** (`/web/wizard.html`), a multi-step (stepper) form with three steps:

1. **Personal data** — name, email, date of birth, country
2. **Preferences** — framework, role, experience, terms, newsletter
3. **Review and completion** — summary + success message

Tests cover the full flow, validation, backward navigation, restart, API interception for lookups, and accessibility.

The file combines **Page Object** ([`WizardPage`](../../../../cypress/pages/WizardPage.js)), **custom commands** (`cy.completeWizardStep1`, `cy.fillWizardFlow`), and **factory** ([`WizardDataFactory`](../../../../cypress/support/factories/index.js)).

---

## Prerequisites

| Item | Description |
|------|-------------|
| Environment | TestFlow server running |
| Authentication | `cy.visitWithSession` via `beforeEach` |
| Factory | [`WizardDataFactory`](../../../../cypress/support/factories/index.js) — fake data with Faker |
| JSON fixtures | [`cypress/fixtures/lookups/countries.json`](../../../../cypress/fixtures/lookups/countries.json) |
| Commands | [`cypress/support/commands/actions.js`](../../../../cypress/support/commands/actions.js) |

```bash
npm run cy:run:wizard
npx cypress run --env grepTags=@smoke --spec cypress/e2e/wizard/**
npx cypress run --env grepTags=@critical --spec cypress/e2e/wizard/**
npx cypress run --env grepTags=@a11y --spec cypress/e2e/wizard/**
```

---

## Tags used

| Tag | Where it appears | Meaning |
|-----|------------------|---------|
| `@regression` | Both `describe` blocks | Regression suite |
| `@smoke` | `shows step 1 by default` | Quick load verification |
| `@critical` | `completes all wizard sections` | Main end-to-end flow |
| `@a11y` | Accessibility `describe` | axe-core scan |

---

## Structure overview

```
wizard.cy.js
├── Imports (WizardPage, WizardDataFactory)
├── describe: Wizard — multi-step flow
│   ├── beforeEach (visitWithSession + pageRoot)
│   └── 6 tests (it)
└── describe: Wizard — accessibility
    ├── beforeEach
    └── 1 a11y test
```

---

## Imports — block by block

### `import WizardPage from '../../pages/WizardPage'`

Page Object with wizard locators: `pageRoot()`, `panel1()`, `step1()`, `success()`, etc.

**Concept:** encapsulates `data-testid` selectors — UI changes stay centralized.

---

### `import { WizardDataFactory } from '../../support/factories'`

| Method | Returns |
|--------|---------|
| `createPersonalStep(overrides)` | `{ name, email, dob, country }` via Faker |
| `createPreferencesStep()` | `{ framework, role, experience }` |

**Concept:** **Test Data Factory** — generates valid data; `overrides` allows customizing specific fields.

---

## Setup — `beforeEach`

```javascript
beforeEach(() => {
  cy.visitWithSession('/web/wizard.html')
  WizardPage.pageRoot().should('exist')
})
```

| Aspect | Explanation |
|--------|-------------|
| `visitWithSession` | Creates authenticated session via `cy.session` + navigates |
| `pageRoot()` | Confirms `page-wizard` in DOM before each test |

**Global Given:** logged-in user on the wizard page.

---

## Tests — block by block

### `shows step 1 by default` — `@smoke`

```javascript
WizardPage.panel1().should('be.visible')
WizardPage.step1().should('have.class', 'active')
```

| **Given** | Wizard just loaded |
| **Then** | Panel 1 visible + step 1 indicator has `active` class |

---

### `validates required fields on step 1`

```javascript
cy.getByTestId('wizard-next').click()
cy.getByTestId('wizard-step1-error').should('be.visible')
```

| **When** | Advancing without filling fields |
| **Then** | Step 1 error message visible |

---

### `maps country fixture codes to wizard select options`

```javascript
cy.mockCountriesLookup()
cy.task('readFixture', 'lookups/countries.json').then(({ countries }) => {
  const canada = countries.find((c) => c.code === 'CA')
  expect(canada).to.exist
  cy.getByTestId('wizard-country').select('ca')
  cy.getByTestId('wizard-country').should('have.value', 'ca')
})
```

| Aspect | Explanation |
|--------|-------------|
| `cy.mockCountriesLookup()` | Intercepts GET countries with fixture |
| `cy.task('readFixture')` | Reads JSON from disk via Node plugin |
| `select('ca')` | `<option>` value is lowercase |

**Cypress concept:** `cy.intercept` decouples tests from an unstable backend.

---

### `completes all wizard sections` — `@critical`

```javascript
const personal = WizardDataFactory.createPersonalStep()
const prefs = WizardDataFactory.createPreferencesStep()

cy.section('PERSONAL INFO')
cy.completeWizardStep1(personal)
cy.advanceWizard()
cy.getByTestId('wizard-step-1').should('have.class', 'done')

cy.section('PREFERENCES')
cy.completeWizardStep2(prefs)
cy.advanceWizard()
cy.getByTestId('wizard-step-2').should('have.class', 'done')

cy.section('CONFIRMATION')
cy.completeWizardStep3()
cy.advanceWizard()

cy.getByTestId('wizard-success').should('be.visible')
cy.getByTestId('wizard-success-message').should('not.be.empty')
cy.getByTestId('review-name').should('contain.text', personal.name)
```

| Step | Validation |
|------|------------|
| After step 1 | `wizard-step-1` indicator has `done` class |
| After step 2 | `wizard-step-2` indicator has `done` class |
| Final | Success screen + name in review |

**Concept:** `cy.section()` groups steps in the Mochawesome report.

---

### `navigates back from step 2 to step 1`

```javascript
cy.completeWizardStep1(personal)
cy.advanceWizard()
cy.getByTestId('wizard-back').click()
WizardPage.panel1().should('be.visible')
```

Tests **bidirectional** stepper navigation.

---

### `restarts wizard after completion`

```javascript
cy.fillWizardFlow(personal, WizardDataFactory.createPreferencesStep())
cy.getByTestId('wizard-restart').click()
WizardPage.panel1().should('be.visible')
```

| **When** | Completes wizard + clicks restart |
| **Then** | Returns to panel 1 (initial state) |

`cy.fillWizardFlow` orchestrates all three steps via commands in [`actions.js`](../../../../cypress/support/commands/actions.js).

---

## Accessibility — separate `describe`

```javascript
describe('Wizard — accessibility', { tags: '@a11y @regression' }, () => {
  it('wizard page has no critical a11y violations', () => {
    cy.checkA11yPage(undefined, { preset: 'critical' })
  })
})
```

| **Given** | Wizard on step 1 (default state) |
| **Then** | No critical a11y violations via axe-core |

---

## Concepts learned — summary

| Concept | Where it appears |
|---------|----------------|
| Page Object | `WizardPage` |
| Test Data Factory | `WizardDataFactory` |
| Composite commands | `completeWizardStep1`, `fillWizardFlow`, `advanceWizard` |
| Network intercept | `cy.mockCountriesLookup()` |
| Node task | `cy.task('readFixture', ...)` |
| BDD reporting | `cy.section()` |
| Tags | `@smoke`, `@critical`, `@a11y`, `@regression` |
| A11y | `cy.checkA11yPage` with `critical` preset |

---

## Related references

- Page Object: [`WizardPage.js`](../../../../cypress/pages/WizardPage.js)
- Factory: [`cypress/support/factories/index.js`](../../../../cypress/support/factories/index.js)
- Wizard commands: [`commands/actions.js`](../../../../cypress/support/commands/actions.js)
- Countries fixture: [`lookups/countries.json`](../../../../cypress/fixtures/lookups/countries.json)
