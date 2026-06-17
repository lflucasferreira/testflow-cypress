# testflow-cypress

Cypress E2E and component automation for [TestFlow](https://github.com/qaschoolbr/testflow) — a web sandbox for QA practice and automation learning.

## Stack

| Tool | Version | Purpose |
|------|---------|---------|
| Cypress | 15+ | E2E + component testing |
| @bahmutov/cy-grep | 3.x | Tag-based test filtering (`@smoke`, `@regression`, `@a11y`) |
| cypress-axe | — | Accessibility checks |
| Ajv | 8.x | JSON Schema contract validation |
| @percy/cypress | 3.x | Visual regression (optional) |
| mochawesome | — | HTML reports in CI |
| Cypress Cloud | — | Test Replay (smoke gate, project `jb6cfs`) |

## Test coverage

| Suite | Spec | Tags |
|-------|------|------|
| Smoke | `smoke/navigation.cy.js` | `@smoke` |
| Auth | `auth/login.cy.js` | `@regression` |
| Dashboard | `dashboard/dashboard.cy.js` | `@regression` |
| Team | `team/team.cy.js` | `@regression` |
| Settings | `settings/settings.cy.js` | `@regression` |
| Components | `components/components.cy.js` | `@regression`, `@a11y` |
| Wizard | `wizard/wizard.cy.js` | `@regression` |
| Advanced | `advanced/advanced.cy.js` | `@regression` |
| Activity | `activity/activity.cy.js` | `@regression` |
| States | `states/states.cy.js` | `@regression` |
| API | `api/*.cy.js` | `@api`, `@regression` |
| Visual | `visual/percy.cy.js` | `@visual` |
| Component | `cypress/component/**` | — |

Traceable test case IDs use the `[TC-xxxx]` prefix — see `cypress/support/@enums/testCases.js`.

## Prerequisites

- Node.js 20+
- TestFlow running on port `5050` (Docker: `docker run -p 5050:5050 qaschool/testflow:latest`)

## Setup

```bash
npm install
```

### Credentials

Default demo credentials (local only):

| Field | Value |
|-------|-------|
| Email | `demo@automation.io` |
| Password | `Demo123!` |

Override via environment variables (recommended for CI):

```bash
export CYPRESS_DEMO_EMAIL=demo@automation.io
export CYPRESS_DEMO_PASSWORD=your-secret
```

In GitHub Actions, set repository secrets `DEMO_PASSWORD` and `CYPRESS_RECORD_KEY` (from [Cypress Cloud](https://cloud.cypress.io/projects/jb6cfs)). See [docs/cypress-cloud-setup.md](docs/cypress-cloud-setup.md).

### Environments

| ENV | Base URL | How to set |
|-----|----------|------------|
| `local` | `http://localhost:5050` | default |
| `ci` | `http://localhost:5050` | `CYPRESS_ENV=ci` |
| `staging` | custom | `CYPRESS_ENV=staging STAGING_URL=https://...` |

## Running tests

```bash
# Interactive runner
npm run cy:open

# Full suite
npm run cy:run

# By tag
npm run cy:run:smoke
npm run cy:run:regression
npm run cy:run:a11y
npm run cy:run:critical

# By suite
npm run cy:run:auth
npm run cy:run:team
npm run cy:run:visual

# Component tests
npm run cy:run:component

# Visual regression (requires PERCY_TOKEN)
export PERCY_TOKEN=your_percy_token
npm run cy:run:visual:percy

# HTML report (local)
npm run cy:run:smoke:report

# Cypress Cloud — smoke only (requires CYPRESS_RECORD_KEY)
export CYPRESS_RECORD_KEY=your_record_key
npm run cy:run:smoke:cloud
```

> **Cursor IDE:** if Cypress fails to launch, run with `env -u ELECTRON_RUN_AS_NODE npm run cy:run`.

## Selector strategy

E2E tests use TestFlow `data-testid`; component tests and slides use `data-cy-hook`. See [docs/selector-strategy.md](docs/selector-strategy.md).

## Slides & training docs

- **Português:** [`docs/pt/README.md`](docs/pt/README.md) — walkthrough bloco a bloco de cada spec
- **English:** [`docs/en/README.md`](docs/en/README.md) — same training material in English
- **Slides:** [`docs/slides/`](docs/slides/) — introductory presentation (HTML/PDF)
- Run locally: TestFlow on port `5050`, then `npm run cy:run` or `npx cypress open`

## CI/CD

Pipeline: `.github/workflows/cypress.yml`

| Job | What it runs |
|-----|--------------|
| `smoke` | `@smoke` grep gate + **Cypress Cloud** record (if `CYPRESS_RECORD_KEY` set) |
| `regression` | `@regression` grep gate |
| `test` | Matrix per suite (parallel) |
| `component` | React component tests |
| `visual` | Percy snapshots (`PERCY_TOKEN` secret) |
| `report` | Merged mochawesome HTML artifact |

## Project structure

```
cypress/
├── e2e/           # E2E specs by feature
├── component/     # Component test stubs
├── fixtures/      # Test data + JSON Schemas
├── pages/         # Page Objects
└── support/       # Commands, factories, utilities, a11y
```

## Technologies

Cypress 15, React 18, Vite, cypress-axe, Ajv, Percy, mochawesome, GitHub Actions.

## License

Private — see repository owner.
