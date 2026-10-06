import { expect, test } from '@playwright/test';

// Serviços e preços do site antigo (legacy/src/pages/landing.js). Preço é dado
// de negócio: se mudar, mude aqui e em src/content/servicos de propósito.
const SERVICOS = [
  ['Brow Lamination', 'R$ 120'],
  ['Nanofios', 'R$ 450'],
  ['Design de Sobrancelhas', 'R$ 40'],
  ['Design com Henna ou Coloração', 'R$ 50'],
  ['Hidragloss', 'R$ 130 a sessão'],
] as const;

test.describe('sem JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('o conteúdo está no HTML, para busca e previews', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Realce Sua Beleza Natural');
    for (const [titulo, preco] of SERVICOS) {
      const card = page.locator('[data-servico]').filter({ has: page.getByRole('heading', { name: titulo, exact: true }) });
      await expect(card.locator('[data-preco]')).toHaveText(preco);
    }
    await expect(page.locator('[data-servico]')).toHaveCount(SERVICOS.length);
  });
});

test('SEO: título, canonical, Open Graph e dados estruturados', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('Gabriela Rincão - Brow Lamination e Nanofios');
  await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href', 'https://gabrielarincao.com.br/');
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', 'https://gabrielarincao.com.br/og-default.png');
  const jsonLd = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent()) ?? '{}');
  expect(jsonLd['@type']).toBe('BeautySalon');
  expect(jsonLd.hasOfferCatalog.itemListElement).toHaveLength(SERVICOS.length);
});

test('links de contato apontam para os canais certos', async ({ page }) => {
  await page.goto('/');
  const whats = page.locator('a[href*="wa.me"]');
  expect(await whats.count()).toBeGreaterThan(5);
  for (const href of await whats.evaluateAll((as) => as.map((a) => (a as HTMLAnchorElement).href))) {
    expect(href).toMatch(/^https:\/\/wa\.me\/5517996820993\?text=/);
  }
  await expect(page.locator('a[href="https://instagram.com/gabrielarincao"]').first()).toBeAttached();
  await expect(page.locator('a[href="mailto:gabrielacasari@hotmail.com"]')).toBeAttached();
  await expect(page.locator('a[href*="#/login"]')).toHaveCount(0);
  await expect(page.getByText('Área Administrativa')).toHaveCount(0);
});

test('clique no WhatsApp registra generate_lead no dataLayer', async ({ page, context }) => {
  await context.route(/googletagmanager|wa\.me/, (r) => r.abort());
  await page.goto('/');
  await page.locator('[data-servico]').first().getByRole('link').click({ modifiers: ['ControlOrMeta'] });
  const evento = await page.evaluate(() =>
    (window as unknown as { dataLayer: Record<string, unknown>[] }).dataLayer.find((e) => e.event === 'generate_lead'),
  );
  expect(evento).toMatchObject({ lead_source: 'whatsapp', page_path: '/' });
  expect(String(evento?.lead_subject)).toContain('Agendar');
});

test('menu do celular abre, navega e fecha com Esc', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'menu só existe no celular');
  await page.goto('/');
  const botao = page.locator('[data-menu-botao]');
  const menu = page.locator('#menu-mobile');
  await expect(menu).toBeHidden();
  await botao.click();
  await expect(menu).toBeVisible();
  await expect(botao).toHaveAttribute('aria-expanded', 'true');
  await expect(botao).toHaveAccessibleName('Fechar menu');
  await page.keyboard.press('Escape');
  await expect(menu).toBeHidden();
  await expect(botao).toBeFocused();
  await botao.click();
  await menu.getByRole('link', { name: 'Serviços' }).click();
  await expect(menu).toBeHidden();
  await expect(page.locator('#servicos')).toBeInViewport();
});

test('sem erro de JavaScript e sem rolagem horizontal', async ({ page, context }) => {
  await context.route(/googletagmanager/, (r) => r.abort());
  const erros: string[] = [];
  page.on('pageerror', (e) => erros.push(e.message));
  await page.goto('/');
  expect(erros).toEqual([]);
  const larguras = await page.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]);
  expect(larguras[0]).toBeLessThanOrEqual(larguras[1]);
});
