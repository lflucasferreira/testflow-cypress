# Smoke — Navegação e Saúde da API

**Arquivo de origem:** [`navigation.cy.js`](../../../../cypress/e2e/smoke/navigation.cy.js)

---

## Propósito

Esta suíte **smoke** valida que a aplicação TestFlow está operacional após autenticação. Ela cobre três dimensões complementares:

1. **Carregamento de páginas** — cada rota autenticada abre sem erro e expõe o elemento raiz esperado.
2. **Navegação pela sidebar** — links, estado ativo e logout funcionam como contrato da UI.
3. **Saúde da API** — endpoints críticos respondem com status e payload corretos.

A suíte foi projetada para ser **rápida**: usa `cy.session` para reutilizar autenticação e verifica apenas a raiz de cada página, sem fluxos profundos.

---

## Pré-requisitos

| Item | Detalhe |
|------|---------|
| **TestFlow** | Aplicação rodando em `http://localhost:5050` (ou `baseUrl` configurada em `cypress.config.js`) |
| **Dependências** | `npm install` executado na raiz do projeto |
| **Credenciais** | `DEMO_EMAIL` e `DEMO_PASSWORD` definidos em `cypress.env.json` ou variáveis de ambiente Cypress |
| **Execução** | `npx cypress run --spec cypress/e2e/smoke/navigation.cy.js` ou modo interativo via `npx cypress open` |

---

## Tags utilizadas

| Tag | Onde aparece | Significado |
|-----|--------------|-------------|
| `@smoke` | `describe`, `it` de páginas e API | Testes rápidos de sanidade pós-deploy |
| `@regression` | Todos os `describe` | Incluído na suíte de regressão completa |
| `@critical` | Navegação team, login API, logout | Fluxos que bloqueiam uso da aplicação |
| `@api` | Bloco "API health" | Testes HTTP via `cy.request`, sem browser |

---

## Conceitos Cypress

| Conceito | Uso neste arquivo |
|----------|-------------------|
| [`cy.session`](../../../../cypress/support/commands.js) | Cache de login via `cy.createAuthSession()` — evita repetir POST de auth em cada teste |
| [`cy.visitWithSession`](../../../../cypress/support/commands.js) | Combina sessão + visita + skip do tour de onboarding |
| [`cy.getByTestId`](../../../../cypress/support/commands.js) | Seletores estáveis via `data-testid` |
| [`cy.request`](https://docs.cypress.io/api/commands/request) | Chamadas HTTP diretas, sem UI |
| [`validateJsonSchema`](../../../../cypress/support/commands.js) | Valida resposta contra JSON Schema em [`cypress/fixtures/schemas/`](../../../../cypress/fixtures/schemas/) |
| [`TC` / `tc()`](../../../../cypress/support/@enums/testCases.js) | IDs rastreáveis (ex.: `TC-0001`) prefixados no título do teste |
| `failOnStatusCode: false` | Permite assertar status 404/422 sem falhar automaticamente |

---

## Passo a passo — bloco a bloco

### Bloco 1 — Imports e lista de páginas

```javascript
import { TC, tc } from '../../support/@enums/testCases'

const PAGES = [
  { path: '/web/dashboard.html', testId: 'page-dashboard', title: 'Dashboard', tcId: TC.SMOKE_DASHBOARD },
  // ... demais páginas
]
```

- **Given:** o projeto importa enums de casos de teste para rastreabilidade com Jira/Xray.
- **When:** `PAGES` define o contrato de cada rota — path, `testId` raiz e título esperado no `<title>`.
- **Then:** adicionar uma nova página exige apenas uma entrada no array, sem duplicar lógica.

---

### Bloco 2 — Smoke: carregamento de páginas

```javascript
describe('Smoke — page navigation', { tags: '@smoke @regression' }, () => {
  beforeEach(() => {
    cy.createAuthSession()
  })

  PAGES.forEach(({ path, testId, title, tcId }) => {
    it(tc(tcId, `${title} page loads without error`), { tags: '@smoke' }, () => {
      cy.visit(path)
      cy.getByTestId(testId).should('exist')
      cy.title().should('include', title)
    })
  })
})
```

- **Given:** uma sessão autenticada existe (via `cy.session` interno).
- **When:** o teste visita cada path e busca o elemento raiz pelo `data-testid`.
- **Then:** a página existe no DOM e o título do browser contém o nome esperado — prova de renderização mínima sem JS errors explícitos (monitorados globalmente em `support/e2e.js`).

**Páginas cobertas:** Dashboard, Team, Settings, Components, Activity, Advanced, Wizard, UI States.

---

### Bloco 3 — Smoke: navegação pela sidebar

```javascript
describe('Smoke — sidebar navigation', { tags: '@smoke @regression' }, () => {
  beforeEach(() => {
    cy.visitWithSession('/web/dashboard.html')
    cy.getByTestId('page-dashboard').should('exist')
  })

  it(tc(TC.SMOKE_NAV_TEAM, 'navigates from dashboard to team via sidebar'), { tags: '@smoke @critical' }, () => {
    cy.getByTestId('nav-team').click()
    cy.getByTestId('page-team').should('exist')
    cy.url().should('include', '/web/team.html')
  })
```

- **Given:** usuário autenticado está no dashboard com sidebar visível.
- **When:** clica no link `nav-team`.
- **Then:** URL muda para `/web/team.html` e `page-team` aparece no DOM.

**Teste de link ativo:**

```javascript
  it(tc(TC.SMOKE_NAV_ACTIVE, 'highlights the active nav link'), { tags: '@smoke' }, () => {
    cy.getByTestId('nav-dashboard').should('have.class', 'active')
  })
```

- **Given:** dashboard é a rota atual.
- **When:** inspeciona o item de menu correspondente.
- **Then:** possui classe CSS `active` — feedback visual de navegação.

**Teste de logout:**

```javascript
  it(tc(TC.SMOKE_LOGOUT, 'logout clears session and redirects to login'), { tags: '@critical' }, () => {
    cy.getByTestId('nav-logout').click()
    cy.url().should('include', '/web/index.html')
    cy.window().then((win) => {
      expect(win.sessionStorage.getItem('sandbox-auth')).to.be.null
    })
  })
```

- **Given:** sessão ativa em `sessionStorage`.
- **When:** usuário clica em logout.
- **Then:** redireciona para login e `sandbox-auth` é removido.

---

### Bloco 4 — Smoke: saúde da API

```javascript
describe('Smoke — API health', { tags: '@smoke @api @regression' }, () => {
  it(tc(TC.SMOKE_HEALTH, 'GET /health returns 200'), { tags: '@smoke @api' }, () => {
    cy.request('/health').its('status').should('eq', 200)
  })
```

- **Given:** backend TestFlow está acessível.
- **When:** `GET /health` é executado.
- **Then:** status HTTP é 200.

**Login via API:**

```javascript
  it(tc(TC.SMOKE_AUTH_LOGIN, 'POST /api/auth/login returns token'), { tags: '@smoke @api @critical' }, () => {
    cy.request({
      method: 'POST',
      url: '/api/auth/login',
      body: { email: Cypress.env('DEMO_EMAIL'), password: Cypress.env('DEMO_PASSWORD') },
    }).then(({ status, body }) => {
      expect(status).to.eq(200)
      cy.validateJsonSchema(body, 'auth-login.json')
      expect(body.user.email).to.eq(Cypress.env('DEMO_EMAIL'))
    })
  })
```

- **Given:** credenciais DEMO válidas.
- **When:** POST `/api/auth/login` com body JSON.
- **Then:** resposta 200, schema [`auth-login.json`](../../../../cypress/fixtures/schemas/auth-login.json) válido e email do usuário confere.

**Listagem de usuários:**

```javascript
  it(tc(TC.SMOKE_USERS_LIST, 'GET /api/users returns user array'), { tags: '@smoke @api' }, () => {
    cy.request('/api/users').then(({ status, body }) => {
      expect(status).to.eq(200)
      cy.validateJsonSchema(body, 'users-list.json')
    })
  })
```

- **Given:** endpoint público ou autenticado conforme configuração do sandbox.
- **When:** GET `/api/users`.
- **Then:** array validado contra [`users-list.json`](../../../../cypress/fixtures/schemas/users-list.json).

**Endpoints de erro:**

```javascript
  it(tc(TC.SMOKE_ERROR_404, 'GET /api/errors/404 returns 404 status'), () => {
    cy.request({ url: '/api/errors/404', failOnStatusCode: false })
      .its('status').should('eq', 404)
  })
```

- **Given:** rota de erro simulado existe no backend.
- **When:** request com `failOnStatusCode: false`.
- **Then:** Cypress não aborta o teste e o status assertado é 404 (ou 422 no caso análogo).

---

## Como executar

```bash
# Suíte smoke completa
npx cypress run --env grepTags=@smoke

# Apenas este arquivo
npx cypress run --spec cypress/e2e/smoke/navigation.cy.js

# Apenas testes @api deste arquivo
npx cypress run --spec cypress/e2e/smoke/navigation.cy.js --env grepTags=@api
```

---

## Referências relacionadas

- Page Objects: não utilizados nesta suíte (seletores diretos via `getByTestId`)
- Comandos customizados: [`cypress/support/commands.js`](../../../../cypress/support/commands.js)
- Enums de casos: [`cypress/support/@enums/testCases.js`](../../../../cypress/support/@enums/testCases.js)
