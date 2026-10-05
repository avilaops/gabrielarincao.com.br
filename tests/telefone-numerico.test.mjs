import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

// localStorage falso em memória
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
const { ClienteService } = await import('../src/services/clientes.js');
const { LembretesService } = await import('../src/services/lembretes.js');

const KEYS = StorageService.KEYS;

// Backup editado à mão: telefone como número, não como texto
const CLIENTES = [
    { id: 'c1', nome: 'Ana Souza', telefone: 17999990000 },
    { id: 'c2', nome: 'Bia Lima', telefone: '17988880000' },
    { id: 'c3', nome: 'Carla Sem Telefone' }
];
const AGENDAMENTO = { id: 'a1', clienteId: 'c1', servico: 'Design', valor: 80, dataHora: '2026-10-06T14:00:00' };

beforeEach(() => {
    globalThis.localStorage.clear();
    StorageService.set(KEYS.CLIENTES, CLIENTES);
    StorageService.set(KEYS.AGENDAMENTOS, [AGENDAMENTO]);
});

test('busca de clientes não quebra com telefone numérico', () => {
    assert.deepEqual(ClienteService.search('ana').map(c => c.id), ['c1']);
    assert.deepEqual(ClienteService.search('lima').map(c => c.id), ['c2']);
});

test('busca de clientes acha pelo telefone numérico', () => {
    assert.deepEqual(ClienteService.search('99999').map(c => c.id), ['c1']);
    assert.deepEqual(ClienteService.search('98888').map(c => c.id), ['c2']);
});

test('link do WhatsApp aceita telefone numérico', () => {
    assert.equal(
        LembretesService.gerarLinkWhatsApp(17999990000, 'Oi'),
        'https://wa.me/5517999990000?text=Oi'
    );
    assert.equal(
        LembretesService.gerarLinkWhatsApp('(17) 98888-0000', 'Oi'),
        'https://wa.me/5517988880000?text=Oi'
    );
});

test('envio de lembrete não quebra com telefone numérico e marca o agendamento', () => {
    const link = LembretesService.enviarLembrete(AGENDAMENTO, CLIENTES[0]);

    assert.ok(link.startsWith('https://wa.me/5517999990000?text='));
    assert.equal(StorageService.get(KEYS.AGENDAMENTOS)[0].lembreteEnviado, true);
});

test('envio de lembrete para cliente sem telefone falha sem marcar o agendamento', () => {
    assert.throws(() => LembretesService.enviarLembrete(AGENDAMENTO, CLIENTES[2]), /sem telefone/);
    assert.equal(StorageService.get(KEYS.AGENDAMENTOS)[0].lembreteEnviado, undefined);
});
