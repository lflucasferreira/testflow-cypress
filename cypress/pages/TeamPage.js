class TeamPage {
  // ── Selectors ──────────────────────────────────────────────────────────────
  pageRoot()          { return cy.getByTestId('page-team') }
  teamSummary()       { return cy.getByTestId('team-summary') }
  inviteBtn()         { return cy.getByTestId('invite-btn') }
  searchInput()       { return cy.getByTestId('table-search') }
  roleFilter()        { return cy.getByTestId('role-filter') }
  statusFilter()      { return cy.getByTestId('status-filter') }
  sortBtn()           { return cy.getByTestId('table-sort-name') }
  rowCount()          { return cy.getByTestId('table-row-count') }
  table()             { return cy.getByTestId('users-table') }
  tableRows()         { return this.table().find('tbody tr') }
  row(id)             { return cy.getByTestId(`user-row-${id}`) }
  editBtn(id)         { return cy.getByTestId(`edit-row-${id}`) }
  saveBtn(id)         { return cy.getByTestId(`save-row-${id}`) }
  cancelBtn(id)       { return cy.getByTestId(`cancel-row-${id}`) }
  nameCell(id)        { return cy.getByTestId(`cell-name-${id}`) }
  roleCell(id)        { return cy.getByTestId(`cell-role-${id}`) }
  prevPage()          { return cy.getByTestId('prev-page') }
  nextPage()          { return cy.getByTestId('next-page') }
  pageInfo()          { return cy.getByTestId('page-info') }
  inviteModal()       { return cy.getByTestId('invite-modal') }
  inviteName()        { return cy.getByTestId('invite-name') }
  inviteEmail()       { return cy.getByTestId('invite-email') }
  inviteRole()        { return cy.getByTestId('invite-role') }
  inviteConfirm()     { return cy.getByTestId('invite-confirm') }
  inviteCancel()      { return cy.getByTestId('invite-cancel') }
  inviteError()       { return cy.getByTestId('invite-error') }
  editNameInput(id)   { return cy.getByTestId(`edit-name-${id}`) }
  editRoleSelect(id)  { return cy.getByTestId(`edit-role-${id}`) }
  frameworkSearch()   { return cy.getByTestId('item-search') }
  frameworkList()     { return cy.getByTestId('item-list') }

  // ── Actions ────────────────────────────────────────────────────────────────
  search(term) {
    this.searchInput().clear().type(term)
    return this
  }

  clearSearch() {
    this.searchInput().clear()
    return this
  }

  filterByRole(role) {
    this.roleFilter().select(role)
    return this
  }

  filterByStatus(status) {
    this.statusFilter().select(status)
    return this
  }

  sortByName() {
    this.sortBtn().click()
    return this
  }

  goToNextPage() {
    this.nextPage().click()
    return this
  }

  goToPrevPage() {
    this.prevPage().click()
    return this
  }

  openInviteModal() {
    this.inviteBtn().click()
    this.inviteModal().should('be.visible')
    return this
  }

  fillInviteForm({ name, email, role }) {
    if (name)  this.inviteName().clear().type(name)
    if (email) this.inviteEmail().clear().type(email)
    if (role)  this.inviteRole().select(role)
    return this
  }

  submitInvite() {
    this.inviteConfirm().click()
    return this
  }

  cancelInvite() {
    this.inviteCancel().click()
    return this
  }

  startEdit(id) {
    this.editBtn(id).click()
    this.editNameInput(id).should('be.visible')
    return this
  }

  editName(id, newName) {
    this.editNameInput(id).clear().type(newName)
    return this
  }

  editRole(id, role) {
    this.editRoleSelect(id).select(role)
    return this
  }

  saveEdit(id) {
    this.saveBtn(id).click()
    return this
  }

  cancelEdit(id) {
    this.cancelBtn(id).click()
    return this
  }

  // ── Assertions ─────────────────────────────────────────────────────────────
  shouldHaveRowCount(n) {
    this.tableRows().should('have.length', n)
    return this
  }

  shouldShowRowCountLabel(text) {
    this.rowCount().should('contain.text', text)
    return this
  }

  shouldHaveInviteModalOpen() {
    this.inviteModal().should('be.visible')
    return this
  }

  shouldHaveInviteModalClosed() {
    this.inviteModal().should('not.be.visible')
    return this
  }

  shouldShowInviteError(text) {
    this.inviteError().should('be.visible').and('contain.text', text)
    return this
  }

  shouldShowNameInRow(id, name) {
    this.nameCell(id).should('contain.text', name)
    return this
  }

  shouldShowEditInputs(id) {
    this.editNameInput(id).should('be.visible')
    this.editRoleSelect(id).should('be.visible')
    return this
  }
}

export default new TeamPage()
