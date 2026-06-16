# Testes de Estados de UI — Loading, erro, sucesso, vazio e acessibilidade

**Arquivo-fonte:** [`../../../../cypress/e2e/states/states.cy.js`](../../../../cypress/e2e/states/states.cy.js)

---

## Propósito

Este módulo exercita a página **States** (`/web/states.html`), projetada para demonstrar **transições de estado** comuns em aplicações reais:

| Área | Estados cobertos |
|------|------------------|
| Skeleton loading | idle → carregando → cards carregados → reset |
| Fetch simulado | erro (falha) vs sucesso |
| Listagem | empty state (busca sem resultados) |
| Grid parcial | cards com status mistos |
| Acessibilidade | varredura axe sem violações críticas |

Material ideal para aprender **esperas explícitas**, **timeouts customizados** e integração com **axe-core**.

---

## Pré-requisitos

| Item | Descrição |
|------|-----------|
| Servidor sandbox | Rodando com rotas `/web/states.html` |
| Autenticação | `StatesPage.visit()` → `cy.visitWithSession` |
| Page Object | [`StatesPage.js`](../../../../cypress/pages/StatesPage.js) |
| A11y | `cy.checkA11yPage` em [`actions.js`](../../../../cypress/support/commands/actions.js) |

```bash
npm run cy:run:states
npx cypress run --env grepTags=@smoke --spec cypress/e2e/states/**
npx cypress run --env grepTags=@a11y --spec cypress/e2e/states/**
```

---

## Tags utilizadas

| Tag | Aplicação |
|-----|-----------|
| `@regression` | `describe` principal |
| `@smoke` | `shows idle message before load` |
| `@a11y` | Teste de acessibilidade |

---

## Visão geral da estrutura

```
states.cy.js
├── Import StatesPage
├── beforeEach (StatesPage.visit + pageRoot)
├── context: Skeleton loading (3 testes)
├── context: Error and success states (2 testes)
├── context: Empty and partial states (2 testes)
└── context: Accessibility (1 teste)
```

---

## Imports — bloco a bloco

### `import StatesPage from '../../pages/StatesPage'`

Page Object com métodos de alto nível:

| Método | Ação |
|--------|------|
| `loadSkeletonCards()` | Clica `skeleton-trigger` |
| `triggerError()` | Clica `error-trigger` |
| `skeletonIdle()` | Localizador do estado idle |
| `partialTrigger()` | Dispara grid parcial |

Encapsula `data-testid` e reduz duplicação nos testes.

---

## Setup — `beforeEach`

```javascript
beforeEach(() => {
  StatesPage.visit()
  StatesPage.pageRoot().should('exist')
})
```

**Given global:** usuário logado em `/web/states.html`.

---

## context `Skeleton loading` — bloco a bloco

### `shows idle message before load` — `@smoke`

```javascript
StatesPage.skeletonIdle().should('contain.text', 'Load cards')
```

| **Given** | Página recém-carregada, seção skeleton no estado inicial |
| **Then** | Mensagem idle contém "Load cards" |

**Conceito Cypress:** `contain.text` faz match parcial (substring).

---

### `loads metric cards after skeleton delay`

```javascript
StatesPage.loadSkeletonCards()
cy.getByTestId('loaded-card', { timeout: 5000 }).should('have.length', 4)
```

| **When** | Clica trigger (simula fetch com delay) |
| **Then** | Exatamente 4 elementos `loaded-card` em até 5 segundos |

**Conceito — timeout:** `{ timeout: 5000 }` reforça espera porque skeleton + delay podem exceder o default em ambientes lentos.

---

### `resets skeleton section`

```javascript
StatesPage.loadSkeletonCards()
cy.getByTestId('loaded-card', { timeout: 5000 }).should('exist')
StatesPage.skeletonReset().click()
StatesPage.skeletonIdle().should('be.visible')
```

**Fluxo completo:** load → assert intermediária → reset → assert final. Modelo de teste de **ciclo de vida** de componente.

---

## context `Error and success states` — bloco a bloco

### `shows error state on failed fetch`

```javascript
StatesPage.triggerError()
cy.getByTestId('error-state')
  .should('be.visible')
  .and('contain.text', 'Request failed')
```

| **When** | Dispara fetch que falha |
| **Then** | Banner de erro visível com mensagem |

---

### `shows success state on successful fetch`

```javascript
StatesPage.successTrigger().click()
cy.getByTestId('success-state')
  .should('be.visible')
  .and('contain.text', 'succeeded')
```

Espelho do teste de erro — valida **feedback positivo**.

---

## context `Empty and partial states` — bloco a bloco

### `renders empty state when search has no matches`

```javascript
cy.getByTestId('empty-search').type('xyzno match')
cy.getByTestId('empty-state').should('be.visible')
cy.getByTestId('result-list').should('not.exist')
```

| **When** | Preenche termo sem correspondências |
| **Then** | Empty state visível; lista **não** está no DOM |

**Conceito:** `should('not.exist')` confirma que a UI não renderizou lista vazia oculta.

---

### `loads partial grid with mixed card statuses`

```javascript
StatesPage.partialTrigger().click()
cy.get('[data-testid^="partial-card-"]').should('have.length', 6)
```

**Seletor CSS:** `[data-testid^="partial-card-"]` = atributo **começa com** prefixo. Alternativa quando `getByTestId` não suporta prefix nativamente.

---

## context `Accessibility`

```javascript
it('states page has no critical a11y violations', { tags: '@a11y' }, () => {
  cy.checkA11yPage(undefined, { preset: 'critical' })
})
```

| **Given** | Página States carregada |
| **Then** | Nenhuma violação critical via axe-core |

Tag `@a11y` permite pipeline dedicado: `npm run cy:run:a11y`.

---

## Resumo de conceitos aprendidos

| Conceito | Onde aparece |
|----------|--------------|
| Page Object | `StatesPage` com métodos compostos |
| Skeleton loading | idle → loaded → reset |
| Timeout customizado | `{ timeout: 5000 }` |
| Error/Success states | Triggers + asserções de texto |
| Empty state | `not.exist` vs lista vazia |
| Seletor por prefixo | `[data-testid^="partial-card-"]` |
| A11y | `cy.checkA11yPage` com `@a11y` |
| Tags | `@smoke`, `@regression`, `@a11y` |

---

## Checklist de aprendizado

- [ ] Explicar skeleton loading vs spinner tradicional
- [ ] Justificar `{ timeout: 5000 }` no skeleton
- [ ] Diferenciar empty state visível vs lista vazia no DOM
- [ ] Descrever o que `cy.checkA11yPage` faz internamente
- [ ] Executar `npm run cy:run:a11y` isoladamente
