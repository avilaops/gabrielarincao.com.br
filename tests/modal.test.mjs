import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

// DOM mínimo em memória: só o que o Modal usa para abrir e sair da tela
class DocumentoFalso {
    constructor() {
        this.elementos = new Map();
        this.ouvintes = [];
        this.body = {
            insertAdjacentHTML: (_posicao, html) => {
                const id = html.match(/id="([^"]+)"/)[1];
                this.elementos.set(id, {
                    style: {},
                    classList: { add() {} },
                    addEventListener() {},
                    querySelector: () => null,
                    remove: () => this.elementos.delete(id)
                });
            }
        };
    }
    getElementById(id) {
        return this.elementos.get(id) || null;
    }
    addEventListener(evento, fn) {
        this.ouvintes.push({ evento, fn });
    }
    removeEventListener(evento, fn) {
        this.ouvintes = this.ouvintes.filter(o => !(o.evento === evento && o.fn === fn));
    }
}

globalThis.requestAnimationFrame = () => {};

const { Modal } = await import('../src/components/modal.js');

beforeEach(() => {
    globalThis.document = new DocumentoFalso();
});

test('remove tira o modal da tela e o listener de ESC', () => {
    const modal = new Modal({ id: 'modal-teste' });
    modal.show();
    assert.ok(document.getElementById('modal-teste'));
    assert.equal(document.ouvintes.length, 1);

    modal.remove();
    assert.equal(document.getElementById('modal-teste'), null);
    assert.equal(document.ouvintes.length, 0);
});

test('remove não quebra com modal que já saiu da tela', () => {
    const modal = new Modal({ id: 'modal-teste' });
    modal.show();
    modal.remove();
    modal.remove();
    assert.equal(document.ouvintes.length, 0);
});

test('reabrir e remover várias vezes não acumula listener de ESC', () => {
    for (let i = 0; i < 5; i++) {
        const modal = new Modal({ id: 'modal-' + i });
        modal.show();
        modal.remove();
    }
    assert.equal(document.ouvintes.length, 0);
});

test('ESC fecha o modal e tira o próprio listener', () => {
    const modal = new Modal({ id: 'modal-teste' });
    modal.show();

    document.ouvintes[0].fn({ key: 'Escape' });
    assert.equal(document.ouvintes.length, 0);
    assert.equal(document.getElementById('modal-teste').style.opacity, '0');
});
