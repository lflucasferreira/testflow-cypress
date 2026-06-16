# API — Autenticação (POST /api/auth/login)

Este módulo cobre testes de contrato e integração para o endpoint de login. O arquivo fonte é [`auth.api.cy.js`](../../../../cypress/e2e/api/auth.api.cy.js).

## Objetivos de aprendizado

Ao final deste treinamento, você saberá:

- Validar respostas HTTP com `cy.request` sem abrir o navegador.
- Reutilizar uma única resposta em múltiplos `it()` com hook `before`.
- Testar credenciais inválidas e payloads malformados com `failOnStatusCode: false`.
- Combinar interceptação de rede com fluxo UI para validar o contrato end-to-end.

## Pré-requisitos

- Variáveis `DEMO_EMAIL` e `DEMO_PASSWORD` em `cypress.env.json` ou CI secrets.
- Servidor TestFlow (ou mock) respondendo em `POST /api/auth/login`.
- Noções de status HTTP (200, 401, 4xx) e formato JSON.

## Visão geral

O spec organiza cenários em quatro `context`:

| Contexto              | Foco                                      |
|-----------------------|-------------------------------------------|
| Valid credentials     | Contrato de sucesso + token reutilizável  |
| Invalid credentials   | 401 para senha/e-mail incorretos          |
| Malformed request     | 4xx para body incompleto                  |
| Intercept — login flow| UI + rede (stub e contrato real)          |

Tags globais: `@api @regression`. Casos críticos usam `@smoke @api @critical`.

## Contexto: Valid credentials

### Padrão before + múltiplos asserts

```javascript
let res

before(() => {
  cy.request({ method: 'POST', url: ENDPOINT, body: VALID })
    .then((r) => { res = r })
})
```

Uma única requisição alimenta vários testes — reduz carga no servidor e garante consistência. Cada `it()` inspeciona um aspecto diferente da mesma resposta:

- **Status 200** — código de sucesso.
- **Content-Type** — header inclui `application/json`.
- **Duration** — resposta em menos de 2000 ms (SLA de performance).
- **Token** — string não vazia no body (`@critical`).
- **User object** — quando presente, `user.email` é string válida e coincide com o e-mail enviado.
- **Token funcional** — Bearer token autentica `GET /api/users` com status 200.

Este último teste prova que o token não é apenas um campo decorativo — ele funciona em chamadas subsequentes.

## Contexto: Invalid credentials

Testes de segurança básica com `failOnStatusCode: false`:

```javascript
cy.request({
  method: 'POST',
  url: ENDPOINT,
  body: { email: VALID.email, password: 'wrongpassword' },
  failOnStatusCode: false,
}).its('status').should('eq', 401)
```

Sem `failOnStatusCode: false`, o Cypress falharia ao receber 401. Cenários cobertos:

1. Senha errada para e-mail válido → 401.
2. E-mail inexistente → 401.
3. Body de erro contém `message` ou `error.message` não vazio.

O padrão `body.message ?? body.error?.message` tolera variações de formato entre backends.

## Contexto: Malformed request

Validação de entrada no servidor:

| Cenário           | Body enviado              | Status esperado |
|-------------------|---------------------------|-----------------|
| Body vazio        | `{}`                      | 400–422         |
| E-mail ausente    | `{ password }`            | 400–422         |
| Senha ausente     | `{ email }`               | 400–422         |

Usar `.should('be.within', 400, 422)` acomoda APIs que retornam 400 ou 422 para validação — comum em frameworks distintos.

## Contexto: Intercept — login flow

Aqui a API encontra a UI. Dois cenários complementares:

### Contrato de rede real

```javascript
cy.intercept('POST', ENDPOINT).as('loginCall')
// ... preenche formulário e clica submit
cy.wait('@loginCall').then(({ request, response }) => {
  expect(request.body.email).to.eq(VALID.email)
  expect(response.statusCode).to.eq(200)
  expect(response.body.token).to.be.a('string').and.not.be.empty
})
```

O toggle `login-use-api` ativa o modo que chama a API real. O intercept confirma payload e resposta sem mockar o backend.

### Stub de erro 500

```javascript
cy.intercept('POST', ENDPOINT, {
  statusCode: 500,
  body: { error: 'Internal Server Error' },
}).as('loginFail')
```

Após o submit, a URL permanece em `/web/login.html` — o app não redireciona em falha. Se `login-result` estiver visível, o texto não deve ser vazio (feedback ao usuário).

**Nota:** a senha é digitada com `{ log: false }` para não aparecer nos logs do Cypress.

## Comandos e constantes

```javascript
const ENDPOINT = '/api/auth/login'
const VALID = {
  email: Cypress.env('DEMO_EMAIL'),
  password: Cypress.env('DEMO_PASSWORD'),
}
```

Centralizar endpoint e credenciais facilita manutenção quando a rota ou variáveis mudarem.

## Como executar

```bash
# Toda a suíte API
npm run cy:run:api

# Apenas auth
npx cypress run --spec 'cypress/e2e/api/auth.api.cy.js'

# Smoke API (inclui casos @smoke deste arquivo)
npm run cy:run:smoke
```

## Boas práticas demonstradas

1. **Separação happy path / sad path** — contexts distintos melhoram legibilidade no relatório Mochawesome.
2. **Asserções atômicas** — um `it()` por propriedade facilita identificar qual contrato quebrou.
3. **Teste de token downstream** — valida o ciclo completo auth → recurso protegido.
4. **Intercept + UI** — garante que frontend e backend falam o mesmo contrato.

## Exercícios práticos

1. Adicione um teste para e-mail com formato inválido (`not-an-email`) esperando 4xx.
2. Stub resposta 401 e verifique se a UI exibe mensagem de erro.
3. Meça `duration` também nos testes de credenciais inválidas e documente o SLA.
4. Mapeie cada `it()` a um caso Xray usando os IDs em `testCases.js` (ex.: `TC-0021`).

## Troubleshooting

| Sintoma                         | Causa provável                          |
|---------------------------------|-----------------------------------------|
| 401 nos testes de credenciais válidas | `DEMO_*` incorretos ou usuário inexistente |
| Intercept não dispara           | Toggle API desligado ou URL diferente   |
| Duration > 2000 ms              | Servidor lento ou cold start em CI      |
| Token vazio                     | Contrato da API mudou (campo renomeado) |

## Referências

- Spec: [`cypress/e2e/api/auth.api.cy.js`](../../../../cypress/e2e/api/auth.api.cy.js)
- Estratégia de seletores UI: [`docs/selector-strategy.md`](../../../selector-strategy.md)
- Status HTTP enum: [`cypress/support/@enums/httpStatus.js`](../../../../cypress/support/@enums/httpStatus.js)
