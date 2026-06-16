# Testes Avançados — Shadow DOM, iframes e viewport

**Arquivo-fonte:** [`../../../../cypress/e2e/advanced/advanced.cy.js`](../../../../cypress/e2e/advanced/advanced.cy.js)

---

## Propósito

Este módulo valida a página **Advanced** (`/web/advanced.html`), que concentra cenários de front-end mais complexos do sandbox TestFlow:

- **Shadow DOM** — conteúdo encapsulado fora da árvore DOM principal
- **iframe** — carregamento de conteúdo embutido
- **Links externos** — atributos `href` e `target`
- **Viewport responsivo** — comportamento em tamanho mobile vs desktop
- **Navegação** — botão que leva o usuário para outra rota

Os testes são **E2E de interface** com Cypress e servem como material de treinamento para localizadores, asserções com retry e Page Object.

---

## Pré-requisitos

| Item | Descrição |
|------|-----------|
| Ambiente | Servidor do sandbox em execução |
| Autenticação | `AdvancedPage.visit()` → `cy.visitWithSession` |
| Viewports | [`VIEWPORTS`](../../../../cypress/support/@enums/viewports.js) — DESKTOP, MOBILE |
| Page Object | [`AdvancedPage.js`](../../../../cypress/pages/AdvancedPage.js) |

```bash
npm run cy:run:advanced
npx cypress run --env grepTags=@smoke --spec cypress/e2e/advanced/**
```

---

## Tags utilizadas

| Tag | Onde aparece | Significado |
|-----|--------------|-------------|
| `@regression` | `describe` principal | Suite de regressão completa |
| `@smoke` | Shadow DOM e viewport mobile | Subconjunto rápido para gate de CI |

---

## Visão geral da estrutura

```
advanced.cy.js
├── Imports (AdvancedPage, VIEWPORTS)
├── beforeEach (AdvancedPage.visit + pageRoot)
└── 6 testes (it)
    ├── Shadow DOM (render + acesso interno)
    ├── Iframe
    ├── Link externo
    ├── Viewport mobile
    └── Navegação
```

---

## Imports — bloco a bloco

### `import AdvancedPage from '../../pages/AdvancedPage'`

Page Object com localizadores especializados:

| Método | Elemento |
|--------|----------|
| `sectionShadow()` | Seção shadow visível |
| `shadowHost()` | Host do shadow root |
| `demoIframe()` | iframe de demonstração |
| `externalLink()` | Link externo |
| `shadowFind(selector)` | Busca dentro do shadow root |

---

### `import { VIEWPORTS } from '../../support/@enums/viewports'`

| Constante | Dimensão |
|-----------|----------|
| `VIEWPORTS.DESKTOP` | 1280 × 800 |
| `VIEWPORTS.MOBILE` | 375 × 812 |

Usadas com `cy.viewport(width, height)`.

---

## Setup — `beforeEach`

```javascript
beforeEach(() => {
  AdvancedPage.visit()
  AdvancedPage.pageRoot().should('exist')
})
```

**Given:** usuário autenticado em `/web/advanced.html` com `page-advanced` no DOM.

---

## Testes — bloco a bloco

### `renders shadow DOM section` — `@smoke`

```javascript
cy.section('Shadow DOM')
AdvancedPage.sectionShadow().should('be.visible')
AdvancedPage.shadowHost().should('exist')
```

| **Given** | Página Advanced carregada |
| **Then** | Seção shadow visível; host anexado ao DOM |

**Diferença Cypress:**

- `be.visible` — elemento visível para o usuário
- `exist` — presente no DOM (pode estar oculto)

---

### `accesses content inside shadow root`

```javascript
AdvancedPage.shadowHost().shadow().find('*').should('have.length.at.least', 1)
```

| **When** | Penetra shadow root via `.shadow()` |
| **Then** | Pelo menos um nó filho dentro do shadow root |

**Conceito Cypress:** `.shadow()` acessa **open shadow roots** a partir do host conhecido.

---

### `loads demo iframe`

```javascript
cy.section('Iframe')
AdvancedPage.demoIframe()
  .should('be.visible')
  .and('have.attr', 'src')
```

| **Then** | Iframe visível; atributo `src` presente |

**Conceito:** interagir *dentro* do iframe exigiria `cy.iframe()` ou plugin dedicado; aqui só validamos o elemento `<iframe>` externo.

---

### `shows external link with target blank`

```javascript
AdvancedPage.externalLink()
  .should('have.attr', 'href')
  .and('include', 'http')
```

Não clica no link — evita abrir nova aba/janela e flakiness em CI.

---

### `renders shadow section at mobile viewport` — `@smoke`

```javascript
cy.viewport(VIEWPORTS.MOBILE.width, VIEWPORTS.MOBILE.height)
AdvancedPage.sectionShadow().should('be.visible')
cy.viewport(VIEWPORTS.DESKTOP.width, VIEWPORTS.DESKTOP.height)
```

| Fase | Ação |
|------|------|
| **When** | Redimensiona para mobile (375×812) |
| **Then** | Seção shadow continua visível |
| **Cleanup** | Restaura desktop para não afetar testes seguintes |

**Conceito Cypress:** `cy.viewport` simula tamanho de tela; não emula user-agent completo.

---

### `navigates with page finish button`

```javascript
cy.getByTestId('page-finish-btn').click()
cy.url().should('not.include', '/web/advanced.html')
```

| **When** | Clica em `page-finish-btn` |
| **Then** | URL deixa de conter `/web/advanced.html` |

**Conceito Cypress:** `cy.url().should(...)` aguarda navegação completar — mais robusto que ler URL imediatamente após o clique.

---

## Resumo de conceitos aprendidos

| Conceito | Onde aparece |
|----------|--------------|
| Page Object | `AdvancedPage` |
| Shadow DOM | `.shadow().find('*')` |
| Iframe | Validação de `src` externo |
| Viewport responsivo | `cy.viewport` + constantes `VIEWPORTS` |
| Navegação | `cy.url().should('not.include', ...)` |
| Relatório BDD | `cy.section()` |
| Tags | `@smoke`, `@regression` |

---

## Checklist de aprendizado

- [ ] Explicar por que `beforeEach` centraliza login e navegação
- [ ] Diferenciar `be.visible` vs `exist`
- [ ] Descrever como Cypress acessa shadow root aberto
- [ ] Executar suite com `grepTags=@smoke` e interpretar resultado
- [ ] Propor um teste novo: validar `target="_blank"` no link externo
