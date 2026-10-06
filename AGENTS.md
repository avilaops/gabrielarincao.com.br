# AGENTS.md — gabrielarincao.com.br

Site institucional da Gabriela Rincão (estúdio de design de sobrancelhas). Página
única estática em Astro + Tailwind CSS v4 + TypeScript, publicada pelo GitHub Pages.
O CRM que existia aqui foi removido; não há login, backend nem dado de cliente.

## Git

Vale a seção 4 de `/home/avops/AGENTS.md`, acima de qualquer fluxo de branch ou PR
descrito em outro lugar deste repositório:

- Toda alteração é commitada e enviada para a `main` na mesma tarefa. Alteração que não
  foi para a `main` não está entregue.
- Antes de commitar: `git pull --rebase origin main`. Deu conflito, resolva na hora.
- Rode `npm test`, `npm run build` e `npm run test:e2e` antes do push. A `main` publica direto em produção.
- Se o GitHub recusar o push direto, abra o PR e mescle na mesma tarefa.
- Nunca `push --force` na `main`. Nunca comite segredo (`.env`, chave, token).
- Não crie branches `claude/…`, `codex/…` ou `openclaw/…` para trabalho normal.
- Mensagem de commit em português.

## Testes

- `npm test` roda o Vitest (`tests/*.test.ts`): lógica pura, sem DOM.
- `npm run build` roda `astro check` (tipos) e `astro build`. Tem que passar antes do push.
- `npm run test:e2e` roda o Playwright (`e2e/`) contra o build, em celular e desktop.
  Num ambiente com Chromium já instalado, use `PLAYWRIGHT_CHROMIUM=<caminho>` em vez de
  `npx playwright install`.

## Estrutura

- `src/pages/index.astro` monta a página com as seções de `src/components/`.
- `src/layouts/Base.astro` tem o `<head>`: SEO, Open Graph, JSON-LD `BeautySalon`, GTM e o
  listener de `generate_lead` (conversão do GA4; não remova nem mude os campos).
- `src/content/servicos/*.md` — serviços e preços (coleção com schema em `src/content.config.ts`).
- `src/data/site.ts` — contato e IDs; `src/data/depoimentos.ts` — depoimentos.
- `src/styles/global.css` — tokens de cor e fonte de `docs/marca/IDENTIDADE_VISUAL.md`.
- `public/` — copiado como está para `dist/` (favicons, `CNAME`, `robots.txt`, IndexNow).
- `legacy/` — site antigo, só consulta. Não importe nada de lá.

## Regras de código

- Preço e texto de serviço são dados de negócio: não invente, não arredonde. Mudou preço,
  mude também `e2e/site.spec.ts`.
- Não invente depoimento, endereço, horário ou avaliação. Dado de negócio vem da Gabriela.
- Sem CSS em linha e sem `onclick="…"`; interação vai em `<script>` do componente.
- JavaScript no cliente só quando CSS não resolve. Hoje só o menu do celular usa.
- Imagem passa por `<Image>`/`<Picture>` de `astro:assets`, com `alt` (vazio se decorativa).
- As fotos de `src/assets/img/` que vieram do Adobe Stock são ilustrativas (lista e licença em
  `docs/marca/CREDITOS-IMAGENS.md`). Nunca as use em galeria, antes e depois ou qualquer lugar
  que sugira trabalho da Gabriela. Foto real dela tem prioridade.
- Dourado (`ouro`) como texto só sobre fundo escuro; sobre claro não passa no WCAG AA.
- Sem dependência nova sem necessidade.

## Deploy

- Push na `main` dispara `.github/workflows/pages.yml`, que testa, gera `dist/` e publica no
  GitHub Pages.
- Workflow, DNS e domínio são da raia `ops`; não altere aqui sem combinar.

## Pendências conhecidas

- Depoimentos herdados do site antigo ainda não foram confirmados como reais
  (`src/data/depoimentos.ts`).
- Endereço e horário do estúdio não estão no site nem no JSON-LD: falta a Gabriela informar.
- A senha do antigo CRM ficou no histórico do git. Se ela era usada em outro lugar, troque.
