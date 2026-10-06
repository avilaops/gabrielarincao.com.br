// ATENÇÃO: depoimentos herdados do site antigo. Antes de manter no ar, confirme
// com a Gabriela que são de clientes reais e que elas autorizaram o uso do nome.
// Depoimento inventado é propaganda enganosa (CDC art. 37). Na dúvida, troque
// por avaliações reais do Google ou do Instagram.
export interface Depoimento {
  nome: string;
  texto: string;
}

export const depoimentos: Depoimento[] = [
  {
    nome: 'Mariana Silva',
    texto:
      'Amei o resultado! Profissional super atenciosa e o design ficou perfeito para meu rosto. Super recomendo!',
  },
  {
    nome: 'Juliana Costa',
    texto:
      'Melhor lugar para fazer sobrancelha! Ambiente lindo e a Gabriela é muito talentosa. Não troco por nada!',
  },
  {
    nome: 'Fernanda Oliveira',
    texto:
      'Fiz a micropigmentação e estou apaixonada! Acordar com as sobrancelhas prontas não tem preço.',
  },
];
