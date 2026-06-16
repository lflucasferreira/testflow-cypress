# TestFlow Cypress — Training Documentation

Instructional material that explains **block by block** each test file in the project. Ideal for new students learning Cypress, Page Objects, and E2E/component automation.

Each document links to the corresponding spec file with a relative path.

**Language:** English · [Português](../pt/README.md)

---

## How to use this material

1. Read the doc for the suite you will run or maintain.
2. Open the [spec file](..) linked at the top of the document.
3. Follow the explanation section by section while reading the code.
4. Run the suite locally:

```bash
npx cypress open                              # interactive runner
npx cypress run --spec cypress/e2e/smoke/navigation.cy.js
npm run cy:run:smoke                          # via @smoke tags
npm run cy:run:component                     # component tests
```

---

## Index by suite

### Smoke & Auth

| Suite | Documentation | Spec file |
|-------|---------------|-----------|
| Smoke — navigation | [navigation.md](tests/smoke/navigation.md) | [`cypress/e2e/smoke/navigation.cy.js`](../../cypress/e2e/smoke/navigation.cy.js) |
| Auth — login | [login.md](tests/auth/login.md) | [`cypress/e2e/auth/login.cy.js`](../../cypress/e2e/auth/login.cy.js) |

### Authenticated pages

| Suite | Documentation | Spec file |
|-------|---------------|-----------|
| Dashboard | [dashboard.md](tests/dashboard/dashboard.md) | [`cypress/e2e/dashboard/dashboard.cy.js`](../../cypress/e2e/dashboard/dashboard.cy.js) |
| Team | [team.md](tests/team/team.md) | [`cypress/e2e/team/team.cy.js`](../../cypress/e2e/team/team.cy.js) |
| Settings | [settings.md](tests/settings/settings.md) | [`cypress/e2e/settings/settings.cy.js`](../../cypress/e2e/settings/settings.cy.js) |
| Components | [components.md](tests/components/components.md) | [`cypress/e2e/components/components.cy.js`](../../cypress/e2e/components/components.cy.js) |
| Wizard | [wizard.md](tests/wizard/wizard.md) | [`cypress/e2e/wizard/wizard.cy.js`](../../cypress/e2e/wizard/wizard.cy.js) |
| Activity | [activity.md](tests/activity/activity.md) | [`cypress/e2e/activity/activity.cy.js`](../../cypress/e2e/activity/activity.cy.js) |
| Advanced | [advanced.md](tests/advanced/advanced.md) | [`cypress/e2e/advanced/advanced.cy.js`](../../cypress/e2e/advanced/advanced.cy.js) |
| UI States | [states.md](tests/states/states.md) | [`cypress/e2e/states/states.cy.js`](../../cypress/e2e/states/states.cy.js) |

### Visual, API & Component

| Suite | Documentation | Spec file |
|-------|---------------|-----------|
| Visual regression (Percy) | [percy.md](tests/visual/percy.md) | [`cypress/e2e/visual/percy.cy.js`](../../cypress/e2e/visual/percy.cy.js) |
| API — auth | [auth.api.md](tests/api/auth.api.md) | [`cypress/e2e/api/auth.api.cy.js`](../../cypress/e2e/api/auth.api.cy.js) |
| API — users & health | [users.api.md](tests/api/users.api.md) | [`cypress/e2e/api/users.api.cy.js`](../../cypress/e2e/api/users.api.cy.js) |
| API — rules / JSON Patch | [rules.api.md](tests/api/rules.api.md) | [`cypress/e2e/api/rules.api.cy.js`](../../cypress/e2e/api/rules.api.cy.js) |
| Component — ConfirmDialog | [ConfirmDialog.md](tests/component/ConfirmDialog.md) | [`cypress/component/ConfirmDialog.cy.jsx`](../../cypress/component/ConfirmDialog.cy.jsx) |
| Component — LookupPreview | [LookupPreview.md](tests/component/LookupPreview.md) | [`cypress/component/LookupPreview.cy.jsx`](../../cypress/component/LookupPreview.cy.jsx) |
| Component — UserBadge | [UserBadge.md](tests/component/UserBadge.md) | [`cypress/component/UserBadge.cy.jsx`](../../cypress/component/UserBadge.cy.jsx) |
| Component — UserForm | [UserForm.md](tests/component/UserForm.md) | [`cypress/component/UserForm.cy.jsx`](../../cypress/component/UserForm.cy.jsx) |

---

## Cross-cutting concepts

The docs cover, among other topics:

- **Cypress:** `describe`/`context`/`it`, tags via `@bahmutov/cy-grep`, `cy.session`, `cy.intercept`
- **Authentication:** `cy.createAuthSession`, `cy.visitWithSession`, `sessionStorage` (`sandbox-auth`)
- **Page Object Model:** classes in [`cypress/pages/`](../../cypress/pages/)
- **Custom commands:** [`cypress/support/commands/`](../../cypress/support/commands/)
- **Test data:** JSON fixtures in [`cypress/fixtures/`](../../cypress/fixtures/), factories in [`cypress/support/factories/`](../../cypress/support/factories/)
- **Accessibility:** `cy.checkA11yPage` with cypress-axe
- **Component tests:** `cy.mountWithProviders`, `data-cy-hook` selectors
- **Traceable IDs:** `[TC-xxxx]` prefix via [`cypress/support/@enums/testCases.js`](../../cypress/support/@enums/testCases.js)

---

## Other materials in `docs/`

| Resource | Description |
|----------|-------------|
| [`slides/`](../slides/) | Introductory Cypress presentation (HTML/PDF) |
| [`selector-strategy.md`](../selector-strategy.md) | `data-testid` (E2E) vs `data-cy-hook` (component/slides) |
| [`cypress-technical-interview-questions.md`](../cypress-technical-interview-questions.md) | Technical interview question bank (Portuguese) |

---

## Folder structure

```
docs/
├── README.md                          ← language selector
├── cypress-technical-interview-questions.md
├── pt/
│   ├── README.md                      ← Portuguese index
│   └── tests/                         ← walkthroughs per spec
├── en/
│   ├── README.md                      ← this index (English)
│   └── tests/
├── slides/                            ← presentation
└── selector-strategy.md
```

Each `.md` in `docs/en/tests/` and `docs/pt/tests/` mirrors the homonymous spec under `cypress/`.
