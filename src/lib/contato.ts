import { site, MENSAGEM_AGENDAR } from '../data/site';

/** Link do WhatsApp da Gabriela, com a mensagem já escrita para a cliente. */
export function linkWhatsApp(mensagem: string = MENSAGEM_AGENDAR): string {
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(mensagem)}`;
}

/** Link do WhatsApp perguntando sobre um serviço específico. */
export function linkWhatsAppServico(servico: string): string {
  return linkWhatsApp(`Olá! Gostaria de saber mais sobre ${servico}`);
}

export const linkInstagram = `https://instagram.com/${site.instagram}`;
export const linkEmail = `mailto:${site.email}`;

/**
 * Extrai o valor numérico de um preço exibido ("R$ 130 a sessão" → 130) para
 * os dados estruturados do Google. Devolve null se não houver número.
 */
export function valorDoPreco(preco: string): number | null {
  const encontrado = preco.replace(/\./g, '').match(/\d+(,\d+)?/);
  return encontrado ? Number(encontrado[0].replace(',', '.')) : null;
}
