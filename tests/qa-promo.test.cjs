'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const catalog = require('../qa-promo-catalog.js');

test('introductory passes have the requested prices, durations, and no automatic renewal', () => {
  assert.equal(catalog.currency, 'eur');
  assert.equal(catalog.checkoutReady, false);
  assert.equal(catalog.autoRenew, false);
  assert.deepEqual(catalog.offers.map(o => [o.days, o.minorUnits]), [
    [1, 100], [7, 299], [14, 499], [30, 799], [90, 1799], [365, 4999],
  ]);
  assert.equal(new Set(catalog.offers.map(o => o.id)).size, 6);
  for (let i = 1; i < catalog.offers.length; i++) {
    assert.ok(catalog.offers[i].minorUnits / catalog.offers[i].days <
      catalog.offers[i - 1].minorUnits / catalog.offers[i - 1].days);
  }
  assert.match(catalog.formatDuration(7, 'cs'), /7/);
  assert.match(catalog.formatPrice(100, 'cs'), /1,00/);
});

test('the public purchase button cannot initiate checkout while the EUR catalog is staged', async () => {
  const elements = new Map();
  class Element {
    constructor() { this.value = ''; this.disabled = false; this.hidden = false; this.style = {}; this.children = []; this.dataset = {}; }
    append(...items) { this.children.push(...items); }
    add(item) { this.children.push(item); }
    replaceChildren(...items) { this.children = [...items]; }
    querySelector(selector) {
      if (!elements.has(selector)) elements.set(selector, new Element());
      return elements.get(selector);
    }
    querySelectorAll() { return []; }
  }
  const nav = new Element();
  const parent = new Element();
  let calls = 0;
  const doc = {
    getElementById: () => null,
    createElement: () => new Element(),
    querySelector: s => s === '.nav' ? nav : s === '.tab' ? { parentElement: parent } : null,
    querySelectorAll: () => [],
  };
  const sandbox = {
    document: doc,
    window: { QAPromoCatalog: catalog, addEventListener() {}, scrollTo() {} },
    localStorage: { getItem: () => 'cs' },
    location: { search: '' },
    Option: class { constructor(text, value) { this.text = text; this.value = value; } },
    URLSearchParams,
    fetch: async () => { calls++; throw new Error('unexpected checkout'); },
    console,
  };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', 'qa-plans.js'), 'utf8'), sandbox);
  const buy = elements.get('#qaEditorBuy');
  assert.equal(buy.disabled, true);
  const options = elements.get('#qapPack').children;
  assert.equal(options.length, 6);
  assert.match(options[0].text, /1,00/);
  await buy.onclick();
  assert.equal(calls, 0);
  assert.match(elements.get('#qaEditorAccess').textContent, /prodej zatím není aktivní/i);
});

test('the catalog loads before the plan and landing panels and is included in the offline shell', () => {
  const root = path.join(__dirname, '..');
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const worker = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
  const catalogIndex = html.indexOf('await loadModule(promo)');
  assert.ok(catalogIndex >= 0);
  assert.ok(catalogIndex < html.indexOf('await loadModule(plans)'));
  assert.ok(catalogIndex < html.indexOf('await loadModule(landing)'));
  assert.match(worker, /'\.\/qa-promo-catalog\.js'/);
});
