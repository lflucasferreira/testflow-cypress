# Selector Strategy — TestFlow vs Slides

This project bridges two selector conventions used in training materials and the TestFlow sandbox app.

## E2E (TestFlow app)

TestFlow renders UI with **`data-testid`** attributes. Use:

```js
cy.getByTestId('login-email')
// equivalent: cy.get('[data-testid="login-email"]')
```

Page Objects and E2E specs should prefer `data-testid` when interacting with the real application.

## Component tests & slides

Training slides and CT stubs use **`data-cy-hook`**. Use:

```js
cy.getByHook('dialog-confirm-btn')
// matches [data-cy-hook="..."] OR [data-testid="..."]
```

`getByHook()` is the dual-selector bridge: it tries `data-cy-hook` first (slides/CT convention) and falls back to `data-testid` (TestFlow).

## When to use which

| Context | Preferred command | Attribute |
|---------|-------------------|-----------|
| E2E against TestFlow | `getByTestId` | `data-testid` |
| Component tests (stubs) | `getByHook` | `data-cy-hook` |
| Shared helpers / modals | `getByHook` | both (bridge) |
| Page Objects | `getByTestId` | `data-testid` |

## Hook maps

Element hook maps live in `cypress/support/elements/`. CT components define `data-cy-hook`; E2E maps translate to TestFlow `data-testid` where names differ.
