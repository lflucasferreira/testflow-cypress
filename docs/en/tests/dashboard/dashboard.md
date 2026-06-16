# Dashboard — Overview and Interactions

**Source file:** [`dashboard.cy.js`](../../../../cypress/e2e/dashboard/dashboard.cy.js)

---

## Purpose

This suite validates the **main post-login page** of TestFlow. After authentication via `cy.visitWithSession`, it verifies:

- Personalized greeting and subtitle
- KPI cards (runs, pass rate, members, issues) with values and trends
- Recent activity feed and "See all" link
- Suite health bars (regression, smoke, e2e)
- "New test run" modal — open, fields, close, and confirm
- Quick access links (team, settings, wizard)
- Accessibility compliance

It demonstrates the **Page Object** pattern with [`DashboardPage`](../../../../cypress/pages/DashboardPage.js) and chained fluent assertions.

---

## Prerequisites

| Item | Detail |
|------|--------|
| **TestFlow** | Running at `http://localhost:5050` |
| **Dependencies** | `npm install` at the project root |
| **DEMO credentials** | `DEMO_EMAIL` and `DEMO_PASSWORD` configured — used indirectly by `visitWithSession` |
| **Session** | `cy.visitWithSession` creates an authenticated session automatically |
| **Execution** | `npx cypress run --spec cypress/e2e/dashboard/dashboard.cy.js` |

---

## Tags used

| Tag | Where it appears | Meaning |
|-----|------------------|---------|
| `@regression` | Main `describe` | Regression suite |
| `@smoke` | Greeting test | Main page sanity check |
| `@a11y` | Dashboard axe test | Critical accessibility violations |

---

## Cypress concepts

| Concept | Usage in this file |
|---------|-------------------|
| **Page Object** | [`DashboardPage`](../../../../cypress/pages/DashboardPage.js) — greeting, KPIs, modal, health bars |
| **`cy.visitWithSession`** | Cached login + visit + onboarding skip |
| **`context()`** | Groups by feature: Greeting, KPI cards, Recent activity, etc. |
| **Method chaining** | `openNewRunModal().selectSuite('smoke').confirmRun()` |
| **`.invoke('text')`** | Extracts DOM text for regex or `parseInt` |
| **`.within()`** | Scopes assertions inside an activity item |
| **Dynamic `forEach`** | Generates parameterized tests for quick access links |
| **`cy.get('body').type('{esc}')`** | Closes modal via Escape key |
| **`.click('topLeft')`** | Clicks overlay without hitting modal content |

---

## Step-by-step — block by block

### Block 1 — Global setup

```javascript
import DashboardPage from '../../pages/DashboardPage'

describe('Dashboard', { tags: '@regression' }, () => {
  beforeEach(() => {
    cy.visitWithSession('/web/dashboard.html')
    DashboardPage.shouldBeLoaded()
  })
```

- **Given:** authenticated session and onboarding tour skipped.
- **When:** navigating to `/web/dashboard.html`.
- **Then:** `shouldBeLoaded()` confirms root element `page-dashboard` — precondition for all tests.

---

### Block 2 — Greeting

```javascript
  context('Greeting', () => {
    it('shows time-based greeting with the user name', { tags: '@smoke' }, () => {
      DashboardPage.shouldShowGreeting()
      DashboardPage.greeting().should('contain.text', 'Demo User')
    })

    it('shows a non-empty subtitle', () => {
      DashboardPage.subtitle().should('be.visible').and('not.be.empty')
    })
  })
```

- **Given:** dashboard loaded with user "Demo User".
- **When:** Page Object reads greeting element (Good morning/afternoon/evening).
- **Then:** text contains user name and subtitle is not empty.

---

### Block 3 — KPI cards

```javascript
  context('KPI cards', () => {
    it('renders all four KPI cards', () => {
      DashboardPage.shouldHaveAllKpiCards()
    })

    it('shows a numeric value in the runs card', () => {
      DashboardPage.kpiValue('runs')
        .invoke('text')
        .then(parseInt)
        .should('be.greaterThan', 0)
    })

    it('shows a percentage in the pass rate card', () => {
      DashboardPage.kpiValue('passrate')
        .invoke('text')
        .should('match', /^\d+(\.\d+)?%$/)
    })

    it('shows trend indicators on each card', () => {
      ['runs', 'passrate', 'members', 'issues'].forEach((key) => {
        DashboardPage.kpiTrend(key).should('be.visible').and('not.be.empty')
      })
    })
  })
```

- **Given:** four KPI cards rendered (runs, passrate, members, issues).
- **When:** text is extracted via `.invoke('text')`.
- **Then:** runs > 0, pass rate matches `\d+%` pattern, and each card displays a visible trend indicator.

---

### Block 4 — Recent activity

```javascript
  context('Recent activity', () => {
    it('shows 5 activity items', () => {
      DashboardPage.shouldHaveActivityItems(5)
    })

    it('each activity item has text and a timestamp', () => {
      DashboardPage.activityItem(1).within(() => {
        cy.get('.activity-text').should('not.be.empty')
        cy.get('.activity-time').should('not.be.empty')
      })
    })

    it('"See all" link navigates to activity page', () => {
      DashboardPage.quickAction('team') // warm up navigation
      cy.getByTestId('activity-see-all').click()
      cy.url().should('include', '/web/activity.html')
    })
  })
```

- **Given:** activity list with 5 items.
- **When:** first item is inspected with `.within()` or "See all" is clicked.
- **Then:** each item has text + timestamp; link leads to `/web/activity.html`.

---

### Block 5 — Suite health

```javascript
  context('Suite health', () => {
    it('shows Healthy status badge', () => {
      DashboardPage.healthStatus()
        .should('be.visible')
        .and('contain.text', 'Healthy')
    })

    it('renders three suite health bars', () => {
      ['regression', 'smoke', 'e2e'].forEach((suite) => {
        DashboardPage.healthBar(suite).should('exist')
        DashboardPage.healthPct(suite)
          .invoke('text')
          .should('match', /^\d+%$/)
      })
    })

    it('regression bar fill width reflects its percentage', () => {
      DashboardPage.healthBar('regression')
        .should('have.attr', 'style')
        .and('include', 'width:97%')
    })
  })
```

- **Given:** health section with badge and three bars.
- **When:** iterating regression/smoke/e2e suites.
- **Then:** percentages display as `\d+%` and regression bar has inline `width:97%`.

---

### Block 6 — "New test run" modal

```javascript
  context('"New test run" modal', () => {
    it('opens modal on button click', () => {
      DashboardPage.openNewRunModal()
        .shouldShowRunModalOpen()
    })

    it('modal has suite and environment selects', () => {
      DashboardPage.openNewRunModal()
      DashboardPage.runSuiteSelect().should('be.visible')
      DashboardPage.runEnvSelect().should('be.visible')
    })

    it('closes modal on Cancel', () => {
      DashboardPage.openNewRunModal().cancelRun()
      DashboardPage.shouldShowRunModalClosed()
    })

    it('closes modal on Escape key', () => {
      DashboardPage.openNewRunModal()
      cy.get('body').type('{esc}')
      DashboardPage.shouldShowRunModalClosed()
    })

    it('closes modal on overlay click', () => {
      DashboardPage.openNewRunModal()
      cy.getByTestId('run-modal-overlay').click('topLeft')
      DashboardPage.shouldShowRunModalClosed()
    })

    it('confirms a run and shows toast', () => {
      DashboardPage.openNewRunModal()
        .selectSuite('smoke')
        .selectEnvironment('staging')
        .confirmRun()

      DashboardPage.shouldShowRunModalClosed()
      cy.getByTestId('toast-message').should('contain.text', 'smoke')
    })
  })
```

- **Given:** "New test run" button available.
- **When:** modal is opened, interacted with (Cancel, Escape, overlay), or run is confirmed.
- **Then:** modal opens/closes per action; confirmation shows toast with suite name.

---

### Block 7 — Quick access and a11y

```javascript
  context('Quick access navigation', () => {
    const links = [
      { testId: 'qa-team', path: '/web/team.html' },
      { testId: 'qa-settings', path: '/web/settings.html' },
      { testId: 'qa-wizard', path: '/web/wizard.html' },
    ]

    links.forEach(({ testId, path }) => {
      it(`"${testId}" navigates to ${path}`, () => {
        cy.visitWithSession('/web/dashboard.html')
        DashboardPage.shouldBeLoaded()
        cy.getByTestId(testId).click()
        cy.url().should('include', path)
      })
    })
  })

  context('Accessibility', () => {
    it('dashboard has no critical a11y violations', { tags: '@a11y' }, () => {
      cy.checkA11yPage(undefined, { preset: 'critical' })
    })
  })
```

- **Given:** quick access cards on the dashboard.
- **When:** `forEach` generates one `it` per link; axe analyzes the full page.
- **Then:** each click navigates to the correct path; zero critical a11y violations.

---

## How to run

```bash
npx cypress run --spec cypress/e2e/dashboard/dashboard.cy.js

# Smoke only
npx cypress run --spec cypress/e2e/dashboard/dashboard.cy.js --env grepTags=@smoke
```

---

## Related references

- Page Object: [`DashboardPage.js`](../../../../cypress/pages/DashboardPage.js)
- Session command: [`commands.js`](../../../../cypress/support/commands.js) — `visitWithSession`
- A11y: [`commands/actions.js`](../../../../cypress/support/commands/actions.js) — `checkA11yPage`
