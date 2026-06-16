# Component Test — UserBadge

Guide for testing a user badge with conditional rendering and responsive viewport. Spec: [`UserBadge.cy.jsx`](../../../../cypress/component/UserBadge.cy.jsx).

## Learning objectives

You will learn to:

- Parameterize test cases with arrays and `forEach`.
- Assert visibility vs absence based on props (`user.verified`).
- Configure mobile viewport and restore desktop after the test.
- Import co-located components from the training file.

## Prerequisites

- ConfirmDialog.md — `mountWithProviders` and hook patterns.
- Responsive design basics and `cy.viewport`.

## Note on imports

The spec imports `UserBadge` from `./ConfirmDialog` — a file that exports multiple training components (ConfirmDialog, UserForm, UserBadge). In real projects each component would have its own file; here co-location reduces sandbox boilerplate.

Implementation:

```javascript
export function UserBadge({ user }) {
  return (
    <div data-cy-hook="user-badge">
      <span>{user.name}</span>
      {!user.verified && (
        <button data-cy-hook="verify-action">Verify</button>
      )}
    </div>
  )
}
```

Business rule: **unverified** users show a "Verify" button; verified users do not.

## Parameterization with badgeCases

```javascript
const badgeCases = [
  { verified: false, expectVerify: true, label: 'unverified' },
  { verified: true, expectVerify: false, label: 'verified' },
]

badgeCases.forEach(({ verified, expectVerify, label }) => {
  it(`${label} user ${expectVerify ? 'shows' : 'hides'} verify action`, () => {
    // ...
  })
})
```

### Benefits of data-driven testing

1. **DRY** — mount/assert logic written once.
2. **Dynamic titles** — readable Mochawesome report ("unverified user shows verify action").
3. **Extensible** — add case `{ verified: false, role: 'admin', ... }` without copy-paste blocks.

### Conditional assertions

```javascript
cy.mountWithProviders(<UserBadge user={{ name: 'Alex', verified }} />)
if (expectVerify) {
  cy.getByHook('verify-action').should('be.visible')
} else {
  cy.assertHookMissing('verify-action')
}
```

`if` in the test is acceptable when driven by a table — alternative is two separate `it` blocks (as in ConfirmDialog).

## Mobile viewport test

```javascript
const MOBILE = { width: 375, height: 812 }   // iPhone X-ish
const DESKTOP = { width: 1280, height: 800 }

it('renders at mobile viewport', () => {
  cy.viewport(MOBILE.width, MOBILE.height)
  cy.mountWithProviders(<UserBadge user={{ name: 'Alex', verified: false }} />)
  cy.getByHook('user-badge').should('be.visible')
  cy.viewport(DESKTOP.width, DESKTOP.height)
})
```

### Why restore viewport?

Cypress shares viewport between tests in the same spec. Without reset to desktop, following tests (or other specs in the same run) inherit 375×812 — causing silent failures in desktop-only layouts.

**Alternative:** `afterEach(() => cy.viewport(DESKTOP.width, DESKTOP.height))` centralized.

### What this test does not do (yet)

It only validates that the badge exists on mobile — not reflow, button size, or overflow. For visual regression, combine with Percy CT or snapshots.

## Hooks used

| Hook            | Element                           |
|-----------------|-----------------------------------|
| `user-badge`    | Main container                    |
| `verify-action` | Verify button (only if !verified) |

User name renders in a `<span>` without a hook — current tests do not assert text; room for improvement.

## How to run

```bash
npx cypress run --component --spec 'cypress/component/UserBadge.cy.jsx'
npm run cy:run:component:ct
```

## Case matrix

| verified | verify-action in DOM | Generated title                              |
|----------|----------------------|----------------------------------------------|
| false    | yes, visible         | unverified user shows verify action          |
| true     | does not exist       | verified user hides verify action            |

## Related patterns

### Table-driven in other specs

- `UserForm.cy.jsx` — `validationCases` array.
- `rules.api.cy.js` — `generateMandatoryFieldTests` factory.

Consistent style eases onboarding.

### Stub click on Verify

Natural extension:

```javascript
const onVerify = cy.stub().as('onVerify')
// pass onVerify as prop if component evolves
cy.clickHook('verify-action')
cy.get('@onVerify').should('have.been.called')
```

The button has no handler today — a TDD exercise.

## Best practices

1. **Named viewport objects** — `MOBILE`/`DESKTOP` vs magic numbers.
2. **label in case table** — debugging and grep in CI.
3. **assertHookMissing** for negative conditional elements.
4. **Viewport cleanup** — avoids pollution between tests.

## Practical exercises

1. Assert `user.name` visible ("Alex") via `contain.text`.
2. Add case `verified: undefined` — document expected behavior.
3. Test tablet viewport (768×1024).
4. Integrate `cy.clickHook('verify-action')` after adding `onVerify` prop.

## Troubleshooting

| Problem                              | Solution                                  |
|--------------------------------------|-------------------------------------------|
| verify-action exists when verified   | Component bug or wrong prop               |
| Badge invisible on mobile            | CSS overflow — inspect computed styles    |
| Following tests run in mobile        | Missing viewport reset in afterEach       |

## References

- Spec: [`cypress/component/UserBadge.cy.jsx`](../../../../cypress/component/UserBadge.cy.jsx)
- Component: [`cypress/component/ConfirmDialog.jsx`](../../../../cypress/component/ConfirmDialog.jsx) (exports UserBadge)
- Viewport API: [Cypress viewport docs](https://docs.cypress.io/api/commands/viewport)
