# Conteúdo que depende da Gabriela

O site já está pronto para receber estes dados. Cada parte só aparece quando é
preenchida; enquanto estiver vazia, o site continua como está. Depois de
preencher, rode `npm test`, `npm run build` e `npm run test:e2e` e envie para a `main`.

| O que | Onde | O que aparece no site |
|---|---|---|
| Fotos de trabalhos (6 a 12) | arquivos em `src/assets/galeria/` + lista em `src/data/galeria.ts` | Seção "Trabalhos da Gabriela" e item "Trabalhos" no menu |
| Foto dela | `src/assets/img/gabriela.jpg` (ou .png/.webp) | Foto em arco na seção "Sobre a Gabriela" |
| Texto sobre ela | `sobre` em `src/data/estudio.ts` (um parágrafo por item) | Seção "Sobre a Gabriela" e item "Sobre" no menu |
| Endereço | `endereco` em `src/data/estudio.ts` | Rodapé + dados estruturados do Google |
| Horários | `horarios` em `src/data/estudio.ts` | Rodapé + dados estruturados do Google |
| Link do Google Maps | `mapsUrl` em `src/data/estudio.ts` | Link "Como chegar" no rodapé (conta como lead `maps` no GA4) |
| Link das avaliações do Google | `avaliacoesUrl` em `src/data/estudio.ts` | Botão "Ver avaliações no Google" nos depoimentos |
| Depoimentos reais | `src/data/depoimentos.ts` | Substituem os herdados do site antigo |

## Exemplos de preenchimento

```ts
// src/data/galeria.ts
export const galeria: FotoTrabalho[] = [
  { arquivo: 'brow-lamination-01.jpg', legenda: 'Brow lamination, resultado logo após o procedimento', servico: 'Brow Lamination' },
  { arquivo: 'nanofios-01.jpg', legenda: 'Nanofios fio a fio em sobrancelha falhada', servico: 'Nanofios' },
];
```

```ts
// src/data/estudio.ts
export const estudio: Estudio = {
  endereco: { rua: 'Rua …', numero: '…', bairro: '…', cidade: '…', uf: 'SP', cep: '…' },
  horarios: [
    { dias: ['Tu', 'We', 'Th', 'Fr'], abre: '09:00', fecha: '18:00' },
    { dias: ['Sa'], abre: '08:00', fecha: '13:00' },
  ],
  mapsUrl: 'https://maps.app.goo.gl/…',
  avaliacoesUrl: 'https://g.page/r/…/review',
  sobre: ['Primeiro parágrafo…', 'Segundo parágrafo…'],
};
```

Dias: `Mo` seg, `Tu` ter, `We` qua, `Th` qui, `Fr` sex, `Sa` sáb, `Su` dom.

## Regras

- Foto da galeria é trabalho real da Gabriela, com autorização da cliente quando
  aparecer o rosto. Nunca use as fotos do Adobe Stock (`docs/marca/CREDITOS-IMAGENS.md`).
- Foto em boa resolução (lado maior com 1600 px ou mais) e sem filtro pesado. O site
  otimiza o peso sozinho.
- Nome de arquivo sem espaço nem acento (`brow-lamination-01.jpg`).
- Se um arquivo listado em `galeria.ts` não existir, o build falha de propósito.

## Mensagem pronta para pedir o material

> Oi, Gabriela! O site novo já está no ar (gabrielarincao.com.br). Para ele ficar
> completo, preciso de:
>
> 1. De 6 a 12 fotos dos seus trabalhos (pode ser antes e depois), em boa
>    qualidade, de clientes que autorizaram o uso;
> 2. Uma foto sua para a parte "Sobre a Gabriela";
> 3. Um textinho sobre você: há quanto tempo atende, formação e cursos, e como
>    é o seu atendimento;
> 4. O endereço do estúdio e os dias e horários de atendimento;
> 5. O link do seu perfil no Google (Maps) e, se tiver, o das avaliações;
> 6. Se possível, prints de avaliações reais de clientes para os depoimentos.
>
> Pode mandar por aqui mesmo. Obrigado!
