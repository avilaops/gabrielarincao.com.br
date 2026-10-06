import { test } from 'node:test';
import assert from 'node:assert/strict';

const { LandingPage } = await import('../src/pages/landing.js');
const html = await new LandingPage().render();

test('landing leva ao WhatsApp da Gabriela', () => {
    assert.match(html, /https:\/\/wa\.me\/5517996820993/);
});

test('landing não aponta para o CRM removido', () => {
    assert.doesNotMatch(html, /#\/login|Área Administrativa/);
});
