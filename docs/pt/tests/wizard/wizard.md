# Testes do Wizard Multi-Etapas

**Arquivo-fonte:** [`../../../../cypress/e2e/wizard/wizard.cy.js`](../../../../cypress/e2e/wizard/wizard.cy.js)

---

## Propósito

Este módulo valida o **Wizard** (`/web/wizard.html`), um formulário multi-etapas (stepper) com três passos:

1. **Dados pessoais** — nome, e-mail, data de nascimento, país
2. **Preferências** — framework, papel, experiência, termos, newsletter
3. **Revisão e conclusão** — resumo + mensagem de sucesso

Os testes cobrem fluxo completo, validação, navegação retroativa, reinício, interceptação de API para lookups e acessibilidade.

O arquivo combina **Page Object** ([`WizardPage`](../../../../cypress/pages/WizardPage.js)), **comandos customizados** (`cy.completeWizardStep1`, `cy.fillWizardFlow`) e **factory** ([`WizardDataFactory`](../../../../cypress/support/factories/index.js)).

---

## Pré-requisitos

| Item | Descrição |
|------|-----------|
| Ambiente | Servidor TestFlow em execução |
| Autenticação | `cy.visitWithSession` via `beforeEach` |
| Factory | [`WizardDataFactory`](../../../../cypress/support/factories/index.js) — dados fake com Faker |
| Fixtures JSON | [`cypress/fixtures/lookups/countries.json`](../../../../cypress/fixtures/lookups/countries.json) |
| Comandos | [`cypress/support/commands/actions.js`](../../../../cypress/support/commands/actions.js) |

```bash
npm run cy:run:wizard
npx cypress run --env grepTags=@smoke --spec cypress/e2e/wizard/**
npx cypress run --env grepTags=@critical --spec cypress/e2e/wizard/**
npx cypress run --env grepTags=@a11y --spec cypress/e2e/wizard/**
```

---

## Tags utilizadas

| Tag | Onde aparece | Significado |
|-----|--------------|-------------|
| `@regression` | Ambos os `describe` | Suite de regressão |
| `@smoke` | `shows step 1 by default` | Verificação rápida de carregamento |
| `@critical` | `completes all wizard sections` | Fluxo end-to-end principal |
| `@a11y` | `describe` de acessibilidade | Varredura axe-core |

---

## Visão geral da estrutura

```
wizard.cy.js
├── Imports (WizardPage, WizardDataFactory)
├── describe: Wizard — multi-step flow
│   ├── beforeEach (visitWithSession + pageRoot)
│   └── 6 testes (it)
└── describe: Wizard — accessibility
    ├── beforeEach
    └── 1 teste a11y
```

---

## Imports — bloco a bloco

### `import WizardPage from '../../pages/WizardPage'`

Page Object com localizadores do wizard: `pageRoot()`, `panel1()`, `step1()`, `success()`, etc.

**Conceito:** encapsula seletores `data-testid` — mudanças de UI ficam centralizadas.

---

### `import { WizardDataFactory } from '../../support/factories'`

| Método | Retorno |
|--------|---------|
| `createPersonalStep(overrides)` | `{ name, email, dob, country }` via Faker |
| `createPreferencesStep()` | `{ framework, role, experience }` |

**Conceito:** **Test Data Factory** — gera dados válidos; `overrides` permite customizar campos específicos.

---

## Setup — `beforeEach`

```javascript
beforeEach(() => {
  cy.visitWithSession('/web/wizard.html')
  WizardPage.pageRoot().should('exist')
})
```

| Aspecto | Explicação |
|---------|------------|
| `visitWithSession` | Cria sessão autenticada via `cy.session` + navega |
| `pageRoot()` | Confirma `page-wizard` no DOM antes de cada teste |

**Given global:** usuário logado na página do wizard.

---

## Testes — bloco a bloco

### `shows step 1 by default` — `@smoke`

```javascript
WizardPage.panel1().should('be.visible')
WizardPage.step1().should('have.class', 'active')
```

| **Given** | Wizard recém-carregado |
| **Then** | Painel 1 visível + indicador de step 1 com classe `active` |

---

### `validates required fields on step 1`

```javascript
cy.getByTestId('wizard-next').click()
cy.getByTestId('wizard-step1-error').should('be.visible')
```

| **When** | Avança sem preencher campos |
| **Then** | Mensagem de erro da etapa 1 visível |

---

### `maps country fixture codes to wizard select options`

```javascript
cy.mockCountriesLookup()
cy.task('readFixture', 'lookups/countries.json').then(({ countries }) => {
  const canada = countries.find((c) => c.code === 'CA')
  expect(canada).to.exist
  cy.getByTestId('wizard-country').select('ca')
  cy.getByTestId('wizard-country').should('have.value', 'ca')
})
```

| Aspecto | Explicação |
|---------|------------|
| `cy.mockCountriesLookup()` | Intercepta GET de countries com fixture |
| `cy.task('readFixture')` | Lê JSON do disco via plugin Node |
| `select('ca')` | Valor do `<option>` é lowercase |

**Conceito Cypress:** `cy.intercept` desacopla testes de backend instável.

---

### `completes all wizard sections` — `@critical`

```javascript
const personal = WizardDataFactory.createPersonalStep()
const prefs = WizardDataFactory.createPreferencesStep()

cy.section('PERSONAL INFO')
cy.completeWizardStep1(personal)
cy.advanceWizard()
cy.getByTestId('wizard-step-1').should('have.class', 'done')
// ... step 2, step 3 ...
cy.getByTestId('wizard-success').should('be.visible')
cy.getByTestId('review-name').should('contain.text', personal.name)
```

| Etapa | Validação |
|-------|-----------|
| Após step 1 | Indicador `wizard-step-1` com classe `done` |
| Após step 2 | Indicador `wizard-step-2` com classe `done` |
| Final | Tela de sucesso + nome na revisão |

**Conceito:** `cy.section()` agrupa passos no relatório Mochawesome.

---

### `navigates back from step 2 to step 1`

```javascript
cy.completeWizardStep1(personal)
cy.advanceWizard()
cy.getByTestId('wizard-back').click()
WizardPage.panel1().should('be.visible')
```

Testa navegação **bidirecional** do stepper.

---

### `restarts wizard after completion`

```javascript
cy.fillWizardFlow(personal, WizardDataFactory.createPreferencesStep())
cy.getByTestId('wizard-restart').click()
WizardPage.panel1().should('be.visible')
```

| **When** | Completa wizard + clica reiniciar |
| **Then** | Volta ao painel 1 (estado inicial) |

`cy.fillWizardFlow` orquestra os três passos via comandos em [`actions.js`](../../../../cypress/support/commands/actions.js).

---

## Acessibilidade — `describe` separado

```javascript
describe('Wizard — accessibility', { tags: '@a11y @regression' }, () => {
  it('wizard page has no critical a11y violations', () => {
    cy.checkA11yPage(undefined, { preset: 'critical' })
  })
})
```

| **Given** | Wizard na etapa 1 (estado padrão) |
| **Then** | Sem violações a11y críticas via axe-core |

---

## Resumo de conceitos aprendidos

| Conceito | Onde aparece |
|----------|--------------|
| Page Object | `WizardPage` |
| Test Data Factory | `WizardDataFactory` |
| Comandos compostos | `completeWizardStep1`, `fillWizardFlow`, `advanceWizard` |
| Network intercept | `cy.mockCountriesLookup()` |
| Node task | `cy.task('readFixture', ...)` |
| Relatório BDD | `cy.section()` |
| Tags | `@smoke`, `@critical`, `@a11y`, `@regression` |
| A11y | `cy.checkA11yPage` com preset `critical` |
