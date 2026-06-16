# Settings — Perfil, segurança e integrações

**Arquivo de origem:** [`settings.cy.js`](../../../../cypress/e2e/settings/settings.cy.js)

---

## Propósito

Esta suíte valida a **página de configurações** do TestFlow em profundidade. Organizada por seções da UI:

- **Profile** — campos pré-preenchidos, save, timezone, upload de arquivo
- **Notifications** — toggle push, slider de volume, digest semanal, data
- **Security** — troca de senha com validação, 2FA toggle, sessões ativas
- **Integrations** — API token (copy/rotate), webhook URL
- **Danger zone** — botão delete com dialog de confirmação
- **Accessibility** — axe-core no formulário de settings

Demonstra upload via `selectFile`, stubs de `window.confirm`, intercepts de API e asserções encadeadas no [`SettingsPage`](../../../../cypress/pages/SettingsPage.js).

---

## Pré-requisitos

| Item | Detalhe |
|------|---------|
| **TestFlow** | Rodando em `http://localhost:5050` |
| **Dependências** | `npm install` na raiz do projeto |
| **Credenciais DEMO** | Sessão via `cy.visitWithSession('/web/settings.html')` |
| **Fixture de upload** | [`sample.csv`](../../../../cypress/fixtures/sample.csv) para teste de `selectFile` |
| **Execução** | `npx cypress run --spec cypress/e2e/settings/settings.cy.js` |

---

## Tags utilizadas

| Tag | Onde aparece | Significado |
|-----|--------------|-------------|
| `@regression` | `describe` principal | Suíte de regressão |
| `@smoke` | Save de perfil | Sanidade do fluxo de persistência |
| `@critical` | Save de perfil | Configuração essencial do usuário |
| `@a11y` | Teste axe em settings-form | Violations críticas de acessibilidade |

---

## Conceitos Cypress

| Conceito | Uso neste arquivo |
|----------|-------------------|
| **Page Object** | [`SettingsPage`](../../../../cypress/pages/SettingsPage.js) — seções profile, security, integrations |
| **`selectFile()`** | Upload de [`sample.csv`](../../../../cypress/fixtures/sample.csv) com `{ force: true }` |
| **`.select('brt')`** | Seleciona opção em `<select>` nativo (timezone) |
| **`cy.stub(win, 'confirm')`** | Substitui `window.confirm` para testar danger zone sem deletar conta |
| **`cy.interceptPasswordChange`** | Alias `@passwordChange` para assertar payload |
| **`cy.interceptRotateToken`** | Alias `@rotateRequest` para validar resposta com novo token |
| **Method chaining** | `toggleNotifications().toggleNotifications()` — idempotência de toggles |
| **`cy.checkA11yPage`** | Escopo `[data-testid="settings-form"]`, preset `critical` |

---

## Passo a passo — bloco a bloco

### Bloco 1 — Setup

```javascript
import SettingsPage from '../../pages/SettingsPage'

describe('Settings', { tags: '@regression' }, () => {
  beforeEach(() => {
    cy.visitWithSession('/web/settings.html')
    SettingsPage.pageRoot().should('exist')
  })
```

- **Given:** usuário autenticado na página Settings.
- **When:** `visitWithSession` navega com sessão cacheada.
- **Then:** `page-settings` existe — pré-condição global.

---

### Bloco 2 — Seção Profile

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

    it('uploads a CSV fixture via selectFile', () => {
      SettingsPage.fileUpload().selectFile('cypress/fixtures/sample.csv', { force: true })
      SettingsPage.uploadResult().should('contain.text', 'sample.csv')
    })
  })
```

- **Given:** formulário de perfil com dados demo pré-carregados.
- **When:** altera nome e salva, ou faz upload de CSV via input file.
- **Then:** mensagem de sucesso aparece; resultado do upload exibe nome do arquivo.

**Timezone e avatar:**

```javascript
    it('allows changing the timezone select', () => {
      SettingsPage.timezoneSelect().select('brt')
      SettingsPage.timezoneSelect().should('have.value', 'brt')
    })

    it('avatar upload input accepts image files', () => {
      SettingsPage.fileUpload().should('have.attr', 'accept').and('include', '.png')
    })
```

- **Given:** select de timezone e input de avatar.
- **When:** seleciona `brt` ou inspeciona atributo `accept`.
- **Then:** valor persiste no select; input aceita `.png`.

---

### Bloco 3 — Seção Notifications

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

- **Given:** seção de notificações com toggle Off inicial.
- **When:** alterna push, move slider para 75, edita data do digest.
- **Then:** estados On/Off refletidos na UI; volume exibe "75"; checkbox digest marcado por padrão.

---

### Bloco 4 — Security: troca de senha

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

- **Given:** formulário de senha com validação client-side.
- **When:** submit vazio, senha curta ou par válido com intercept.
- **Then:** erros "required" / "8 characters" ou sucesso "updated"; payload da API contém ambas as senhas.

---

### Bloco 5 — Security: 2FA e sessões

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
  })
```

- **Given:** 2FA desabilitado e sessão atual listada.
- **When:** alterna switch 2FA ou inspeciona badge de sessão.
- **Then:** status/texto alternam Disabled ↔ Enabled; badge "Active" visível.

---

### Bloco 6 — Integrations: API token e webhook

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

- **Given:** token API exibido e campo webhook vazio.
- **When:** copy, rotate (com intercept) ou save webhook válido/inválido.
- **Then:** feedback "Copied"; token rotacionado difere do original; resposta 200 com `token`; webhook vazio exibe "Enter a URL".

---

### Bloco 7 — Danger zone e a11y

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

- **Given:** botão delete account visível com classe `btn-danger`.
- **When:** stub de `confirm` retorna `false` e usuário clica delete.
- **Then:** dialog foi invocado mas conta não é deletada; axe não encontra violações críticas no form.

---

## Como executar

```bash
npx cypress run --spec cypress/e2e/settings/settings.cy.js

# Smoke + critical (save profile)
npx cypress run --spec cypress/e2e/settings/settings.cy.js --env grepTags="@smoke|@critical"
```

---

## Referências relacionadas

- Page Object: [`SettingsPage.js`](../../../../cypress/pages/SettingsPage.js)
- Fixture CSV: [`sample.csv`](../../../../cypress/fixtures/sample.csv)
- Intercepts: [`interceptions.js`](../../../../cypress/support/commands/interceptions.js)
- A11y commands: [`commands/actions.js`](../../../../cypress/support/commands/actions.js)
