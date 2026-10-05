import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

// localStorage falso em memória; `falharEm` simula cota estourada numa chave
class LocalStorageFalso {
    constructor() {
        this.itens = new Map();
        this.falharEm = null;
    }
    getItem(key) {
        return this.itens.has(key) ? this.itens.get(key) : null;
    }
    setItem(key, value) {
        if (this.falharEm === key) throw new Error('QuotaExceededError');
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
const { BackupService } = await import('../src/services/backup.js');

const KEYS = StorageService.KEYS;
const DIA_MS = 24 * 60 * 60 * 1000;
const AGORA = new Date('2026-10-05T12:00:00.000Z');

const CLIENTES = [{ id: 'c1', nome: 'Ana', telefone: '17999990000' }, { id: 'c2', nome: 'Bia' }];
const AGENDAMENTOS = [{ id: 'a1', clienteId: 'c1', servico: 'Design', valor: 80 }];
const PAGAMENTOS = [{ id: 'p1', clienteId: 'c1', valor: 80 }];
const CONFIG = { nomeEstudio: 'Gabriela Rincão', whatsapp: '5517996820993' };

function popular() {
    StorageService.set(KEYS.CLIENTES, CLIENTES);
    StorageService.set(KEYS.AGENDAMENTOS, AGENDAMENTOS);
    StorageService.set(KEYS.PAGAMENTOS, PAGAMENTOS);
    StorageService.set(KEYS.CONFIG, CONFIG);
}

function backupValido() {
    return {
        app: 'gabriela-crm',
        versao: 1,
        geradoEm: AGORA.toISOString(),
        dados: structuredClone({ CLIENTES, AGENDAMENTOS, PAGAMENTOS, CONFIG })
    };
}

function estadoBruto() {
    return Object.fromEntries(Object.values(KEYS).map(key => [key, localStorage.getItem(key)]));
}

beforeEach(() => {
    localStorage.clear();
    localStorage.falharEm = null;
});

test('gerar() traz as quatro chaves e versao 1', () => {
    popular();
    const backup = BackupService.gerar(AGORA);

    assert.equal(backup.app, 'gabriela-crm');
    assert.equal(backup.versao, 1);
    assert.equal(backup.geradoEm, AGORA.toISOString());
    assert.deepEqual(Object.keys(backup.dados).sort(), ['AGENDAMENTOS', 'CLIENTES', 'CONFIG', 'PAGAMENTOS']);
    assert.deepEqual(backup.dados.CLIENTES, CLIENTES);
    assert.deepEqual(backup.dados.CONFIG, CONFIG);
});

test('gerar() sem nada gravado ainda produz um backup válido', () => {
    const backup = BackupService.gerar(AGORA);

    assert.deepEqual(backup.dados.CLIENTES, []);
    assert.equal(BackupService.validar(backup).ok, true);
});

test('gerar() não leva a sessão de login nem o registro do backup', () => {
    popular();
    localStorage.setItem('gabriela_auth', JSON.stringify({ email: 'admin@gabriela.com.br', role: 'admin' }));
    BackupService.registrarFeito(AGORA);

    const backup = BackupService.gerar(AGORA);
    const texto = JSON.stringify(backup);

    assert.deepEqual(Object.keys(backup.dados).sort(), Object.keys(KEYS).sort());
    assert.equal(texto.includes('gabriela_auth'), false);
    assert.equal(texto.includes('admin@gabriela.com.br'), false);
    assert.equal(texto.includes('gabriela_backup_meta'), false);
    assert.equal(texto.includes('ultimoBackup'), false);
    assert.equal(Object.values(KEYS).includes(BackupService.META_KEY), false);
});

test('ida e volta: gerar, limpar e restaurar devolve os mesmos dados', () => {
    popular();
    const backup = JSON.parse(JSON.stringify(BackupService.gerar(AGORA)));

    localStorage.clear();
    const resultado = BackupService.restaurar(backup);

    assert.deepEqual(resultado, { ok: true, resumo: { clientes: 2, agendamentos: 1, pagamentos: 1 } });
    assert.deepEqual(StorageService.get(KEYS.CLIENTES), CLIENTES);
    assert.deepEqual(StorageService.get(KEYS.AGENDAMENTOS), AGENDAMENTOS);
    assert.deepEqual(StorageService.get(KEYS.PAGAMENTOS), PAGAMENTOS);
    assert.deepEqual(StorageService.get(KEYS.CONFIG), CONFIG);
});

test('validar aceita um backup válido e devolve o resumo', () => {
    assert.deepEqual(BackupService.validar(backupValido()), {
        ok: true,
        resumo: { clientes: 2, agendamentos: 1, pagamentos: 1 }
    });
});

const casosInvalidos = {
    'valor que não é objeto': () => null,
    'app diferente': () => ({ ...backupValido(), app: 'outro-app' }),
    'versao maior que a conhecida': () => ({ ...backupValido(), versao: 2 }),
    'versao que não é número': () => ({ ...backupValido(), versao: '1' }),
    'dados ausente': () => {
        const backup = backupValido();
        delete backup.dados;
        return backup;
    },
    'CLIENTES que não é array': () => {
        const backup = backupValido();
        backup.dados.CLIENTES = { c1: {} };
        return backup;
    },
    'AGENDAMENTOS que não é array': () => {
        const backup = backupValido();
        backup.dados.AGENDAMENTOS = 'nada';
        return backup;
    },
    'PAGAMENTOS ausente': () => {
        const backup = backupValido();
        delete backup.dados.PAGAMENTOS;
        return backup;
    },
    'item que não é objeto': () => {
        const backup = backupValido();
        backup.dados.CLIENTES.push('texto');
        return backup;
    },
    'item nulo': () => {
        const backup = backupValido();
        backup.dados.PAGAMENTOS.push(null);
        return backup;
    },
    'item sem id': () => {
        const backup = backupValido();
        backup.dados.AGENDAMENTOS.push({ servico: 'Design' });
        return backup;
    },
    'item com id que não é string': () => {
        const backup = backupValido();
        backup.dados.CLIENTES.push({ id: 42, nome: 'Carla' });
        return backup;
    }
};

for (const [nome, montar] of Object.entries(casosInvalidos)) {
    test(`validar recusa: ${nome}`, () => {
        const resultado = BackupService.validar(montar());

        assert.equal(resultado.ok, false);
        assert.equal(typeof resultado.erro, 'string');
        assert.ok(resultado.erro.length > 0);
    });

    test(`restaurar não altera nada com: ${nome}`, () => {
        popular();
        const antes = estadoBruto();

        const resultado = BackupService.restaurar(montar());

        assert.equal(resultado.ok, false);
        assert.deepEqual(estadoBruto(), antes);
    });
}

test('restaurar ignora chaves desconhecidas dentro de dados', () => {
    const backup = backupValido();
    backup.dados.AUTH = { email: 'x@y.z' };
    backup.dados.gabriela_auth = 'invasor';

    assert.equal(BackupService.restaurar(backup).ok, true);
    assert.equal(localStorage.getItem('gabriela_auth'), null);
    assert.deepEqual([...localStorage.itens.keys()].sort(), Object.values(KEYS).sort());
});

test('restaurar é tudo ou nada: falha no meio repõe o estado anterior', (t) => {
    t.mock.method(console, 'error', () => {});
    popular();
    const antes = estadoBruto();

    const backup = backupValido();
    backup.dados.CLIENTES = [{ id: 'novo', nome: 'Outra base' }];
    backup.dados.AGENDAMENTOS = [];
    backup.dados.PAGAMENTOS = [];

    // CLIENTES e AGENDAMENTOS gravam; PAGAMENTOS estoura
    localStorage.falharEm = KEYS.PAGAMENTOS;
    const resultado = BackupService.restaurar(backup);
    localStorage.falharEm = null;

    assert.equal(resultado.ok, false);
    assert.deepEqual(estadoBruto(), antes);
});

test('interpretar recusa texto que não é JSON e devolve o backup quando é válido', () => {
    assert.equal(BackupService.interpretar('isto não é json').ok, false);
    assert.equal(BackupService.interpretar('{"app":"outro"}').ok, false);

    const resultado = BackupService.interpretar(JSON.stringify(backupValido()));
    assert.equal(resultado.ok, true);
    assert.deepEqual(resultado.resumo, { clientes: 2, agendamentos: 1, pagamentos: 1 });
    assert.deepEqual(resultado.backup, backupValido());
});

test('tamanhoAceito recusa arquivo maior que 10 MB', () => {
    assert.equal(BackupService.tamanhoAceito(10 * 1024 * 1024), true);
    assert.equal(BackupService.tamanhoAceito(10 * 1024 * 1024 + 1), false);
});

test('nomeArquivo usa a data no formato AAAA-MM-DD', () => {
    assert.equal(BackupService.nomeArquivo(new Date(2026, 9, 5, 10, 0)), 'backup-gabriela-2026-10-05.json');
    assert.equal(BackupService.nomeArquivo(new Date(2027, 0, 1, 0, 0)), 'backup-gabriela-2027-01-01.json');
});

test('diasDesdeUltimo: null sem backup, dias inteiros depois', () => {
    assert.equal(BackupService.diasDesdeUltimo(AGORA), null);

    BackupService.registrarFeito(new Date(AGORA.getTime() - 3 * DIA_MS - 1000));
    assert.equal(BackupService.diasDesdeUltimo(AGORA), 3);

    localStorage.setItem(BackupService.META_KEY, 'lixo');
    assert.equal(BackupService.diasDesdeUltimo(AGORA), null);
});

test('precisaLembrar: falso sem dados', () => {
    StorageService.init();
    assert.equal(BackupService.precisaLembrar(AGORA), false);
});

test('precisaLembrar: verdadeiro com dados e sem backup', () => {
    popular();
    assert.equal(BackupService.precisaLembrar(AGORA), true);
});

test('precisaLembrar: basta um tipo de dado cadastrado', () => {
    StorageService.set(KEYS.PAGAMENTOS, PAGAMENTOS);
    assert.equal(BackupService.precisaLembrar(AGORA), true);
});

test('precisaLembrar: falso com backup de 6 dias', () => {
    popular();
    BackupService.registrarFeito(new Date(AGORA.getTime() - 6 * DIA_MS));
    assert.equal(BackupService.precisaLembrar(AGORA), false);
});

test('precisaLembrar: verdadeiro com backup de 7 dias', () => {
    popular();
    BackupService.registrarFeito(new Date(AGORA.getTime() - 7 * DIA_MS));
    assert.equal(BackupService.precisaLembrar(AGORA), true);
});

test('registrarFeito grava em gabriela_backup_meta, fora de StorageService.KEYS', () => {
    BackupService.registrarFeito(AGORA);

    assert.deepEqual(JSON.parse(localStorage.getItem('gabriela_backup_meta')), { ultimoBackup: AGORA.toISOString() });
    assert.equal(BackupService.diasDesdeUltimo(AGORA), 0);
});
