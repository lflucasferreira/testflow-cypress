# testflow-cypress

Cypress E2E automation suite for [TestFlow](https://testflow.app) — a web-based sandbox application designed for QA practice and automation learning.

## About TestFlow

TestFlow is a demo web app that simulates a real test management platform. It includes a login flow, dashboard with KPI cards, team management, settings, and UI components — all purpose-built for writing and practising automation.

The app runs locally and exposes both a UI (`:5050/web/`) and a REST API (`:5050/api/`).

## Test coverage

| Suite | Spec | What it covers |
|---|---|---|
| Smoke | `smoke/navigation.cy.js` | All pages load, sidebar nav, auth API health |
| Auth | `auth/login.cy.js` | Login via UI and API, validation, sessionStorage, redirect |
| Dashboard | `dashboard/dashboard.cy.js` | KPIs, activity feed, suite health bars, new run modal |
| Team | `team/team.cy.js` | Table search, filters, sort, pagination, invite modal, inline edit |
| Settings | `settings/settings.cy.js` | Settings form interactions |
| Components | `components/components.cy.js` | UI component library page |

## Prerequisites

- Node.js 18+
- [TestFlow app](https://testflow.app) running locally on port `5050`

## Setup

```bash
npm install
```

## Running the app

Download and start the TestFlow sandbox:

```bash
# macOS / Linux
npx testflow start

# or run the binary directly if downloaded manually
./testflow --port 5050
```

The app will be available at `http://localhost:5050`. Default credentials:

| Field | Value |
|---|---|
| Email | `demo@automation.io` |
| Password | `Demo123!` |

## Running the tests

```bash
# Open Cypress interactive runner
npm run cy:open

# Run all tests headless
npm run cy:run

# Run a specific suite
npm run cy:run:smoke
npm run cy:run:auth
npm run cy:run:team
```

## Project structure

```
cypress/
├── e2e/
│   ├── auth/
│   ├── dashboard/
│   ├── components/
│   ├── settings/
│   ├── smoke/
│   └── team/
├── fixtures/         # Test data (credentials, team members)
├── pages/            # Page Object classes
└── support/
    ├── commands.js   # Custom commands (loginViaApi, visitAuthenticated, getByTestId)
    └── e2e.js        # Global setup
```
