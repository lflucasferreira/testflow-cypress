# Cypress — Perguntas Técnicas para Entrevistas

> Banco de perguntas para entrevistas com recrutadores técnicos, QA leads, SDETs e engenheiros de software.  
> Cobertura baseada no conteúdo dos slides (`docs/slides/index.html`) + tópicos frequentes em empresas brasileiras e internacionais.  
> **Legenda:** `[SLIDE]` = abordado na apresentação · `[EXTRA]` = comum em entrevistas, fora dos slides.

---

## Índice

1. [Conceitos Fundamentais](#1-conceitos-fundamentais)
2. [Arquitetura Interna do Cypress](#2-arquitetura-interna-do-cypress)
3. [Instalação e Configuração](#3-instalação-e-configuração)
4. [Estrutura de Projeto e Organização](#4-estrutura-de-projeto-e-organização)
5. [Comandos e API Fluente](#5-comandos-e-api-fluente)
6. [Seletores e Estratégias de Locators](#6-seletores-e-estratégias-de-locators)
7. [Assertions e Retry Logic](#7-assertions-e-retry-logic)
8. [cy.intercept, Mock e Spy](#8-cyintercept-mock-e-spy)
9. [cy.request e API Testing](#9-cyrequest-e-api-testing)
10. [Comandos Customizados](#10-comandos-customizados)
11. [Page Object Model (POM)](#11-page-object-model-pom)
12. [Fixtures, Factories e Dados de Teste](#12-fixtures-factories-e-dados-de-teste)
13. [cy.session e Autenticação](#13-cysession-e-autenticação)
14. [Component Testing (cy.mount)](#14-component-testing-cymount)
15. [Shadow DOM e Casos Especiais](#15-shadow-dom-e-casos-especiais)
16. [cy.task, Node Events e Integração com Backend](#16-cytask-node-events-e-integração-com-backend)
17. [Multi-ambiente, CI/CD e Execução](#17-multi-ambiente-cicd-e-execução)
18. [Relatórios, Tags e Observabilidade](#18-relatórios-tags-e-observabilidade)
19. [Flakiness, Debugging e Estabilidade](#19-flakiness-debugging-e-estabilidade)
20. [Acessibilidade e Qualidade](#20-acessibilidade-e-qualidade)
21. [Comparações com Outras Ferramentas](#21-comparações-com-outras-ferramentas)
22. [Padrões Avançados e Enterprise](#22-padrões-avançados-e-enterprise)
23. [Segurança e Boas Práticas](#23-segurança-e-boas-práticas)
24. [Cenários Comportamentais e Situação-Problema](#24-cenários-comportamentais-e-situação-problema)
25. [Perguntas de Recrutador / Screening](#25-perguntas-de-recrutador--screening)

---

## 1. Conceitos Fundamentais

| # | Pergunta | Tag |
|---|----------|-----|
| 1.1 | O que é o Cypress e para que tipo de testes ele foi projetado? | `[SLIDE]` |
| 1.2 | Qual a diferença entre teste E2E, teste de integração e teste de componente no contexto Cypress? | `[SLIDE]` |
| 1.3 | Por que o Cypress roda dentro do browser e não usa WebDriver/Selenium? | `[SLIDE]` `[EXTRA]` |
| 1.4 | O Cypress substitui testes unitários? Por quê? | `[EXTRA]` |
| 1.5 | Quais linguagens o Cypress suporta oficialmente? | `[SLIDE]` |
| 1.6 | O Cypress funciona com aplicações mobile nativas (iOS/Android)? | `[EXTRA]` |
| 1.7 | O Cypress suporta testes em múltiplas abas (multi-tab)? | `[EXTRA]` |
| 1.8 | O Cypress consegue testar aplicações em iframes de domínios diferentes? | `[EXTRA]` |
| 1.9 | Qual a diferença entre `cypress open` e `cypress run`? | `[SLIDE]` |
| 1.10 | Em que cenário você escolheria Cypress em vez de Playwright ou Selenium? | `[EXTRA]` |
| 1.11 | O Cypress é uma ferramenta de teste ou também de desenvolvimento/debug? | `[SLIDE]` |
| 1.12 | O que significa "time-travel debugging" no Cypress? | `[SLIDE]` |
| 1.13 | O Cypress grava vídeo e screenshot automaticamente? Em quais condições? | `[SLIDE]` `[EXTRA]` |
| 1.14 | Qual a diferença entre Cypress 12, 13 e 14? O que mudou na config? | `[EXTRA]` |
| 1.15 | O Cypress é open source? Qual o modelo de licenciamento do Cypress Cloud/Dashboard? | `[EXTRA]` |

---

## 2. Arquitetura Interna do Cypress

| # | Pergunta | Tag |
|---|----------|-----|
| 2.1 | Explique a arquitetura do Cypress: Test Runner, Browser, Node process. | `[EXTRA]` |
| 2.2 | O que é a "command queue" do Cypress e por que os comandos são assíncronos mas não usam `async/await`? | `[EXTRA]` |
| 2.3 | Por que `cy.get()` não retorna uma Promise e o que acontece se você fizer `const el = cy.get('button')`? | `[EXTRA]` |
| 2.4 | O que é "chaining" na API do Cypress? Por que `.then()` quebra a chain em alguns casos? | `[EXTRA]` |
| 2.5 | Qual a diferença entre comandos parent, child e dual no Cypress? | `[EXTRA]` |
| 2.6 | O que é o `AUT` (Application Under Test) no contexto Cypress? | `[EXTRA]` |
| 2.7 | Como o Cypress injeta código na aplicação sendo testada? | `[EXTRA]` |
| 2.8 | Por que o Cypress não suporta nativamente múltiplos browsers ao mesmo tempo em um único `cypress run`? | `[EXTRA]` |
| 2.9 | Quais browsers o Cypress suporta oficialmente (Chrome, Firefox, Edge, Electron, WebKit)? | `[EXTRA]` |
| 2.10 | O que é o protocolo de automação usado pelo Cypress vs CDP (Chrome DevTools Protocol)? | `[EXTRA]` |
| 2.11 | Como funciona o mecanismo de retry automático nas assertions? | `[SLIDE]` `[EXTRA]` |
| 2.12 | O Cypress roda em Electron por padrão — qual a implicação disso no CI? | `[EXTRA]` |

---

## 3. Instalação e Configuração

| # | Pergunta | Tag |
|---|----------|-----|
| 3.1 | Quais são os pré-requisitos para instalar o Cypress? | `[SLIDE]` |
| 3.2 | Qual a diferença entre instalar Cypress globalmente vs `--save-dev` no projeto? | `[SLIDE]` `[EXTRA]` |
| 3.3 | O que acontece na primeira execução de `npx cypress open`? | `[SLIDE]` |
| 3.4 | Qual a diferença entre `cypress.config.js` e `cypress.config.ts`? | `[EXTRA]` |
| 3.5 | Para que serve a opção `baseUrl` na config? | `[SLIDE]` |
| 3.6 | O que é `specPattern` e como filtrar quais specs rodam? | `[SLIDE]` |
| 3.7 | Qual a função de `supportFile` (`e2e.js` / `e2e.ts`)? | `[SLIDE]` |
| 3.8 | Como configurar `viewportWidth` e `viewportHeight`? Quando usar `cy.viewport()`? | `[SLIDE]` |
| 3.9 | O que faz `defaultCommandTimeout`? Qual valor você usaria em apps lentos? | `[SLIDE]` `[EXTRA]` |
| 3.10 | Qual a diferença entre `pageLoadTimeout`, `requestTimeout` e `responseTimeout`? | `[EXTRA]` |
| 3.11 | Para que serve `chromeWebSecurity: false`? Quais os riscos? | `[SLIDE]` `[EXTRA]` |
| 3.12 | O que é `testIsolation`? Quando usar `true` vs `false`? | `[SLIDE]` `[EXTRA]` |
| 3.13 | O que faz `experimentalMemoryManagement` e `numTestsKeptInMemory`? | `[SLIDE]` |
| 3.14 | Como bloquear hosts externos com `blockHosts`? | `[SLIDE]` |
| 3.15 | O que é `includeShadowDom` na config? | `[SLIDE]` |
| 3.16 | Como passar variáveis via `Cypress.env()` e `--env` na CLI? | `[SLIDE]` `[EXTRA]` |
| 3.17 | Qual a diferença entre `cypress.env.json`, `Cypress.env` e variáveis de ambiente do SO? | `[EXTRA]` |
| 3.18 | Como configurar múltiplos ambientes (dev, staging, prod) em um único projeto? | `[SLIDE]` `[EXTRA]` |
| 3.19 | O que é `setupNodeEvents(on, config)` e quando você precisa dele? | `[SLIDE]` `[EXTRA]` |
| 3.20 | Como configurar retries em `runMode` vs `openMode`? | `[SLIDE]` |

---

## 4. Estrutura de Projeto e Organização

| # | Pergunta | Tag |
|---|----------|-----|
| 4.1 | Descreva a estrutura padrão de pastas `cypress/` após a instalação. | `[SLIDE]` |
| 4.2 | Qual a diferença entre `cypress/e2e/`, `cypress/commands/` e `cypress/support/`? | `[SLIDE]` |
| 4.3 | Onde colocar fixtures? Quando usar JSON estático vs factory dinâmica? | `[SLIDE]` |
| 4.4 | Como organizar specs por feature vs por tipo de teste (smoke, regression)? | `[SLIDE]` `[EXTRA]` |
| 4.5 | Qual convenção de nomenclatura para arquivos `.cy.js` / `.cy.ts`? | `[SLIDE]` `[EXTRA]` |
| 4.6 | Um arquivo de spec deve testar uma feature ou múltiplas? Justifique. | `[SLIDE]` `[EXTRA]` |
| 4.7 | Onde colocar Page Objects — `cypress/pages/` vs `cypress/support/pages/`? | `[SLIDE]` `[EXTRA]` |
| 4.8 | Como separar helpers de intercept (`commands/interceptions.js`) de actions (`commands/actions.js`)? | `[SLIDE]` |
| 4.9 | Como organizar enums, timeouts e viewports em `support/@enums/`? | `[SLIDE]` |
| 4.10 | Como versionar credenciais e secrets sem commitar no repositório? | `[SLIDE]` `[EXTRA]` |
| 4.11 | Qual a estratégia para monorepos com múltiplos frontends? | `[EXTRA]` |
| 4.12 | Como estruturar testes API puros vs E2E na mesma base de código? | `[SLIDE]` |

---

## 5. Comandos e API Fluente

| # | Pergunta | Tag |
|---|----------|-----|
| 5.1 | Para que serve `cy.visit()`? Como usar com `baseUrl`? | `[SLIDE]` |
| 5.2 | Qual a diferença entre `cy.get()`, `cy.contains()` e `cy.find()`? | `[SLIDE]` |
| 5.3 | Quando usar `.eq(n)` em uma lista de elementos? | `[SLIDE]` |
| 5.4 | O que faz `cy.reload()` e quando é necessário após mock de API? | `[SLIDE]` |
| 5.5 | Para que serve `cy.window()`? Dê um exemplo com localStorage/sessionStorage. | `[SLIDE]` `[EXTRA]` |
| 5.6 | Como digitar em um input com `.type()`? O que faz `{ log: false }`? | `[SLIDE]` |
| 5.7 | Quando usar `{ force: true }` no `.click()`? Quais os riscos? | `[SLIDE]` `[EXTRA]` |
| 5.8 | Qual a diferença entre `.clear()` e selecionar tudo + delete? | `[SLIDE]` |
| 5.9 | Como interagir com `<select>` nativo usando `.select()`? | `[SLIDE]` |
| 5.10 | Como simular teclas especiais (`{esc}`, `{enter}`, `{tab}`)? | `[SLIDE]` |
| 5.11 | Para que serve `.scrollIntoView()`? | `[SLIDE]` |
| 5.12 | Como navegar no DOM com `.parent()`, `.siblings()`, `.children()`? | `[SLIDE]` |
| 5.13 | Qual a diferença entre `.check()` / `.uncheck()` e `.click()` em checkbox? | `[SLIDE]` |
| 5.14 | O que é `cy.wrap()` e quando usá-lo? | `[SLIDE]` |
| 5.15 | O que é `cy.each()` e como iterar linhas de tabela? | `[SLIDE]` |
| 5.16 | Como usar `cy.stub()` para mockar `window.confirm` e `window.alert`? | `[SLIDE]` |
| 5.17 | Como capturar eventos com `cy.on('window:alert')` e `cy.on('window:confirm')`? | `[SLIDE]` |
| 5.18 | O que faz `Cypress.on('uncaught:exception')`? Quando é aceitável ignorar exceções? | `[SLIDE]` `[EXTRA]` |
| 5.19 | Qual a diferença entre `cy.wait(ms)` e `cy.wait('@alias')`? | `[SLIDE]` `[EXTRA]` |
| 5.20 | Por que `cy.wait(5000)` é considerado anti-pattern? | `[EXTRA]` |
| 5.21 | Como fazer upload de arquivo com `cy.selectFile()`? | `[EXTRA]` |
| 5.22 | Como testar download de arquivos no Cypress? | `[EXTRA]` |
| 5.23 | Como interagir com elementos `contenteditable`? | `[EXTRA]` |
| 5.24 | Como testar drag-and-drop com `.trigger()` ou comandos nativos? | `[EXTRA]` |
| 5.25 | O que é `cy.origin()` e quando é necessário (cross-origin)? | `[EXTRA]` |
| 5.26 | Como usar `cy.clock()` e `cy.tick()` para controlar timers? | `[EXTRA]` |
| 5.27 | Como lidar com animações CSS que impedem `.click()`? | `[EXTRA]` |

---

## 6. Seletores e Estratégias de Locators

| # | Pergunta | Tag |
|---|----------|-----|
| 6.1 | Por que `data-cy-hook` / `data-testid` é preferível a classes CSS? | `[SLIDE]` |
| 6.2 | Qual a diferença entre `data-cy`, `data-testid` e `data-cy-hook`? | `[SLIDE]` `[EXTRA]` |
| 6.3 | Como implementar `cy.getByHook()` como comando customizado? | `[SLIDE]` |
| 6.4 | Quando usar seletores CSS vs atributos ARIA (`role`, `aria-label`)? | `[SLIDE]` `[EXTRA]` |
| 6.5 | O Cypress suporta seletores XPath? Como habilitar? | `[EXTRA]` |
| 6.6 | Como selecionar elementos dentro de Shadow DOM com `.shadow()`? | `[SLIDE]` |
| 6.7 | O que é um seletor "brittle" (frágil)? Dê exemplos. | `[EXTRA]` |
| 6.8 | Como evitar seletores acoplados a texto que muda com i18n? | `[SLIDE]` `[EXTRA]` |
| 6.9 | Quando `cy.contains('texto')` é aceitável vs quando evitar? | `[SLIDE]` |
| 6.10 | Como selecionar elementos em tabelas dinâmicas por `data-row-id`? | `[SLIDE]` |
| 6.11 | Qual a hierarquia recomendada de seletores (Testing Library mindset)? | `[EXTRA]` |
| 6.12 | Como lidar com elementos duplicados no DOM (mesmo `data-testid`)? | `[SLIDE]` `[EXTRA]` |

---

## 7. Assertions e Retry Logic

| # | Pergunta | Tag |
|---|----------|-----|
| 7.1 | Qual a diferença entre `.should()` e `.and()`? | `[SLIDE]` |
| 7.2 | Quando usar `.should('exist')` vs `.should('be.visible')`? | `[SLIDE]` |
| 7.3 | Como validar texto parcial com `.should('contain.text', ...)`? | `[SLIDE]` |
| 7.4 | Como contar elementos com `.should('have.length', n)`? | `[SLIDE]` |
| 7.5 | Como validar atributos HTML com `.should('have.attr', ...)`? | `[SLIDE]` |
| 7.6 | Como validar classes CSS com `.should('have.class', ...)`? | `[SLIDE]` |
| 7.7 | Como usar regex em assertions com `.should('match', /regex/)`? | `[SLIDE]` |
| 7.8 | O que faz `.invoke('text')` e `.its('property')`? | `[SLIDE]` |
| 7.9 | Qual a diferença entre Chai (`expect`) e Cypress assertions? | `[EXTRA]` |
| 7.10 | Por que assertions do Cypress fazem retry mas `expect()` puro dentro de `.then()` não? | `[EXTRA]` |
| 7.11 | Como fazer assertion negativa com `.should('not.exist')`? | `[SLIDE]` |
| 7.12 | Como validar que um elemento desapareceu após ação async? | `[SLIDE]` `[EXTRA]` |
| 7.13 | Como usar `should(callback)` com lógica customizada? | `[EXTRA]` |
| 7.14 | O que é "assertion timeout" e como configurá-lo por comando? | `[SLIDE]` `[EXTRA]` |
| 7.15 | Como validar estado de checkbox/radio com `.should('be.checked')`? | `[EXTRA]` |

---

## 8. cy.intercept, Mock e Spy

| # | Pergunta | Tag |
|---|----------|-----|
| 8.1 | O que é `cy.intercept()` e como ele substitui `cy.route()` (legado)? | `[SLIDE]` `[EXTRA]` |
| 8.2 | Qual a diferença entre spy (observar) e mock (simular resposta)? | `[SLIDE]` |
| 8.3 | Como criar alias com `.as('nomeAlias')` e aguardar com `cy.wait('@nomeAlias')`? | `[SLIDE]` |
| 8.4 | Como inspecionar request body com `cy.get('@alias').its('request.body')`? | `[SLIDE]` |
| 8.5 | Como mockar resposta de erro (401, 500) sem alterar o backend? | `[SLIDE]` |
| 8.6 | Como usar fixture em intercept: `{ fixture: 'arquivo.json' }`? | `[SLIDE]` |
| 8.7 | Como mutar response em tempo real com `req.reply(({ body }) => { ... })`? | `[SLIDE]` |
| 8.8 | Como interceptar apenas requests que correspondem a um regex de URL? | `[SLIDE]` |
| 8.9 | Como interceptar métodos HTTP específicos (GET, POST, PATCH, DELETE)? | `[SLIDE]` |
| 8.10 | O que acontece se o intercept for registrado depois do request? | `[EXTRA]` |
| 8.11 | Como garantir ordem de múltiplos intercepts no mesmo fluxo? | `[EXTRA]` |
| 8.12 | Como mockar GraphQL com `cy.intercept`? | `[EXTRA]` |
| 8.13 | Como simular latência de rede no intercept? | `[EXTRA]` |
| 8.14 | Como interceptar WebSocket no Cypress? | `[EXTRA]` |
| 8.15 | Qual a diferença entre stub de rede (intercept) e stub de função (`cy.stub`)? | `[SLIDE]` `[EXTRA]` |
| 8.16 | Como criar helpers reutilizáveis como `interceptGetProfile()`? | `[SLIDE]` |
| 8.17 | Como alterar headers de request no intercept? | `[SLIDE]` |
| 8.18 | O intercept funciona em Component Testing da mesma forma que em E2E? | `[SLIDE]` |

---

## 9. cy.request e API Testing

| # | Pergunta | Tag |
|---|----------|-----|
| 9.1 | Qual a diferença entre testar API com `cy.request` vs Postman/Newman? | `[SLIDE]` `[EXTRA]` |
| 9.2 | O `cy.request` passa pelo browser ou vai direto ao Node? | `[EXTRA]` |
| 9.3 | Como fazer autenticação via API e reutilizar token/cookies na UI? | `[SLIDE]` |
| 9.4 | O que faz `failOnStatusCode: false`? | `[SLIDE]` |
| 9.5 | Como validar status code e shape do body em API tests? | `[SLIDE]` |
| 9.6 | Como implementar `cy.apiWithAuth()` para injetar Bearer token? | `[SLIDE]` |
| 9.7 | Qual a arquitetura "write API + read API" para validar persistência? | `[SLIDE]` |
| 9.8 | O que é JSON Patch (RFC 6902) e por que usar `application/json-patch+json`? | `[SLIDE]` |
| 9.9 | Qual a diferença entre `patch` (happy path) e `tryPatch` (negative tests)? | `[SLIDE]` |
| 9.10 | Como testar OAuth client credentials flow no `before()`? | `[SLIDE]` |
| 9.11 | Como implementar retry com backoff exponencial após PATCH assíncrono? | `[SLIDE]` |
| 9.12 | O que é um Test Suite Builder e como ele reduz duplicação em API tests? | `[SLIDE]` |
| 9.13 | Como gerar cenários de validação parametrizados (caracteres inválidos, max length)? | `[SLIDE]` |
| 9.14 | Como testar idempotência de endpoints (PATCH duplicado)? | `[SLIDE]` |
| 9.15 | Como usar `Correlation-Id` para rastreabilidade em testes de API? | `[SLIDE]` |
| 9.16 | Como validar contrato de API com JSON Schema no Cypress? | `[EXTRA]` |
| 9.17 | Como testar rate limiting e headers de segurança em APIs? | `[EXTRA]` |
| 9.18 | Como testar upload multipart/form-data com `cy.request`? | `[EXTRA]` |
| 9.19 | Como encadear múltiplas chamadas API dependentes (criar → ler → deletar)? | `[EXTRA]` |
| 9.20 | Quando API tests no Cypress são suficientes sem E2E UI? | `[SLIDE]` `[EXTRA]` |

---

## 10. Comandos Customizados

| # | Pergunta | Tag |
|---|----------|-----|
| 10.1 | Como criar um comando customizado com `Cypress.Commands.add()`? | `[SLIDE]` |
| 10.2 | Qual a diferença entre comando parent e child command? | `[EXTRA]` |
| 10.3 | Como sobrescrever um comando existente com `Cypress.Commands.overwrite()`? | `[EXTRA]` |
| 10.4 | Como fazer um comando retornar `this` para chaining (fluent interface)? | `[SLIDE]` |
| 10.5 | Como tipar comandos customizados em TypeScript (`Chainable` interface)? | `[EXTRA]` |
| 10.6 | Quando encapsular fluxo em comando vs Page Object vs função utilitária? | `[SLIDE]` `[EXTRA]` |
| 10.7 | Como criar `cy.signInViaUI()` vs `cy.signInViaAPI()`? | `[SLIDE]` |
| 10.8 | Como criar comandos compostos como `cy.completePhoneVerification()`? | `[SLIDE]` |
| 10.9 | Como criar helpers de tabela: `cy.getTableRows()`, `cy.getTableCell()`? | `[SLIDE]` |
| 10.10 | Como criar `cy.assertResponseShape(obj, schema)` para validação de tipos? | `[SLIDE]` |
| 10.11 | Como registrar comandos em arquivo separado e importar no `e2e.js`? | `[SLIDE]` `[EXTRA]` |
| 10.12 | Quais os riscos de criar muitos comandos customizados? | `[EXTRA]` |

---

## 11. Page Object Model (POM)

| # | Pergunta | Tag |
|---|----------|-----|
| 11.1 | O que é Page Object Model e quais problemas ele resolve? | `[SLIDE]` |
| 11.2 | O que deve ir no Page Object: selectors, actions ou assertions? | `[SLIDE]` `[EXTRA]` |
| 11.3 | Page Object deve ser classe instanciada ou singleton exportado? | `[SLIDE]` `[EXTRA]` |
| 11.4 | Como estruturar métodos que retornam `this` para fluent API? | `[SLIDE]` |
| 11.5 | Como o spec fica legível com POM + padrão Given/When/Then? | `[SLIDE]` |
| 11.6 | Qual a diferença entre POM com Page classes (E2E) e Hook Maps (Component)? | `[SLIDE]` |
| 11.7 | O POM viola DRY se dois pages compartilham o mesmo modal? | `[EXTRA]` |
| 11.8 | Como lidar com componentes compartilhados (header, sidebar) no POM? | `[EXTRA]` |
| 11.9 | Screenplay Pattern vs POM — quando migrar? | `[EXTRA]` |
| 11.10 | Como testar wizard multi-step com Page Objects? | `[SLIDE]` |
| 11.11 | O POM esconde demais a intenção do teste? Argumente a favor e contra. | `[EXTRA]` |
| 11.12 | Como versionar Page Objects quando a UI muda drasticamente? | `[EXTRA]` |

---

## 12. Fixtures, Factories e Dados de Teste

| # | Pergunta | Tag |
|---|----------|-----|
| 12.1 | O que são fixtures no Cypress e onde ficam armazenadas? | `[SLIDE]` |
| 12.2 | Como carregar fixture com `cy.fixture()` e alias com `.as()`? | `[SLIDE]` |
| 12.3 | Qual a diferença entre fixture estática e factory dinâmica com Faker? | `[SLIDE]` |
| 12.4 | Quando usar `@faker-js/faker` vs dados fixos? | `[SLIDE]` |
| 12.5 | Como criar `ContactFactory.createEmail({ verified: false })`? | `[SLIDE]` |
| 12.6 | Como evitar PII real em fixtures de teste? | `[SLIDE]` `[EXTRA]` |
| 12.7 | Como organizar fixtures por domínio (`users/`, `addresses/`, `lookups/`)? | `[SLIDE]` |
| 12.8 | Como usar `cy.wrap()` para re-enfileirar dados de factory na chain? | `[SLIDE]` |
| 12.9 | Como gerar dados válidos por país (`generateTaxId('CA')`)? | `[SLIDE]` |
| 12.10 | Como combinar fixture + intercept para mock de lookup? | `[SLIDE]` |
| 12.11 | Como resetar estado de dados entre testes (seed/cleanup)? | `[SLIDE]` `[EXTRA]` |
| 12.12 | Como lidar com dados compartilhados que causam dependência entre testes? | `[EXTRA]` |

---

## 13. cy.session e Autenticação

| # | Pergunta | Tag |
|---|----------|-----|
| 13.1 | O que é `cy.session()` e qual problema de performance ele resolve? | `[SLIDE]` |
| 13.2 | Qual a diferença entre `cy.session` e `beforeEach` com login manual? | `[SLIDE]` |
| 13.3 | O que faz a função `validate()` dentro de `cy.session`? | `[SLIDE]` |
| 13.4 | O que é `cacheAcrossSpecs` e quando habilitar? | `[SLIDE]` |
| 13.5 | Como combinar `cy.session` com seed de API (`cy.seedAuthToken`)? | `[SLIDE]` |
| 13.6 | Como fazer login programático preservando cookies vs localStorage JWT? | `[SLIDE]` `[EXTRA]` |
| 13.7 | Como testar fluxos com MFA/2FA no Cypress? | `[EXTRA]` |
| 13.8 | Como testar SSO/OAuth redirect flows (Auth0, Okta, Google)? | `[EXTRA]` |
| 13.9 | Como usar `cy.session` com diferentes perfis de usuário (admin, viewer)? | `[SLIDE]` `[EXTRA]` |
| 13.10 | O que acontece quando a sessão expira no meio da suíte? | `[SLIDE]` `[EXTRA]` |
| 13.11 | Como limpar sessão entre ambientes no CI? | `[EXTRA]` |
| 13.12 | `cy.session` funciona em Component Testing? | `[SLIDE]` |

---

## 14. Component Testing (cy.mount)

| # | Pergunta | Tag |
|---|----------|-----|
| 14.1 | O que é Component Testing no Cypress e como difere de E2E? | `[SLIDE]` |
| 14.2 | Como configurar `component.devServer` para React/Vue/Angular? | `[SLIDE]` `[EXTRA]` |
| 14.3 | O que faz `cy.mount(Component)` e quais opções aceita? | `[SLIDE]` |
| 14.4 | Como injetar providers (theme, i18n, Redux) no mount? | `[SLIDE]` |
| 14.5 | Como testar componente Angular com `cy.mount` e `imports/providers`? | `[SLIDE]` |
| 14.6 | O que é `createOutputSpy()` e como espiar eventos de output? | `[SLIDE]` |
| 14.7 | Como testar validação de formulário on blur em componente isolado? | `[SLIDE]` |
| 14.8 | Como parametrizar testes de componente com array de casos (`cases.forEach`)? | `[SLIDE]` |
| 14.9 | Como testar responsividade com `cy.viewport()` em component tests? | `[SLIDE]` |
| 14.10 | Quando Component Test substitui E2E e quando não substitui? | `[SLIDE]` |
| 14.11 | Como mockar API em component test com `cy.intercept`? | `[SLIDE]` |
| 14.12 | Como testar componentes de design system (dropdown, radio, modal)? | `[SLIDE]` |
| 14.13 | Component tests rodam mais rápido que E2E — quantifique o ganho esperado. | `[EXTRA]` |
| 14.14 | Como integrar Component Testing com Storybook? | `[EXTRA]` |
| 14.15 | Como lidar com CSS modules / styled-components em component tests? | `[EXTRA]` |
| 14.16 | Como testar hooks customizados React isoladamente no Cypress? | `[EXTRA]` |

---

## 15. Shadow DOM e Casos Especiais

| # | Pergunta | Tag |
|---|----------|-----|
| 15.1 | Como acessar elementos dentro de Shadow DOM com `.shadow()`? | `[SLIDE]` |
| 15.2 | O que faz `includeShadowDom: true` na config global? | `[SLIDE]` |
| 15.3 | Como testar Web Components customizados? | `[SLIDE]` `[EXTRA]` |
| 15.4 | Como testar canvas, charts (Chart.js, D3) no Cypress? | `[EXTRA]` |
| 15.5 | Como testar editores rich text (TinyMCE, Quill)? | `[EXTRA]` |
| 15.6 | Como testar date pickers de terceiros (react-datepicker, MUI)? | `[EXTRA]` |
| 15.7 | Como testar infinite scroll e lazy loading? | `[EXTRA]` |
| 15.8 | Como testar aplicações com Server-Side Rendering (Next.js, Nuxt)? | `[EXTRA]` |
| 15.9 | Como testar aplicações com Web Workers? | `[EXTRA]` |
| 15.10 | Como lidar com CAPTCHA em testes E2E? | `[EXTRA]` |

---

## 16. cy.task, Node Events e Integração com Backend

| # | Pergunta | Tag |
|---|----------|-----|
| 16.1 | O que é `cy.task()` e por que algumas operações só rodam no Node? | `[SLIDE]` |
| 16.2 | Como registrar tasks em `setupNodeEvents(on, config)`? | `[SLIDE]` |
| 16.3 | Como fazer seed/reset direto no banco via `cy.task('resetDb')`? | `[SLIDE]` |
| 16.4 | Qual a diferença entre `cy.task` e `cy.exec`? | `[EXTRA]` |
| 16.5 | Como ler/escrever arquivos do filesystem em testes com tasks? | `[EXTRA]` |
| 16.6 | Como integrar Cypress com Docker Compose para subir dependências? | `[EXTRA]` |
| 16.7 | Como aguardar serviço ficar healthy antes de rodar specs? | `[EXTRA]` |
| 16.8 | Como usar `cy.task('logJson', body)` para debug no CI? | `[SLIDE]` |
| 16.9 | Como conectar Cypress a banco SQL/NoSQL para assertions de dados? | `[EXTRA]` |
| 16.10 | Quais operações NÃO devem ser feitas via `cy.task` (anti-patterns)? | `[EXTRA]` |

---

## 17. Multi-ambiente, CI/CD e Execução

| # | Pergunta | Tag |
|---|----------|-----|
| 17.1 | Como rodar specs específicos com `--spec`? | `[SLIDE]` |
| 17.2 | Como paralelizar testes no CI (Cypress Cloud, Sorry Cypress, Currents)? | `[EXTRA]` |
| 17.3 | Como configurar GitHub Actions para Cypress com cache e artifacts? | `[EXTRA]` |
| 17.4 | O que publicar como artifact em falha (screenshots, vídeos, reports)? | `[SLIDE]` `[EXTRA]` |
| 17.5 | Como rodar Cypress em Docker (`cypress/included` image)? | `[EXTRA]` |
| 17.6 | Como configurar `start-server-and-test` para subir app antes dos testes? | `[EXTRA]` |
| 17.7 | Como passar secrets do CI (`DEMO_PASSWORD`) sem expor em logs? | `[SLIDE]` `[EXTRA]` |
| 17.8 | Como executar smoke vs regression em pipelines diferentes? | `[SLIDE]` `[EXTRA]` |
| 17.9 | Como usar `--record --key` com Cypress Dashboard? | `[EXTRA]` |
| 17.10 | Como dividir specs em máquinas paralelas por tempo estimado? | `[EXTRA]` |
| 17.11 | Como rodar testes em browser específico: `--browser chrome`? | `[EXTRA]` |
| 17.12 | Como configurar `retries` só no CI e não localmente? | `[SLIDE]` |
| 17.13 | Como executar testes contra ambiente remoto (staging URL)? | `[SLIDE]` |
| 17.14 | Como integrar Cypress com pipeline GitLab CI / Azure DevOps / Jenkins? | `[EXTRA]` |
| 17.15 | Qual estratégia de gate: bloquear merge se smoke falhar? | `[EXTRA]` |

---

## 18. Relatórios, Tags e Observabilidade

| # | Pergunta | Tag |
|---|----------|-----|
| 18.1 | Como configurar `cypress-mochawesome-reporter`? | `[SLIDE]` |
| 18.2 | Qual a diferença entre report HTML e JSON no CI? | `[SLIDE]` |
| 18.3 | O que faz `cy.section()` e `cy.step()` (plugin cypress-plugin-steps)? | `[SLIDE]` |
| 18.4 | Como filtrar specs por tags com `@bahmutov/cy-grep`? | `[SLIDE]` |
| 18.5 | Como rodar apenas `@smoke` ou `@smoke+@critical` na CLI? | `[SLIDE]` |
| 18.6 | O que é `grepFilterSpecs: true`? | `[SLIDE]` |
| 18.7 | Como integrar resultados Cypress com Jira/Xray ou TestRail? | `[EXTRA]` |
| 18.8 | Como nomear testes com IDs rastreáveis (`[TC-0001]`)? | `[SLIDE]` |
| 18.9 | Como fazer merge de múltiplos JSON reports (`mochawesome-merge`)? | `[EXTRA]` |
| 18.10 | Como adicionar contexto customizado ao report (ambiente, build ID)? | `[EXTRA]` |
| 18.11 | Como medir duração de testes e identificar os mais lentos? | `[EXTRA]` |
| 18.12 | Como configurar notificação Slack/Teams em falha de pipeline? | `[EXTRA]` |

---

## 19. Flakiness, Debugging e Estabilidade

| # | Pergunta | Tag |
|---|----------|-----|
| 19.1 | O que é test flakiness e por que E2E é mais suscetível? | `[EXTRA]` |
| 19.2 | Quais são as causas mais comuns de testes flaky no Cypress? | `[EXTRA]` |
| 19.3 | Por que evitar `cy.wait(tempoFixo)` e o que usar no lugar? | `[EXTRA]` |
| 19.4 | Como debugar teste que passa em `open` mas falha em `run` (headless)? | `[EXTRA]` |
| 19.5 | Como usar o Time Travel no runner para inspecionar estado de cada comando? | `[SLIDE]` |
| 19.6 | Como usar `cy.pause()` e `debugger` para debug interativo? | `[EXTRA]` |
| 19.7 | Como isolar teste flaky com `.only` temporariamente (e por que remover depois)? | `[EXTRA]` |
| 19.8 | Como `retries: { runMode: 2 }` ajuda vs mascara bugs reais? | `[SLIDE]` `[EXTRA]` |
| 19.9 | Como lidar com race condition entre UI e API? | `[SLIDE]` `[EXTRA]` |
| 19.10 | Como estabilizar testes que dependem de data/hora atual? | `[EXTRA]` |
| 19.11 | Como lidar com animações e transições que causam falha intermitente? | `[EXTRA]` |
| 19.12 | Como investigar "element detached from DOM" errors? | `[EXTRA]` |
| 19.13 | Como usar Cypress Cloud para detectar flaky tests automaticamente? | `[EXTRA]` |
| 19.14 | Qual sua estratégia quando 10% da suíte é flaky antes de um release? | `[EXTRA]` |

---

## 20. Acessibilidade e Qualidade

| # | Pergunta | Tag |
|---|----------|-----|
| 20.1 | Como integrar `cypress-axe` para testes de acessibilidade? | `[SLIDE]` |
| 20.2 | Quando rodar `cy.checkA11y()` — em todo teste ou smoke dedicado? | `[SLIDE]` `[EXTRA]` |
| 20.3 | Como testar navegação por teclado (Tab, Enter, Escape)? | `[SLIDE]` `[EXTRA]` |
| 20.4 | Como validar roles ARIA e labels em componentes? | `[SLIDE]` |
| 20.5 | Qual a diferença entre teste funcional e teste de acessibilidade automatizado? | `[EXTRA]` |
| 20.6 | O que o axe não detecta e precisa de teste manual? | `[EXTRA]` |
| 20.7 | Como configurar regras axe para ignorar falsos positivos conhecidos? | `[EXTRA]` |
| 20.8 | Como incluir a11y no Definition of Done do time? | `[EXTRA]` |

---

## 21. Comparações com Outras Ferramentas

| # | Pergunta | Tag |
|---|----------|-----|
| 21.1 | Cypress vs Selenium WebDriver — prós e contras? | `[EXTRA]` |
| 21.2 | Cypress vs Playwright — quando cada um é melhor? | `[EXTRA]` |
| 21.3 | Cypress vs TestCafe — diferenças de arquitetura? | `[EXTRA]` |
| 21.4 | Cypress vs WebdriverIO — ecossistema e DX? | `[EXTRA]` |
| 21.5 | Cypress Component Testing vs Testing Library + Jest/Vitest? | `[EXTRA]` |
| 21.6 | Cypress API tests vs RestAssured (Java) ou Supertest (Node)? | `[EXTRA]` |
| 21.7 | Por que algumas empresas migram de Cypress para Playwright? | `[EXTRA]` |
| 21.8 | É possível usar Cypress e Playwright no mesmo projeto? | `[EXTRA]` |
| 21.9 | Cypress vs ferramentas BDD (Cucumber/Gherkin) — integração? | `[EXTRA]` |
| 21.10 | Como integrar Cypress com `cypress-cucumber-preprocessor`? | `[EXTRA]` |

---

## 22. Padrões Avançados e Enterprise

| # | Pergunta | Tag |
|---|----------|-----|
| 22.1 | Como implementar padrão de "test isolation" com cleanup por `beforeEach`? | `[SLIDE]` |
| 22.2 | Como estruturar suíte enterprise com 500+ specs? | `[EXTRA]` |
| 22.3 | Como aplicar pirâmide de testes com Cypress na prática? | `[EXTRA]` |
| 22.4 | Como decidir o que automatizar primeiro (risk-based testing)? | `[EXTRA]` |
| 22.5 | Como implementar contract testing além de API tests manuais? | `[EXTRA]` |
| 22.6 | Como versionar breaking changes de API sem quebrar toda a suíte? | `[EXTRA]` |
| 22.7 | Como fazer visual regression testing com Cypress (Percy, Applitools)? | `[EXTRA]` |
| 22.8 | Como testar feature flags / toggles em E2E? | `[EXTRA]` |
| 22.9 | Como estruturar testes para microfrontends? | `[EXTRA]` |
| 22.10 | Como lidar com testes em ambiente multi-tenant? | `[EXTRA]` |
| 22.11 | Como implementar "soft assertions" ou continuar após falha parcial? | `[EXTRA]` |
| 22.12 | Como usar `cy.section`/`cy.step` para relatório legível para stakeholders não técnicos? | `[SLIDE]` |

---

## 23. Segurança e Boas Práticas

| # | Pergunta | Tag |
|---|----------|-----|
| 23.1 | Como evitar expor senhas nos logs do Cypress (`{ log: false }`)? | `[SLIDE]` |
| 23.2 | Como gerenciar secrets em CI (GitHub Secrets, Vault)? | `[SLIDE]` `[EXTRA]` |
| 23.3 | É seguro rodar testes E2E contra produção? | `[EXTRA]` |
| 23.4 | Como sanitizar fixtures para não conter PII real? | `[SLIDE]` |
| 23.5 | Como evitar que `cy.request` logue tokens Bearer? | `[SLIDE]` `[EXTRA]` |
| 23.6 | Quais dados nunca devem ir para `cypress.env.json` commitado? | `[EXTRA]` |
| 23.7 | Como lidar com `chromeWebSecurity: false` em ambiente corporativo? | `[SLIDE]` `[EXTRA]` |
| 23.8 | Como auditar dependências de plugins Cypress por vulnerabilidades? | `[EXTRA]` |

---

## 24. Cenários Comportamentais e Situação-Problema

> Perguntas abertas frequentes em entrevistas sênior/lead — sem resposta única.

| # | Cenário |
|---|---------|
| 24.1 | Um teste de login passa localmente mas falha no CI com timeout em `cy.get('[data-testid=submit]')`. Como você investiga? |
| 24.2 | O time quer rodar 200 E2E em 15 minutos no pipeline. Qual sua estratégia? |
| 24.3 | O frontend migrou de REST para GraphQL. Como você adapta os testes Cypress existentes? |
| 24.4 | Um desenvolvedor removeu todos os `data-testid` do projeto. Como você reage e propõe alternativa? |
| 24.5 | Testes de um módulo dependem de estado criado por outro módulo. Como refatorar para isolamento? |
| 24.6 | O PO pede cobertura E2E de 100% da aplicação. Como você negocia escopo? |
| 24.7 | Você herda uma suíte Cypress com 40% de flakiness. Quais são os primeiros 30 dias de ação? |
| 24.8 | Como você testaria um fluxo de pagamento com gateway de terceiros (Stripe) sem cobrança real? |
| 24.9 | A aplicação usa autenticação biométrica no mobile web. Como garantir cobertura mínima? |
| 24.10 | Como validar que um PATCH assíncrono persistiu se o read API tem delay de até 30s? |
| 24.11 | Dois QAs escreveram Page Objects duplicados para o mesmo modal. Como padronizar? |
| 24.12 | O build quebrou porque `cypress run` não encontrou o app em `localhost:3000`. Como corrigir o pipeline? |
| 24.13 | Como você introduziria Component Testing em um projeto que só tem E2E hoje? |
| 24.14 | Um teste de wizard com 12 steps é difícil de manter. Como você simplifica? |
| 24.15 | Como testar comportamento quando o usuário perde conexão de rede no meio do fluxo? |
| 24.16 | O time quer executar só testes afetados por um PR (test impact analysis). É viável com Cypress? |
| 24.17 | Como você documenta convenções de automação para onboarding de novos QAs? |
| 24.18 | Um intercept mockado está mascarando bug real de backend. Como equilibrar mock vs integração real? |
| 24.19 | Como estruturar testes para app white-label com múltiplos clientes/branding? |
| 24.20 | Você precisa rodar o mesmo spec em 3 idiomas (pt, en, es). Qual abordagem? |

---

## 25. Perguntas de Recrutador / Screening

> Perguntas iniciais de triagem — recrutadores e tech recruiters.

| # | Pergunta |
|---|----------|
| 25.1 | Você já trabalhou com Cypress? Em qual versão e contexto (E2E, component, API)? |
| 25.2 | Quantos anos de experiência com automação de testes você tem? |
| 25.3 | Qual foi o maior projeto de automação que você participou (quantidade de specs, tamanho do time)? |
| 25.4 | Você já integrou Cypress em pipeline CI/CD? Qual ferramenta (GitHub Actions, Jenkins, etc.)? |
| 25.5 | Você conhece Page Object Model? Já implementou do zero? |
| 25.6 | Qual a diferença entre QA manual e SDET na sua visão? |
| 25.7 | Você programa em JavaScript/TypeScript? Qual seu nível (1–5)? |
| 25.8 | Já usou `cy.intercept` ou mock de API em testes? |
| 25.9 | Você já escreveu testes de API com Cypress ou Postman? |
| 25.10 | Conhece Component Testing (`cy.mount`)? Já usou em React, Vue ou Angular? |
| 25.11 | Como você lida com testes instáveis (flaky) no dia a dia? |
| 25.12 | Você já trabalhou com BDD (Cucumber/Gherkin)? |
| 25.13 | Tem experiência com Docker em contexto de testes? |
| 25.14 | Já usou ferramentas de relatório (Mochawesome, Allure, JUnit)? |
| 25.15 | Qual ferramenta de automação você domina além do Cypress? |
| 25.16 | Você já mentorou outros QAs em automação? |
| 25.17 | Qual sua disponibilidade para pair programming em automação com devs? |
| 25.18 | Você acompanha changelogs e novidades do Cypress (blog, Discord, GitHub)? |
| 25.19 | Tem certificação ou curso relevante (CTFL, Udemy Cypress, Test Automation University)? |
| 25.20 | Por que você quer trabalhar com Cypress nesta vaga especificamente? |

---

## Estatísticas

| Métrica | Valor |
|---------|-------|
| Total de perguntas | **310+** |
| Cobertas nos slides `[SLIDE]` | ~150 |
| Complementares `[EXTRA]` | ~160 |
| Cenários situacionais | 20 |
| Perguntas de screening | 20 |

---

## Como usar este material

1. **Preparação para entrevista:** escolha 3–5 categorias alinhadas à vaga (ex.: CI/CD + intercept + POM).
2. **Mock interview:** peça para alguém sortear 10 perguntas de categorias diferentes.
3. **Gap analysis:** marque `[ ]` nas perguntas que você não sabe responder e estude os tópicos.
4. **Evolução dos slides:** perguntas `[EXTRA]` são candidatas a novos slides.

---

## Referências sugeridas para estudo

- [Documentação oficial Cypress](https://docs.cypress.io)
- [Cypress Best Practices](https://docs.cypress.io/guides/references/best-practices)
- [Cypress Real World App](https://github.com/cypress-io/cypress-realworld-app)
- [Testing Library Guiding Principles](https://testing-library.com/docs/guiding-principles)
- Slides do projeto: `docs/slides/index.html`

---

*Gerado para o projeto TestFlow Cypress — Junho 2026*
