# Cypress — Slides

Apresentação Reveal.js sobre Cypress (E2E, API, Component Testing, POM).

## Arquivos

| Arquivo | Descrição |
|---------|-----------|
| `index.html` | Apresentação interativa |
| `cypress-intro-slides.pdf` | Versão PDF (55 slides) |
| `css/theme-cypress.css` | Tema visual Cypress |
| `assets/cypress-logo.svg` | Logo |

## Visualizar no browser

```bash
npm run slides
# http://localhost:3333/docs/slides/
```

## Regenerar PDF

```bash
npm run slides:pdf
```

Gera `docs/slides/cypress-intro-slides.pdf` via [decktape](https://github.com/astefanutti/decktape) (1280×720, todos os fragments visíveis).

## Export manual (Chrome)

1. Abra `http://localhost:3333/docs/slides/?print-pdf`
2. `Cmd+P` → Destino: **Salvar como PDF**
3. Layout: **Paisagem**, Margens: **Nenhuma**, **Gráficos de fundo** ativado
