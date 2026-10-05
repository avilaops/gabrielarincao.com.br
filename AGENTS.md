# AGENTS.md — gabrielarincao.com.br

Site institucional e CRM da Gabriela Rincão (estúdio de design de sobrancelhas).
HTML, CSS e JavaScript puro em módulos ES, sem etapa de build. Os dados do CRM ficam
só no `localStorage` do navegador da usuária.

## Git

Vale a seção 4 de `/home/avops/AGENTS.md`, acima de qualquer fluxo de branch ou PR
descrito em outro arquivo deste repositório (`GIT_COMMANDS.md`, `COMMANDS.md` etc.):

- Toda alteração é commitada e enviada para a `main` na mesma tarefa. Alteração que não
  foi para a `main` não está entregue.
- Antes de commitar: `git pull --rebase origin main`. Deu conflito, resolva na hora.
- Rode `npm test` antes do push. A `main` publica direto em produção.
- Se o GitHub recusar o push direto, abra o PR e mescle na mesma tarefa.
- Nunca `push --force` na `main`. Nunca comite segredo (`.env`, chave, token).
- Não crie branches `claude/…`, `codex/…` ou `openclaw/…` para trabalho normal.
- Mensagem de commit em português.

## Testes

- `npm test` roda `node --test`, que acha sozinho todo `tests/*.test.mjs`. Arquivo de
  teste novo não precisa ser registrado em lugar nenhum.
- Os testes rodam em Node sem DOM: serviço ou utilitário testável não pode depender de
  `document`/`window` na importação.
- Não há build nem lint. `node --check <arquivo>` confere a sintaxe das páginas.

## Estrutura

- `index.html`, `app.js` — entrada; `src/services/router.js` troca as páginas.
- `src/pages/` — telas (`landing`, `login`, `dashboard`, `clientes`, `agenda`, `financeiro`).
- `src/services/` — regras e acesso ao `localStorage` (`storage.js` tem as chaves).
- `src/components/` — cabeçalho, modal e gráfico em canvas.
- `tests/` — testes do Node.
- `ROADMAP.md` — itens do produto; marque a caixa no mesmo commit que entrega o item.

## Regras de código

- **Todo dado de cliente, agendamento, pagamento ou arquivo importado passa por
  `Utils.sanitizeHTML` antes de entrar em `innerHTML`, em `Modal` ou em atributo.**
  Um backup `.json` de terceiro pode ser restaurado, então nada do `localStorage` é
  confiável.
- Não interpole dado em `onclick="…"`: o escape de HTML não protege código inline. Use
  atributo `data-*` e `addEventListener`.
- Números e datas vão por `Utils.formatCurrency`, `Number(...)` ou `Date`.
- Sem dependência nova sem necessidade; o site é servido como arquivo estático.

## Deploy

- Push na `main` dispara `.github/workflows/deploy-production.yml`, que monta a imagem
  nginx do `Dockerfile` e publica. `package.json` e `tests/` não vão para a imagem.
- Workflow, servidor, DNS e contêiner são da raia `ops`; não altere aqui.

## Pendências conhecidas

- `src/services/auth.js` tem credencial fixa em código público. Tratar em tarefa própria.
- `src/pages/clientes.js` lê `resultado.sucesso`, mas `ImportacaoService` devolve
  `importados`: o resumo da importação mostra "undefined" e a lista não recarrega.
