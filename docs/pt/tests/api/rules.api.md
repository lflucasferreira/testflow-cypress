# API — Rules engine e padrões TestFlow

Este módulo avançado cobre JSON Patch, builders de teste, autenticação de serviço e intercepts mutáveis. Arquivo fonte: [`rules.api.cy.js`](../../../../cypress/e2e/api/rules.api.cy.js).

## Objetivos de aprendizado

Ao concluir, você dominará:

- Construir operações RFC 6902 com `JsonPatchBuilder` e factories.
- Diferenciar `patchUserViaRules` de `tryPatchUserViaRules` (failOnStatusCode).
- Usar `ApiTestPatterns` para fluxos read-after-write e campos obrigatórios.
- Configurar tokens OAuth-style com `setServiceToken` e `apiWithAuth`.
- Mutar respostas em intercepts para simular estados edge na UI.

## Pré-requisitos

- Leitura dos módulos auth.api e users.api.
- Conhecimento básico de JSON Patch (op, path, value).
- Variáveis de serviço em `cypress.env.json` para OAuth mock.

## Imports e dependências

```javascript
import { JsonPatchBuilder, modifyPatchField } from '../../support/utilities/jsonPatchUtils'
import { ApiTestPatterns } from '../../support/utilities/testPatterns'
import { UserPatchFactory } from '../../support/factories'
import { HTTP_STATUS } from '../../support/@enums/httpStatus'
import { TC, tc } from '../../support/@enums/testCases'
```

O spec integra utilitários de patch, factories de dados, padrões reutilizáveis e enums HTTP — espelhando arquitetura de projetos enterprise (TestFlow adapted).

## Setup global

```javascript
before(() => {
  cy.setServiceToken()
})
```

Antes de qualquer contexto, o token de serviço é obtido e armazenado em `Cypress.env('SERVICE_TOKEN')`. Contextos que precisam de auth de usuário usam `cy.seedAuthToken()` no `beforeEach`.

## Contexto: JSON Patch utilities

### JsonPatchBuilder

```javascript
const patches = new JsonPatchBuilder()
  .replace('/name', 'Alex')
  .replace('/role', 'admin')
  .build()

expect(patches[0]).to.deep.eq({ op: 'replace', path: '/name', value: 'Alex' })
```

API fluente para montar arrays de patch sem arrays manuais propensos a typo.

### modifyPatchField para testes negativos

```javascript
const base = UserPatchFactory.createNamePatch('A', 'B', 'C')
const invalid = modifyPatchField(base, '/name', null)
expect(invalid.find((p) => p.path === '/name').value).to.be.null
```

Permite derivar variantes inválidas a partir de patch válido — padrão DRY para negative testing.

## Contexto: patch vs tryPatch

| Comando                 | Comportamento                                      |
|-------------------------|----------------------------------------------------|
| `tryPatchUserViaRules`  | `failOnStatusCode: false` — captura 4xx/5xx        |
| `patchUserViaRules`     | Espera sucesso; falha em erro                      |

Patch válido aceita status variados (`OK`, `NO_CONTENT`, `NOT_FOUND`, `BAD_REQUEST`) conforme o mock. Patch inválido (path `/invalid`, user 999) espera 400, 404, 422 ou 500. Use `cy.section` e `cy.task('logJson')` para diagnóstico no CI.

## Contexto: executeSuccessfulPatchFlow

Caso rastreável **TC-0301**:

```javascript
it(tc(TC.API_PATCH_READ_AFTER_WRITE, 'patches user and validates read-after-write with retry'), () => {
  const uniqueName = `PatchFlow ${Date.now()}`
  const patches = UserPatchFactory.createSimpleNamePatch(uniqueName)

  ApiTestPatterns.executeSuccessfulPatchFlow(
    1,
    patches,
    'patchUserViaRules',
    'name',
  )
})
```

O builder executa:

1. PATCH com patches fornecidos.
2. GET do recurso (com retry) até campo `name` refletir valor patchado.
3. Asserções de consistência read-after-write.

`Date.now()` no nome evita colisão entre execuções paralelas.

## Contexto: mandatory field validation

```javascript
ApiTestPatterns.generateMandatoryFieldTests(
  ['/name'],
  basePatch,
  'tryPatchUserViaRules',
  1,
)
```

Gera dinamicamente testes que removem ou nullificam campos obrigatórios — mapeados a **TC-0302**. Reduz boilerplate quando há dezenas de campos mandatory.

## Contexto: Dual-service read after write

```javascript
cy.seedAuthToken()
ApiTestPatterns.executeSuccessfulGetFlow('/api/users', (body) => {
  expect(body.users).to.be.an('array').and.have.length.greaterThan(0)
  cy.validateJsonSchema(body.users[0], 'user.json')
})
```

Combina seed de token de usuário com GET autenticado e validação de schema — ponte entre auth layer e data layer.

## Contexto: OAuth e intercept mutável

`setServiceToken` persiste token em `Cypress.env`; `getServiceCredentials` retorna `client_id` e `client_secret`. O intercept `interceptGetUsersAndPatch` zera `body.users` na Activity — mesmo padrão de lista vazia que users.api, porém mutando resposta em vez de fixture fixa.

## Como executar

```bash
npm run cy:run:api
npx cypress run --spec 'cypress/e2e/api/rules.api.cy.js'
npm run cy:run:smoke   # inclui apiWithAuth @smoke
```

## Boas práticas e exercícios

Use **factories** para dados, **patterns** para fluxos longos, **enums HTTP** em vez de magic numbers e **tryPatch** em negative tests. Exercícios: patch `add`, estender mandatory tests para `/email`, mapear TC-0301/0302 no Jira. Se `SERVICE_TOKEN` estiver undefined, revise env vars; timeouts em read-after-write indicam retry ou user ID inválido.

## Referências

- Spec: [`cypress/e2e/api/rules.api.cy.js`](../../../../cypress/e2e/api/rules.api.cy.js)
- Patterns: [`cypress/support/utilities/testPatterns.js`](../../../../cypress/support/utilities/testPatterns.js)
- JSON Patch utils: [`cypress/support/utilities/jsonPatchUtils.js`](../../../../cypress/support/utilities/jsonPatchUtils.js)
- Factories: [`cypress/support/factories/index.js`](../../../../cypress/support/factories/index.js)
