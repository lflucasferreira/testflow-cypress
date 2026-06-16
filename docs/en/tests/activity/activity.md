# Activity Page Tests

**Source file:** [`../../../../cypress/e2e/activity/activity.cy.js`](../../../../cypress/e2e/activity/activity.cy.js)

---

## Purpose

This module validates the **Activity** page (`/web/activity.html`), focused on advanced automation patterns:

- **API calls via UI** — buttons that trigger fetch and display results
- **Network interception** — artificial delay and response mocking
- **Local state** — counter increment/decrement/reset
- **Simulated progress** — download bar
- **Dynamic content** — asynchronous loading
- **Data fixtures** — reading JSON and CSV
- **File upload** — drag-and-drop via `selectFile`

It is a lab for concepts beyond simple clicks: network, time, files, and external data.

---

## Prerequisites

| Item | Description |
|------|-------------|
| Environment | TestFlow server running |
| Authentication | `ActivityPage.visit()` → `cy.visitWithSession` |
| Fixtures | [`users/empty-list.json`](../../../../cypress/fixtures/users/empty-list.json), [`sample.csv`](../../../../cypress/fixtures/sample.csv), [`lookups/countries.json`](../../../../cypress/fixtures/lookups/countries.json) |
| Intercepts | [`commands/interceptions.js`](../../../../cypress/support/commands/interceptions.js) |

```bash
npm run cy:run:activity
npx cypress run --env grepTags=@smoke --spec cypress/e2e/activity/**
npx cypress run --env grepTags=@api --spec cypress/e2e/activity/**
```

---

## Tags used

| Tag | Where it appears | Meaning |
|-----|------------------|---------|
| `@regression` | Main `describe` | Regression suite |
| `@smoke` | `fetches users via API button` | Quick API-via-UI gate |
| `@api` | `fetches users via API button` | Test with HTTP response validation |

---

## Structure overview

```
activity.cy.js
├── Import ActivityPage
├── beforeEach (ActivityPage.visit + pageRoot)
└── 8 tests (it) — network, counter, progress, fixtures, upload
```

---

## Imports — block by block

### `import ActivityPage from '../../pages/ActivityPage'`

Page Object with locators: `fetchUsersBtn()`, `apiResult()`, `counterValue()`, `dropZone()`, etc.

The `visit()` method wraps `cy.visitWithSession('/web/activity.html')`.

---

## Setup — `beforeEach`

```javascript
beforeEach(() => {
  ActivityPage.visit()
  ActivityPage.pageRoot().should('exist')
})
```

**Given:** authenticated user on `/web/activity.html` with `page-activity` in the DOM.

---

## Tests — block by block

### `fetches users via API button` — `@smoke @api`

```javascript
cy.section('Setup intercept')
cy.interceptGetUsers().as('getUsers')

cy.section('Trigger fetch')
cy.step('Click fetch users button')
ActivityPage.fetchUsersBtn().click()

cy.section('Assert response')
cy.wait('@getUsers').its('response.statusCode').should('eq', 200)
ActivityPage.apiResult().should('not.be.empty')
```

| Step | Description |
|------|-------------|
| **Given** | Intercept registered for GET `/api/users` |
| **When** | Clicks fetch button |
| **Then (network)** | Response with status 200 |
| **Then (UI)** | Result area not empty |

**Cypress concepts:**

| API | Usage |
|-----|-------|
| `cy.interceptGetUsers()` | Custom command in [`interceptions.js`](../../../../cypress/support/commands/interceptions.js) |
| `.as('getUsers')` | Alias for `cy.wait('@getUsers')` |
| `cy.section` / `cy.step` | Readable BDD reporting |

---

### `handles slow API with intercept delay`

```javascript
cy.interceptSlowApi(1500).as('slowApi')
ActivityPage.fetchSlowBtn().click()
cy.wait('@slowApi')
ActivityPage.apiResult().should('be.visible')
```

| Aspect | Explanation |
|--------|-------------|
| `interceptSlowApi(1500)` | Adds 1.5s delay to `/api/slow` response |
| Final assertion | UI displays result after slow API |

**Concept:** tests latency resilience without fully mocking the response.

---

### `increments and decrements counter`

```javascript
ActivityPage.counterIncrement().click().click()
ActivityPage.counterValue().should('contain.text', '2')
ActivityPage.counterDecrement().click()
ActivityPage.counterValue().should('contain.text', '1')
ActivityPage.counterReset().click()
ActivityPage.counterValue().should('contain.text', '0')
```

Tests **local JavaScript state** — reactive counter without involving the backend.

---

### `starts download progress simulation`

```javascript
ActivityPage.progressStart().click()
ActivityPage.downloadProgress().should('exist')
```

Progress bar exists in the DOM (may exist before the visual animation completes).

---

### `loads dynamic content section`

```javascript
ActivityPage.loadDynamicBtn().click()
ActivityPage.dynamicContent().should('not.be.empty')
```

Content injected asynchronously after interaction.

---

### `uses mockApiGet with empty users fixture`

```javascript
cy.mockApiGet('users/empty-list', /\/api\/users/)
ActivityPage.fetchUsersBtn().click()
cy.wait('@mock_users_empty-list')
ActivityPage.apiResult().should('contain.text', 'Fetched 0 users')
```

| Aspect | Explanation |
|--------|-------------|
| `mockApiGet(fixture, pattern)` | Mocked response — does **not** call real backend |
| Generated alias | `@mock_users_empty-list` (replaces `/` with `_`) |
| Assertion | UI reflects `"Fetched 0 users"` |

**Concept:** mocking enables deterministic **edge cases** (empty list).

---

### `readFixture task exposes countries lookup for test data`

```javascript
cy.task('readFixture', 'lookups/countries.json').then((data) => {
  expect(data.countries.map((c) => c.code)).to.include('CA')
})
```

Tests the Node helper — validates that the fixture contains Canada (`"CA"`).

---

### `accepts CSV file via drag-and-drop on drop zone`

```javascript
ActivityPage.dropZone().selectFile('cypress/fixtures/sample.csv', { action: 'drag-drop' })
ActivityPage.dropZone().should('contain.text', 'sample.csv')
```

| Aspect | Explanation |
|--------|-------------|
| `selectFile(..., { action: 'drag-drop' })` | Simulates Cypress native drag-and-drop |
| Assertion | Drop zone displays the file name |

---

## Concepts learned — summary

| Concept | Where it appears |
|---------|------------------|
| Page Object | `ActivityPage` |
| Network interception | `cy.interceptGetUsers`, `cy.interceptSlowApi`, `cy.mockApiGet` |
| Alias wait | `cy.wait('@getUsers')` |
| Latency simulation | `interceptSlowApi(1500)` |
| API mock | `mockApiGet` with fixture |
| Local UI state | Counter increment/decrement |
| Node task | `cy.task('readFixture', ...)` |
| File upload | `selectFile` with `drag-drop` |
| BDD reporting | `cy.section`, `cy.step` |
| Tags | `@smoke`, `@api`, `@regression` |
