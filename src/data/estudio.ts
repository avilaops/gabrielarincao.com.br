// Dados do estúdio que dependem da Gabriela. Enquanto um campo estiver vazio, a
// parte do site que depende dele simplesmente não aparece: nada aqui pode ser
// inventado ou "aproximado". Passo a passo em docs/CONTEUDO-DA-GABRIELA.md.

export type Dia = 'Mo' | 'Tu' | 'We' | 'Th' | 'Fr' | 'Sa' | 'Su';

export interface Horario {
  dias: Dia[];
  /** "09:00" */
  abre: string;
  /** "18:00" */
  fecha: string;
}

export interface Endereco {
  rua: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
}

export interface Estudio {
  endereco: Endereco | null;
  horarios: Horario[];
  /** Link do Google Maps para o estúdio (botão "Como chegar"). */
  mapsUrl: string | null;
  /** Link da página de avaliações do perfil da empresa no Google. */
  avaliacoesUrl: string | null;
  /** Parágrafos da seção "Sobre a Gabriela". Foto em src/assets/img/gabriela.(jpg|png|webp). */
  sobre: string[];
}

export const estudio: Estudio = {
  endereco: null,
  horarios: [],
  mapsUrl: null,
  avaliacoesUrl: null,
  sobre: [],
};
