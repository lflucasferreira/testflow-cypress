import { TC, tc } from '../../support/@enums/testCases'

describe('Components', { tags: '@regression' }, () => {
  beforeEach(() => {
    cy.visitWithSession('/web/components.html')
    cy.getByTestId('page-components').should('exist')
  })

  context('Buttons', () => {
    it('all button variants are visible', () => {
      ['btn-primary', 'btn-secondary', 'btn-success', 'btn-danger'].forEach((id) => {
        cy.getByTestId(id).should('be.visible').and('not.be.disabled')
      })
    })

    it('disabled button is not interactive', () => {
      cy.getByTestId('btn-disabled')
        .should('be.disabled')
        .and('have.css', 'cursor', 'not-allowed')
    })

    it(tc(TC.COMP_LOADING_BUTTON, 'loading button shows spinner during simulated load'), () => {
      cy.clock()
      cy.getByTestId('btn-loading').click()
      cy.getByTestId('btn-loading').should('be.disabled')
      cy.get('.spinner').should('be.visible')
      cy.tick(2000)
      cy.getByTestId('btn-loading').should('not.be.disabled')
    })

    it('toast button shows a toast notification', () => {
      cy.getByTestId('btn-toast').click()
      cy.getByTestId('toast-message').should('be.visible').and('not.be.empty')
    })

    it('native alert can be dismissed', () => {
      cy.on('window:alert', (text) => {
        expect(text).to.not.be.empty
      })
      cy.getByTestId('btn-alert').click()
    })

    it('native confirm returns true on accept', () => {
      cy.on('window:confirm', () => true)
      cy.getByTestId('btn-confirm').click()
      cy.getByTestId('dialog-result').should('contain.text', 'Confirmed')
    })

    it('native confirm returns false on cancel', () => {
      cy.on('window:confirm', () => false)
      cy.getByTestId('btn-confirm').click()
      cy.getByTestId('dialog-result').should('contain.text', 'Cancelled')
    })
  })

  context('Modal', () => {
    beforeEach(() => {
      cy.getByTestId('open-modal-btn').click()
      cy.getByTestId('modal-overlay').should('be.visible')
    })

    it('opens modal and shows title', () => {
      cy.get('#modal-title').should('contain.text', 'Confirm action')
    })

    it('has accessible role dialog', () => {
      cy.getByTestId('modal-overlay')
        .should('have.attr', 'role', 'dialog')
        .and('have.attr', 'aria-modal', 'true')
    })

    it('closes on Confirm button', () => {
      cy.clickDialogConfirm()
      cy.getByTestId('modal-overlay').should('not.be.visible')
      cy.getByHook('toast-message').should('be.visible')
    })

    it('closes on Cancel button', () => {
      cy.clickDialogCancel()
      cy.getByTestId('modal-overlay').should('not.be.visible')
    })

    it('closes on close (✕) button', () => {
      cy.clickDialogClose()
      cy.getByTestId('modal-overlay').should('not.be.visible')
    })

    it('closes on Escape key', () => {
      cy.get('body').type('{esc}')
      cy.getByTestId('modal-overlay').should('not.be.visible')
    })

    it('closes on overlay background click', () => {
      cy.getByTestId('modal-overlay').click('topLeft')
      cy.getByTestId('modal-overlay').should('not.be.visible')
    })

    it('aria-hidden is set correctly when closed', () => {
      cy.getByTestId('modal-cancel-btn').click()
      cy.getByTestId('modal-overlay').should('have.attr', 'aria-hidden', 'true')
    })
  })

  context('Tabs', () => {
    it('Overview tab is active by default', () => {
      cy.getByTestId('tab-overview')
        .should('have.attr', 'aria-selected', 'true')
      cy.getByTestId('tab-panel-overview').should('be.visible')
    })

    it('clicking Cypress tab activates it and shows its panel', () => {
      cy.getByTestId('tab-cypress').click()
      cy.getByTestId('tab-cypress').should('have.attr', 'aria-selected', 'true')
      cy.getByTestId('tab-panel-cypress').should('be.visible')
      cy.getByTestId('tab-panel-overview').should('not.be.visible')
    })

    it('clicking Playwright tab activates it and shows its panel', () => {
      cy.getByTestId('tab-playwright').click()
      cy.getByTestId('tab-playwright').should('have.attr', 'aria-selected', 'true')
      cy.getByTestId('tab-panel-playwright').should('be.visible')
    })

    it('only one tab panel is visible at a time', () => {
      cy.getByTestId('tab-cypress').click()
      cy.get('.tab-panel.active').should('have.length', 1)
    })

    it('tabs have correct role attributes', () => {
      cy.get('[role="tablist"]').should('exist')
      cy.get('[role="tab"]').should('have.length', 3)
      cy.get('[role="tabpanel"]').should('have.length', 3)
    })

    it('supports keyboard focus on tab controls', () => {
      cy.getByTestId('tab-overview').should('have.attr', 'aria-selected', 'true')
      cy.getByTestId('tab-cypress').focus().should('be.focused').click()
      cy.getByTestId('tab-panel-cypress').should('be.visible')
    })
  })

  context('Accordion', () => {
    it('all panels are collapsed by default', () => {
      [1, 2, 3].forEach((n) => {
        cy.getByTestId(`accordion-trigger-${n}`)
          .should('have.attr', 'aria-expanded', 'false')
        cy.getByTestId(`accordion-panel-${n}`)
          .should('not.be.visible')
      })
    })

    it('expands first panel on click', () => {
      cy.getByTestId('accordion-trigger-1').click()
      cy.getByTestId('accordion-trigger-1').should('have.attr', 'aria-expanded', 'true')
      cy.getByTestId('accordion-panel-1').should('be.visible')
    })

    it('collapses first panel on second click', () => {
      cy.getByTestId('accordion-trigger-1').click().click()
      cy.getByTestId('accordion-panel-1').should('not.be.visible')
    })

    it('multiple panels can be open simultaneously', () => {
      cy.getByTestId('accordion-trigger-1').click()
      cy.getByTestId('accordion-trigger-2').click()
      cy.getByTestId('accordion-panel-1').should('be.visible')
      cy.getByTestId('accordion-panel-2').should('be.visible')
    })
  })

  context('Accessibility', () => {
    it('components page has no critical a11y violations', { tags: '@a11y' }, () => {
      cy.checkA11yPage(undefined, { preset: 'critical' })
    })

    it('modal dialog passes a11y when open', { tags: '@a11y' }, () => {
      cy.getByTestId('open-modal-btn').click()
      cy.getByTestId('modal-overlay').should('be.visible')
      cy.checkA11yPage('[data-testid="modal-overlay"]', { preset: 'critical' })
    })
  })
})
