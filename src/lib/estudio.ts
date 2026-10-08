import type { Estudio, Horario } from '../data/estudio';

const NOMES: Record<Horario['dias'][number], string> = {
  Mo: 'Seg', Tu: 'Ter', We: 'Qua', Th: 'Qui', Fr: 'Sex', Sa: 'Sáb', Su: 'Dom',
};
const SCHEMA: Record<Horario['dias'][number], string> = {
  Mo: 'Monday', Tu: 'Tuesday', We: 'Wednesday', Th: 'Thursday', Fr: 'Friday', Sa: 'Saturday', Su: 'Sunday',
};

/** "Seg a Sex · 09:00 às 18:00" — dias consecutivos viram intervalo. */
export function horarioPorExtenso(h: Horario): string {
  const ordem = Object.keys(NOMES) as Horario['dias'];
  const idx = h.dias.map((d) => ordem.indexOf(d)).sort((a, b) => a - b);
  const seguidos = idx.length > 2 && idx.every((v, i) => i === 0 || v === idx[i - 1] + 1);
  const dias = seguidos
    ? `${NOMES[ordem[idx[0]]]} a ${NOMES[ordem[idx[idx.length - 1]]]}`
    : idx.map((i) => NOMES[ordem[i]]).join(', ');
  return `${dias} · ${h.abre} às ${h.fecha}`;
}

export function enderecoPorExtenso(e: NonNullable<Estudio['endereco']>): string {
  const linha = [`${e.rua}, ${e.numero}`, e.complemento].filter(Boolean).join(' - ');
  return `${linha} - ${e.bairro}, ${e.cidade} - ${e.uf}, ${e.cep}`;
}

/** Campos de endereço, horário e mapa para o JSON-LD BeautySalon. Só o que existe. */
export function dadosLocais(e: Estudio): Record<string, unknown> {
  const dados: Record<string, unknown> = {};
  if (e.endereco) {
    dados.address = {
      '@type': 'PostalAddress',
      streetAddress: [`${e.endereco.rua}, ${e.endereco.numero}`, e.endereco.complemento].filter(Boolean).join(' - '),
      addressLocality: e.endereco.cidade,
      addressRegion: e.endereco.uf,
      postalCode: e.endereco.cep,
      addressCountry: 'BR',
    };
  }
  if (e.horarios.length) {
    dados.openingHoursSpecification = e.horarios.map((h) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: h.dias.map((d) => SCHEMA[d]),
      opens: h.abre,
      closes: h.fecha,
    }));
  }
  if (e.mapsUrl) dados.hasMap = e.mapsUrl;
  return dados;
}

/** Acha o arquivo de cada foto da galeria; falha o build se algum não existir. */
export function resolverFotos<T>(
  lista: { arquivo: string }[],
  arquivos: Record<string, T>,
): T[] {
  return lista.map(({ arquivo }) => {
    const chave = Object.keys(arquivos).find((k) => k.endsWith(`/${arquivo}`));
    if (!chave) throw new Error(`Foto da galeria não encontrada em src/assets/galeria/: ${arquivo}`);
    return arquivos[chave];
  });
}
