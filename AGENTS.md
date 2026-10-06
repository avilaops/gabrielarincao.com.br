# gabrielarincao.com.br

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

Ainda sem instruções específicas registradas. Ler o README e a documentação do repositório antes de agir.
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
- A importação de contatos (`ImportacaoService.importarArquivo`, `.vcf` e `.csv`) e o
  envio de lembrete só têm teste de serviço: `FileReader` e DOM não existem no Node.
  Falta uma conferência no navegador com arquivo real.
