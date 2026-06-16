# Dashboard — Visão geral e interações

**Arquivo de origem:** [`dashboard.cy.js`](../../../../cypress/e2e/dashboard/dashboard.cy.js)

---

## Propósito

Esta suíte valida a **página principal pós-login** do TestFlow. Após autenticação via `cy.visitWithSession`, verifica:

- Saudação personalizada e subtítulo
- Cards KPI (runs, pass rate, members, issues) com valores e tendências
- Feed de atividade recente e link "See all"
- Barras de saúde das suítes (regression, smoke, e2e)
- Modal "New test run" — abertura, campos, fechamento e confirmação
- Links de acesso rápido (team, settings, wizard)
- Conformidade de acessibilidade

Demonstra o padrão **Page Object** com [`DashboardPage`](../../../../cypress/pages/DashboardPage.js) e asserções fluentes encadeadas.

---

## Pré-requisitos

| Item | Detalhe |
|------|---------|
| **TestFlow** | Rodando em `http://localhost:5050` |
| **Dependências** | `npm install` na raiz do projeto |
| **Credenciais DEMO** | `DEMO_EMAIL` e `DEMO_PASSWORD` configurados — usados indiretamente por `visitWithSession` |
| **Sessão** | `cy.visitWithSession` cria sessão autenticada automaticamente |
| **Execução** | `npx cypress run --spec cypress/e2e/dashboard/dashboard.cy.js` |

---

## Tags utilizadas

| Tag | Onde aparece | Significado |
|-----|--------------|-------------|
| `@regression` | `describe` principal | Suíte de regressão |
| `@smoke` | Teste de greeting | Sanidade da página principal |
| `@a11y` | Teste axe no dashboard | Violations críticas de acessibilidade |

---

## Conceitos Cypress

| Conceito | Uso neste arquivo |
|----------|-------------------|
| **Page Object** | [`DashboardPage`](../../../../cypress/pages/DashboardPage.js) — greeting, KPIs, modal, health bars |
| **`cy.visitWithSession`** | Login cacheado + visita + skip onboarding |
| **`context()`** | Agrupa por feature: Greeting, KPI cards, Recent activity, etc. |
| **Method chaining** | `openNewRunModal().selectSuite('smoke').confirmRun()` |
| **`.invoke('text')`** | Extrai texto do DOM para regex ou `parseInt` |
| **`.within()`** | Escopo de asserções dentro de um activity item |
| **`forEach` dinâmico** | Gera testes parametrizados para quick access links |
| **`cy.get('body').type('{esc}')`** | Fecha modal via tecla Escape |
| **`.click('topLeft')`** | Clica overlay sem acertar o conteúdo do modal |

---

## Passo a passo — bloco a bloco

### Bloco 1 — Setup global

```javascript
import DashboardPage from '../../pages/DashboardPage'

describe('Dashboard', { tags: '@regression' }, () => {
  beforeEach(() => {
    cy.visitWithSession('/web/dashboard.html')
    DashboardPage.shouldBeLoaded()
  })
```

- **Given:** sessão autenticada e tour de onboarding ignorado.
- **When:** navega para `/web/dashboard.html`.
- **Then:** `shouldBeLoaded()` confirma elemento raiz `page-dashboard` — pré-condição de todos os testes.

---

### Bloco 2 — Saudação (Greeting)

```javascript
  context('Greeting', () => {
    it('shows time-based greeting with the user name', { tags: '@smoke' }, () => {
      DashboardPage.shouldShowGreeting()
      DashboardPage.greeting().should('contain.text', 'Demo User')
    })

    it('shows a non-empty subtitle', () => {
      DashboardPage.subtitle().should('be.visible').and('not.be.empty')
    })
  })
```

- **Given:** dashboard carregado com usuário "Demo User".
- **When:** Page Object lê elemento de greeting (Good morning/afternoon/evening).
- **Then:** texto contém nome do usuário e subtítulo não está vazio.

---

### Bloco 3 — Cards KPI

```javascript
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
```

- **Given:** quatro cards KPI renderizados (runs, passrate, members, issues).
- **When:** extrai texto via `.invoke('text')`.
- **Then:** runs > 0, pass rate segue padrão `\d+%` e cada card exibe trend indicator visível.

---

### Bloco 4 — Atividade recente

```javascript
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
```

- **Given:** lista de atividades com 5 itens.
- **When:** inspeciona primeiro item com `.within()` ou clica "See all".
- **Then:** cada item tem texto + timestamp; link leva a `/web/activity.html`.

---

### Bloco 5 — Saúde das suítes (Suite health)

```javascript
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
```

- **Given:** seção de health com badge e três barras.
- **When:** itera suites regression/smoke/e2e.
- **Then:** percentuais exibidos como `\d+%` e barra regression tem `width:97%` inline.

---

### Bloco 6 — Modal "New test run"

```javascript
  context('"New test run" modal', () => {
    it('opens modal on button click', () => {
      DashboardPage.openNewRunModal()
        .shouldShowRunModalOpen()
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
```

- **Given:** botão "New test run" disponível.
- **When:** abre modal, interage (Cancel, Escape, overlay) ou confirma run.
- **Then:** modal abre/fecha conforme ação; confirmação exibe toast com nome da suíte.

---

### Bloco 7 — Navegação rápida e a11y

```javascript
  context('Quick access navigation', () => {
    const links = [
      { testId: 'qa-team', path: '/web/team.html' },
      { testId: 'qa-settings', path: '/web/settings.html' },
      { testId: 'qa-wizard', path: '/web/wizard.html' },
    ]

    links.forEach(({ testId, path }) => {
      it(`"${testId}" navigates to ${path}`, () => {
        cy.visitWithSession('/web/dashboard.html')
        DashboardPage.shouldBeLoaded()
        cy.getByTestId(testId).click()
        cy.url().should('include', path)
      })
    })
  })

  context('Accessibility', () => {
    it('dashboard has no critical a11y violations', { tags: '@a11y' }, () => {
      cy.checkA11yPage(undefined, { preset: 'critical' })
    })
  })
```

- **Given:** cards de quick access no dashboard.
- **When:** `forEach` gera um `it` por link; axe analisa página inteira.
- **Then:** cada clique navega para path correto; zero violações críticas de a11y.

---

## Como executar

```bash
npx cypress run --spec cypress/e2e/dashboard/dashboard.cy.js

# Apenas smoke
npx cypress run --spec cypress/e2e/dashboard/dashboard.cy.js --env grepTags=@smoke
```

---

## Referências relacionadas

- Page Object: [`DashboardPage.js`](../../../../cypress/pages/DashboardPage.js)
- Comando de sessão: [`commands.js`](../../../../cypress/support/commands.js) — `visitWithSession`
- A11y: [`commands/actions.js`](../../../../cypress/support/commands/actions.js) — `checkA11yPage`
