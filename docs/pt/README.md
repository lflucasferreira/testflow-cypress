# TestFlow Cypress — Documentação de Treinamento

Material didático que explica **bloco a bloco** cada arquivo de teste do projeto. Ideal para novos alunos que estão aprendendo Cypress, Page Objects e automação E2E/component.

Cada documento aponta para o arquivo de spec correspondente com um link relativo.

**Idioma:** Português · [English](../en/README.md)

---

## Como usar este material

1. Leia o doc da suite que você vai executar ou manter.
2. Abra o [arquivo de spec](..) linkado no topo do documento.
3. Siga a explicação seção por seção enquanto lê o código.
4. Execute a suite localmente:

```bash
npx cypress open                              # runner interativo
npx cypress run --spec cypress/e2e/smoke/navigation.cy.js
npm run cy:run:smoke                          # via tags @smoke
npm run cy:run:component                     # testes de componente
```

---

## Índice por suite

### Smoke & Auth

| Suite | Documentação | Arquivo de teste |
|-------|--------------|------------------|
| Smoke — navegação | [navigation.md](tests/smoke/navigation.md) | [`cypress/e2e/smoke/navigation.cy.js`](../../cypress/e2e/smoke/navigation.cy.js) |
| Auth — login | [login.md](tests/auth/login.md) | [`cypress/e2e/auth/login.cy.js`](../../cypress/e2e/auth/login.cy.js) |

### Páginas autenticadas

| Suite | Documentação | Arquivo de teste |
|-------|--------------|------------------|
| Dashboard | [dashboard.md](tests/dashboard/dashboard.md) | [`cypress/e2e/dashboard/dashboard.cy.js`](../../cypress/e2e/dashboard/dashboard.cy.js) |
| Team | [team.md](tests/team/team.md) | [`cypress/e2e/team/team.cy.js`](../../cypress/e2e/team/team.cy.js) |
| Settings | [settings.md](tests/settings/settings.md) | [`cypress/e2e/settings/settings.cy.js`](../../cypress/e2e/settings/settings.cy.js) |
| Components | [components.md](tests/components/components.md) | [`cypress/e2e/components/components.cy.js`](../../cypress/e2e/components/components.cy.js) |
| Wizard | [wizard.md](tests/wizard/wizard.md) | [`cypress/e2e/wizard/wizard.cy.js`](../../cypress/e2e/wizard/wizard.cy.js) |
| Activity | [activity.md](tests/activity/activity.md) | [`cypress/e2e/activity/activity.cy.js`](../../cypress/e2e/activity/activity.cy.js) |
| Advanced | [advanced.md](tests/advanced/advanced.md) | [`cypress/e2e/advanced/advanced.cy.js`](../../cypress/e2e/advanced/advanced.cy.js) |
| UI States | [states.md](tests/states/states.md) | [`cypress/e2e/states/states.cy.js`](../../cypress/e2e/states/states.cy.js) |

### Visual, API & Component

| Suite | Documentação | Arquivo de teste |
|-------|--------------|------------------|
| Visual regression (Percy) | [percy.md](tests/visual/percy.md) | [`cypress/e2e/visual/percy.cy.js`](../../cypress/e2e/visual/percy.cy.js) |
| API — auth | [auth.api.md](tests/api/auth.api.md) | [`cypress/e2e/api/auth.api.cy.js`](../../cypress/e2e/api/auth.api.cy.js) |
| API — users & health | [users.api.md](tests/api/users.api.md) | [`cypress/e2e/api/users.api.cy.js`](../../cypress/e2e/api/users.api.cy.js) |
| API — rules / JSON Patch | [rules.api.md](tests/api/rules.api.md) | [`cypress/e2e/api/rules.api.cy.js`](../../cypress/e2e/api/rules.api.cy.js) |
| Component — ConfirmDialog | [ConfirmDialog.md](tests/component/ConfirmDialog.md) | [`cypress/component/ConfirmDialog.cy.jsx`](../../cypress/component/ConfirmDialog.cy.jsx) |
| Component — LookupPreview | [LookupPreview.md](tests/component/LookupPreview.md) | [`cypress/component/LookupPreview.cy.jsx`](../../cypress/component/LookupPreview.cy.jsx) |
| Component — UserBadge | [UserBadge.md](tests/component/UserBadge.md) | [`cypress/component/UserBadge.cy.jsx`](../../cypress/component/UserBadge.cy.jsx) |
| Component — UserForm | [UserForm.md](tests/component/UserForm.md) | [`cypress/component/UserForm.cy.jsx`](../../cypress/component/UserForm.cy.jsx) |

---

## Conceitos transversais

Os documentos cobrem, entre outros:

- **Cypress:** `describe`/`context`/`it`, tags com `@bahmutov/cy-grep`, `cy.session`, `cy.intercept`
- **Autenticação:** `cy.createAuthSession`, `cy.visitWithSession`, `sessionStorage` (`sandbox-auth`)
- **Page Object Model:** classes em [`cypress/pages/`](../../cypress/pages/)
- **Comandos customizados:** [`cypress/support/commands/`](../../cypress/support/commands/)
- **Dados de teste:** fixtures JSON em [`cypress/fixtures/`](../../cypress/fixtures/), factories em [`cypress/support/factories/`](../../cypress/support/factories/)
- **Acessibilidade:** `cy.checkA11yPage` com cypress-axe
- **Component tests:** `cy.mountWithProviders`, seletores `data-cy-hook`
- **IDs rastreáveis:** prefixo `[TC-xxxx]` via [`cypress/support/@enums/testCases.js`](../../cypress/support/@enums/testCases.js)

---

## Outros materiais em `docs/`

| Recurso | Descrição |
|---------|-----------|
| [`slides/`](../slides/) | Apresentação introdutória Cypress (HTML/PDF) |
| [`selector-strategy.md`](../selector-strategy.md) | `data-testid` (E2E) vs `data-cy-hook` (component/slides) |
| [`cypress-technical-interview-questions.md`](../cypress-technical-interview-questions.md) | Banco de perguntas técnicas para entrevistas |

---

## Estrutura de pastas

```
docs/
├── README.md                          ← seletor de idioma
├── cypress-technical-interview-questions.md
├── pt/
│   ├── README.md                      ← índice (Português)
│   └── tests/                         ← walkthroughs por spec
├── en/
│   ├── README.md                      ← index (English)
│   └── tests/
├── slides/                            ← apresentação
└── selector-strategy.md
```
