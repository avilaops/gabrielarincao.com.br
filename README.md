# gabrielarincao.com.br

Site da Gabriela Rincão — design de sobrancelhas, Brow Lamination e Nanofios.
Página única, estática, feita em [Astro](https://astro.build) com Tailwind CSS e
publicada pelo GitHub Pages.

## Rodar no computador

Precisa de Node 22 ou mais novo.

```bash
npm install
npm run dev        # http://localhost:4321, recarrega sozinho
```

## Trocar preço ou serviço

Cada serviço é um arquivo em `src/content/servicos/`. Para mudar o preço do
Nanofios, edite `src/content/servicos/nanofios.md`:

```yaml
---
titulo: Nanofios
descricao: Técnica de micropigmentação fio a fio ultra realista e natural
preco: R$ 450
beneficios: [Resultado hiper-realista, Fios ultrafinos, Duração 1-2 anos, Retoque incluso]
ordem: 2
---
```

Serviço novo é um arquivo novo na mesma pasta; `ordem` define a posição. O preço
precisa começar com `R$` e um número (o build recusa se não começar). Lembre de
atualizar a lista em `e2e/site.spec.ts`, que confere os preços publicados.

Telefone, Instagram, e-mail e ID do Google Tag Manager ficam em `src/data/site.ts`.
Depoimentos ficam em `src/data/depoimentos.ts`.

## Verificar antes de publicar

```bash
npm test           # testes de unidade (Vitest)
npm run build      # confere os tipos e gera dist/
npm run test:e2e   # abre o build no Chromium (celular e desktop) e confere a página
```

## Publicar

Push na `main` dispara `.github/workflows/pages.yml`: testes, build, testes no
navegador e publicação de `dist/` no GitHub Pages (domínio em `public/CNAME`).

## Estrutura

```
src/
  pages/index.astro        a página
  layouts/Base.astro       <head>: SEO, Open Graph, dados estruturados, GTM e generate_lead
  components/              uma seção por arquivo (Hero, Servicos, Depoimentos…)
  content/servicos/        serviços e preços
  data/                    contato e depoimentos
  lib/contato.ts           links de WhatsApp, Instagram e e-mail
  styles/global.css        cores e fontes da marca (docs/marca/IDENTIDADE_VISUAL.md)
  assets/img/              imagens otimizadas no build
public/                    arquivos copiados como estão (favicons, robots, CNAME…)
tests/                     Vitest
e2e/                       Playwright
docs/marca/                identidade visual e logos originais
```
