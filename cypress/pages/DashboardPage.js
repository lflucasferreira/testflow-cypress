class DashboardPage {
  // ── Selectors ──────────────────────────────────────────────────────────────
  pageRoot()              { return cy.getByTestId('page-dashboard') }
  greeting()              { return cy.getByTestId('dash-greeting') }
  subtitle()              { return cy.getByTestId('dash-subtitle') }
  kpiGrid()               { return cy.getByTestId('kpi-grid') }
  kpiCard(name)           { return cy.getByTestId(`kpi-${name}`) }
  kpiValue(name)          { return cy.getByTestId(`kpi-${name}-value`) }
  kpiTrend(name)          { return cy.getByTestId(`kpi-${name}-trend`) }
  activityList()          { return cy.getByTestId('activity-list') }
  activityItem(n)         { return cy.getByTestId(`activity-item-${n}`) }
  healthStatus()          { return cy.getByTestId('health-status') }
  healthBar(suite)        { return cy.getByTestId(`health-${suite}`) }
  healthPct(suite)        { return cy.getByTestId(`health-${suite}-pct`) }
  newRunBtn()             { return cy.getByTestId('btn-new-run') }
  runModal()              { return cy.getByTestId('run-modal-overlay') }
  runSuiteSelect()        { return cy.getByTestId('run-suite') }
  runEnvSelect()          { return cy.getByTestId('run-env') }
  runConfirmBtn()         { return cy.getByTestId('run-modal-confirm') }
  runCancelBtn()          { return cy.getByTestId('run-modal-cancel') }
  quickAction(name)       { return cy.getByTestId(`qa-${name}`) }

  // ── Actions ────────────────────────────────────────────────────────────────
  openNewRunModal() {
    this.newRunBtn().click()
    this.runModal().should('be.visible')
    return this
  }

  selectSuite(suite) {
    this.runSuiteSelect().select(suite)
    return this
  }

  selectEnvironment(env) {
    this.runEnvSelect().select(env)
    return this
  }

  confirmRun() {
    this.runConfirmBtn().click()
    return this
  }

  cancelRun() {
    this.runCancelBtn().click()
    return this
  }

  // ── Assertions ─────────────────────────────────────────────────────────────
  shouldBeLoaded() {
    this.pageRoot().should('exist')
    return this
  }

  shouldShowGreeting() {
    this.greeting()
      .should('be.visible')
      .invoke('text')
      .should('match', /Good (morning|afternoon|evening),/)
    return this
  }

  shouldHaveAllKpiCards() {
    ['runs', 'passrate', 'members', 'issues'].forEach((key) => {
      this.kpiCard(key).should('be.visible')
      this.kpiValue(key).should('not.be.empty')
    })
    return this
  }

  shouldHaveActivityItems(count = 5) {
    this.activityList()
      .find('[data-testid^="activity-item-"]')
      .should('have.length', count)
    return this
  }

  shouldShowRunModalOpen() {
    this.runModal().should('be.visible')
    return this
  }

  shouldShowRunModalClosed() {
    this.runModal().should('not.be.visible')
    return this
  }
}

export default new DashboardPage()
