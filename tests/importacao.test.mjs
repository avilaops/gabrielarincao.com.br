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

// FileReader falso: entrega o `conteudo` do arquivo falso, como o navegador faria
class FileReaderFalso {
    readAsText(file) {
        queueMicrotask(() => {
            if (file.falhar) {
                this.onerror();
                return;
            }
            this.onload({ target: { result: file.conteudo } });
        });
    }
}

globalThis.localStorage = new LocalStorageFalso();
globalThis.FileReader = FileReaderFalso;

const { ImportacaoService } = await import('../src/services/importacao.js');
const { ClienteService } = await import('../src/services/clientes.js');

const VCF = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    'FN:Ana Souza',
    'TEL;TYPE=CELL:(17) 99999-0000',
    'EMAIL:ana@example.com',
    'END:VCARD',
    'BEGIN:VCARD',
    'VERSION:3.0',
    'FN:Sem Telefone',
    'END:VCARD',
    ''
].join('\r\n');

const CSV = 'Nome,Telefone,Email\nBia Lima,(17) 98888-0000,bia@example.com\nSem Telefone,,\n';

beforeEach(() => {
    globalThis.localStorage.clear();
});

test('importarArquivo importa .vcf e devolve o resumo que a tela lê', async () => {
    const resultado = await ImportacaoService.importarArquivo({ name: 'contatos.vcf', conteudo: VCF });

    assert.equal(resultado.importados, 1);
    assert.equal(resultado.erros, 1);
    assert.equal(resultado.detalhes.erros[0].erro, 'Nome ou telefone não encontrado');

    const clientes = ClienteService.getAll();
    assert.equal(clientes.length, 1);
    assert.equal(clientes[0].nome, 'Ana Souza');
    assert.equal(clientes[0].telefone, '17999990000');
});

test('importarArquivo importa .csv e devolve o resumo que a tela lê', async () => {
    const resultado = await ImportacaoService.importarArquivo({ name: 'contatos.csv', conteudo: CSV });

    assert.equal(resultado.importados, 1);
    assert.equal(resultado.erros, 1);
    assert.equal(resultado.detalhes.erros[0].linha, 3);

    const clientes = ClienteService.getAll();
    assert.equal(clientes.length, 1);
    assert.equal(clientes[0].nome, 'Bia Lima');
    assert.equal(clientes[0].telefone, '17988880000');
});

test('importarArquivo aceita extensão em maiúsculas', async () => {
    const vcf = await ImportacaoService.importarArquivo({ name: 'CONTATOS.VCF', conteudo: VCF });
    const csv = await ImportacaoService.importarArquivo({ name: 'Contatos.Csv', conteudo: CSV });

    assert.equal(vcf.importados, 1);
    assert.equal(csv.importados, 1);
});

test('importarArquivo recusa formato que não é VCF nem CSV', async () => {
    for (const name of ['contatos.xlsx', 'contatos', 'vcf', 'contatos.csv.txt']) {
        await assert.rejects(
            ImportacaoService.importarArquivo({ name, conteudo: VCF }),
            /Formato não suportado/
        );
    }
    await assert.rejects(ImportacaoService.importarArquivo(undefined), /Formato não suportado/);
    assert.equal(ClienteService.getAll().length, 0);
});

test('importarArquivo repassa a falha de leitura do arquivo', async () => {
    await assert.rejects(
        ImportacaoService.importarArquivo({ name: 'contatos.vcf', falhar: true }),
        /Erro ao ler arquivo/
    );
});
