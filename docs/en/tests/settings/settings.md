# Settings — Profile, Security, and Integrations

**Source file:** [`settings.cy.js`](../../../../cypress/e2e/settings/settings.cy.js)

---

## Purpose

This suite validates the **settings page** of TestFlow in depth. It is organized by UI sections:

- **Profile** — pre-filled fields, save, timezone, file upload
- **Notifications** — push toggle, volume slider, weekly digest, date
- **Security** — password change with validation, 2FA toggle, active sessions
- **Integrations** — API token (copy/rotate), webhook URL
- **Danger zone** — delete button with confirmation dialog
- **Accessibility** — axe-core on the settings form

It demonstrates upload via `selectFile`, `window.confirm` stubs, API intercepts, and chained assertions in [`SettingsPage`](../../../../cypress/pages/SettingsPage.js).

---

## Prerequisites

| Item | Detail |
|------|--------|
| **TestFlow** | Running at `http://localhost:5050` |
| **Dependencies** | `npm install` at the project root |
| **DEMO credentials** | Session via `cy.visitWithSession('/web/settings.html')` |
| **Upload fixture** | [`sample.csv`](../../../../cypress/fixtures/sample.csv) for `selectFile` test |
| **Execution** | `npx cypress run --spec cypress/e2e/settings/settings.cy.js` |

---

## Tags used

| Tag | Where it appears | Meaning |
|-----|------------------|---------|
| `@regression` | Main `describe` | Regression suite |
| `@smoke` | Profile save | Persistence flow sanity check |
| `@critical` | Profile save | Essential user configuration |
| `@a11y` | Settings-form axe test | Critical accessibility violations |

---

## Cypress concepts

| Concept | Usage in this file |
|---------|-------------------|
| **Page Object** | [`SettingsPage`](../../../../cypress/pages/SettingsPage.js) — profile, security, integrations sections |
| **`selectFile()`** | Upload of [`sample.csv`](../../../../cypress/fixtures/sample.csv) with `{ force: true }` |
| **`.select('brt')`** | Selects option in native `<select>` (timezone) |
| **`cy.stub(win, 'confirm')`** | Replaces `window.confirm` to test danger zone without deleting account |
| **`cy.interceptPasswordChange`** | Alias `@passwordChange` to assert payload |
| **`cy.interceptRotateToken`** | Alias `@rotateRequest` to validate response with new token |
| **Method chaining** | `toggleNotifications().toggleNotifications()` — toggle idempotence |
| **`cy.checkA11yPage`** | Scope `[data-testid="settings-form"]`, preset `critical` |

---

## Step-by-step — block by block

### Block 1 — Setup

```javascript
import SettingsPage from '../../pages/SettingsPage'

describe('Settings', { tags: '@regression' }, () => {
  beforeEach(() => {
    cy.visitWithSession('/web/settings.html')
    SettingsPage.pageRoot().should('exist')
  })
```

- **Given:** authenticated user on the Settings page.
- **When:** `visitWithSession` navigates with cached session.
- **Then:** `page-settings` exists — global precondition.

---

### Block 2 — Profile section

```javascript
  context('Profile section', () => {
    it('shows pre-filled values for name and email', () => {
      SettingsPage.nameInput().should('have.value', 'Demo User')
      SettingsPage.emailInput().should('have.value', 'demo@automation.io')
    })

    it('saves profile and shows success message', { tags: '@smoke @critical' }, () => {
      SettingsPage.fillName('Demo User Updated').saveProfile()
      SettingsPage.shouldShowSaveSuccess()
    })

    it('shows a toast on save', () => {
      SettingsPage.saveProfile()
      cy.getByTestId('toast-message').should('contain.text', 'saved')
    })

    it('uploads a CSV fixture via selectFile', () => {
      SettingsPage.fileUpload().selectFile('cypress/fixtures/sample.csv', { force: true })
      SettingsPage.uploadResult().should('contain.text', 'sample.csv')
    })
  })
```

- **Given:** profile form with pre-loaded demo data.
- **When:** name is changed and saved, or CSV is uploaded via file input.
- **Then:** success message and toast appear; upload result displays filename.

**Timezone and avatar:**

```javascript
    it('allows changing the timezone select', () => {
      SettingsPage.timezoneSelect().select('brt')
      SettingsPage.timezoneSelect().should('have.value', 'brt')
    })

    it('avatar upload input accepts image files', () => {
      SettingsPage.fileUpload().should('have.attr', 'accept').and('include', '.png')
    })
```

- **Given:** timezone select and avatar input.
- **When:** `brt` is selected or `accept` attribute is inspected.
- **Then:** value persists in select; input accepts `.png`.

---

### Block 3 — Notifications section

```javascript
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
```

- **Given:** notifications section with toggle Off initially.
- **When:** push is toggled, slider moved to 75, digest date edited.
- **Then:** On/Off states reflected in UI; volume displays "75"; digest checkbox checked by default.

---

### Block 4 — Security: password change

```javascript
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
      cy.interceptPasswordChange()

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
```

- **Given:** password form with client-side validation.
- **When:** empty submit, short password, or valid pair with intercept.
- **Then:** "required" / "8 characters" errors or "updated" success; fields cleared; API payload contains both passwords.

---

### Block 5 — Security: 2FA and sessions

```javascript
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
```

- **Given:** 2FA disabled and current session listed.
- **When:** 2FA switch toggled or session badge inspected.
- **Then:** status alternates Disabled ↔ Enabled; "Active" badge and session metadata visible.

---

### Block 6 — Integrations: API token and webhook

```javascript
  context('Integrations — API token', () => {
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

    it('rotate token triggers a request and response contains new token', () => {
      cy.interceptRotateToken()

      SettingsPage.rotateToken()
      SettingsPage.apiKeyDisplay().invoke('text').should('not.be.empty')

      cy.get('@rotateRequest').then((interception) => {
        if (interception) {
          expect(interception.response.statusCode).to.eq(200)
          expect(interception.response.body).to.have.property('token')
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
  })
```

- **Given:** API token displayed and empty webhook field.
- **When:** copy, rotate (with intercept), or save valid/invalid webhook.
- **Then:** "Copied" feedback; rotated token differs from original; 200 response with `token`; empty webhook shows "Enter a URL".

---

### Block 7 — Danger zone and a11y

```javascript
  context('Danger zone', () => {
    it('delete account shows confirmation dialog', () => {
      cy.window().then((win) => {
        cy.stub(win, 'confirm').returns(false).as('confirmDialog')
      })
      SettingsPage.deleteAccountBtn().click()
      cy.get('@confirmDialog').should('have.been.called')
    })
  })

  context('Accessibility', () => {
    it('settings page has no critical a11y violations', { tags: '@a11y' }, () => {
      cy.checkA11yPage('[data-testid="settings-form"]', { preset: 'critical' })
    })
  })
```

- **Given:** visible delete account button with `btn-danger` class.
- **When:** `confirm` stub returns `false` and user clicks delete.
- **Then:** dialog was invoked but account is not deleted; axe finds no critical violations in the form.

---

## How to run

```bash
npx cypress run --spec cypress/e2e/settings/settings.cy.js

# Smoke + critical (profile save)
npx cypress run --spec cypress/e2e/settings/settings.cy.js --env grepTags="@smoke|@critical"
```

---

## Related references

- Page Object: [`SettingsPage.js`](../../../../cypress/pages/SettingsPage.js)
- CSV fixture: [`sample.csv`](../../../../cypress/fixtures/sample.csv)
- Intercepts: [`interceptions.js`](../../../../cypress/support/commands/interceptions.js)
- A11y commands: [`commands/actions.js`](../../../../cypress/support/commands/actions.js)
