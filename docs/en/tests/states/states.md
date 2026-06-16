# UI State Tests — Loading, error, success, empty, and accessibility

**Source file:** [`../../../../cypress/e2e/states/states.cy.js`](../../../../cypress/e2e/states/states.cy.js)

---

## Purpose

This module exercises the **States** page (`/web/states.html`), designed to demonstrate common **state transitions** in real applications:

| Area | States covered |
|------|----------------|
| Skeleton loading | idle → loading → cards loaded → reset |
| Simulated fetch | error (failure) vs success |
| Listing | empty state (search with no results) |
| Partial grid | cards with mixed statuses |
| Accessibility | axe scan with no critical violations |

Ideal material for learning **explicit waits**, **custom timeouts**, and **axe-core** integration.

---

## Prerequisites

| Item | Description |
|------|-------------|
| Sandbox server | Running with `/web/states.html` route |
| Authentication | `StatesPage.visit()` → `cy.visitWithSession` |
| Page Object | [`StatesPage.js`](../../../../cypress/pages/StatesPage.js) |
| A11y | `cy.checkA11yPage` in [`actions.js`](../../../../cypress/support/commands/actions.js) |

```bash
npm run cy:run:states
npx cypress run --env grepTags=@smoke --spec cypress/e2e/states/**
npx cypress run --env grepTags=@a11y --spec cypress/e2e/states/**
```

---

## Tags used

| Tag | Application |
|-----|-------------|
| `@regression` | Main `describe` |
| `@smoke` | `shows idle message before load` |
| `@a11y` | Accessibility test |

---

## Structure overview

```
states.cy.js
├── Import StatesPage
├── beforeEach (StatesPage.visit + pageRoot)
├── context: Skeleton loading (3 tests)
├── context: Error and success states (2 tests)
├── context: Empty and partial states (2 tests)
└── context: Accessibility (1 test)
```

---

## Imports — block by block

### `import StatesPage from '../../pages/StatesPage'`

Page Object with high-level methods:

| Method | Action |
|--------|--------|
| `loadSkeletonCards()` | Clicks `skeleton-trigger` |
| `triggerError()` | Clicks `error-trigger` |
| `skeletonIdle()` | Locator for idle state |
| `partialTrigger()` | Triggers partial grid |

Encapsulates `data-testid` and reduces duplication in tests.

---

## Setup — `beforeEach`

```javascript
beforeEach(() => {
  StatesPage.visit()
  StatesPage.pageRoot().should('exist')
})
```

**Global Given:** logged-in user on `/web/states.html`.

---

## context `Skeleton loading` — block by block

### `shows idle message before load` — `@smoke`

```javascript
StatesPage.skeletonIdle().should('contain.text', 'Load cards')
```

| **Given** | Freshly loaded page, skeleton section in initial state |
| **Then** | Idle message contains "Load cards" |

**Cypress concept:** `contain.text` performs partial (substring) matching.

---

### `loads metric cards after skeleton delay`

```javascript
StatesPage.loadSkeletonCards()
cy.getByTestId('loaded-card', { timeout: 5000 }).should('have.length', 4)
```

| **When** | Clicks trigger (simulates fetch with delay) |
| **Then** | Exactly 4 `loaded-card` elements within 5 seconds |

**Concept — timeout:** `{ timeout: 5000 }` reinforces the wait because skeleton + delay may exceed the default on slow environments.

---

### `resets skeleton section`

```javascript
StatesPage.loadSkeletonCards()
cy.getByTestId('loaded-card', { timeout: 5000 }).should('exist')
StatesPage.skeletonReset().click()
StatesPage.skeletonIdle().should('be.visible')
```

**Full flow:** load → intermediate assert → reset → final assert. A model for **component lifecycle** testing.

---

## context `Error and success states` — block by block

### `shows error state on failed fetch`

```javascript
StatesPage.triggerError()
cy.getByTestId('error-state')
  .should('be.visible')
  .and('contain.text', 'Request failed')
```

| **When** | Triggers fetch that fails |
| **Then** | Error banner visible with message |

---

### `shows success state on successful fetch`

```javascript
StatesPage.successTrigger().click()
cy.getByTestId('success-state')
  .should('be.visible')
  .and('contain.text', 'succeeded')
```

Mirror of the error test — validates **positive feedback**.

---

## context `Empty and partial states` — block by block

### `renders empty state when search has no matches`

```javascript
cy.getByTestId('empty-search').type('xyzno match')
cy.getByTestId('empty-state').should('be.visible')
cy.getByTestId('result-list').should('not.exist')
```

| **When** | Enters term with no matches |
| **Then** | Empty state visible; list **not** in the DOM |

**Concept:** `should('not.exist')` confirms the UI did not render a hidden empty list.

---

### `loads partial grid with mixed card statuses`

```javascript
StatesPage.partialTrigger().click()
cy.get('[data-testid^="partial-card-"]').should('have.length', 6)
```

**CSS selector:** `[data-testid^="partial-card-"]` = attribute **starts with** prefix. Alternative when `getByTestId` does not natively support prefix matching.

---

## context `Accessibility`

```javascript
it('states page has no critical a11y violations', { tags: '@a11y' }, () => {
  cy.checkA11yPage(undefined, { preset: 'critical' })
})
```

| **Given** | States page loaded |
| **Then** | No critical violations via axe-core |

The `@a11y` tag enables a dedicated pipeline: `npm run cy:run:a11y`.

---

## Concepts learned — summary

| Concept | Where it appears |
|---------|------------------|
| Page Object | `StatesPage` with composite methods |
| Skeleton loading | idle → loaded → reset |
| Custom timeout | `{ timeout: 5000 }` |
| Error/Success states | Triggers + text assertions |
| Empty state | `not.exist` vs empty list |
| Prefix selector | `[data-testid^="partial-card-"]` |
| A11y | `cy.checkA11yPage` with `@a11y` |
| Tags | `@smoke`, `@regression`, `@a11y` |

---

## Learning checklist

- [ ] Explain skeleton loading vs traditional spinner
- [ ] Justify `{ timeout: 5000 }` on skeleton
- [ ] Differentiate visible empty state vs empty list in the DOM
- [ ] Describe what `cy.checkA11yPage` does internally
- [ ] Run `npm run cy:run:a11y` in isolation
