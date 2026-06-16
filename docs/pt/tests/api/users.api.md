# API — Usuários e Health

Este guia documenta testes de leitura, health check, simulação de erros e integração UI/API do arquivo [`users.api.cy.js`](../../../../cypress/e2e/api/users.api.cy.js).

## Objetivos de aprendizado

Você aprenderá a:

- Validar listagens REST com schema JSON e regex de e-mail.
- Monitorar latência de endpoints críticos (`/api/users`, `/health`).
- Testar endpoints de erro controlados (404, 422).
- Mockar respostas GET com fixtures e intercepts na página Activity.
- Usar tasks Cypress para ler fixtures do filesystem.

## Pré-requisitos

- Schema `user.json` em `cypress/fixtures/schemas/` (usado por `cy.validateJsonSchema`).
- Sessão ou API pública disponível para `GET /api/users`.
- Familiaridade com `cy.request` e tags `@smoke`.

## Visão geral

O `describe` principal **API — Users & Health** divide-se em quatro contextos:

```
GET /api/users          → contrato da listagem
GET /health             → disponibilidade do serviço
Error simulation        → endpoints /api/errors/*
Fixture + intercept     → UI Activity com mocks
```

Tags: `@api @regression` no describe; `@smoke` em health e status 200 de users.

## Contexto: GET /api/users

### Hook before compartilhado

Assim como em auth.api, uma requisição única alimenta múltiplas asserções:

```javascript
before(() => {
  cy.request('/api/users').then((r) => { res = r })
})
```

### Asserções de contrato

| Teste                    | O que valida                                      |
|--------------------------|---------------------------------------------------|
| Status 200               | Endpoint acessível                                |
| Duration < 2000 ms       | Performance aceitável                             |
| `body.users` array       | Lista não vazia                                   |
| JSON Schema por usuário  | Estrutura conforme `user.json`                    |
| Regex de e-mail          | Formato `user@domain.tld`                         |

### Validação de schema

```javascript
res.body.users.forEach((user) => {
  cy.validateJsonSchema(user, 'user.json')
})
```

O helper usa AJV para garantir que cada objeto usuário respeita o schema — campos obrigatórios, tipos e formatos. Isso detecta breaking changes silenciosos quando a API adiciona ou remove propriedades.

### Validação de e-mail

```javascript
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
expect(user.email).to.match(emailRegex)
```

Complementa o schema com regra de negócio legível — útil quando o schema aceita string genérica mas o domínio exige formato específico.

## Contexto: GET /health

Health checks são rápidos e frequentemente usados em smoke pipelines:

```javascript
cy.request('/health').its('status').should('eq', 200)
cy.request('/health').its('duration').should('be.lessThan', 1000)
```

SLA mais agressivo (1000 ms vs 2000 ms de users) reflete expectativa de resposta mínima sem lógica pesada.

## Contexto: Error simulation endpoints

O TestFlow expõe rotas de teste que retornam erros previsíveis:

```javascript
cy.request({ url: '/api/errors/404', failOnStatusCode: false })
  .its('status').should('eq', 404)
```

Padrões testados:

- Status exato (404, 422).
- Presença de mensagem de erro (`message` ou `error.message`).

Esses endpoints permitem validar handlers de erro client-side e middleware de logging sem depender de falhas reais de produção.

## Contexto: Fixture + intercept on Activity page

Este bloco conecta API testing à experiência do usuário na página Activity.

### beforeEach com sessão

```javascript
beforeEach(() => {
  cy.visitWithSession('/web/activity.html')
})
```

Cada teste parte de um estado autenticado consistente.

### mockApiGet com fixture

```javascript
cy.mockApiGet('users/empty-list', /\/api\/users/)
cy.getByTestId('fetch-users-btn').click()
cy.wait('@mock_users_empty-list')
cy.getByTestId('api-result').should('contain.text', 'Fetched 0 users')
```

O helper registra intercept que serve fixture `users/empty-list` quando a UI dispara fetch. O alias `@mock_users_empty-list` sincroniza clique e resposta mockada.

**Por que testar lista vazia?** Estados edge (zero registros) frequentemente quebram templates que assumem `users[0]` existente.

### Task readFixture

```javascript
cy.task('readFixture', 'lookups/countries.json').then((data) => {
  expect(data.countries).to.be.an('array').and.have.length.greaterThan(0)
  expect(data.countries[0]).to.include.keys('code', 'name')
})
```

Tasks rodam no processo Node do Cypress — ideal para ler JSON do disco sem passar pelo browser. Valida estrutura de lookups usados em outros fluxos.

Fluxo Activity + mock: registre intercept → clique em fetch → wait no alias → assert "Fetched 0 users".

## Como executar

```bash
npm run cy:run:api
npx cypress run --spec 'cypress/e2e/api/users.api.cy.js'
npm run cy:run:activity   # specs E2E da página Activity (complementar)
```

Relacionado a auth.api (token), rules.api (PATCH) e schema `user.json`. Use `failOnStatusCode: false` em erros simulados, valide todos os users com schema, e sempre `wait` no alias do mock. Exercício: fixture `users/single-user.json` com "Fetched 1 users".

## Referências

- Spec: [`cypress/e2e/api/users.api.cy.js`](../../../../cypress/e2e/api/users.api.cy.js)
- Intercepts: [`cypress/support/commands/interceptions.js`](../../../../cypress/support/commands/interceptions.js)
- Schema user: [`cypress/fixtures/schemas/user.json`](../../../../cypress/fixtures/schemas/user.json)
