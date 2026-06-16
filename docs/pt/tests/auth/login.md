# Autenticação — Login

**Arquivo de origem:** [`login.cy.js`](../../../../cypress/e2e/auth/login.cy.js)

---

## Propósito

Esta suíte valida o **fluxo completo de autenticação** da aplicação TestFlow pela tela de login. Cobre:

- Estrutura e acessibilidade do formulário
- Login bem-sucedido (UI pura e com toggle de API)
- Persistência de sessão em `sessionStorage`
- Rejeição de credenciais inválidas
- Validação HTML5 e comportamento do checkbox "Remember me"
- Proteção de rotas e redirecionamento pós-login
- Verificação de acessibilidade com axe-core

É a base para entender como [`LoginPage`](../../../../cypress/pages/LoginPage.js) encapsula seletores e ações reutilizáveis.

---

## Pré-requisitos

| Item | Detalhe |
|------|---------|
| **TestFlow** | Rodando em `http://localhost:5050` |
| **Dependências** | `npm install` na raiz do projeto |
| **Credenciais DEMO** | `DEMO_EMAIL` (`demo@automation.io`) e `DEMO_PASSWORD` (`Demo123!`) em `cypress.env.json` |
| **Fixture** | [`credentials.json`](../../../../cypress/fixtures/credentials.json) com pares válido/inválido para testes negativos |
| **Execução** | `npx cypress run --spec cypress/e2e/auth/login.cy.js` |

---

## Tags utilizadas

| Tag | Onde aparece | Significado |
|-----|--------------|-------------|
| `@regression` | `describe` principal | Suíte de regressão completa |
| `@smoke` | Login bem-sucedido via UI | Sanidade crítica pós-deploy |
| `@critical` | `AUTH_LOGIN_SUCCESS` | Bloqueia todo uso autenticado se falhar |
| `@a11y` | Teste de acessibilidade | Valida violações críticas com axe |

---

## Conceitos Cypress

| Conceito | Uso neste arquivo |
|----------|-------------------|
| **Page Object** | [`LoginPage`](../../../../cypress/pages/LoginPage.js) — métodos fluentes (`loginWith`, `shouldRedirectToDashboard`) |
| **`context()`** | Agrupa testes por tema (estrutura, credenciais válidas, inválidas, etc.) |
| **`cy.fixture().as()`** | Carrega [`credentials.json`](../../../../cypress/fixtures/credentials.json) como alias `@creds` |
| **`function ()` vs arrow** | Testes com `this.creds` usam `function` para acessar o contexto Mocha |
| **`cy.intercept()`** | Espiona `POST /api/auth/login` quando toggle "Use API" está ativo |
| **`cy.window()`** | Inspeciona `sessionStorage` após login |
| **`cy.checkA11yPage`** | Integração axe-core no escopo `[data-testid="login-form"]` |
| **`TC` / `tc()`** | IDs rastreáveis (`TC-0100`, `TC-0101`) nos títulos |

---

## Passo a passo — bloco a bloco

### Bloco 1 — Setup e Page Object

```javascript
import LoginPage from '../../pages/LoginPage'
import { TC, tc } from '../../support/@enums/testCases'

describe('Authentication', { tags: '@regression' }, () => {
  beforeEach(() => {
    LoginPage.visit()
  })
```

- **Given:** cada teste inicia na página de login (`/web/login.html`).
- **When:** `LoginPage.visit()` executa `cy.visit` encapsulado.
- **Then:** estado limpo — nenhuma sessão prévia assumida (exceto onde o teste cria uma).

---

### Bloco 2 — Estrutura da página

```javascript
  context('Page structure', () => {
    it(tc(TC.AUTH_LOGIN_FORM, 'renders all form elements'), () => {
      LoginPage.emailInput().should('be.visible')
      LoginPage.passwordInput().should('be.visible')
      LoginPage.submitBtn().should('be.visible').and('not.be.disabled')
      LoginPage.rememberCheckbox().should('exist')
      LoginPage.useApiCheckbox().should('exist')
    })
```

- **Given:** página de login carregada.
- **When:** Page Object expõe cada campo via `data-testid`.
- **Then:** email, senha, submit, remember e use-api existem e submit não está desabilitado.

**Placeholder e tipo de campo:**

```javascript
    it('has correct placeholder text on email field', () => {
      LoginPage.emailInput().should('have.attr', 'placeholder', 'demo@automation.io')
    })

    it('password field masks input', () => {
      LoginPage.passwordInput().should('have.attr', 'type', 'password')
    })
```

- **Given:** formulário renderizado.
- **When:** inspeciona atributos HTML nativos.
- **Then:** placeholder guia o usuário demo e senha usa `type="password"`.

---

### Bloco 3 — Credenciais válidas

```javascript
  context('Valid credentials', () => {
    it(tc(TC.AUTH_LOGIN_SUCCESS, 'logs in via UI and redirects to dashboard'), { tags: '@smoke @critical' }, () => {
      LoginPage
        .loginWith(Cypress.env('DEMO_EMAIL'), Cypress.env('DEMO_PASSWORD'))
        .shouldRedirectToDashboard()
    })
```

- **Given:** credenciais DEMO válidas.
- **When:** preenche email/senha e submete via Page Object.
- **Then:** URL contém `/web/dashboard.html` e `page-dashboard` existe — fluxo feliz principal.

**Login com API interceptada:**

```javascript
    it('logs in with API toggle enabled', () => {
      cy.section('Setup intercept')
      cy.interceptLogin()

      LoginPage
        .toggleUseApi()
        .loginWith(Cypress.env('DEMO_EMAIL'), Cypress.env('DEMO_PASSWORD'))

      cy.wait('@loginApi').its('response.statusCode').should('eq', 200)
      LoginPage.shouldRedirectToDashboard()
    })
```

- **Given:** checkbox "Use API" ativado e intercept registrado como `@loginApi`.
- **When:** login dispara request real ao backend.
- **Then:** resposta 200 confirmada antes do redirect.

**Persistência em sessionStorage:**

```javascript
    it('sets auth data in sessionStorage after login', () => {
      LoginPage.loginWith(Cypress.env('DEMO_EMAIL'), Cypress.env('DEMO_PASSWORD'))

      cy.window().then((win) => {
        const auth = JSON.parse(win.sessionStorage.getItem('sandbox-auth') ?? 'null')
        expect(auth).to.not.be.null
        expect(auth.email).to.eq(Cypress.env('DEMO_EMAIL'))
      })
    })
```

- **Given:** login bem-sucedido.
- **When:** lê `sandbox-auth` do `sessionStorage`.
- **Then:** objeto JSON contém email do usuário autenticado.

---

### Bloco 4 — Credenciais inválidas

```javascript
  context('Invalid credentials', () => {
    beforeEach(() => {
      cy.fixture('credentials').as('creds')
    })

    it('shows error for wrong password', function () {
      LoginPage
        .loginWith(this.creds.valid.email, this.creds.invalid.password)
        .shouldShowError('Invalid credentials')
    })
```

- **Given:** fixture [`credentials.json`](../../../../cypress/fixtures/credentials.json) carregada como `@creds`.
- **When:** email válido com senha errada.
- **Then:** mensagem visível contém "Invalid credentials" — usa `function ()` para `this.creds`.

**Sem navegação em falha:**

```javascript
    it('does not navigate away on failed login', function () {
      LoginPage.loginWith(this.creds.invalid.email, this.creds.invalid.password)
      cy.url().should('include', '/web/login.html')
    })
```

- **Given:** par completamente inválido.
- **When:** submit do formulário.
- **Then:** permanece em `/web/login.html`.

---

### Bloco 5 — Validação HTML5 e Remember me

```javascript
  context('Form validation', () => {
    it('requires email to not be empty (HTML5 validation)', () => {
      LoginPage.fillPassword(Cypress.env('DEMO_PASSWORD')).submit()
      LoginPage.emailInput().then(($el) => {
        expect($el[0].validity.valid).to.be.false
      })
    })
  })
```

- **Given:** email vazio, senha preenchida.
- **When:** submit sem preencher email.
- **Then:** `validity.valid` do input é `false` — validação nativa do browser.

```javascript
  context('Remember me', () => {
    it('checkbox can be checked and unchecked', () => {
      LoginPage.rememberCheckbox().should('not.be.checked')
      LoginPage.toggleRememberMe()
      LoginPage.rememberCheckbox().should('be.checked')
      LoginPage.toggleRememberMe()
      LoginPage.rememberCheckbox().should('not.be.checked')
    })
  })
```

- **Given:** checkbox desmarcado inicialmente.
- **When:** dois cliques alternados via `toggleRememberMe()`.
- **Then:** estado checked/unchecked alterna corretamente.

---

### Bloco 6 — Proteção de rotas e a11y

```javascript
  context('Redirect after login', () => {
    it('redirects to login when accessing a protected page unauthenticated', () => {
      cy.visit('/web/team.html')
      cy.url().should('include', '/web/login.html')

      LoginPage.loginWith(Cypress.env('DEMO_EMAIL'), Cypress.env('DEMO_PASSWORD'))
      cy.url().should('not.include', '/web/login.html')
    })
  })
```

- **Given:** usuário não autenticado tenta acessar `/web/team.html`.
- **When:** guard de rota redireciona para login e usuário autentica.
- **Then:** sai da tela de login após credenciais válidas.

```javascript
  context('Accessibility', () => {
    it('login page has no critical a11y violations', { tags: '@a11y' }, () => {
      cy.checkA11yPage('[data-testid="login-form"]', { preset: 'critical' })
    })
  })
```

- **Given:** formulário de login renderizado.
- **When:** axe-core analisa violações no escopo do form.
- **Then:** nenhuma violação crítica — preset `critical` ignora regras menores.

---

## Como executar

```bash
# Suíte completa de login
npx cypress run --spec cypress/e2e/auth/login.cy.js

# Apenas smoke/critical
npx cypress run --spec cypress/e2e/auth/login.cy.js --env grepTags=@critical

# Testes de acessibilidade
npx cypress run --spec cypress/e2e/auth/login.cy.js --env grepTags=@a11y
```

---

## Referências relacionadas

- Page Object: [`LoginPage.js`](../../../../cypress/pages/LoginPage.js)
- Intercepts: [`cypress/support/commands/interceptions.js`](../../../../cypress/support/commands/interceptions.js)
- Fixture de credenciais: [`credentials.json`](../../../../cypress/fixtures/credentials.json)
