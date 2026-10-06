import { test } from 'node:test';
import assert from 'node:assert/strict';

const { Utils } = await import('../src/utils/utils.js');

test('sanitizeHTML escapa tags', () => {
    assert.equal(
        Utils.sanitizeHTML('<img src=x onerror=alert(1)>'),
        '&lt;img src=x onerror=alert(1)&gt;'
    );
});

test('sanitizeHTML escapa aspas para uso em atributo', () => {
    assert.equal(
        Utils.sanitizeHTML(`" onfocus="alert(1)" x='`),
        '&quot; onfocus=&quot;alert(1)&quot; x=&#39;'
    );
});

test('sanitizeHTML escapa o & antes dos demais, sem escapar duas vezes', () => {
    assert.equal(Utils.sanitizeHTML('Ana & Bia <3'), 'Ana &amp; Bia &lt;3');
});

test('sanitizeHTML devolve vazio para nulo e indefinido', () => {
    assert.equal(Utils.sanitizeHTML(null), '');
    assert.equal(Utils.sanitizeHTML(undefined), '');
    assert.equal(Utils.sanitizeHTML(''), '');
});

test('sanitizeHTML converte valor que não é texto', () => {
    assert.equal(Utils.sanitizeHTML(80), '80');
    assert.equal(Utils.sanitizeHTML({ toString: () => '<b>' }), '&lt;b&gt;');
});

test('formatPhone formata celular com 11 dígitos', () => {
    assert.equal(Utils.formatPhone('11999998888'), '(11) 99999-8888');
    assert.equal(Utils.formatPhone('(11) 99999-8888'), '(11) 99999-8888');
});

test('formatPhone aceita telefone numérico vindo de backup editado', () => {
    assert.equal(Utils.formatPhone(11999998888), '(11) 99999-8888');
    assert.equal(Utils.formatPhone(33334444), '33334444');
});

test('formatPhone devolve traço para telefone vazio', () => {
    assert.equal(Utils.formatPhone(''), '-');
    assert.equal(Utils.formatPhone(null), '-');
    assert.equal(Utils.formatPhone(undefined), '-');
});
