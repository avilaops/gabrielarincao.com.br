# AGENTS.md — gabrielarincao.com.br

<!-- avilaops:contexto:inicio (versão 2026-10-03; gerado a partir de avilaops/contexto, não editar aqui) -->
## Contexto Ávila Ops (vale para todos os projetos)

Este repositório pertence à Ávila Ops Tecnologia, que ajuda pequenas empresas a construir presença digital, organizar a operação e crescer. As contas `avilaops` e `avilainc` no GitHub são a mesma empresa. Nicolas Avila (Nicolas sem acento) é o fundador e quem decide.

### Como trabalhar

- Comunicar em português natural, com resposta direta e evidência. Sem tom de coach, promessa vaga ou jargão comercial. O idioma da interface e do conteúdo acompanha o site, não a conversa.
- Identificar o projeto, o domínio, o repositório e o ambiente antes de alterar qualquer coisa. Não presumir que todos os projetos usam o mesmo deploy.
- Ter iniciativa dentro do pedido e levar a tarefa até um resultado verificado. Plano, código, publicação e funcionamento comprovado são coisas diferentes: não declarar sucesso só porque um build terminou ou um workflow foi ativado.
- Proteger dados, acessos e a separação entre clientes. Nunca gravar segredo em arquivo versionado, issue, PR ou memória.
- Não iniciar comunicação externa nem ação irreversível sem autorização do Nicolas.
- Preservar trabalho em andamento de outra pessoa ou de outro agente. Trabalho não commitado vai para uma branch `resgate/*`.

### Decisões vigentes

- Pagamentos: Mercado Pago no Brasil e PayPal para clientes de fora. Não usar Stripe nem Éfi, mesmo que material antigo diga o contrário.
- Automações em n8n, infraestrutura em Cloudflare e canais em Twilio, preservando integrações existentes.
- Ofertas com três planos: entrada limitada, intermediário como escolha principal e premium como referência. Consultar preços vigentes antes de publicar.
- Build de aplicação roda no GitHub Actions, não no servidor de produção.
- Versão antiga de código fica no GitHub. Não criar `.tgz`, `.tar`, `*-before-*` nem pastas `rollback/`, `releases/` ou `backups/` com código no servidor; voltar versão é republicar o commit. Antes de mexer em dado, fazer dump do banco.

### Sessões na nuvem

- Uma sessão de nuvem não tem acesso à máquina do Nicolas, aos servidores nem à memória compartilhada. Não presumir o estado de produção: buscar evidência ou dizer que não foi verificado.
- Decisão durável tomada na sessão deve ficar registrada na descrição do PR e, quando for do projeto, neste arquivo, fora deste bloco.
- A memória compartilhada completa e as regras corporativas ficam no repositório privado `avilaops/contexto`.
<!-- avilaops:contexto:fim -->

## Este projeto

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
- `src/data/site.ts` — contato e IDs; `src/data/depoimentos.ts` — depoimentos;
  `src/data/faq.ts` — dúvidas frequentes (também viram JSON-LD `FAQPage`). Resposta só com
  dado que já está no site; mudou duração de serviço, mude a dúvida junto.
- `src/data/estudio.ts` (endereço, horários, Maps, avaliações, texto "Sobre") e
  `src/data/galeria.ts` + `src/assets/galeria/` (fotos reais de trabalhos): cada parte só
  aparece no site quando preenchida. Guia e mensagem para pedir o material em
  `docs/CONTEUDO-DA-GABRIELA.md`.
- `src/pages/404.astro` — página de erro (`noindex`, fora do sitemap).
- `src/styles/global.css` — tokens de cor e fonte de `docs/marca/IDENTIDADE_VISUAL.md`.
- `public/` — copiado como está para `dist/` (favicons, `CNAME`, `robots.txt`, IndexNow,
  `og.jpg` 1200×630 usado no preview de links).
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
- Fotos de trabalhos, foto e texto "Sobre", endereço, horários e links do Google: a
  estrutura está pronta e vazia; falta a Gabriela enviar (`docs/CONTEUDO-DA-GABRIELA.md`).
- A senha do antigo CRM ficou no histórico do git. Se ela era usada em outro lugar, troque.
