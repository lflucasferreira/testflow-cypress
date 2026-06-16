# Team — Table, Filters, and Invites

**Source file:** [`team.cy.js`](../../../../cypress/e2e/team/team.cy.js)

---

## Purpose

This suite validates the **team management page** of TestFlow. It covers the full interaction cycle with the member table:

- Page structure (header, columns, pagination)
- Search by name and email
- Role filters (Admin) and status filters (active/inactive)
- Name sorting (desc/asc)
- Pagination between pages
- Invite modal with validation, factory, and API intercept
- Inline row editing
- Framework list filtering

It combines **Page Object** ([`TeamPage`](../../../../cypress/pages/TeamPage.js)), **factory** ([`TeamMemberFactory`](../../../../cypress/support/factories)), **fixtures**, and **network intercepts**.

---

## Prerequisites

| Item | Detail |
|------|--------|
| **TestFlow** | Running at `http://localhost:5050` |
| **Dependencies** | `npm install` at the project root |
| **DEMO credentials** | Used by `cy.visitWithSession('/web/team.html')` |
| **Fixtures** | [`team-member.json`](../../../../cypress/fixtures/team-member.json) for invite form prefill |
| **Factory** | [`TeamMemberFactory`](../../../../cypress/support/factories) generates unique data per test |
| **Execution** | `npx cypress run --spec cypress/e2e/team/team.cy.js` |

---

## Tags used

| Tag | Where it appears | Meaning |
|-----|------------------|---------|
| `@regression` | Main `describe` | Regression suite |
| `@smoke` | Search for "Alice" | Table and filter sanity check |
| `@critical` | Successful invite | Business flow that adds a member |

---

## Cypress concepts

| Concept | Usage in this file |
|---------|-------------------|
| **Page Object** | [`TeamPage`](../../../../cypress/pages/TeamPage.js) — table, filters, modal, inline editing |
| **Factory pattern** | `TeamMemberFactory.createInvite()` — dynamic data avoids collisions |
| **`cy.searchTable` / `cy.getTableRows`** | Custom table commands in [`commands.js`](../../../../cypress/support/commands.js) |
| **`cy.wrap($row)`** | Iterates jQuery rows in Cypress context |
| **`cy.fixture().then()`** | Loads static data from [`team-member.json`](../../../../cypress/fixtures/team-member.json) |
| **`cy.interceptInvite`** | Spies on invite POST — alias `@inviteApi` |
| **`cy.getByHook(SHARED.toast.testId)`** | Centralized hook map in [`elements.js`](../../../../cypress/support/elements.js) |
| **`cy.section()`** | Groups steps in Mochawesome report |
| **Conditional API editing** | Tests PUT or PATCH depending on backend response |

---

## Step-by-step — block by block

### Block 1 — Setup

```javascript
import TeamPage from '../../pages/TeamPage'
import { TeamMemberFactory } from '../../support/factories'
import { SHARED } from '../../support/elements'

describe('Team', { tags: '@regression' }, () => {
  beforeEach(() => {
    cy.visitWithSession('/web/team.html')
    TeamPage.pageRoot().should('exist')
  })
```

- **Given:** authenticated user on the Team page.
- **When:** `visitWithSession` ensures session + navigation.
- **Then:** `page-team` exists — base for all contexts.

---

### Block 2 — Page structure

```javascript
  context('Page structure', () => {
    it('shows the page header with member count', () => {
      TeamPage.teamSummary().should('contain.text', '6 members')
    })

    it('renders all table columns', () => {
      cy.getByTestId('users-table').find('thead th').should('have.length', 7)
    })

    it('renders the correct number of rows on page 1', () => {
      TeamPage.shouldHaveRowCount(4)
    })

    it('row count label matches visible rows', () => {
      TeamPage.rowCount().should('contain.text', '6 row(s)')
    })
  })
```

- **Given:** table with 6 total members, 4 visible on page 1.
- **When:** header, columns (`thead th`), and counter are inspected.
- **Then:** 7 columns, 4 visible rows, label "6 row(s)" reflects total.

---

### Block 3 — Search

```javascript
  context('Search', () => {
    it('filters rows by member name', { tags: '@smoke' }, () => {
      cy.searchTable('Alice')
      cy.getTableRows().should('have.length', 1)
      cy.getTableCell(1, 'name').should('contain.text', 'Alice QA')
    })

    it('filters rows by email', () => {
      TeamPage.search('carol')
      TeamPage.shouldHaveRowCount(1)
    })

    it('returns all rows when search is cleared', () => {
      TeamPage.search('Alice')
      TeamPage.shouldHaveRowCount(1)
      TeamPage.clearSearch()
      TeamPage.shouldHaveRowCount(4)
    })

    it('shows zero rows for a term with no match', () => {
      TeamPage.search('zzznoresult')
      TeamPage.tableRows().should('have.length', 0)
    })
  })
```

- **Given:** table with multiple members.
- **When:** search term is entered (name, email, or nonexistent term).
- **Then:** rows filter dynamically; clear restores 4 rows; invalid term returns 0.

---

### Block 4 — Role and status filters

```javascript
  context('Role filter', () => {
    it('filters to Admin rows only', () => {
      TeamPage.filterByRole('admin')
      TeamPage.tableRows().each(($row) => {
        cy.wrap($row).find('[data-role="admin"]').should('exist')
      })
    })

    it('shows all rows when filter is reset', () => {
      TeamPage.filterByRole('admin')
      TeamPage.filterByRole('')
      TeamPage.shouldHaveRowCount(4)
    })
  })

  context('Status filter', () => {
    it('filters to active members only', () => {
      TeamPage.filterByStatus('active')
      TeamPage.tableRows().each(($row) => {
        cy.wrap($row).find('[data-status="active"]').should('exist')
      })
    })

    it('filters to inactive members only', () => {
      TeamPage.filterByStatus('inactive')
      TeamPage.tableRows().each(($row) => {
        cy.wrap($row).find('[data-status="inactive"]').should('exist')
      })
    })
  })
```

- **Given:** role and status dropdowns available.
- **When:** filter is selected and each visible row is iterated with `.each()`.
- **Then:** every row displays the corresponding badge/attribute (`data-role`, `data-status`); reset restores all rows.

---

### Block 5 — Sorting and pagination

```javascript
  context('Sorting', () => {
    it('sorts rows by name descending on first click', () => {
      TeamPage.sortByName()
      TeamPage.tableRows().then(($rows) => {
        const names = [...$rows].map((r) =>
          (r.querySelector('[data-testid^="cell-name-"]')?.textContent ?? '').trim()
        )
        expect(names).to.deep.eq([...names].sort((a, b) => b.localeCompare(a)))
      })
    })

    it('second click sorts rows by name ascending', () => {
      TeamPage.sortByName().sortByName()
      // ... ascending localeCompare assertion
    })
  })

  context('Pagination', () => {
    it('"Prev" button is disabled on page 1', () => {
      TeamPage.prevPage().should('be.disabled')
    })

    it('navigates to page 2 showing remaining rows', () => {
      TeamPage.goToNextPage()
      TeamPage.pageInfo().should('contain.text', 'Page 2')
      TeamPage.shouldHaveRowCount(2)
    })

    it('"Next" button is disabled on last page', () => {
      TeamPage.goToNextPage()
      TeamPage.nextPage().should('be.disabled')
    })

    it('navigating back to page 1 restores row count', () => {
      TeamPage.goToNextPage().goToPrevPage()
      TeamPage.shouldHaveRowCount(4)
    })
  })
```

- **Given:** paginated table (4 + 2 rows).
- **When:** "Name" header or Prev/Next buttons are clicked.
- **Then:** names sort via `localeCompare`; page 2 shows 2 remaining rows; Prev disabled on page 1; Next disabled on last page.

---

### Block 6 — Invite modal

```javascript
  context('Invite member modal', () => {
    let member

    beforeEach(() => {
      member = TeamMemberFactory.createInvite()
    })

    it('shows validation error when name is empty', () => {
      TeamPage.openInviteModal()
        .fillInviteForm({ email: member.email })
        .submitInvite()
        .shouldShowInviteError('required')
    })

    it('shows validation error for invalid email', () => {
      TeamPage.openInviteModal()
        .fillInviteForm({ name: member.name, email: 'notanemail' })
        .submitInvite()
        .shouldShowInviteError('valid email')
    })

    it('adds a new row after successful invite', { tags: '@critical' }, () => {
      cy.section('Invite member')
      TeamPage.openInviteModal()
        .fillInviteForm(member)
        .submitInvite()

      TeamPage.shouldHaveInviteModalClosed()
      cy.getByHook(SHARED.toast.testId).should('contain.text', member.email)
      TeamPage.rowCount().invoke('text').then((text) => {
        expect(parseInt(text, 10)).to.be.greaterThan(6)
      })
    })
```

- **Given:** factory generates unique member per test (`name`, `email`, `role`).
- **When:** modal is opened, form filled, submitted, or empty fields validated.
- **Then:** validation errors appear; successful invite closes modal, shows toast, and counter increments above 6.

**Payload intercept:**

```javascript
    it('invite request contains name and email in the payload', () => {
      cy.interceptInvite()

      TeamPage.openInviteModal()
        .fillInviteForm(member)
        .submitInvite()

      cy.get('@inviteApi').then((interception) => {
        if (interception) {
          expect(interception.request.body).to.include.keys('name', 'email')
          expect(interception.request.body.email).to.eq(member.email)
        }
      })
    })
```

- **Given:** intercept registered before submit.
- **When:** invite is sent to the backend.
- **Then:** request body contains correct `name` and `email`.

---

### Block 7 — Inline editing and frameworks

```javascript
  context('Inline editing', () => {
    it('updates the row after saving a new name', () => {
      TeamPage.startEdit(1)
        .editName(1, 'Alice QA Updated')
        .saveEdit(1)

      TeamPage.nameCell(1).should('contain.text', 'Alice QA Updated')
    })

    it('edit save updates the row and triggers a write request if API-driven', () => {
      cy.interceptPutUser()
      cy.interceptPatchUser()
      // ... save and assert PUT or PATCH payload
    })

    it('discards changes on Cancel', () => {
      TeamPage.startEdit(1)
        .editName(1, 'Should Not Save')
        .cancelEdit(1)

      TeamPage.nameCell(1).should('not.contain.text', 'Should Not Save')
    })
  })

  context('Framework list filter', () => {
    it('filters the framework list', () => {
      TeamPage.frameworkSearch().type('play')
      TeamPage.frameworkList()
        .find('li')
        .each(($li) => {
          expect($li.text().toLowerCase()).to.include('play')
        })
    })

    it('shows all frameworks when filter is cleared', () => {
      TeamPage.frameworkSearch().type('cypress').clear()
      TeamPage.frameworkList().find('li').should('have.length.greaterThan', 1)
    })
  })
```

- **Given:** editable row and sidebar framework list.
- **When:** edit mode entered, name changed, saved or cancelled; frameworks filtered by "play".
- **Then:** name persists or reverts; only matching frameworks remain visible; clear restores full list.

---

## How to run

```bash
npx cypress run --spec cypress/e2e/team/team.cy.js

# Smoke + critical
npx cypress run --spec cypress/e2e/team/team.cy.js --env grepTags="@smoke|@critical"
```

---

## Related references

- Page Object: [`TeamPage.js`](../../../../cypress/pages/TeamPage.js)
- Factory: [`cypress/support/factories/`](../../../../cypress/support/factories/)
- Fixture: [`team-member.json`](../../../../cypress/fixtures/team-member.json)
- Intercepts: [`interceptions.js`](../../../../cypress/support/commands/interceptions.js)
- Element map: [`elements.js`](../../../../cypress/support/elements.js)
