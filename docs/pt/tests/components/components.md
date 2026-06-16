# Testes da Página de Componentes (Components)

**Arquivo-fonte:** [`../../../../cypress/e2e/components/components.cy.js`](../../../../cypress/e2e/components/components.cy.js)

---

## Propósito

Este módulo valida a página **Components** (`/web/components.html`), um catálogo de componentes UI reutilizáveis do sandbox TestFlow. Os testes cobrem:

- **Botões** — variantes, estados disabled/loading, toast, diálogos nativos (`alert`, `confirm`)
- **Modal** — abertura, fechamento (botões, Escape, clique no overlay), atributos ARIA
- **Tabs** — navegação, painéis, roles ARIA, foco por teclado
- **Accordion** — expandir/colapsar, múltiplos painéis abertos
- **Acessibilidade** — página inteira e modal aberto

Diferente de Settings, este arquivo interage **diretamente com `cy.getByTestId`** em vez de Page Object dedicado — padrão comum para páginas de demonstração/catálogo.

---

## Pré-requisitos

| Item | Descrição |
|------|-----------|
| Ambiente | Servidor TestFlow em execução |
| Autenticação | `cy.visitWithSession` via `beforeEach` |
| Constantes de TC | [`support/@enums/testCases.js`](../../../../cypress/support/@enums/testCases.js) |
| Comandos de diálogo | `cy.clickDialogConfirm`, `cy.clickDialogCancel` em [`actions.js`](../../../../cypress/support/commands/actions.js) |

```bash
npm run cy:run:components
npx cypress run --env grepTags=@a11y --spec cypress/e2e/components/**
```

---

## Tags utilizadas

| Tag | Onde aparece | Significado |
|-----|--------------|-------------|
| `@regression` | `describe` principal | Suite de regressão |
| `@a11y` | Testes de acessibilidade | Varredura axe-core |
| TC ID via `tc()` | Loading button | Vincula teste a `TC-0501` no relatório |

---

## Visão geral da estrutura

```
components.cy.js
├── Imports (TC, tc)
├── beforeEach (visitWithSession)
├── context: Buttons (7 testes)
├── context: Modal (+ beforeEach open modal)
├── context: Tabs (6 testes)
├── context: Accordion (4 testes)
└── context: Accessibility (2 testes)
```

---

## Imports — bloco a bloco

### `import { TC, tc } from '../../support/@enums/testCases'`

| Símbolo | Papel |
|---------|-------|
| `TC` | Constantes de ID de casos de teste (ex.: `TC.COMP_LOADING_BUTTON = "TC-0501"`) |
| `tc(id, title)` | Formata `"[TC-0501] loading button shows spinner..."` para relatórios |

**Conceito:** IDs rastreáveis em CI e integrações com Zephyr/Jira.

---

## Setup — `beforeEach` global

```javascript
beforeEach(() => {
  cy.visitWithSession('/web/components.html')
  cy.getByTestId('page-components').should('exist')
})
```

**Given:** usuário logado na página Components com elemento raiz presente.

---

## context `Buttons` — bloco a bloco

### `all button variants are visible`

```javascript
['btn-primary', 'btn-secondary', 'btn-success', 'btn-danger'].forEach((id) => {
  cy.getByTestId(id).should('be.visible').and('not.be.disabled')
})
```

Loop valida conjunto homogêneo de variantes visíveis e habilitadas.

---

### `disabled button is not interactive`

```javascript
cy.getByTestId('btn-disabled')
  .should('be.disabled')
  .and('have.css', 'cursor', 'not-allowed')
```

Valida estado semântico (`disabled`) e visual (cursor CSS).

---

### Loading button — `tc(TC.COMP_LOADING_BUTTON, ...)`

```javascript
cy.clock()
cy.getByTestId('btn-loading').click()
cy.getByTestId('btn-loading').should('be.disabled')
cy.get('.spinner').should('be.visible')
cy.tick(2000)
cy.getByTestId('btn-loading').should('not.be.disabled')
```

| Aspecto | Explicação |
|---------|------------|
| `cy.clock()` | Mock de timers JavaScript |
| `cy.tick(2000)` | Avança 2 segundos sem espera real |

**Conceito Cypress:** Clock API elimina waits fixos — testes rápidos e determinísticos.

---

### Diálogos nativos — `alert` e `confirm`

```javascript
cy.on('window:alert', (text) => { expect(text).to.not.be.empty })
cy.on('window:confirm', () => true)  // ou () => false
```

| Handler | Resultado na UI |
|---------|-----------------|
| `alert` aceito | Mensagem capturada, não vazia |
| `confirm` → `true` | `"Confirmed"` em `dialog-result` |
| `confirm` → `false` | `"Cancelled"` em `dialog-result` |

**Importante:** registrar handler **antes** do clique que dispara o diálogo.

---

## context `Modal` — bloco a bloco

### `beforeEach` aninhado

```javascript
beforeEach(() => {
  cy.getByTestId('open-modal-btn').click()
  cy.getByTestId('modal-overlay').should('be.visible')
})
```

Abre modal automaticamente antes de cada teste do contexto.

---

### Fechamento do modal

| Teste | Ação | Then |
|-------|------|------|
| Confirm | `cy.clickDialogConfirm()` | Overlay oculto + toast visível |
| Cancel | `cy.clickDialogCancel()` | Overlay oculto |
| Close (✕) | `cy.clickDialogClose()` | Overlay oculto |
| Escape | `cy.get('body').type('{esc}')` | Overlay oculto |
| Overlay click | `.click('topLeft')` | Overlay oculto |

**Conceito:** `click('topLeft')` simula clique fora do conteúdo central.

### ARIA

```javascript
cy.getByTestId('modal-overlay')
  .should('have.attr', 'role', 'dialog')
  .and('have.attr', 'aria-modal', 'true')
```

Após fechar: `aria-hidden="true"`.

---

## context `Tabs` — bloco a bloco

Estado inicial: aba Overview com `aria-selected="true"` e painel visível.

```javascript
cy.getByTestId('tab-cypress').click()
cy.getByTestId('tab-panel-cypress').should('be.visible')
cy.getByTestId('tab-panel-overview').should('not.be.visible')
```

| Teste | Validação |
|-------|-----------|
| Exclusividade | `.tab-panel.active` tem length 1 |
| Roles | 1 tablist, 3 tabs, 3 tabpanels |
| Teclado | `.focus().should('be.focused').click()` |

---

## context `Accordion` — bloco a bloco

| Teste | Comportamento |
|-------|---------------|
| Default | 3 painéis com `aria-expanded="false"`, conteúdo oculto |
| Expand | Clique → `aria-expanded="true"` + painel visível |
| Toggle | Dois cliques → painel oculto novamente |
| Múltiplos abertos | Painéis 1 e 2 visíveis simultaneamente |

Este accordion **não** é exclusivo (diferente de tabs).

---

## context `Accessibility`

```javascript
cy.checkA11yPage(undefined, { preset: 'critical' })
cy.checkA11yPage('[data-testid="modal-overlay"]', { preset: 'critical' })
```

Segundo teste valida a11y com modal aberto — estado interativo propício a violações.

---

## Resumo de conceitos aprendidos

| Conceito | Onde aparece |
|----------|--------------|
| Locators diretos | `getByTestId`, seletores ARIA/CSS |
| Mock Clock | `cy.clock()` + `cy.tick()` |
| TC IDs | `tc(TC.COMP_LOADING_BUTTON, ...)` |
| Diálogos nativos | `cy.on('window:alert')`, `cy.on('window:confirm')` |
| `beforeEach` aninhado | Setup de modal por contexto |
| Teclado | `{esc}`, `.focus()` |
| Clique com posição | `.click('topLeft')` |
| ARIA | `role`, `aria-selected`, `aria-expanded`, `aria-modal` |
| A11y | `cy.checkA11yPage` com tag `@a11y` |
