import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Um arquivo .md por serviço em src/content/servicos. O preço é texto livre
// ("R$ 130 a sessão") porque é assim que aparece para a cliente.
const servicos = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/servicos' }),
  schema: z.object({
    titulo: z.string(),
    descricao: z.string(),
    preco: z.string().regex(/^R\$ \d/, 'O preço precisa começar com "R$ " e um número'),
    beneficios: z.array(z.string()).min(1),
    ordem: z.number().int(),
  }),
});

export const collections = { servicos };
