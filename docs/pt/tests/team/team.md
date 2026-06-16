# Team — Tabela, filtros e convites

**Arquivo de origem:** [`team.cy.js`](../../../../cypress/e2e/team/team.cy.js)

---

## Propósito

Esta suíte valida a **página de gerenciamento de equipe** do TestFlow. Cobre o ciclo completo de interação com a tabela de membros:

- Estrutura da página (header, colunas, paginação)
- Busca por nome e email
- Filtros por role (Admin) e status (active/inactive)
- Ordenação por nome (desc/asc)
- Paginação entre páginas
- Modal de convite com validação, factory e intercept de API
- Edição inline de linhas
- Filtro da lista de frameworks

Combina **Page Object** ([`TeamPage`](../../../../cypress/pages/TeamPage.js)), **factory** ([`TeamMemberFactory`](../../../../cypress/support/factories)), **fixtures** e **network intercepts**.

---

## Pré-requisitos

| Item | Detalhe |
|------|---------|
| **TestFlow** | Rodando em `http://localhost:5050` |
| **Dependências** | `npm install` na raiz do projeto |
| **Credenciais DEMO** | Usadas por `cy.visitWithSession('/web/team.html')` |
| **Fixtures** | [`team-member.json`](../../../../cypress/fixtures/team-member.json) para prefill do formulário de convite |
| **Factory** | [`TeamMemberFactory`](../../../../cypress/support/factories) gera dados únicos por teste |
| **Execução** | `npx cypress run --spec cypress/e2e/team/team.cy.js` |

---

## Tags utilizadas

| Tag | Onde aparece | Significado |
|-----|--------------|-------------|
| `@regression` | `describe` principal | Suíte de regressão |
| `@smoke` | Busca por nome "Alice" | Sanidade da tabela e filtro |
| `@critical` | Convite bem-sucedido | Fluxo de negócio que adiciona membro |

---

## Conceitos Cypress

| Conceito | Uso neste arquivo |
|----------|-------------------|
| **Page Object** | [`TeamPage`](../../../../cypress/pages/TeamPage.js) — tabela, filtros, modal, edição inline |
| **Factory pattern** | `TeamMemberFactory.createInvite()` — dados dinâmicos evitam colisão |
| **`cy.searchTable` / `cy.getTableRows`** | Comandos customizados de tabela em [`commands.js`](../../../../cypress/support/commands.js) |
| **`cy.wrap($row)`** | Itera linhas jQuery no contexto Cypress |
| **`cy.fixture().then()`** | Carrega dados estáticos de [`team-member.json`](../../../../cypress/fixtures/team-member.json) |
| **`cy.interceptInvite`** | Espiona POST de convite — alias `@inviteApi` |
| **`cy.getByHook(SHARED.toast.testId)`** | Mapa centralizado de hooks em [`elements.js`](../../../../cypress/support/elements.js) |
| **`cy.section()`** | Agrupa steps no relatório Mochawesome |
| **Edição condicional de API** | Testa PUT ou PATCH conforme backend responda |

---

## Passo a passo — bloco a bloco

### Bloco 1 — Setup

```javascript
import TeamPage from '../../pages/TeamPage'
import { TeamMemberFactory } from '../../support/factories'
import { SHARED } from '../../support/elements'

describe('Team', { tags: '@regression' }, () => {
  beforeEach(() => {
    cy.visitWithSession('/web/team.html')
    TeamPage.pageRoot().should('exist')
  })
```

- **Given:** usuário autenticado na página Team.
- **When:** `visitWithSession` garante sessão + navegação.
- **Then:** `page-team` existe — base para todos os contextos.

---

### Bloco 2 — Estrutura da página

```javascript
  context('Page structure', () => {
    it('shows the page header with member count', () => {
      TeamPage.teamSummary().should('contain.text', '6 members')
    })

    it('renders all table columns', () => {
      cy.getByTestId('users-table').find('thead th').should('have.length', 7)
    })

    it('renders the correct number of rows on page 1', () => {
      TeamPage.shouldHaveRowCount(4)
    })

    it('row count label matches visible rows', () => {
      TeamPage.rowCount().should('contain.text', '6 row(s)')
    })
  })
```

- **Given:** tabela com 6 membros totais, 4 visíveis na página 1.
- **When:** inspeciona header, colunas (`thead th`) e contador.
- **Then:** 7 colunas, 4 linhas visíveis, label "6 row(s)" reflete total.

---

### Bloco 3 — Busca (Search)

```javascript
  context('Search', () => {
    it('filters rows by member name', { tags: '@smoke' }, () => {
      cy.searchTable('Alice')
      cy.getTableRows().should('have.length', 1)
      cy.getTableCell(1, 'name').should('contain.text', 'Alice QA')
    })

    it('filters rows by email', () => {
      TeamPage.search('carol')
      TeamPage.shouldHaveRowCount(1)
    })

    it('returns all rows when search is cleared', () => {
      TeamPage.search('Alice')
      TeamPage.shouldHaveRowCount(1)
      TeamPage.clearSearch()
      TeamPage.shouldHaveRowCount(4)
    })

    it('shows zero rows for a term with no match', () => {
      TeamPage.search('zzznoresult')
      TeamPage.tableRows().should('have.length', 0)
    })
  })
```

- **Given:** tabela com múltiplos membros.
- **When:** digita termo de busca (nome, email ou termo inexistente).
- **Then:** linhas filtradas dinamicamente; clear restaura 4 linhas; termo inválido retorna 0.

---

### Bloco 4 — Filtros de role e status

```javascript
  context('Role filter', () => {
    it('filters to Admin rows only', () => {
      TeamPage.filterByRole('admin')
      TeamPage.tableRows().each(($row) => {
        cy.wrap($row).find('[data-role="admin"]').should('exist')
      })
    })
  })

  context('Status filter', () => {
    it('filters to active members only', () => {
      TeamPage.filterByStatus('active')
      TeamPage.tableRows().each(($row) => {
        cy.wrap($row).find('[data-status="active"]').should('exist')
      })
    })
  })
```

- **Given:** dropdowns de role e status disponíveis.
- **When:** seleciona filtro e itera cada linha visível com `.each()`.
- **Then:** toda linha exibe badge/atributo correspondente (`data-role`, `data-status`).

---

### Bloco 5 — Ordenação e paginação

```javascript
  context('Sorting', () => {
    it('sorts rows by name descending on first click', () => {
      TeamPage.sortByName()
      TeamPage.tableRows().then(($rows) => {
        const names = [...$rows].map((r) =>
          (r.querySelector('[data-testid^="cell-name-"]')?.textContent ?? '').trim()
        )
        expect(names).to.deep.eq([...names].sort((a, b) => b.localeCompare(a)))
      })
    })
  })

  context('Pagination', () => {
    it('"Prev" button is disabled on page 1', () => {
      TeamPage.prevPage().should('be.disabled')
    })

    it('navigates to page 2 showing remaining rows', () => {
      TeamPage.goToNextPage()
      TeamPage.pageInfo().should('contain.text', 'Page 2')
      TeamPage.shouldHaveRowCount(2)
    })
  })
```

- **Given:** tabela paginada (4 + 2 linhas).
- **When:** clica header "Name" ou botões Prev/Next.
- **Then:** nomes ordenados via `localeCompare`; página 2 mostra 2 linhas restantes; Prev desabilitado na página 1.

---

### Bloco 6 — Modal de convite

```javascript
  context('Invite member modal', () => {
    let member

    beforeEach(() => {
      member = TeamMemberFactory.createInvite()
    })

    it('shows validation error when name is empty', () => {
      TeamPage.openInviteModal()
        .fillInviteForm({ email: member.email })
        .submitInvite()
        .shouldShowInviteError('required')
    })

    it('adds a new row after successful invite', { tags: '@critical' }, () => {
      cy.section('Invite member')
      TeamPage.openInviteModal()
        .fillInviteForm(member)
        .submitInvite()

      TeamPage.shouldHaveInviteModalClosed()
      cy.getByHook(SHARED.toast.testId).should('contain.text', member.email)
      TeamPage.rowCount().invoke('text').then((text) => {
        expect(parseInt(text, 10)).to.be.greaterThan(6)
      })
    })
```

- **Given:** factory gera membro único por teste (`name`, `email`, `role`).
- **When:** abre modal, preenche form, submete ou valida campos vazios.
- **Then:** erros de validação aparecem; convite bem-sucedido fecha modal, exibe toast e incrementa contador > 6.

**Intercept de payload:**

```javascript
    it('invite request contains name and email in the payload', () => {
      cy.interceptInvite()

      TeamPage.openInviteModal()
        .fillInviteForm(member)
        .submitInvite()

      cy.get('@inviteApi').then((interception) => {
        if (interception) {
          expect(interception.request.body).to.include.keys('name', 'email')
          expect(interception.request.body.email).to.eq(member.email)
        }
      })
    })
```

- **Given:** intercept registrado antes do submit.
- **When:** convite é enviado ao backend.
- **Then:** body da request contém `name` e `email` corretos.

---

### Bloco 7 — Edição inline e frameworks

```javascript
  context('Inline editing', () => {
    it('updates the row after saving a new name', () => {
      TeamPage.startEdit(1)
        .editName(1, 'Alice QA Updated')
        .saveEdit(1)

      TeamPage.nameCell(1).should('contain.text', 'Alice QA Updated')
    })

    it('discards changes on Cancel', () => {
      TeamPage.startEdit(1)
        .editName(1, 'Should Not Save')
        .cancelEdit(1)

      TeamPage.nameCell(1).should('not.contain.text', 'Should Not Save')
    })
  })

  context('Framework list filter', () => {
    it('filters the framework list', () => {
      TeamPage.frameworkSearch().type('play')
      TeamPage.frameworkList()
        .find('li')
        .each(($li) => {
          expect($li.text().toLowerCase()).to.include('play')
        })
    })
  })
```

- **Given:** linha editável e lista lateral de frameworks.
- **When:** entra em modo edit, altera nome, salva ou cancela; filtra frameworks por "play".
- **Then:** nome persiste ou reverte; apenas frameworks matching permanecem visíveis.

---

## Como executar

```bash
npx cypress run --spec cypress/e2e/team/team.cy.js

# Smoke + critical
npx cypress run --spec cypress/e2e/team/team.cy.js --env grepTags="@smoke|@critical"
```

---

## Referências relacionadas

- Page Object: [`TeamPage.js`](../../../../cypress/pages/TeamPage.js)
- Factory: [`cypress/support/factories/`](../../../../cypress/support/factories/)
- Fixture: [`team-member.json`](../../../../cypress/fixtures/team-member.json)
- Intercepts: [`interceptions.js`](../../../../cypress/support/commands/interceptions.js)
- Element map: [`elements.js`](../../../../cypress/support/elements.js)
