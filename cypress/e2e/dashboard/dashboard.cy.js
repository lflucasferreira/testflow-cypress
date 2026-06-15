import DashboardPage from '../../pages/DashboardPage'

describe('Dashboard', { tags: '@regression' }, () => {
  beforeEach(() => {
    cy.visitWithSession('/web/dashboard.html')
    DashboardPage.shouldBeLoaded()
  })

  context('Greeting', () => {
    it('shows time-based greeting with the user name', { tags: '@smoke' }, () => {
      DashboardPage.shouldShowGreeting()
      DashboardPage.greeting().should('contain.text', 'Demo User')
    })

    it('shows a non-empty subtitle', () => {
      DashboardPage.subtitle().should('be.visible').and('not.be.empty')
    })
  })

  context('KPI cards', () => {
    it('renders all four KPI cards', () => {
      DashboardPage.shouldHaveAllKpiCards()
    })

    it('shows a numeric value in the runs card', () => {
      DashboardPage.kpiValue('runs')
        .invoke('text')
        .then(parseInt)
        .should('be.greaterThan', 0)
    })

    it('shows a percentage in the pass rate card', () => {
      DashboardPage.kpiValue('passrate')
        .invoke('text')
        .should('match', /^\d+(\.\d+)?%$/)
    })

    it('shows trend indicators on each card', () => {
      ['runs', 'passrate', 'members', 'issues'].forEach((key) => {
        DashboardPage.kpiTrend(key).should('be.visible').and('not.be.empty')
      })
    })
  })

  context('Recent activity', () => {
    it('shows 5 activity items', () => {
      DashboardPage.shouldHaveActivityItems(5)
    })

    it('each activity item has text and a timestamp', () => {
      DashboardPage.activityItem(1).within(() => {
        cy.get('.activity-text').should('not.be.empty')
        cy.get('.activity-time').should('not.be.empty')
      })
    })

    it('"See all" link navigates to activity page', () => {
      DashboardPage.quickAction('team') // warm up navigation
      cy.getByTestId('activity-see-all').click()
      cy.url().should('include', '/web/activity.html')
    })
  })

  context('Suite health', () => {
    it('shows Healthy status badge', () => {
      DashboardPage.healthStatus()
        .should('be.visible')
        .and('contain.text', 'Healthy')
    })

    it('renders three suite health bars', () => {
      ['regression', 'smoke', 'e2e'].forEach((suite) => {
        DashboardPage.healthBar(suite).should('exist')
        DashboardPage.healthPct(suite)
          .invoke('text')
          .should('match', /^\d+%$/)
      })
    })

    it('regression bar fill width reflects its percentage', () => {
      DashboardPage.healthBar('regression')
        .should('have.attr', 'style')
        .and('include', 'width:97%')
    })
  })

  context('"New test run" modal', () => {
    it('opens modal on button click', () => {
      DashboardPage.openNewRunModal()
        .shouldShowRunModalOpen()
    })

    it('modal has suite and environment selects', () => {
      DashboardPage.openNewRunModal()
      DashboardPage.runSuiteSelect().should('be.visible')
      DashboardPage.runEnvSelect().should('be.visible')
    })

    it('closes modal on Cancel', () => {
      DashboardPage.openNewRunModal().cancelRun()
      DashboardPage.shouldShowRunModalClosed()
    })

    it('closes modal on Escape key', () => {
      DashboardPage.openNewRunModal()
      cy.get('body').type('{esc}')
      DashboardPage.shouldShowRunModalClosed()
    })

    it('closes modal on overlay click', () => {
      DashboardPage.openNewRunModal()
      cy.getByTestId('run-modal-overlay').click('topLeft')
      DashboardPage.shouldShowRunModalClosed()
    })

    it('confirms a run and shows toast', () => {
      DashboardPage.openNewRunModal()
        .selectSuite('smoke')
        .selectEnvironment('staging')
        .confirmRun()

      DashboardPage.shouldShowRunModalClosed()
      cy.getByTestId('toast-message').should('contain.text', 'smoke')
    })
  })

  context('Quick access navigation', () => {
    const links = [
      { testId: 'qa-team', path: '/web/team.html' },
      { testId: 'qa-settings', path: '/web/settings.html' },
      { testId: 'qa-wizard', path: '/web/wizard.html' },
    ]

    links.forEach(({ testId, path }) => {
      it(`"${testId}" navigates to ${path}`, () => {
        cy.getByTestId(testId).click()
        cy.url().should('include', path)
      })

      // Go back for next iteration
      afterEach(() => cy.go('back'))
    })
  })

  context('Accessibility', () => {
    it('dashboard has no critical a11y violations', { tags: '@a11y' }, () => {
      cy.checkA11yPage(undefined, { preset: 'critical' })
    })
  })
})
