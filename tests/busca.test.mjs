import { test } from 'node:test';
import assert from 'node:assert/strict';

const { BuscaService } = await import('../src/services/busca.js');

const ids = (lista) => lista.map(c => c.id);

const CLIENTES = [
    {
        id: 'jose', nome: 'José Almeida', telefone: '17999990000', instagram: '@jose.alm',
        dataNascimento: '1990-05-01', observacoes: 'Prefere manhã', createdAt: '2026-01-10T10:00:00.000Z',
        historico: [
            { id: 'h1', data: '2026-03-10T14:00', servico: 'Nanofios', valor: 300 },
            { id: 'h2', data: '2026-08-05T09:00', servico: 'Henna', valor: 60 }
        ]
    },
    {
        id: 'bia', nome: 'Bia Lima', telefone: 17988880000, instagram: '@bialima',
        dataNascimento: '1985-05-20', createdAt: '2026-02-10T10:00:00.000Z',
        historico: [
            { id: 'h3', data: '2026-08-15T10:00', servico: 'nanofios', valor: '250' }
        ]
    },
    {
        id: 'carla', nome: 'Carla Souza', telefone: '(11) 97777-0000', instagram: '',
        dataNascimento: '', createdAt: '2026-03-10T10:00:00.000Z', historico: []
    },
    // Backup restaurado: sem nome e sem histórico
    { id: 'semnome', telefone: '11966660000', dataNascimento: '2000-12-31', createdAt: '2026-04-10T10:00:00.000Z' },
    {
        id: 'ana', nome: 'Ana Árvore', telefone: '11955550000', dataNascimento: '1992-09-09',
        createdAt: '2026-05-10T10:00:00.000Z',
        historico: [
            { id: 'h4', data: '2026-09-30T23:30', servico: 'henna', valor: 70 },
            { id: 'h5', data: '2026-01-05', servico: 'Design', valor: 80 },
            { id: 'h6', data: 'data ruim', servico: 'Design', valor: 'abc' }
        ]
    }
];

test('normalizar tira acento, caixa e espaço das pontas', () => {
    assert.equal(BuscaService.normalizar('  JOSÉ  '), 'jose');
    assert.equal(BuscaService.normalizar(null), '');
    assert.equal(BuscaService.normalizar(undefined), '');
    assert.equal(BuscaService.normalizar(17999990000), '17999990000');
});

test('sem filtro devolve todos, em array novo', () => {
    const resultado = BuscaService.filtrarClientes(CLIENTES);
    assert.deepEqual(ids(resultado), ids(CLIENTES));
    assert.notEqual(resultado, CLIENTES);
    assert.deepEqual(ids(BuscaService.filtrarClientes(CLIENTES, null)), ids(CLIENTES));
    assert.deepEqual(BuscaService.filtrarClientes(undefined, { texto: 'a' }), []);
});

test('texto ignora acento e procura em nome, Instagram e observações', () => {
    assert.deepEqual(ids(BuscaService.filtrarClientes(CLIENTES, { texto: 'jose' })), ['jose']);
    assert.deepEqual(ids(BuscaService.filtrarClientes(CLIENTES, { texto: 'ARVORE' })), ['ana']);
    assert.deepEqual(ids(BuscaService.filtrarClientes(CLIENTES, { texto: '@bialima' })), ['bia']);
    assert.deepEqual(ids(BuscaService.filtrarClientes(CLIENTES, { texto: 'manha' })), ['jose']);
});

test('texto com dígito compara o telefone só pelos dígitos', () => {
    assert.deepEqual(ids(BuscaService.filtrarClientes(CLIENTES, { texto: '(17) 99999' })), ['jose']);
    // telefone numérico e telefone gravado com máscara
    assert.deepEqual(ids(BuscaService.filtrarClientes(CLIENTES, { texto: '98888' })), ['bia']);
    assert.deepEqual(ids(BuscaService.filtrarClientes(CLIENTES, { texto: '1197777' })), ['carla']);
});

test('texto sem dígito não casa com telefone', () => {
    assert.deepEqual(BuscaService.filtrarClientes(CLIENTES, { texto: '()' }), []);
    assert.deepEqual(BuscaService.filtrarClientes(CLIENTES, { texto: 'xyz' }), []);
});

test('cliente sem nome não quebra a busca por texto', () => {
    assert.doesNotThrow(() => BuscaService.filtrarClientes(CLIENTES, { texto: 'qualquer' }));
    assert.deepEqual(ids(BuscaService.filtrarClientes(CLIENTES, { texto: '96666' })), ['semnome']);
});

test('mês de aniversário lê o mês do texto e não desloca o dia 1º', () => {
    assert.deepEqual(ids(BuscaService.filtrarClientes(CLIENTES, { mesAniversario: 5 })), ['jose', 'bia']);
    assert.deepEqual(ids(BuscaService.filtrarClientes(CLIENTES, { mesAniversario: '5' })), ['jose', 'bia']);
    assert.deepEqual(BuscaService.filtrarClientes(CLIENTES, { mesAniversario: 4 }), []);
    // sem data de nascimento fica de fora com o filtro ativo
    assert.deepEqual(ids(BuscaService.filtrarClientes(CLIENTES, { mesAniversario: 12 })), ['semnome']);
});

test('filtro inválido ou vazio é ignorado', () => {
    const todos = ids(CLIENTES);
    assert.deepEqual(ids(BuscaService.filtrarClientes(CLIENTES, { mesAniversario: 13 })), todos);
    assert.deepEqual(ids(BuscaService.filtrarClientes(CLIENTES, { mesAniversario: '' })), todos);
    assert.deepEqual(ids(BuscaService.filtrarClientes(CLIENTES, { atendimento: 'talvez' })), todos);
    assert.deepEqual(ids(BuscaService.filtrarClientes(CLIENTES, { periodoDe: '10/07/2026' })), todos);
    assert.deepEqual(ids(BuscaService.filtrarClientes(CLIENTES, { texto: '   ', servico: '' })), todos);
});

test('atendimento com/sem; histórico ausente conta como sem', () => {
    assert.deepEqual(ids(BuscaService.filtrarClientes(CLIENTES, { atendimento: 'com' })), ['jose', 'bia', 'ana']);
    assert.deepEqual(ids(BuscaService.filtrarClientes(CLIENTES, { atendimento: 'sem' })), ['carla', 'semnome']);
});

test('serviço é igualdade sem acento nem caixa', () => {
    assert.deepEqual(ids(BuscaService.filtrarClientes(CLIENTES, { servico: 'Nanofios' })), ['jose', 'bia']);
    assert.deepEqual(ids(BuscaService.filtrarClientes(CLIENTES, { servico: 'HENNA' })), ['jose', 'ana']);
    assert.deepEqual(BuscaService.filtrarClientes(CLIENTES, { servico: 'Nano' }), []);
});

test('serviço e período valem sobre o mesmo atendimento', () => {
    // José fez Nanofios em março e Henna em agosto: não entra em "Nanofios, de julho a setembro"
    const resultado = BuscaService.filtrarClientes(CLIENTES, {
        servico: 'Nanofios', periodoDe: '2026-07-01', periodoAte: '2026-09-30'
    });
    assert.deepEqual(ids(resultado), ['bia']);
});

test('período é inclusivo e usa o dia local do atendimento', () => {
    assert.deepEqual(
        ids(BuscaService.filtrarClientes(CLIENTES, { periodoDe: '2026-09-01', periodoAte: '2026-09-30' })),
        ['ana']
    );
    assert.deepEqual(BuscaService.filtrarClientes(CLIENTES, { periodoDe: '2026-10-01' }), []);
    // data gravada só como AAAA-MM-DD é usada como está
    assert.deepEqual(
        ids(BuscaService.filtrarClientes(CLIENTES, { periodoDe: '2026-01-05', periodoAte: '2026-01-05' })),
        ['ana']
    );
});

test('só periodoDe é "a partir de" e só periodoAte é "até"', () => {
    assert.deepEqual(ids(BuscaService.filtrarClientes(CLIENTES, { periodoDe: '2026-08-10' })), ['bia', 'ana']);
    assert.deepEqual(ids(BuscaService.filtrarClientes(CLIENTES, { periodoAte: '2026-03-10' })), ['jose', 'ana']);
});

test('item com data inválida não casa com período', () => {
    const cliente = [{ id: 'x', nome: 'X', historico: [{ data: 'data ruim', servico: 'Design' }, { servico: 'Design' }] }];
    assert.deepEqual(BuscaService.filtrarClientes(cliente, { periodoDe: '2000-01-01' }), []);
    assert.deepEqual(ids(BuscaService.filtrarClientes(cliente, { servico: 'design' })), ['x']);
});

test('periodoDe maior que periodoAte troca as pontas', () => {
    const certo = BuscaService.filtrarClientes(CLIENTES, { periodoDe: '2026-07-01', periodoAte: '2026-09-30' });
    const trocado = BuscaService.filtrarClientes(CLIENTES, { periodoDe: '2026-09-30', periodoAte: '2026-07-01' });
    assert.deepEqual(ids(certo), ['jose', 'bia', 'ana']);
    assert.deepEqual(ids(trocado), ids(certo));
});

test('filtros combinados aplicam E', () => {
    assert.deepEqual(
        ids(BuscaService.filtrarClientes(CLIENTES, { texto: 'lima', mesAniversario: 5, atendimento: 'com' })),
        ['bia']
    );
    assert.deepEqual(
        BuscaService.filtrarClientes(CLIENTES, { texto: 'lima', mesAniversario: 5, atendimento: 'sem' }),
        []
    );
    assert.deepEqual(
        BuscaService.filtrarClientes(CLIENTES, { texto: 'lima', mesAniversario: 9, atendimento: 'com' }),
        []
    );
});

test('ordem recentes: createdAt do mais novo para o mais antigo', () => {
    assert.deepEqual(ids(BuscaService.ordenarClientes(CLIENTES)), ['ana', 'semnome', 'carla', 'bia', 'jose']);
    assert.deepEqual(ids(BuscaService.ordenarClientes(CLIENTES, 'recentes')), ['ana', 'semnome', 'carla', 'bia', 'jose']);
});

test('ordem por nome, A–Z e Z–A, sem diferenciar acento', () => {
    // cliente sem nome conta como nome vazio
    assert.deepEqual(ids(BuscaService.ordenarClientes(CLIENTES, 'nome-az')), ['semnome', 'ana', 'bia', 'carla', 'jose']);
    assert.deepEqual(ids(BuscaService.ordenarClientes(CLIENTES, 'nome-za')), ['jose', 'carla', 'bia', 'ana', 'semnome']);
});

test('ordem último atendimento: sem histórico vai para o fim', () => {
    // ana 30/09, bia 15/08, jose 05/08; carla e semnome sem histórico, desempatados por recentes
    assert.deepEqual(
        ids(BuscaService.ordenarClientes(CLIENTES, 'ultimo-atendimento')),
        ['ana', 'bia', 'jose', 'semnome', 'carla']
    );
});

test('ordem mais procedimentos', () => {
    assert.deepEqual(
        ids(BuscaService.ordenarClientes(CLIENTES, 'mais-procedimentos')),
        ['ana', 'jose', 'bia', 'semnome', 'carla']
    );
});

test('ordem maior valor soma Number(valor) e trata valor inválido como zero', () => {
    // jose 360, bia 250 (texto), ana 150 ('abc' vale 0)
    assert.deepEqual(
        ids(BuscaService.ordenarClientes(CLIENTES, 'maior-valor')),
        ['jose', 'bia', 'ana', 'semnome', 'carla']
    );
});

test('ordem desconhecida cai em recentes', () => {
    const recentes = ids(BuscaService.ordenarClientes(CLIENTES, 'recentes'));
    assert.deepEqual(ids(BuscaService.ordenarClientes(CLIENTES, 'aleatoria')), recentes);
    assert.deepEqual(ids(BuscaService.ordenarClientes(CLIENTES, 'constructor')), recentes);
    assert.deepEqual(ids(BuscaService.ordenarClientes(CLIENTES, null)), recentes);
});

test('servicosDoHistorico deduplica sem diferenciar caixa e ordena', () => {
    assert.deepEqual(BuscaService.servicosDoHistorico(CLIENTES), ['Design', 'Henna', 'Nanofios']);
    assert.deepEqual(
        BuscaService.servicosDoHistorico([{ historico: [{ servico: 'henna' }, { servico: 'Henna' }, { servico: '  ' }, {}] }]),
        ['henna']
    );
    assert.deepEqual(BuscaService.servicosDoHistorico([]), []);
});

test('filtrosAtivos conta o período como um e ignora a ordenação', () => {
    assert.equal(BuscaService.filtrosAtivos({}), 0);
    assert.equal(BuscaService.filtrosAtivos(), 0);
    assert.equal(BuscaService.filtrosAtivos({ texto: '  ', mesAniversario: '', atendimento: '', servico: '' }), 0);
    assert.equal(BuscaService.filtrosAtivos({ periodoDe: '2026-07-01', periodoAte: '2026-09-30' }), 1);
    assert.equal(BuscaService.filtrosAtivos({ periodoAte: '2026-09-30' }), 1);
    assert.equal(BuscaService.filtrosAtivos({ ordem: 'nome-az' }), 0);
    assert.equal(
        BuscaService.filtrosAtivos({
            texto: 'ana', mesAniversario: '5', atendimento: 'com', servico: 'Henna',
            periodoDe: '2026-07-01', periodoAte: '2026-09-30'
        }),
        5
    );
});

test('a lista de entrada não é alterada', () => {
    const copia = structuredClone(CLIENTES);
    const ordemOriginal = ids(CLIENTES);

    BuscaService.filtrarClientes(CLIENTES, { texto: 'a', servico: 'Henna', periodoDe: '2026-09-30', periodoAte: '2026-07-01' });
    BuscaService.ORDENS.forEach(ordem => BuscaService.ordenarClientes(CLIENTES, ordem));
    BuscaService.servicosDoHistorico(CLIENTES);

    assert.deepEqual(CLIENTES, copia);
    assert.deepEqual(ids(CLIENTES), ordemOriginal);
});
