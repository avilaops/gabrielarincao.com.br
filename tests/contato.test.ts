import { readFileSync, readdirSync } from 'node:fs';
import { describe, expect, test } from 'vitest';
import { linkWhatsApp, linkWhatsAppServico, valorDoPreco } from '../src/lib/contato';

describe('links de contato', () => {
  test('agendamento abre o WhatsApp da Gabriela com a mensagem padrão', () => {
    expect(linkWhatsApp()).toBe(
      'https://wa.me/5517996820993?text=Ol%C3%A1!%20Gostaria%20de%20agendar%20um%20hor%C3%A1rio',
    );
  });

  test('mensagem por serviço é codificada para URL', () => {
    const url = new URL(linkWhatsAppServico('Design com Henna ou Coloração'));
    expect(url.searchParams.get('text')).toBe('Olá! Gostaria de saber mais sobre Design com Henna ou Coloração');
  });
});

describe('valorDoPreco', () => {
  test.each([
    ['R$ 40', 40],
    ['R$ 130 a sessão', 130],
    ['R$ 1.250', 1250],
    ['R$ 99,90', 99.9],
    ['Sob consulta', null],
  ])('%s → %s', (preco, esperado) => {
    expect(valorDoPreco(preco)).toBe(esperado);
  });

  test('todo serviço publicado tem preço com valor para o Google', () => {
    const pasta = new URL('../src/content/servicos/', import.meta.url);
    const arquivos = readdirSync(pasta).filter((f) => f.endsWith('.md'));
    expect(arquivos.length).toBeGreaterThan(0);
    for (const arquivo of arquivos) {
      const preco = readFileSync(new URL(arquivo, pasta), 'utf8').match(/^preco: (.+)$/m)?.[1];
      expect(preco, arquivo).toBeDefined();
      expect(valorDoPreco(preco!), arquivo).toBeGreaterThan(0);
    }
  });
});
