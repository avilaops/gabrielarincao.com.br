// Fotos REAIS de trabalhos da Gabriela. O arquivo vai em src/assets/galeria/ e a
// legenda aqui. Lista vazia = seção "Trabalhos" escondida. Nunca use as fotos do
// Adobe Stock (docs/marca/CREDITOS-IMAGENS.md) aqui.
export interface FotoTrabalho {
  /** Nome do arquivo em src/assets/galeria/, ex.: "brow-lamination-01.jpg". */
  arquivo: string;
  /** Descrição para quem não vê a imagem, ex.: "Brow lamination, depois do procedimento". */
  legenda: string;
  /** Título do serviço como está em src/content/servicos (opcional). */
  servico?: string;
}

export const galeria: FotoTrabalho[] = [];
