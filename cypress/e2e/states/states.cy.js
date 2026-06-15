import StatesPage from '../../pages/StatesPage'

describe('UI States — loading, error, empty', { tags: '@regression' }, () => {
  beforeEach(() => {
    StatesPage.visit()
    StatesPage.pageRoot().should('exist')
  })

  context('Skeleton loading', () => {
    it('shows idle message before load', { tags: '@smoke' }, () => {
      StatesPage.skeletonIdle().should('contain.text', 'Load cards')
    })

    it('loads metric cards after skeleton delay', () => {
      StatesPage.loadSkeletonCards()
      cy.getByTestId('loaded-card', { timeout: 5000 }).should('have.length', 4)
    })

    it('resets skeleton section', () => {
      StatesPage.loadSkeletonCards()
      cy.getByTestId('loaded-card', { timeout: 5000 }).should('exist')
      StatesPage.skeletonReset().click()
      StatesPage.skeletonIdle().should('be.visible')
    })
  })

  context('Error and success states', () => {
    it('shows error state on failed fetch', () => {
      StatesPage.triggerError()
      cy.getByTestId('error-state').should('be.visible').and('contain.text', 'Request failed')
    })

    it('shows success state on successful fetch', () => {
      StatesPage.successTrigger().click()
      cy.getByTestId('success-state').should('be.visible').and('contain.text', 'succeeded')
    })
  })

  context('Empty and partial states', () => {
    it('renders empty state when search has no matches', () => {
      cy.getByTestId('empty-search').type('xyzno match')
      cy.getByTestId('empty-state').should('be.visible')
      cy.getByTestId('result-list').should('not.exist')
    })

    it('loads partial grid with mixed card statuses', () => {
      StatesPage.partialTrigger().click()
      cy.get('[data-testid^="partial-card-"]').should('have.length', 6)
    })
  })

  context('Accessibility', () => {
    it('states page has no critical a11y violations', { tags: '@a11y' }, () => {
      cy.checkA11yPage(undefined, { preset: 'critical' })
    })
  })
})
