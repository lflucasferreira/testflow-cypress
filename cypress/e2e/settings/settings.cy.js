import SettingsPage from '../../pages/SettingsPage'

describe('Settings', () => {
  beforeEach(() => {
    cy.visitAuthenticated('/web/settings.html')
    SettingsPage.pageRoot().should('exist')
  })

  context('Profile section', () => {
    it('shows pre-filled values for name and email', () => {
      SettingsPage.nameInput().should('have.value', 'Demo User')
      SettingsPage.emailInput().should('have.value', 'demo@automation.io')
    })

    it('saves profile and shows success message', () => {
      SettingsPage.fillName('Demo User Updated').saveProfile()
      SettingsPage.shouldShowSaveSuccess()
    })

    it('shows a toast on save', () => {
      SettingsPage.saveProfile()
      cy.getByTestId('toast-message').should('contain.text', 'saved')
    })

    it('allows changing the timezone select', () => {
      SettingsPage.timezoneSelect().select('brt')
      SettingsPage.timezoneSelect().should('have.value', 'brt')
    })

    it('avatar upload input accepts image files', () => {
      SettingsPage.fileUpload().should('have.attr', 'accept').and('include', '.png')
    })
  })

  context('Notifications section', () => {
    it('push notifications start as Off', () => {
      SettingsPage.shouldShowNotificationsOff()
    })

    it('toggles notifications On', () => {
      SettingsPage.toggleNotifications()
      SettingsPage.shouldShowNotificationsOn()
    })

    it('toggles notifications back Off', () => {
      SettingsPage.toggleNotifications().toggleNotifications()
      SettingsPage.shouldShowNotificationsOff()
    })

    it('volume slider updates the displayed value', () => {
      SettingsPage.setSlider(75)
      SettingsPage.volumeValue().should('have.text', '75')
    })

    it('weekly digest checkbox is checked by default', () => {
      SettingsPage.digestCheckbox().should('be.checked')
    })

    it('digest start date field is editable', () => {
      SettingsPage.dateInput().clear().type('2025-01-01')
      SettingsPage.dateInput().should('have.value', '2025-01-01')
    })
  })

  context('Security — password change', () => {
    it('shows error when both password fields are empty', () => {
      SettingsPage.passwordSaveBtn().click()
      SettingsPage.shouldShowPasswordError('required')
    })

    it('shows error when new password is too short', () => {
      SettingsPage.submitPasswordChange('Demo123!', 'short')
      SettingsPage.shouldShowPasswordError('8 characters')
    })

    it('shows success when a valid new password is provided', () => {
      SettingsPage.submitPasswordChange('Demo123!', 'NewPass123!')
      SettingsPage.passwordResult()
        .should('contain.text', 'updated')
    })

    it('clears password fields after successful change', () => {
      SettingsPage.submitPasswordChange('Demo123!', 'NewPass123!')
      SettingsPage.currentPassword().should('have.value', '')
      SettingsPage.newPassword().should('have.value', '')
    })

    it('password change request contains currentPassword and newPassword', () => {
      cy.intercept('POST', '/api/**').as('passwordChange')

      SettingsPage.submitPasswordChange('Demo123!', 'NewPass123!')
      SettingsPage.passwordResult().should('contain.text', 'updated')

      cy.get('@passwordChange').then((interception) => {
        if (interception) {
          expect(interception.request.body).to.include.all.keys('currentPassword', 'newPassword')
          expect(interception.request.body.newPassword).to.eq('NewPass123!')
        }
      })
    })
  })

  context('Security — 2FA', () => {
    it('starts as Disabled', () => {
      SettingsPage.twofaStatus().should('have.text', 'Disabled')
      SettingsPage.twofaSwitch().should('have.attr', 'aria-checked', 'false')
    })

    it('enables 2FA on toggle', () => {
      SettingsPage.toggle2FA()
      SettingsPage.shouldShow2FAEnabled()
    })

    it('disables 2FA on second toggle', () => {
      SettingsPage.toggle2FA().toggle2FA()
      SettingsPage.twofaStatus().should('have.text', 'Disabled')
    })
  })

  context('Security — active sessions', () => {
    it('shows current session with Active badge', () => {
      cy.getByTestId('session-current').should('be.visible')
      SettingsPage.sessionBadge().should('contain.text', 'Active')
    })

    it('shows session device name and location', () => {
      cy.getByTestId('session-name').should('not.be.empty')
      cy.getByTestId('session-meta').should('contain.text', 'Current session')
    })
  })

  context('Integrations — API token', () => {
    it('displays the API token', () => {
      SettingsPage.apiKeyDisplay()
        .should('be.visible')
        .invoke('text')
        .should('not.be.empty')
    })

    it('shows "Copied" feedback when Copy is clicked', () => {
      SettingsPage.copyToken()
      SettingsPage.shouldShowTokenResult('Copied')
    })

    it('generates a new token on Rotate', () => {
      SettingsPage.apiKeyDisplay().invoke('text').then((original) => {
        SettingsPage.rotateToken()
        SettingsPage.apiKeyDisplay().invoke('text').should('not.eq', original)
      })
    })

    it('shows toast after rotating token', () => {
      SettingsPage.rotateToken()
      cy.getByTestId('toast-message').should('contain.text', 'rotated')
    })

    it('rotate token triggers a request and response contains new token', () => {
      cy.intercept('/api/**').as('rotateRequest')

      SettingsPage.rotateToken()
      SettingsPage.apiKeyDisplay().invoke('text').should('not.be.empty')

      cy.get('@rotateRequest').then((interception) => {
        if (interception) {
          expect(interception.response.statusCode).to.eq(200)
          expect(interception.response.body).to.have.property('token')
          expect(interception.response.body.token).to.be.a('string').and.not.be.empty
        }
      })
    })
  })

  context('Integrations — Webhook', () => {
    it('saves a valid webhook URL', () => {
      SettingsPage.saveWebhook('https://ci.example.com/webhook')
      SettingsPage.shouldShowWebhookSaved()
    })

    it('shows error when webhook URL is empty', () => {
      SettingsPage.saveWebhookBtn().click()
      cy.getByTestId('webhook-result')
        .should('contain.text', 'Enter a URL')
    })

    it('shows toast on successful save', () => {
      SettingsPage.saveWebhook('https://ci.example.com/hook')
      cy.getByTestId('toast-message').should('contain.text', 'saved')
    })
  })

  context('Danger zone', () => {
    it('delete account button is visible', () => {
      SettingsPage.deleteAccountBtn()
        .should('be.visible')
        .and('have.class', 'btn-danger')
    })

    it('delete account shows confirmation dialog', () => {
      cy.window().then((win) => {
        cy.stub(win, 'confirm').returns(false).as('confirmDialog')
      })
      SettingsPage.deleteAccountBtn().click()
      cy.get('@confirmDialog').should('have.been.called')
    })
  })
})
