# Components Page Tests

**Source file:** [`../../../../cypress/e2e/components/components.cy.js`](../../../../cypress/e2e/components/components.cy.js)

---

## Purpose

This module validates the **Components** page (`/web/components.html`), a catalog of reusable UI components in the TestFlow sandbox. The tests cover:

- **Buttons** — variants, disabled/loading states, toast, native dialogs (`alert`, `confirm`)
- **Modal** — open/close (buttons, Escape, overlay click), ARIA attributes
- **Tabs** — navigation, panels, ARIA roles, keyboard focus
- **Accordion** — expand/collapse, multiple panels open at once
- **Accessibility** — full page and modal open state

Unlike Settings, this file interacts **directly with `cy.getByTestId`** instead of a dedicated Page Object — a common pattern for demo/catalog pages.

---

## Prerequisites

| Item | Description |
|------|-------------|
| Environment | TestFlow server running |
| Authentication | `cy.visitWithSession` via `beforeEach` |
| TC constants | [`support/@enums/testCases.js`](../../../../cypress/support/@enums/testCases.js) |
| Dialog commands | `cy.clickDialogConfirm`, `cy.clickDialogCancel` in [`actions.js`](../../../../cypress/support/commands/actions.js) |

```bash
npm run cy:run:components
npx cypress run --env grepTags=@a11y --spec cypress/e2e/components/**
```

---

## Tags used

| Tag | Where it appears | Meaning |
|-----|------------------|---------|
| `@regression` | Main `describe` | Regression suite |
| `@a11y` | Accessibility tests | axe-core scan |
| TC ID via `tc()` | Loading button | Links test to `TC-0501` in reports |

---

## Structure overview

```
components.cy.js
├── Imports (TC, tc)
├── beforeEach (visitWithSession)
├── context: Buttons (7 tests)
├── context: Modal (+ beforeEach open modal)
├── context: Tabs (6 tests)
├── context: Accordion (4 tests)
└── context: Accessibility (2 tests)
```

---

## Imports — block by block

### `import { TC, tc } from '../../support/@enums/testCases'`

| Symbol | Role |
|--------|------|
| `TC` | Test case ID constants (e.g. `TC.COMP_LOADING_BUTTON = "TC-0501"`) |
| `tc(id, title)` | Formats `"[TC-0501] loading button shows spinner..."` for reports |

**Concept:** Traceable IDs in CI and Zephyr/Jira integrations.

---

## Setup — global `beforeEach`

```javascript
beforeEach(() => {
  cy.visitWithSession('/web/components.html')
  cy.getByTestId('page-components').should('exist')
})
```

**Given:** logged-in user on the Components page with the root element present.

---

## context `Buttons` — block by block

### `all button variants are visible`

```javascript
['btn-primary', 'btn-secondary', 'btn-success', 'btn-danger'].forEach((id) => {
  cy.getByTestId(id).should('be.visible').and('not.be.disabled')
})
```

Loop validates a homogeneous set of visible, enabled variants.

---

### `disabled button is not interactive`

```javascript
cy.getByTestId('btn-disabled')
  .should('be.disabled')
  .and('have.css', 'cursor', 'not-allowed')
```

Validates semantic state (`disabled`) and visual feedback (CSS cursor).

---

### Loading button — `tc(TC.COMP_LOADING_BUTTON, ...)`

```javascript
cy.clock()
cy.getByTestId('btn-loading').click()
cy.getByTestId('btn-loading').should('be.disabled')
cy.get('.spinner').should('be.visible')
cy.tick(2000)
cy.getByTestId('btn-loading').should('not.be.disabled')
```

| Aspect | Explanation |
|--------|-------------|
| `cy.clock()` | Mocks JavaScript timers |
| `cy.tick(2000)` | Advances 2 seconds without real waiting |

**Cypress concept:** The Clock API eliminates fixed waits — fast, deterministic tests.

---

### Native dialogs — `alert` and `confirm`

```javascript
cy.on('window:alert', (text) => { expect(text).to.not.be.empty })
cy.on('window:confirm', () => true)  // or () => false
```

| Handler | UI result |
|---------|-----------|
| `alert` accepted | Message captured, not empty |
| `confirm` → `true` | `"Confirmed"` in `dialog-result` |
| `confirm` → `false` | `"Cancelled"` in `dialog-result` |

**Important:** register the handler **before** the click that triggers the dialog.

---

## context `Modal` — block by block

### Nested `beforeEach`

```javascript
beforeEach(() => {
  cy.getByTestId('open-modal-btn').click()
  cy.getByTestId('modal-overlay').should('be.visible')
})
```

Opens the modal automatically before each test in this context.

---

### Modal close behavior

| Test | Action | Then |
|------|--------|------|
| Confirm | `cy.clickDialogConfirm()` | Overlay hidden + toast visible |
| Cancel | `cy.clickDialogCancel()` | Overlay hidden |
| Close (✕) | `cy.clickDialogClose()` | Overlay hidden |
| Escape | `cy.get('body').type('{esc}')` | Overlay hidden |
| Overlay click | `.click('topLeft')` | Overlay hidden |

**Concept:** `click('topLeft')` simulates a click outside the central content.

### ARIA

```javascript
cy.getByTestId('modal-overlay')
  .should('have.attr', 'role', 'dialog')
  .and('have.attr', 'aria-modal', 'true')
```

After closing: `aria-hidden="true"`.

---

## context `Tabs` — block by block

Initial state: Overview tab with `aria-selected="true"` and visible panel.

```javascript
cy.getByTestId('tab-cypress').click()
cy.getByTestId('tab-panel-cypress').should('be.visible')
cy.getByTestId('tab-panel-overview').should('not.be.visible')
```

| Test | Validation |
|------|------------|
| Exclusivity | `.tab-panel.active` has length 1 |
| Roles | 1 tablist, 3 tabs, 3 tabpanels |
| Keyboard | `.focus().should('be.focused').click()` |

---

## context `Accordion` — block by block

| Test | Behavior |
|------|----------|
| Default | 3 panels with `aria-expanded="false"`, content hidden |
| Expand | Click → `aria-expanded="true"` + visible panel |
| Toggle | Two clicks → panel hidden again |
| Multiple open | Panels 1 and 2 visible simultaneously |

This accordion is **not** exclusive (unlike tabs).

---

## context `Accessibility`

```javascript
cy.checkA11yPage(undefined, { preset: 'critical' })
cy.checkA11yPage('[data-testid="modal-overlay"]', { preset: 'critical' })
```

The second test validates a11y with the modal open — an interactive state prone to violations.

---

## Concepts learned — summary

| Concept | Where it appears |
|---------|------------------|
| Direct locators | `getByTestId`, ARIA/CSS selectors |
| Mock Clock | `cy.clock()` + `cy.tick()` |
| TC IDs | `tc(TC.COMP_LOADING_BUTTON, ...)` |
| Native dialogs | `cy.on('window:alert')`, `cy.on('window:confirm')` |
| Nested `beforeEach` | Modal setup per context |
| Keyboard | `{esc}`, `.focus()` |
| Positioned click | `.click('topLeft')` |
| ARIA | `role`, `aria-selected`, `aria-expanded`, `aria-modal` |
| A11y | `cy.checkA11yPage` with `@a11y` tag |
