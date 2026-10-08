import { site } from './site';

// Perguntas frequentes. Toda resposta sai de um dado que já está no site: a
// duração vem dos benefícios de cada serviço em src/content/servicos e o
// agendamento é pelo WhatsApp. Não acrescente prazo, cuidado pós-procedimento
// ou contraindicação sem a Gabriela confirmar.
export interface Pergunta {
  pergunta: string;
  resposta: string;
}

export const perguntas: Pergunta[] = [
  {
    pergunta: 'Como faço para agendar?',
    resposta: `Pelo WhatsApp (${site.whatsapp.replace(/^55(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3')}): você conversa direto com a Gabriela e escolhe o melhor horário.`,
  },
  {
    pergunta: 'Quanto tempo dura o Brow Lamination?',
    resposta: 'O efeito dura de 6 a 8 semanas, com os fios alinhados e um visual mais cheio.',
  },
  {
    pergunta: 'Quanto tempo duram os Nanofios?',
    resposta: 'O resultado dura de 1 a 2 anos, e o retoque já está incluso no valor.',
  },
  {
    pergunta: 'Quanto tempo leva o design de sobrancelhas?',
    resposta: 'Cerca de 40 minutos, com análise facial completa para chegar ao design ideal para o seu rosto.',
  },
  {
    pergunta: 'Quanto tempo dura a henna?',
    resposta: 'A coloração natural dura até 15 dias, com efeito imediato.',
  },
];
