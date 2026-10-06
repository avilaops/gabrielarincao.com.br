import { test, beforeEach, mock } from 'node:test';
import assert from 'node:assert/strict';

// O erro de data só aparece a oeste de Greenwich: fixa o fuso do Brasil, mesmo em `npm test`
process.env.TZ = 'America/Sao_Paulo';

// localStorage falso em memória (mesmo esquema de backup.test.mjs)
class LocalStorageFalso {
    constructor() {
        this.itens = new Map();
    }
    getItem(key) {
        return this.itens.has(key) ? this.itens.get(key) : null;
    }
    setItem(key, value) {
        this.itens.set(key, String(value));
    }
    removeItem(key) {
        this.itens.delete(key);
    }
    clear() {
        this.itens.clear();
    }
}

globalThis.localStorage = new LocalStorageFalso();

const { StorageService } = await import('../src/services/storage.js');
const { Utils } = await import('../src/utils/utils.js');
const { ClienteService } = await import('../src/services/clientes.js');
const { NotificacoesService } = await import('../src/services/notificacoes.js');
const { LembretesService } = await import('../src/services/lembretes.js');
const { AgendaService } = await import('../src/services/agenda.js');

const KEYS = StorageService.KEYS;

// Segunda-feira, 5 de outubro de 2026, 10h no horário local
const AGORA = new Date(2026, 9, 5, 10, 0);

function clientes(lista) {
    StorageService.set(KEYS.CLIENTES, lista.map((c, i) => ({
        id: `c${i + 1}`,
        telefone: '17999990000',
        createdAt: '2026-01-01T12:00:00.000Z',
        ...c
    })));
}

function agendamentos(lista) {
    StorageService.set(KEYS.AGENDAMENTOS, lista.map((a, i) => ({
        id: `a${i + 1}`,
        clienteId: 'c1',
        servico: 'Design',
        valor: 80,
        status: 'agendado',
        ...a
    })));
}

function nomes(lista) {
    return lista.map(item => item.nome);
}

function ids(lista) {
    return lista.map(item => item.id);
}

beforeEach(() => {
    localStorage.clear();
    StorageService.init();
});

test('roda no fuso do Brasil (UTC-3)', () => {
    assert.equal(new Date(2026, 9, 5).getTimezoneOffset(), 180);
    // O jeito antigo de ler a data volta um dia: é o erro que parseDataLocal corrige
    assert.equal(new Date('1990-05-01').getDate(), 30);
});

test('parseDataLocal devolve a meia-noite local do dia gravado', () => {
    const data = Utils.parseDataLocal('1990-05-01');
    assert.equal(data.getDate(), 1);
    assert.equal(data.getMonth(), 4);
    assert.equal(data.getFullYear(), 1990);
    assert.equal(data.getHours(), 0);
});

test('parseDataLocal aceita ISO completo usando só a data', () => {
    const data = Utils.parseDataLocal('1990-05-01T00:00:00.000Z');
    assert.equal(data.getDate(), 1);
    assert.equal(data.getMonth(), 4);
});

test('parseDataLocal devolve null para vazio, lixo e data que não existe', () => {
    for (const valor of ['', null, undefined, 'lixo', '01/05/1990', '1990-5-1', '1990-13-01', '2023-02-31', 19900501]) {
        assert.equal(Utils.parseDataLocal(valor), null, String(valor));
    }
});

test('getAniversariantes do mês não joga o dia 1º no mês anterior', () => {
    const mes = String(new Date().getMonth() + 1).padStart(2, '0');
    clientes([{ nome: 'Ana', dataNascimento: `1990-${mes}-01` }]);
    assert.deepEqual(nomes(ClienteService.getAniversariantes()), ['Ana']);
});

test('aniversário hoje tem diasAte 0', () => {
    clientes([{ nome: 'Ana', dataNascimento: '1990-10-05' }]);
    const lista = NotificacoesService.aniversariantes(AGORA);
    assert.equal(lista.length, 1);
    assert.equal(lista[0].diasAte, 0);
});

test('aniversário daqui a 7 dias entra, daqui a 8 não, e o de ontem não', () => {
    clientes([
        { nome: 'Sete', dataNascimento: '1990-10-12' },
        { nome: 'Oito', dataNascimento: '1990-10-13' },
        { nome: 'Ontem', dataNascimento: '1990-10-04' },
        { nome: 'Hoje', dataNascimento: '1985-10-05' }
    ]);
    const lista = NotificacoesService.aniversariantes(AGORA);
    assert.deepEqual(nomes(lista), ['Hoje', 'Sete']);
    assert.deepEqual(lista.map(c => c.diasAte), [0, 7]);
});

test('aniversariantes atravessa a virada de ano', () => {
    clientes([{ nome: 'Ana', dataNascimento: '1990-01-02' }]);
    const lista = NotificacoesService.aniversariantes(new Date(2026, 11, 28, 15, 0));
    assert.equal(lista.length, 1);
    assert.equal(lista[0].diasAte, 5);
    assert.equal(lista[0].aniversario.getFullYear(), 2027);
});

test('nascido em 29/02 conta em 28/02 em ano não bissexto e em 29/02 no bissexto', () => {
    clientes([{ nome: 'Ana', dataNascimento: '1992-02-29' }]);

    const naoBissexto = NotificacoesService.aniversariantes(new Date(2027, 1, 28, 9, 0));
    assert.equal(naoBissexto.length, 1);
    assert.equal(naoBissexto[0].diasAte, 0);

    const vespera = NotificacoesService.aniversariantes(new Date(2028, 1, 28, 9, 0));
    assert.equal(vespera[0].diasAte, 1);
    assert.equal(vespera[0].aniversario.getDate(), 29);
});

test('cliente sem data ou com data inválida não quebra nem aparece', () => {
    clientes([
        { nome: 'Sem data' },
        { nome: 'Vazia', dataNascimento: '' },
        { nome: 'Lixo', dataNascimento: 'abc' },
        { nome: 'Número', dataNascimento: 19901005 },
        { nome: 'Ana', dataNascimento: '1990-10-05' }
    ]);
    assert.deepEqual(nomes(NotificacoesService.aniversariantes(AGORA)), ['Ana']);
});

test('agendamentosDoDia de hoje: só ativos, só os que não passaram, em ordem de horário', () => {
    clientes([{ nome: 'Ana' }]);
    agendamentos([
        { id: 'tarde', dataHora: '2026-10-05T16:00' },
        { id: 'passou', dataHora: '2026-10-05T09:00' },
        { id: 'cancelado', dataHora: '2026-10-05T11:00', status: 'cancelado' },
        { id: 'concluido', dataHora: '2026-10-05T12:00', status: 'concluido' },
        { id: 'confirmado', dataHora: '2026-10-05T11:30', status: 'confirmado' },
        { id: 'amanha', dataHora: '2026-10-06T09:00' },
        { id: 'invalido', dataHora: 'abc' }
    ]);
    const hoje = NotificacoesService.agendamentosDoDia(AGORA, 0);
    assert.deepEqual(ids(hoje), ['confirmado', 'tarde']);
    assert.equal(hoje[0].cliente.nome, 'Ana');
});

test('agendamentosDoDia compara pelo dia local: 23:30 de amanhã é amanhã', () => {
    clientes([{ nome: 'Ana' }]);
    agendamentos([
        { id: 'noite', dataHora: '2026-10-06T23:30' },
        { id: 'manha', dataHora: '2026-10-06T08:00' },
        { id: 'hoje-noite', dataHora: '2026-10-05T23:30' },
        { id: 'depois', dataHora: '2026-10-07T00:00' }
    ]);
    assert.deepEqual(ids(NotificacoesService.agendamentosDoDia(AGORA, 1)), ['manha', 'noite']);
    assert.deepEqual(ids(NotificacoesService.agendamentosDoDia(AGORA, 0)), ['hoje-noite']);
});

test('lembretesPendentes exclui os que já tiveram lembrete enviado', () => {
    clientes([{ nome: 'Ana' }]);
    agendamentos([
        { id: 'enviado', dataHora: '2026-10-06T09:00', lembreteEnviado: true },
        { id: 'pendente', dataHora: '2026-10-06T10:00' },
        { id: 'falso', dataHora: '2026-10-06T11:00', lembreteEnviado: false },
        { id: 'hoje', dataHora: '2026-10-05T15:00' }
    ]);
    assert.deepEqual(ids(NotificacoesService.lembretesPendentes(AGORA)), ['pendente', 'falso']);
});

test('LembretesService devolve agendamento de amanhã com status agendado', () => {
    clientes([{ nome: 'Ana' }]);
    const amanha = new Date();
    amanha.setDate(amanha.getDate() + 1);
    amanha.setHours(12, 0, 0, 0);
    const ontem = new Date();
    ontem.setDate(ontem.getDate() - 1);
    agendamentos([
        { id: 'agendado', dataHora: amanha.toISOString() },
        { id: 'confirmado', dataHora: amanha.toISOString(), status: 'confirmado' },
        { id: 'cancelado', dataHora: amanha.toISOString(), status: 'cancelado' },
        { id: 'ontem', dataHora: ontem.toISOString() }
    ]);
    const lista = LembretesService.getAgendamentosParaLembrete();
    assert.deepEqual(ids(lista).sort(), ['agendado', 'confirmado']);
    assert.equal(lista[0].cliente.nome, 'Ana');
});

test('LembretesService não lista quem já recebeu o lembrete, igual ao card Avisos', () => {
    clientes([{ nome: 'Ana' }]);
    const amanha = new Date();
    amanha.setDate(amanha.getDate() + 1);
    amanha.setHours(12, 0, 0, 0);
    agendamentos([
        { id: 'enviado', dataHora: amanha.toISOString(), lembreteEnviado: true },
        { id: 'pendente', dataHora: amanha.toISOString() },
        { id: 'falso', dataHora: amanha.toISOString(), lembreteEnviado: false },
        { id: 'confirmado-enviado', dataHora: amanha.toISOString(), status: 'confirmado', lembreteEnviado: true }
    ]);
    const modal = ids(LembretesService.getAgendamentosParaLembrete()).sort();
    assert.deepEqual(modal, ['falso', 'pendente']);
    assert.deepEqual(modal, ids(NotificacoesService.lembretesPendentes(new Date())).sort());
});

test('enviar o lembrete tira o agendamento da lista do modal', () => {
    clientes([{ nome: 'Ana' }]);
    const amanha = new Date();
    amanha.setDate(amanha.getDate() + 1);
    amanha.setHours(12, 0, 0, 0);
    agendamentos([
        { id: 'um', dataHora: amanha.toISOString() },
        { id: 'dois', dataHora: amanha.toISOString() }
    ]);
    const [primeiro] = LembretesService.getAgendamentosParaLembrete().filter(ag => ag.id === 'um');
    LembretesService.enviarLembrete(primeiro, primeiro.cliente);
    assert.deepEqual(ids(LembretesService.getAgendamentosParaLembrete()), ['dois']);
});

test('lembrete enviado continua disponível para reenvio, fora da lista de pendentes', () => {
    clientes([{ nome: 'Ana' }]);
    const amanha = new Date();
    amanha.setDate(amanha.getDate() + 1);
    amanha.setHours(12, 0, 0, 0);
    const ontem = new Date();
    ontem.setDate(ontem.getDate() - 1);
    agendamentos([
        { id: 'um', dataHora: amanha.toISOString() },
        { id: 'dois', dataHora: amanha.toISOString() },
        { id: 'cancelado', dataHora: amanha.toISOString(), status: 'cancelado', lembreteEnviado: true },
        { id: 'ontem', dataHora: ontem.toISOString(), lembreteEnviado: true }
    ]);
    assert.deepEqual(ids(LembretesService.getLembretesEnviados()), []);

    const [primeiro] = LembretesService.getAgendamentosParaLembrete().filter(ag => ag.id === 'um');
    LembretesService.enviarLembrete(primeiro, primeiro.cliente);
    const [enviado] = LembretesService.getLembretesEnviados();
    assert.equal(enviado.id, 'um');
    assert.equal(enviado.cliente.nome, 'Ana');

    // Reenviar gera o link de novo e não devolve o agendamento aos pendentes
    const link = LembretesService.enviarLembrete(enviado, enviado.cliente, 'elegante');
    assert.match(link, /^https:\/\/wa\.me\/5517999990000\?text=/);
    assert.deepEqual(ids(LembretesService.getLembretesEnviados()), ['um']);
    assert.deepEqual(ids(LembretesService.getAgendamentosParaLembrete()), ['dois']);
});

test('reenvio preserva o horário do primeiro envio e guarda o do reenvio à parte', () => {
    // Relógio fixo antes de montar os dados: "amanhã" tem de ser o do relógio do teste
    mock.timers.enable({ apis: ['Date'], now: new Date('2026-10-05T13:00:00.000Z') });
    const gravado = id => StorageService.get(KEYS.AGENDAMENTOS).find(ag => ag.id === id);
    try {
        clientes([{ nome: 'Ana' }]);
        const amanha = new Date();
        amanha.setDate(amanha.getDate() + 1);
        amanha.setHours(12, 0, 0, 0);
        agendamentos([
            { id: 'um', dataHora: amanha.toISOString() },
            // Gravados antes desta mudança: com e sem o horário do primeiro envio
            { id: 'antigo', dataHora: amanha.toISOString(), lembreteEnviado: true, dataLembrete: '2026-10-01T12:00:00.000Z' },
            { id: 'sem-data', dataHora: amanha.toISOString(), lembreteEnviado: true }
        ]);

        // Primeiro envio: só `dataLembrete`
        const [copiaDaTela] = LembretesService.getAgendamentosParaLembrete();
        LembretesService.enviarLembrete(copiaDaTela, copiaDaTela.cliente);
        assert.equal(gravado('um').dataLembrete, '2026-10-05T13:00:00.000Z');
        assert.equal('dataReenvioLembrete' in gravado('um'), false);

        // Reenvio, mesmo com a cópia antiga da tela (ainda sem marcação): o primeiro horário fica
        mock.timers.setTime(new Date('2026-10-05T15:30:00.000Z').getTime());
        LembretesService.enviarLembrete(copiaDaTela, copiaDaTela.cliente);
        assert.equal(gravado('um').dataLembrete, '2026-10-05T13:00:00.000Z');
        assert.equal(gravado('um').dataReenvioLembrete, '2026-10-05T15:30:00.000Z');

        // Segundo reenvio: o campo à parte fica com o mais recente
        mock.timers.setTime(new Date('2026-10-05T18:00:00.000Z').getTime());
        LembretesService.enviarLembrete(AgendaService.getById('um'), ClienteService.getById('c1'));
        assert.equal(gravado('um').dataLembrete, '2026-10-05T13:00:00.000Z');
        assert.equal(gravado('um').dataReenvioLembrete, '2026-10-05T18:00:00.000Z');

        // Registro antigo: o horário já gravado é o do primeiro envio e continua lá
        LembretesService.enviarLembrete(AgendaService.getById('antigo'), ClienteService.getById('c1'));
        assert.equal(gravado('antigo').dataLembrete, '2026-10-01T12:00:00.000Z');
        assert.equal(gravado('antigo').dataReenvioLembrete, '2026-10-05T18:00:00.000Z');

        // Registro antigo sem horário: o primeiro envio é desconhecido e não é inventado
        LembretesService.enviarLembrete(AgendaService.getById('sem-data'), ClienteService.getById('c1'));
        assert.equal('dataLembrete' in gravado('sem-data'), false);
        assert.equal(gravado('sem-data').dataReenvioLembrete, '2026-10-05T18:00:00.000Z');
        assert.equal(gravado('sem-data').lembreteEnviado, true);
    } finally {
        mock.timers.reset();
    }
});

test('título do modal de lembretes acompanha o que há na lista', () => {
    assert.equal(LembretesService.tituloModal(1, 0), 'Enviar Lembretes (1 pendente)');
    assert.equal(LembretesService.tituloModal(3, 0), 'Enviar Lembretes (3 pendentes)');
    assert.equal(LembretesService.tituloModal(2, 1), 'Enviar Lembretes (2 pendentes, 1 já enviado)');
    // Só reenvios: nada de "0 pendentes"
    assert.equal(LembretesService.tituloModal(0, 1), 'Reenviar Lembretes (1 já enviado)');
    assert.equal(LembretesService.tituloModal(0, 4), 'Reenviar Lembretes (4 já enviados)');
});

test('AgendaService.getPorData com texto AAAA-MM-DD usa o dia local, não o UTC', () => {
    clientes([{ nome: 'Ana' }]);
    agendamentos([
        { id: 'manha', dataHora: '2026-10-05T10:00' },
        { id: 'noite', dataHora: '2026-10-05T23:30' },
        { id: 'amanha', dataHora: '2026-10-06T09:00' },
        { id: 'ontem-noite', dataHora: '2026-10-04T23:30' }
    ]);
    assert.deepEqual(ids(AgendaService.getPorData('2026-10-05')).sort(), ['manha', 'noite']);
    assert.deepEqual(ids(AgendaService.getPorData('2026-10-04')), ['ontem-noite']);
    // Dia que não existe não casa com nenhum agendamento
    assert.deepEqual(AgendaService.getPorData('2026-02-31'), []);
    // ISO com horário continua valendo pelo instante: 02:30Z de 06/10 é 23:30 de 05/10 aqui
    assert.deepEqual(ids(AgendaService.getPorData('2026-10-06T02:30:00.000Z')).sort(), ['manha', 'noite']);
});

test('AgendaService.getPorData compara pelo dia local, mesmo depois das 21h', () => {
    clientes([{ nome: 'Ana' }]);
    agendamentos([
        { id: 'manha', dataHora: '2026-10-05T10:00' },
        { id: 'noite', dataHora: '2026-10-05T23:30' },
        // Mesmo instante das 23:30 locais de 05/10, gravado em UTC
        { id: 'noite-utc', dataHora: '2026-10-06T02:30:00.000Z' },
        { id: 'amanha-cedo', dataHora: '2026-10-06T00:15' },
        { id: 'amanha', dataHora: '2026-10-06T09:00' },
        { id: 'ontem-noite', dataHora: '2026-10-04T23:30' },
        { id: 'invalido', dataHora: 'abc' }
    ]);
    const esperado = ['manha', 'noite', 'noite-utc'];
    assert.deepEqual(ids(AgendaService.getPorData(new Date(2026, 9, 5, 22, 0))).sort(), esperado);
    assert.deepEqual(ids(AgendaService.getPorData(new Date(2026, 9, 5, 0, 0))).sort(), esperado);
    assert.deepEqual(ids(AgendaService.getPorData(new Date(2026, 9, 5, 23, 59))).sort(), esperado);
});

test('AgendaService.getHoje às 22h conta os mesmos agendamentos de hoje do card Avisos', () => {
    clientes([{ nome: 'Ana' }]);
    agendamentos([
        { id: 'manha', dataHora: '2026-10-05T10:00', status: 'concluido' },
        { id: 'noite', dataHora: '2026-10-05T23:30' },
        { id: 'amanha', dataHora: '2026-10-06T09:00' }
    ]);
    const noite = new Date(2026, 9, 5, 22, 0);
    mock.timers.enable({ apis: ['Date'], now: noite });
    try {
        assert.deepEqual(ids(AgendaService.getHoje()).sort(), ['manha', 'noite']);
        // O card só mostra o que ainda não passou; o que ele mostra tem de estar em "hoje"
        assert.deepEqual(ids(NotificacoesService.agendamentosDoDia(noite, 0)), ['noite']);
    } finally {
        mock.timers.reset();
    }
});

test('resumo separa hoje e semana e soma o total', () => {
    clientes([
        { nome: 'Hoje', dataNascimento: '1990-10-05' },
        { nome: 'Semana', dataNascimento: '1990-10-08' },
        { nome: 'Longe', dataNascimento: '1990-12-25' }
    ]);
    agendamentos([
        { id: 'h1', dataHora: '2026-10-05T14:00' },
        { id: 'h2', dataHora: '2026-10-05T16:00', status: 'confirmado' },
        { id: 'm1', dataHora: '2026-10-06T09:00' },
        { id: 'm2', dataHora: '2026-10-06T10:00', lembreteEnviado: true },
        { id: 'm3', dataHora: '2026-10-06T11:00' }
    ]);
    const resumo = NotificacoesService.resumo(AGORA);
    assert.deepEqual(nomes(resumo.aniversariantesHoje), ['Hoje']);
    assert.deepEqual(nomes(resumo.aniversariantesSemana), ['Semana']);
    assert.deepEqual(ids(resumo.agendamentosHoje), ['h1', 'h2']);
    assert.deepEqual(ids(resumo.agendamentosAmanha), ['m1', 'm2', 'm3']);
    assert.deepEqual(ids(resumo.lembretesPendentes), ['m1', 'm3']);
    assert.equal(resumo.total, 1 + 2 + 2);
    assert.equal(
        resumo.total,
        resumo.aniversariantesHoje.length + resumo.agendamentosHoje.length + resumo.lembretesPendentes.length
    );
});

test('resumo sem dados devolve listas vazias e total zero', () => {
    const resumo = NotificacoesService.resumo(AGORA);
    assert.equal(resumo.total, 0);
    for (const chave of ['aniversariantesHoje', 'aniversariantesSemana', 'agendamentosHoje', 'agendamentosAmanha', 'lembretesPendentes']) {
        assert.deepEqual(resumo[chave], []);
    }
});
