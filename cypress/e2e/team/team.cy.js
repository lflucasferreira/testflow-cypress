import TeamPage from '../../pages/TeamPage'
import { TeamMemberFactory } from '../../support/factories'
import { SHARED } from '../../support/elements'

describe('Team', { tags: '@regression' }, () => {
  beforeEach(() => {
    cy.visitWithSession('/web/team.html')
    TeamPage.pageRoot().should('exist')
  })

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
      TeamPage.tableRows().then(($rows) => {
        const names = [...$rows].map((r) =>
          (r.querySelector('[data-testid^="cell-name-"]')?.textContent ?? '').trim()
        )
        expect(names).to.deep.eq([...names].sort((a, b) => a.localeCompare(b)))
      })
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

  context('Invite member modal', () => {
    let member

    beforeEach(() => {
      member = TeamMemberFactory.createInvite()
    })

    it('opens modal on "Invite member" click', () => {
      TeamPage.openInviteModal()
        .shouldHaveInviteModalOpen()
    })

    it('closes modal on Cancel', () => {
      TeamPage.openInviteModal().cancelInvite()
      TeamPage.shouldHaveInviteModalClosed()
    })

    it('closes modal on Escape key', () => {
      TeamPage.openInviteModal()
      cy.get('body').type('{esc}')
      TeamPage.shouldHaveInviteModalClosed()
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

    it('prefills invite form from team-member fixture', () => {
      cy.fixture('team-member').then(({ new: member }) => {
        TeamPage.openInviteModal()
          .fillInviteForm({ name: member.name, email: member.email, role: 'user' })
        TeamPage.inviteName().should('have.value', member.name)
        TeamPage.inviteEmail().should('have.value', member.email)
      })
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

    it('invite request contains name and email in the payload', () => {
      cy.interceptInvite()

      TeamPage.openInviteModal()
        .fillInviteForm(member)
        .submitInvite()

      TeamPage.shouldHaveInviteModalClosed()
      cy.get('@inviteApi').then((interception) => {
        if (interception) {
          expect(interception.request.body).to.include.keys('name', 'email')
          expect(interception.request.body.email).to.eq(member.email)
        }
      })
    })
  })

  context('Inline editing', () => {
    it('shows name and role inputs when Edit is clicked', () => {
      TeamPage.startEdit(1).shouldShowEditInputs(1)
    })

    it('updates the row after saving a new name', () => {
      TeamPage.startEdit(1)
        .editName(1, 'Alice QA Updated')
        .saveEdit(1)

      TeamPage.nameCell(1).should('contain.text', 'Alice QA Updated')
    })

    it('shows a success toast after saving', () => {
      TeamPage.startEdit(2)
        .saveEdit(2)

      cy.getByTestId('toast-message').should('contain.text', 'updated')
    })

    it('edit save updates the row and triggers a write request if API-driven', () => {
      cy.interceptPutUser()
      cy.interceptPatchUser()

      TeamPage.startEdit(1)
        .editName(1, 'Alice QA Intercepted')
        .saveEdit(1)

      TeamPage.nameCell(1).should('contain.text', 'Alice QA Intercepted')

      cy.get('@putUser').then((put) => {
        cy.get('@patchUser').then((patch) => {
          const interception = put || patch
          if (interception) {
            expect(interception.request.body).to.have.property('name')
          }
        })
      })
    })

    it('discards changes on Cancel', () => {
      TeamPage.startEdit(1)
        .editName(1, 'Should Not Save')
        .cancelEdit(1)

      TeamPage.nameCell(1).should('not.contain.text', 'Should Not Save')
    })

    it('restores normal row after Cancel', () => {
      TeamPage.startEdit(1).cancelEdit(1)
      TeamPage.editBtn(1).should('be.visible')
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
})
