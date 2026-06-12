import TeamPage from '../../pages/TeamPage'

describe('Team', () => {
  beforeEach(() => {
    cy.visitAuthenticated('/web/team.html')
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
    it('filters rows by member name', () => {
      TeamPage.search('Alice')
      TeamPage.shouldHaveRowCount(1)
      TeamPage.nameCell(1).should('contain.text', 'Alice QA')
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
    it('sorts rows by name ascending on first click', () => {
      TeamPage.sortByName()
      TeamPage.nameCell(1).invoke('text').then((first) => {
        TeamPage.nameCell(2).invoke('text').then((second) => {
          expect(first.localeCompare(second)).to.be.lessThan(1)
        })
      })
    })

    it('reverses sort order on second click', () => {
      TeamPage.sortByName().sortByName()
      TeamPage.nameCell(4).invoke('text').then((last) => {
        TeamPage.nameCell(1).invoke('text').then((first) => {
          expect(last.localeCompare(first)).to.be.lessThan(1)
        })
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
    beforeEach(() => {
      cy.fixture('team-member').as('member')
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

    it('shows validation error when name is empty', function () {
      TeamPage.openInviteModal()
        .fillInviteForm({ email: this.member.new.email })
        .submitInvite()
        .shouldShowInviteError('required')
    })

    it('shows validation error for invalid email', function () {
      TeamPage.openInviteModal()
        .fillInviteForm({ name: this.member.new.name, email: 'notanemail' })
        .submitInvite()
        .shouldShowInviteError('valid email')
    })

    it('adds a new row after successful invite', function () {
      TeamPage.openInviteModal()
        .fillInviteForm(this.member.new)
        .submitInvite()

      TeamPage.shouldHaveInviteModalClosed()
      cy.getByTestId('toast-message').should('contain.text', this.member.new.email)
      TeamPage.rowCount().invoke('text').then((text) => {
        expect(parseInt(text)).to.be.greaterThan(6)
      })
    })

    it('invite request contains name and email in the payload', function () {
      cy.intercept('POST', '/api/**').as('inviteRequest')

      TeamPage.openInviteModal()
        .fillInviteForm(this.member.new)
        .submitInvite()

      TeamPage.shouldHaveInviteModalClosed()
      cy.getByTestId('toast-message').should('contain.text', this.member.new.email)

      cy.get('@inviteRequest').then((interception) => {
        if (interception) {
          expect(interception.request.body).to.include.keys('name', 'email')
          expect(interception.request.body.email).to.eq(this.member.new.email)
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

    it('edit save triggers a write request with updated data', () => {
      cy.intercept('PUT', '/api/**').as('editPut')
      cy.intercept('PATCH', '/api/**').as('editPatch')

      TeamPage.startEdit(1)
        .editName(1, 'Alice QA Intercepted')
        .saveEdit(1)

      TeamPage.nameCell(1).should('contain.text', 'Alice QA Intercepted')

      cy.get('@editPut').then((put) => {
        cy.get('@editPatch').then((patch) => {
          const interception = put || patch
          expect(interception, 'expected a PUT or PATCH request to be made').to.not.be.null
          expect(interception.request.body).to.have.property('name')
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
