// Serviço de avisos do CRM (aniversários e agendamentos de hoje e amanhã)
import { AgendaService } from './agenda.js';
import { ClienteService } from './clientes.js';
import { Utils } from '../utils/utils.js';

const DIA_MS = 24 * 60 * 60 * 1000;

export class NotificacoesService {
    static STATUS_ATIVOS = ['agendado', 'confirmado'];

    static ehBissexto(ano) {
        return (ano % 4 === 0 && ano % 100 !== 0) || ano % 400 === 0;
    }

    // Dia do aniversário num ano; quem nasceu em 29/02 comemora em 28/02 fora de ano bissexto
    static aniversarioNoAno(nascimento, ano) {
        const mes = nascimento.getMonth();
        let dia = nascimento.getDate();
        if (mes === 1 && dia === 29 && !this.ehBissexto(ano)) dia = 28;
        return new Date(ano, mes, dia);
    }

    // Clientes com aniversário de hoje até `dias` dias à frente, com `diasAte` (0 = hoje)
    static aniversariantes(agora = new Date(), dias = 7) {
        const hoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
        const resultado = [];

        ClienteService.getAll().forEach(cliente => {
            const nascimento = Utils.parseDataLocal(cliente.dataNascimento);
            if (!nascimento) return;

            // Ano atual e o seguinte, para atravessar a virada de ano
            for (const ano of [hoje.getFullYear(), hoje.getFullYear() + 1]) {
                const aniversario = this.aniversarioNoAno(nascimento, ano);
                // Arredonda porque o dia pode ter 23 ou 25 horas em troca de horário de verão
                const diasAte = Math.round((aniversario - hoje) / DIA_MS);
                if (diasAte >= 0 && diasAte <= dias) {
                    resultado.push({ ...cliente, diasAte, aniversario });
                    break;
                }
            }
        });

        return resultado.sort((a, b) => a.diasAte - b.diasAte);
    }

    // Agendamentos ativos no dia local `agora + deslocamento` (0 = hoje, 1 = amanhã)
    static agendamentosDoDia(agora = new Date(), deslocamento = 0) {
        const inicio = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate() + deslocamento);
        const fim = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate() + deslocamento + 1);

        return AgendaService.getAll()
            .filter(agendamento => {
                if (!this.STATUS_ATIVOS.includes(agendamento.status)) return false;
                const data = new Date(agendamento.dataHora);
                // Data inválida falha nas duas comparações; de hoje, só o que ainda não passou
                return data >= inicio && data < fim && data >= agora;
            })
            .sort((a, b) => new Date(a.dataHora) - new Date(b.dataHora));
    }

    // Agendamentos de amanhã que ainda não tiveram lembrete enviado
    static lembretesPendentes(agora = new Date()) {
        return this.agendamentosDoDia(agora, 1).filter(agendamento => agendamento.lembreteEnviado !== true);
    }

    static resumo(agora = new Date()) {
        const aniversariantes = this.aniversariantes(agora);
        const aniversariantesHoje = aniversariantes.filter(cliente => cliente.diasAte === 0);
        const aniversariantesSemana = aniversariantes.filter(cliente => cliente.diasAte > 0);
        const agendamentosHoje = this.agendamentosDoDia(agora, 0);
        const agendamentosAmanha = this.agendamentosDoDia(agora, 1);
        const lembretesPendentes = this.lembretesPendentes(agora);

        return {
            aniversariantesHoje,
            aniversariantesSemana,
            agendamentosHoje,
            agendamentosAmanha,
            lembretesPendentes,
            total: aniversariantesHoje.length + agendamentosHoje.length + lembretesPendentes.length
        };
    }
}
