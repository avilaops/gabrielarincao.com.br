// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Site 100% estático, publicado pelo GitHub Pages (.github/workflows/pages.yml).
export default defineConfig({
  site: 'https://gabrielarincao.com.br',
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
