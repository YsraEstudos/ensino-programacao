import {withPublicDependencies} from './public-test-source.mjs';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {JSDOM} from 'jsdom';

const root = new URL('../public/', import.meta.url);
const catalog = JSON.parse(readFileSync(new URL('course-catalog.json', root)));
const settle = async () => { for (let i = 0; i < 5; i++) await new Promise(resolve => setImmediate(resolve)); };

async function load({items = catalog, missingStatus = false, missingModule = false, saved = {}} = {}) {
  const dom = new JSDOM(readFileSync(new URL('devpath.html', root), 'utf8'), {
    url: 'http://localhost/devpath.html#/catalog', runScripts: 'outside-only'
  });
  const w = dom.window;
  if (missingStatus) w.document.querySelector('.save-status').remove();
  w.fetch = async () => ({ok: true, json: async () => items});
  w.localStorage.setItem('devpath-local-preview-v1', JSON.stringify(saved));
  for (const script of w.document.querySelectorAll('script[src]')) {
    const name = new URL(script.src).pathname.slice(1);
    if (missingModule && name === 'js-stage00-ui.js') continue;
    w.eval(withPublicDependencies(readFileSync(new URL(name, root), 'utf8')));
  }
  await settle();
  return dom;
}

test('catalog counts follow the loaded catalog, including a smaller valid catalog', async () => {
  const dom = await load({items: catalog.slice(0, 5)});
  try {
    assert.match(dom.window.document.querySelector('.page-intro').textContent, /5 atividades/);
    assert.equal(dom.window.document.querySelectorAll('.catalog-learning-card').length, 5);
  } finally { dom.window.close(); }
});

test('missing optional save indicator does not prevent rendering or saving', async () => {
  const dom = await load({missingStatus: true});
  try {
    assert.equal(dom.window.document.querySelectorAll('.catalog-learning-card').length, 254);
    const saved = JSON.parse(dom.window.localStorage.getItem('devpath-local-preview-v1'));
    assert.equal(saved.activeDays.length, 1);
  } finally { dom.window.close(); }
});

test('missing required module produces an actionable startup message', async () => {
  const dom = await load({missingModule: true});
  try { assert.match(dom.window.document.querySelector('#view').textContent, /carregar.*DevPathStage00UI/i); }
  finally { dom.window.close(); }
});

test('app state and functions do not leak into the global script scope', async () => {
  const dom = await load();
  try {
    assert.equal(dom.window.eval('typeof progress'), 'undefined');
    assert.equal(dom.window.eval('typeof selectedCatalogFilter'), 'undefined');
    assert.equal(dom.window.render, undefined);
  } finally { dom.window.close(); }
});

test('untrusted catalog text renders as text and malformed route identifiers are rejected', async () => {
  const items = structuredClone(catalog);
  items[0].title = '<img src=x onerror="window.injected=true">';
  const dom = await load({items});
  try {
    assert.equal(dom.window.document.querySelector('.catalog-learning-card img'), null);
    assert.match(dom.window.document.querySelector('.catalog-learning-card h3').textContent, /<img/);
  } finally { dom.window.close(); }
  items[0].stage = 'D" onmouseover="window.injected=true';
  const bad = await load({items});
  try { assert.equal(bad.window.document.querySelector('[onmouseover]'), null); }
  finally { bad.window.close(); }
});

test('scheduled review advances once, saves its interval, and enables the next question', async () => {
  const item = catalog.find(item => item.stage === '04');
  const dom = await load({saved: {
    answers: {[item.id]: true}, reviewSchedule: {[item.id]: {intervalIndex: 0, dueAt: 1}}
  }});
  try {
    const w = dom.window;
    w.location.hash = '#/review'; await settle();
    w.document.querySelector(`[data-review-choice="${item.review.answer}"]`).click();
    w.document.querySelector('[data-review-check]').click();
    const saved = JSON.parse(w.localStorage.getItem('devpath-local-preview-v1'));
    assert.equal(saved.reviewSchedule[item.id].intervalIndex, 1);
    assert(Math.abs(saved.reviewSchedule[item.id].dueAt - Date.now() - 14 * 86400000) < 2000);
    const next = w.document.querySelector('.review-actions .button-primary');
    assert.equal(next.disabled, false);
    next.click();
    assert.match(w.document.querySelector('#view').textContent, /Rodada concluída/);
  } finally { dom.window.close(); }
});
