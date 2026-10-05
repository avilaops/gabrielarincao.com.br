// Serviço de Lembretes de Agendamento
import { AgendaService } from './agenda.js';
import { ClienteService } from './clientes.js';

export class LembretesService {
    // Templates de mensagens
    static templates = {
        padrao: {
            nome: 'Mensagem Padrão',
            texto: `Olá {nome}! 😊

Esse é um lembrete do seu agendamento:
📅 {data} às {hora}
💅 Serviço: {servico}
📍 Endereço: [Seu Endereço]

Nos vemos amanhã! ✨

Qualquer dúvida, estou à disposição!
Gabriela Rincão`
        },
        elegante: {
            nome: 'Mensagem Elegante',
            texto: `✨ Olá {nome},

Estou aguardando você amanhã para seu atendimento:

🗓️ Data: {data}
🕐 Horário: {hora}
💎 Serviço: {servico}

Será um prazer cuidar da sua beleza! 

Até breve,
Gabriela Rincão 🌸`
        },
        amigavel: {
            nome: 'Mensagem Amigável',
            texto: `Oi {nome}! Tudo bem? 😄

Só passando pra lembrar que amanhã é o dia do seu atendimento! 🎉

⏰ {hora} - {data}
💅 {servico}

Tô super animada pra te ver! 
Até amanhã! 😘

Gabi ✨`
        },
        profissional: {
            nome: 'Mensagem Profissional',
            texto: `Prezada {nome},

Confirmo seu agendamento para amanhã:

Data: {data}
Horário: {hora}
Procedimento: {servico}
Valor: {valor}

Em caso de imprevistos, favor avisar com antecedência.

Atenciosamente,
Gabriela Rincão - Designer de Sobrancelhas`
        },
        confirmacao: {
            nome: 'Pedido de Confirmação',
            texto: `Oi {nome}! 💕

Seu agendamento está confirmado para amanhã:
📅 {data} às {hora}
✨ {servico}

Por favor, confirme sua presença respondendo:
✅ SIM - Estarei lá!
❌ NÃO - Preciso remarcar

Aguardo seu retorno! 😊
Gabriela`
        },
        primeira_vez: {
            nome: 'Cliente Primeira Vez',
            texto: `Olá {nome}! 💖

Que alegria ter você como cliente!

Amanhã será nosso primeiro atendimento:
📅 {data} às {hora}
💅 {servico}

Dicas importantes:
• Chegue 5 minutos antes
• Evite maquiagem nas sobrancelhas
• Traga foto de referência (opcional)

Qualquer dúvida, estou aqui! 
Até amanhã! ✨

Gabriela Rincão`
        }
    };

    // Verificar agendamentos que precisam de lembrete
    static getAgendamentosParaLembrete() {
        const agora = new Date();
        const amanha = new Date(agora);
        amanha.setDate(amanha.getDate() + 1);
        amanha.setHours(0, 0, 0, 0);

        const depoisDeAmanha = new Date(amanha);
        depoisDeAmanha.setDate(depoisDeAmanha.getDate() + 1);

        const agendamentos = AgendaService.getAll();
        
        return agendamentos.filter(ag => {
            if (ag.status !== 'agendado' && ag.status !== 'confirmado') return false;
            
            const dataAgendamento = new Date(ag.dataHora);
            return dataAgendamento >= amanha && dataAgendamento < depoisDeAmanha;
        }).map(ag => {
            const cliente = ClienteService.getById(ag.clienteId);
            return {
                ...ag,
                cliente
            };
        });
    }

    // Formatar mensagem com dados do agendamento
    static formatarMensagem(template, agendamento, cliente) {
        const data = new Date(agendamento.dataHora);
        const dataFormatada = data.toLocaleDateString('pt-BR', { 
            weekday: 'long', 
            day: '2-digit', 
            month: 'long' 
        });
        const horaFormatada = data.toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        const valorFormatado = new Intl.NumberFormat('pt-BR', { 
            style: 'currency', 
            currency: 'BRL' 
        }).format(agendamento.valor);

        return template
            .replace(/{nome}/g, cliente.nome.split(' ')[0]) // Primeiro nome
            .replace(/{data}/g, dataFormatada)
            .replace(/{hora}/g, horaFormatada)
            .replace(/{servico}/g, agendamento.servico)
            .replace(/{valor}/g, valorFormatado);
    }

    // Gerar link do WhatsApp com mensagem
    static gerarLinkWhatsApp(telefone, mensagem) {
        if (telefone === undefined || telefone === null || telefone === '') {
            throw new Error('Cliente sem telefone cadastrado');
        }
        // Backup editado à mão pode trazer o telefone como número
        const telefoneFormatado = String(telefone).replace(/\D/g, '');
        const mensagemEncoded = encodeURIComponent(mensagem);
        return `https://wa.me/55${telefoneFormatado}?text=${mensagemEncoded}`;
    }

    // Enviar lembrete (abre WhatsApp)
    static enviarLembrete(agendamento, cliente, templateId = 'padrao') {
        const template = this.templates[templateId];
        if (!template) {
            throw new Error('Template não encontrado');
        }

        const mensagem = this.formatarMensagem(template.texto, agendamento, cliente);
        const link = this.gerarLinkWhatsApp(cliente.telefone, mensagem);
        
        // Marcar que lembrete foi enviado
        AgendaService.update(agendamento.id, {
            ...agendamento,
            lembreteEnviado: true,
            dataLembrete: new Date().toISOString()
        });

        return link;
    }

    // Obter todos os templates
    static getTemplates() {
        return Object.entries(this.templates).map(([id, template]) => ({
            id,
            ...template
        }));
    }

    // Preview da mensagem
    static previewMensagem(templateId, agendamento, cliente) {
        const template = this.templates[templateId];
        if (!template) return '';
        
        return this.formatarMensagem(template.texto, agendamento, cliente);
    }
}
