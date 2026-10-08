import { describe, expect, test } from 'vitest';
import { dadosLocais, enderecoPorExtenso, horarioPorExtenso, resolverFotos } from '../src/lib/estudio';

const endereco = { rua: 'Rua Exemplo', numero: '100', bairro: 'Centro', cidade: 'Cidade', uf: 'SP', cep: '15500-000' };

describe('dados do estúdio', () => {
  test('sem dado preenchido, o JSON-LD não ganha campo nenhum', () => {
    expect(dadosLocais({ endereco: null, horarios: [], mapsUrl: null, avaliacoesUrl: null, sobre: [] })).toEqual({});
  });

  test('endereço, horário e mapa entram no JSON-LD no formato do schema.org', () => {
    const d = dadosLocais({
      endereco,
      horarios: [{ dias: ['Mo', 'Tu', 'We', 'Th', 'Fr'], abre: '09:00', fecha: '18:00' }],
      mapsUrl: 'https://maps.app.goo.gl/x',
      avaliacoesUrl: null,
      sobre: [],
    });
    expect(d.address).toMatchObject({ streetAddress: 'Rua Exemplo, 100', postalCode: '15500-000', addressCountry: 'BR' });
    expect(d.openingHoursSpecification).toEqual([
      { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '09:00', closes: '18:00' },
    ]);
    expect(d.hasMap).toBe('https://maps.app.goo.gl/x');
  });

  test('horário por extenso agrupa dias seguidos', () => {
    expect(horarioPorExtenso({ dias: ['Mo', 'Tu', 'We', 'Th', 'Fr'], abre: '09:00', fecha: '18:00' })).toBe('Seg a Sex · 09:00 às 18:00');
    expect(horarioPorExtenso({ dias: ['Sa'], abre: '08:00', fecha: '12:00' })).toBe('Sáb · 08:00 às 12:00');
    expect(horarioPorExtenso({ dias: ['Tu', 'Th'], abre: '09:00', fecha: '17:00' })).toBe('Ter, Qui · 09:00 às 17:00');
  });

  test('endereço por extenso', () => {
    expect(enderecoPorExtenso(endereco)).toBe('Rua Exemplo, 100 - Centro, Cidade - SP, 15500-000');
  });

  test('foto da galeria sem arquivo derruba o build', () => {
    expect(() => resolverFotos([{ arquivo: 'falta.jpg' }], { '/src/assets/galeria/outra.jpg': 1 })).toThrow(/falta\.jpg/);
    expect(resolverFotos([{ arquivo: 'a.jpg' }], { '/src/assets/galeria/a.jpg': 7 })).toEqual([7]);
  });
});
