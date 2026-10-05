import { test, beforeEach, mock } from 'node:test';
import assert from 'node:assert/strict';

// DOM mínimo em memória: só o que o Toast usa
class ElementoFalso {
    constructor() {
        this.filhos = [];
        this.atributos = {};
        this.ouvintes = {};
        this.pai = null;
        this.className = '';
        this.textContent = '';
        this.innerHTML = '';
    }
    setAttribute(nome, valor) {
        this.atributos[nome] = valor;
    }
    appendChild(filho) {
        filho.pai = this;
        this.filhos.push(filho);
    }
    addEventListener(evento, fn) {
        this.ouvintes[evento] = fn;
    }
    remove() {
        if (!this.pai) return;
        this.pai.filhos = this.pai.filhos.filter(f => f !== this);
        this.pai = null;
    }
}

function documentoFalso() {
    const body = new ElementoFalso();
    return {
        body,
        createElement: () => new ElementoFalso(),
        getElementById: id => body.filhos.find(f => f.id === id) || null
    };
}

const { Toast } = await import('../src/components/toast.js');

beforeEach(() => {
    globalThis.document = documentoFalso();
});

test('show cria o contêiner único com role e aria-live', () => {
    Toast.show('um');
    Toast.show('dois');
    assert.equal(document.body.filhos.length, 1);
    const container = document.body.filhos[0];
    assert.equal(container.id, 'toast-container');
    assert.equal(container.atributos.role, 'status');
    assert.equal(container.atributos['aria-live'], 'polite');
    assert.equal(container.filhos.length, 2);
});

test('a mensagem entra por textContent, nunca por innerHTML', () => {
    const toast = Toast.show('<img src=x onerror=alert(1)>');
    assert.equal(toast.textContent, '<img src=x onerror=alert(1)>');
    assert.equal(toast.innerHTML, '');
});

test('tipo padrão é info e os atalhos usam as classes existentes', () => {
    assert.equal(Toast.show('a').className, 'toast toast-info');
    assert.equal(Toast.success('a').className, 'toast toast-success');
    assert.equal(Toast.error('a').className, 'toast toast-error');
    assert.equal(Toast.warning('a').className, 'toast toast-warning');
});

test('some sozinho depois da duração (4 s por padrão) e ao clicar', () => {
    mock.timers.enable({ apis: ['setTimeout'] });
    try {
        const padrao = Toast.success('padrão');
        const curto = Toast.show('curto', 'info', 1000);
        const clicado = Toast.show('clicado');
        const container = document.body.filhos[0];

        clicado.ouvintes.click();
        assert.deepEqual(container.filhos, [padrao, curto]);

        mock.timers.tick(1000);
        assert.deepEqual(container.filhos, [padrao]);

        mock.timers.tick(2999);
        assert.deepEqual(container.filhos, [padrao]);

        mock.timers.tick(1);
        assert.deepEqual(container.filhos, []);
    } finally {
        mock.timers.reset();
    }
});
