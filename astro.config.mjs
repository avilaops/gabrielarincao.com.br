// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Site 100% estático, publicado pelo GitHub Pages (.github/workflows/pages.yml).
export default defineConfig({
  site: 'https://gabrielarincao.com.br',
  integrations: [sitemap()],
  // CSS dentro do HTML: a página é uma só e o CSS é pequeno, então isso tira a
  // requisição que bloqueava a primeira pintura (Lighthouse "render-blocking").
  build: { inlineStylesheets: 'always' },
  vite: {
    plugins: [tailwindcss()],
  },
});
