# Testes da Página de Activity

**Arquivo-fonte:** [`../../../../cypress/e2e/activity/activity.cy.js`](../../../../cypress/e2e/activity/activity.cy.js)

---

## Propósito

Este módulo valida a página **Activity** (`/web/activity.html`), focada em padrões avançados de automação:

- **Chamadas API via UI** — botões que disparam fetch e exibem resultados
- **Interceptação de rede** — delay artificial e mock de respostas
- **Estado local** — contador increment/decrement/reset
- **Progresso simulado** — barra de download
- **Conteúdo dinâmico** — carregamento assíncrono
- **Fixtures de dados** — leitura de JSON e CSV
- **Upload de arquivo** — drag-and-drop via `selectFile`

É um laboratório para conceitos que vão além de cliques simples: rede, tempo, arquivos e dados externos.

---

## Pré-requisitos

| Item | Descrição |
|------|-----------|
| Ambiente | Servidor TestFlow em execução |
| Autenticação | `ActivityPage.visit()` → `cy.visitWithSession` |
| Fixtures | [`users/empty-list.json`](../../../../cypress/fixtures/users/empty-list.json), [`sample.csv`](../../../../cypress/fixtures/sample.csv), [`lookups/countries.json`](../../../../cypress/fixtures/lookups/countries.json) |
| Intercepts | [`commands/interceptions.js`](../../../../cypress/support/commands/interceptions.js) |

```bash
npm run cy:run:activity
npx cypress run --env grepTags=@smoke --spec cypress/e2e/activity/**
npx cypress run --env grepTags=@api --spec cypress/e2e/activity/**
```

---

## Tags utilizadas

| Tag | Onde aparece | Significado |
|-----|--------------|-------------|
| `@regression` | `describe` principal | Suite de regressão |
| `@smoke` | `fetches users via API button` | Gate rápido de API via UI |
| `@api` | `fetches users via API button` | Teste com validação de resposta HTTP |

---

## Visão geral da estrutura

```
activity.cy.js
├── Import ActivityPage
├── beforeEach (ActivityPage.visit + pageRoot)
└── 8 testes (it) — rede, contador, progresso, fixtures, upload
```

---

## Imports — bloco a bloco

### `import ActivityPage from '../../pages/ActivityPage'`

Page Object com localizadores: `fetchUsersBtn()`, `apiResult()`, `counterValue()`, `dropZone()`, etc.

Método `visit()` encapsula `cy.visitWithSession('/web/activity.html')`.

---

## Setup — `beforeEach`

```javascript
beforeEach(() => {
  ActivityPage.visit()
  ActivityPage.pageRoot().should('exist')
})
```

**Given:** usuário autenticado em `/web/activity.html` com `page-activity` no DOM.

---

## Testes — bloco a bloco

### `fetches users via API button` — `@smoke @api`

```javascript
cy.section('Setup intercept')
cy.interceptGetUsers().as('getUsers')

cy.section('Trigger fetch')
cy.step('Click fetch users button')
ActivityPage.fetchUsersBtn().click()

cy.section('Assert response')
cy.wait('@getUsers').its('response.statusCode').should('eq', 200)
ActivityPage.apiResult().should('not.be.empty')
```

| Passo | Descrição |
|-------|-----------|
| **Given** | Intercept registrado para GET `/api/users` |
| **When** | Clica botão fetch |
| **Then (rede)** | Resposta com status 200 |
| **Then (UI)** | Área de resultado não vazia |

**Conceitos Cypress:**

| API | Uso |
|-----|-----|
| `cy.interceptGetUsers()` | Comando customizado em [`interceptions.js`](../../../../cypress/support/commands/interceptions.js) |
| `.as('getUsers')` | Alias para `cy.wait('@getUsers')` |
| `cy.section` / `cy.step` | Relatório BDD legível |

---

### `handles slow API with intercept delay`

```javascript
cy.interceptSlowApi(1500).as('slowApi')
ActivityPage.fetchSlowBtn().click()
cy.wait('@slowApi')
ActivityPage.apiResult().should('be.visible')
```

| Aspecto | Explicação |
|---------|------------|
| `interceptSlowApi(1500)` | Adiciona delay de 1.5s na resposta de `/api/slow` |
| Asserção final | UI exibe resultado após API lenta |

**Conceito:** testa resiliência a latência sem mockar resposta completa.

---

### `increments and decrements counter`

```javascript
ActivityPage.counterIncrement().click().click()
ActivityPage.counterValue().should('contain.text', '2')
ActivityPage.counterDecrement().click()
ActivityPage.counterValue().should('contain.text', '1')
ActivityPage.counterReset().click()
ActivityPage.counterValue().should('contain.text', '0')
```

Testa **estado local** JavaScript — contador reativo sem envolver backend.

---

### `starts download progress simulation`

```javascript
ActivityPage.progressStart().click()
ActivityPage.downloadProgress().should('exist')
```

Barra de progresso existe no DOM (pode existir antes da animação visual completar).

---

### `loads dynamic content section`

```javascript
ActivityPage.loadDynamicBtn().click()
ActivityPage.dynamicContent().should('not.be.empty')
```

Conteúdo injetado assincronamente após interação.

---

### `uses mockApiGet with empty users fixture`

```javascript
cy.mockApiGet('users/empty-list', /\/api\/users/)
ActivityPage.fetchUsersBtn().click()
cy.wait('@mock_users_empty-list')
ActivityPage.apiResult().should('contain.text', 'Fetched 0 users')
```

| Aspecto | Explicação |
|---------|------------|
| `mockApiGet(fixture, pattern)` | Resposta mockada — **não** chama backend real |
| Alias gerado | `@mock_users_empty-list` (substitui `/` por `_`) |
| Asserção | UI reflete `"Fetched 0 users"` |

**Conceito:** mock permite testar **edge cases** (lista vazia) de forma determinística.

---

### `readFixture task exposes countries lookup for test data`

```javascript
cy.task('readFixture', 'lookups/countries.json').then((data) => {
  expect(data.countries.map((c) => c.code)).to.include('CA')
})
```

Teste do helper Node — valida que fixture contém Canadá (`"CA"`).

---

### `accepts CSV file via drag-and-drop on drop zone`

```javascript
ActivityPage.dropZone().selectFile('cypress/fixtures/sample.csv', { action: 'drag-drop' })
ActivityPage.dropZone().should('contain.text', 'sample.csv')
```

| Aspecto | Explicação |
|---------|------------|
| `selectFile(..., { action: 'drag-drop' })` | Simula drag-and-drop nativo do Cypress |
| Asserção | Drop zone exibe nome do arquivo |

---

## Resumo de conceitos aprendidos

| Conceito | Onde aparece |
|----------|--------------|
| Page Object | `ActivityPage` |
| Interceptação de rede | `cy.interceptGetUsers`, `cy.interceptSlowApi`, `cy.mockApiGet` |
| Espera de alias | `cy.wait('@getUsers')` |
| Simulação de latência | `interceptSlowApi(1500)` |
| Mock de API | `mockApiGet` com fixture |
| Estado local UI | Contador increment/decrement |
| Node task | `cy.task('readFixture', ...)` |
| Upload de arquivo | `selectFile` com `drag-drop` |
| Relatório BDD | `cy.section`, `cy.step` |
| Tags | `@smoke`, `@api`, `@regression` |
