# Advanced Tests — Shadow DOM, iframes, and viewport

**Source file:** [`../../../../cypress/e2e/advanced/advanced.cy.js`](../../../../cypress/e2e/advanced/advanced.cy.js)

---

## Purpose

This module validates the **Advanced** page (`/web/advanced.html`), which concentrates more complex front-end scenarios in the TestFlow sandbox:

- **Shadow DOM** — encapsulated content outside the main DOM tree
- **iframe** — embedded content loading
- **External links** — `href` and `target` attributes
- **Responsive viewport** — mobile vs desktop behavior
- **Navigation** — button that routes the user elsewhere

The tests are **interface E2E** with Cypress and serve as training material for locators, retry assertions, and Page Objects.

---

## Prerequisites

| Item | Description |
|------|-------------|
| Environment | Sandbox server running |
| Authentication | `AdvancedPage.visit()` → `cy.visitWithSession` |
| Viewports | [`VIEWPORTS`](../../../../cypress/support/@enums/viewports.js) — DESKTOP, MOBILE |
| Page Object | [`AdvancedPage.js`](../../../../cypress/pages/AdvancedPage.js) |

```bash
npm run cy:run:advanced
npx cypress run --env grepTags=@smoke --spec cypress/e2e/advanced/**
```

---

## Tags used

| Tag | Where it appears | Meaning |
|-----|------------------|---------|
| `@regression` | Main `describe` | Full regression suite |
| `@smoke` | Shadow DOM and mobile viewport | Quick CI gate subset |

---

## Structure overview

```
advanced.cy.js
├── Imports (AdvancedPage, VIEWPORTS)
├── beforeEach (AdvancedPage.visit + pageRoot)
└── 6 tests (it)
    ├── Shadow DOM (render + internal access)
    ├── Iframe
    ├── External link
    ├── Mobile viewport
    └── Navigation
```

---

## Imports — block by block

### `import AdvancedPage from '../../pages/AdvancedPage'`

Page Object with specialized locators:

| Method | Element |
|--------|---------|
| `sectionShadow()` | Visible shadow section |
| `shadowHost()` | Shadow root host |
| `demoIframe()` | Demo iframe |
| `externalLink()` | External link |
| `shadowFind(selector)` | Query inside shadow root |

---

### `import { VIEWPORTS } from '../../support/@enums/viewports'`

| Constant | Dimension |
|----------|-----------|
| `VIEWPORTS.DESKTOP` | 1280 × 800 |
| `VIEWPORTS.MOBILE` | 375 × 812 |

Used with `cy.viewport(width, height)`.

---

## Setup — `beforeEach`

```javascript
beforeEach(() => {
  AdvancedPage.visit()
  AdvancedPage.pageRoot().should('exist')
})
```

**Given:** authenticated user on `/web/advanced.html` with `page-advanced` in the DOM.

---

## Tests — block by block

### `renders shadow DOM section` — `@smoke`

```javascript
cy.section('Shadow DOM')
AdvancedPage.sectionShadow().should('be.visible')
AdvancedPage.shadowHost().should('exist')
```

| **Given** | Advanced page loaded |
| **Then** | Shadow section visible; host attached to DOM |

**Cypress distinction:**

- `be.visible` — element visible to the user
- `exist` — present in the DOM (may be hidden)

---

### `accesses content inside shadow root`

```javascript
AdvancedPage.shadowHost().shadow().find('*').should('have.length.at.least', 1)
```

| **When** | Penetrates shadow root via `.shadow()` |
| **Then** | At least one child node inside the shadow root |

**Cypress concept:** `.shadow()` accesses **open shadow roots** from a known host.

---

### `loads demo iframe`

```javascript
cy.section('Iframe')
AdvancedPage.demoIframe()
  .should('be.visible')
  .and('have.attr', 'src')
```

| **Then** | Iframe visible; `src` attribute present |

**Concept:** interacting *inside* the iframe would require `cy.iframe()` or a dedicated plugin; here we only validate the outer `<iframe>` element.

---

### `shows external link with target blank`

```javascript
AdvancedPage.externalLink()
  .should('have.attr', 'href')
  .and('include', 'http')
```

Does not click the link — avoids opening a new tab/window and CI flakiness.

---

### `renders shadow section at mobile viewport` — `@smoke`

```javascript
cy.viewport(VIEWPORTS.MOBILE.width, VIEWPORTS.MOBILE.height)
AdvancedPage.sectionShadow().should('be.visible')
cy.viewport(VIEWPORTS.DESKTOP.width, VIEWPORTS.DESKTOP.height)
```

| Phase | Action |
|-------|--------|
| **When** | Resizes to mobile (375×812) |
| **Then** | Shadow section remains visible |
| **Cleanup** | Restores desktop so following tests are unaffected |

**Cypress concept:** `cy.viewport` simulates screen size; it does not fully emulate user-agent.

---

### `navigates with page finish button`

```javascript
cy.getByTestId('page-finish-btn').click()
cy.url().should('not.include', '/web/advanced.html')
```

| **When** | Clicks `page-finish-btn` |
| **Then** | URL no longer contains `/web/advanced.html` |

**Cypress concept:** `cy.url().should(...)` waits for navigation to complete — more robust than reading the URL immediately after the click.

---

## Concepts learned — summary

| Concept | Where it appears |
|---------|------------------|
| Page Object | `AdvancedPage` |
| Shadow DOM | `.shadow().find('*')` |
| Iframe | External `src` validation |
| Responsive viewport | `cy.viewport` + `VIEWPORTS` constants |
| Navigation | `cy.url().should('not.include', ...)` |
| BDD reporting | `cy.section()` |
| Tags | `@smoke`, `@regression` |

---

## Learning checklist

- [ ] Explain why `beforeEach` centralizes login and navigation
- [ ] Differentiate `be.visible` vs `exist`
- [ ] Describe how Cypress accesses an open shadow root
- [ ] Run the suite with `grepTags=@smoke` and interpret the result
- [ ] Propose a new test: validate `target="_blank"` on the external link
