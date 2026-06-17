# Cypress — Slides

Apresentação Reveal.js sobre Cypress (E2E, API, Component Testing, POM).

## Arquivos

| Arquivo | Descrição |
|---------|-----------|
| `index.html` | Apresentação interativa (Reveal.js) |
| `guia-completo.html` | Guia passo a passo em português (instalação + todos os comandos) |
| `complete-guide.html` | Complete step-by-step guide in English (setup + all commands) |
| `cypress-intro-slides.pdf` | Versão PDF (55 slides) |
| `css/theme-cypress.css` | Tema visual Cypress |
| `assets/cypress-logo.svg` | Logo |

## Visualizar no browser

**Importante:** rode os comandos na pasta **`testflow-cypress`** (não em `testflow-pytest`).

```bash
cd testflow-cypress

# Slides Reveal.js
npm run slides
# http://localhost:3333/docs/slides/

# Guia completo PT (abre o browser)
npm run slides:guia

# Complete guide EN
npm run slides:guide
```

URLs diretas (com `npm run slides` ativo):

| Recurso | URL |
|---------|-----|
| Slides | http://localhost:3333/docs/slides/ |
| Guia PT | http://localhost:3333/docs/slides/guia-completo.html |
| Guide EN | http://localhost:3333/docs/slides/complete-guide.html |

Também é possível abrir `guia-completo.html` ou `complete-guide.html` direto no browser (duplo clique).

## Regenerar PDF

```bash
npm run slides:pdf
```

Gera `docs/slides/cypress-intro-slides.pdf` via [decktape](https://github.com/astefanutti/decktape) (1280×720, todos os fragments visíveis).

## Export manual (Chrome)

1. Abra `http://localhost:3333/docs/slides/?print-pdf`
2. `Cmd+P` → Destino: **Salvar como PDF**
3. Layout: **Paisagem**, Margens: **Nenhuma**, **Gráficos de fundo** ativado
