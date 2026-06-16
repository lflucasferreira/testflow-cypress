# Component Test — UserBadge

Guia de testes para badge de usuário com renderização condicional e viewport responsivo. Spec: [`UserBadge.cy.jsx`](../../../../cypress/component/UserBadge.cy.jsx).

## Objetivos de aprendizado

Você aprenderá a:

- Parametrizar casos de teste com arrays e `forEach`.
- Assert visibilidade vs ausência baseada em props (`user.verified`).
- Configurar viewport mobile e restaurar desktop após o teste.
- Importar componentes co-localizados no arquivo de treinamento.

## Pré-requisitos

- ConfirmDialog.md — padrões `mountWithProviders` e hooks.
- Noções de responsive design e `cy.viewport`.

## Nota sobre imports

O spec importa `UserBadge` de `./ConfirmDialog` — arquivo que exporta múltiplos componentes de treinamento (ConfirmDialog, UserForm, UserBadge). Em projetos reais, cada componente teria arquivo próprio; aqui a co-localização reduz boilerplate do sandbox.

Implementação:

```javascript
export function UserBadge({ user }) {
  return (
    <div data-cy-hook="user-badge">
      <span>{user.name}</span>
      {!user.verified && (
        <button data-cy-hook="verify-action">Verify</button>
      )}
    </div>
  )
}
```

Regra de negócio: usuários **não verificados** exibem botão "Verify"; verificados não.

## Parametrização com badgeCases

```javascript
const badgeCases = [
  { verified: false, expectVerify: true, label: 'unverified' },
  { verified: true, expectVerify: false, label: 'verified' },
]

badgeCases.forEach(({ verified, expectVerify, label }) => {
  it(`${label} user ${expectVerify ? 'shows' : 'hides'} verify action`, () => {
    // ...
  })
})
```

### Vantagens do data-driven testing

1. **DRY** — lógica de mount/assert escrita uma vez.
2. **Títulos dinâmicos** — relatório Mochawesome legível ("unverified user shows verify action").
3. **Extensível** — adicionar caso `{ verified: false, role: 'admin', ... }` sem novo bloco copy-paste.

### Asserções condicionais

```javascript
cy.mountWithProviders(<UserBadge user={{ name: 'Alex', verified }} />)
if (expectVerify) {
  cy.getByHook('verify-action').should('be.visible')
} else {
  cy.assertHookMissing('verify-action')
}
```

`if` no teste é aceitável quando driven by table — alternativa seria dois `it` separados (como no ConfirmDialog).

## Teste de viewport mobile

```javascript
const MOBILE = { width: 375, height: 812 }   // iPhone X-ish
const DESKTOP = { width: 1280, height: 800 }

it('renders at mobile viewport', () => {
  cy.viewport(MOBILE.width, MOBILE.height)
  cy.mountWithProviders(<UserBadge user={{ name: 'Alex', verified: false }} />)
  cy.getByHook('user-badge').should('be.visible')
  cy.viewport(DESKTOP.width, DESKTOP.height)
})
```

### Por que restaurar viewport?

Cypress compartilha viewport entre testes no mesmo spec. Sem reset para desktop, testes seguintes (ou outros specs na mesma run) herdam 375×812 — causando falhas silenciosas em layouts desktop-only.

**Alternativa:** `afterEach(() => cy.viewport(DESKTOP.width, DESKTOP.height))` centralizado.

### O que este teste não faz (ainda)

Valida apenas que badge existe em mobile — não verifica reflow, tamanho de botão ou overflow. Para regressão visual, combine com Percy CT ou snapshots.

## Hooks utilizados

| Hook            | Elemento                          |
|-----------------|-----------------------------------|
| `user-badge`    | Container principal               |
| `verify-action` | Botão Verify (só se !verified)    |

Nome do usuário renderiza em `<span>` sem hook — testes atuais não assertam texto; oportunidade de melhoria.

## Como executar

```bash
npx cypress run --component --spec 'cypress/component/UserBadge.cy.jsx'
npm run cy:run:component:ct
```

## Matriz de casos

| verified | verify-action no DOM | Título gerado                              |
|----------|----------------------|--------------------------------------------|
| false    | sim, visible         | unverified user shows verify action        |
| true     | não existe           | verified user hides verify action          |

## Padrões relacionados

### Table-driven em outros specs

- `UserForm.cy.jsx` — `validationCases` array.
- `rules.api.cy.js` — `generateMandatoryFieldTests` factory.

Consistência de estilo facilita onboarding.

### Stub de click em Verify

Extensão natural:

```javascript
const onVerify = cy.stub().as('onVerify')
// passar onVerify como prop se componente evoluir
cy.clickHook('verify-action')
cy.get('@onVerify').should('have.been.called')
```

Hoje o botão não tem handler — exercício de TDD.

## Boas práticas

1. **Objetos viewport nomeados** — `MOBILE`/`DESKTOP` vs magic numbers.
2. **label no case table** — debugging e grep no CI.
3. **assertHookMissing** para elementos condicionais negativos.
4. **Cleanup viewport** — evita poluição entre testes.

## Exercícios práticos

1. Assert `user.name` visível ("Alex") via `contain.text`.
2. Adicione caso `verified: undefined` — documente comportamento esperado.
3. Teste tablet viewport (768×1024).
4. Integre `cy.clickHook('verify-action')` após adicionar prop `onVerify`.

## Troubleshooting

| Problema                         | Solução                                   |
|----------------------------------|-------------------------------------------|
| verify-action existe quando verified | Bug no componente ou prop errada      |
| Badge invisible em mobile        | CSS overflow — inspecione computed styles |
| Testes seguintes em mobile       | Falta reset viewport no afterEach         |

## Referências

- Spec: [`cypress/component/UserBadge.cy.jsx`](../../../../cypress/component/UserBadge.cy.jsx)
- Componente: [`cypress/component/ConfirmDialog.jsx`](../../../../cypress/component/ConfirmDialog.jsx) (export UserBadge)
- Viewport API: [Cypress viewport docs](https://docs.cypress.io/api/commands/viewport)
