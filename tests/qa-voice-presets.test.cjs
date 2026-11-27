const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');

const source = fs.readFileSync(path.join(__dirname, '..', 'qa-prep-studio.js'), 'utf8');
const dspSource = source.slice(source.indexOf('function voiceDSP('), source.indexOf('\n\nlet tries=0;'));
const dsp = vm.runInNewContext('const clamp=(v,a,b)=>Math.min(b,Math.max(a,Number(v)||0));' + dspSource + ';voiceDSP');
const presetSource = source.match(/const presets=(\{[^\n]+\});/)[1];
const presets = vm.runInNewContext('(' + presetSource + ')');
const newIds = ['kitten','puppy','bunny','hamster','duckling','frog','fairy','goblin','teddy','baby_dragon','cute_robot','baby_alien'];
const input = Float32Array.from({length: 32000}, (_, i) =>
  .24 * Math.sin(2 * Math.PI * 210 * i / 32000) +
  .12 * Math.sin(2 * Math.PI * 620 * i / 32000) +
  (i % 4000 === 0 ? .25 : 0));

test('new presets render distinct, bounded audio from an imported voice', () => {
  const dry = dsp(input, 32000, 0, 1, 'none', 0, 1).data;
  const hashes = new Set();
  for (const id of newIds) {
    assert(source.includes("['" + id + "',"), id + ' has a selectable label');
    assert(presets[id], id + ' has audio settings');
    const [pitch, tempo, effect] = presets[id];
    const output = dsp(input, 32000, pitch, tempo, effect, .7, 1).data;
    assert(output.every(x => Number.isFinite(x) && Math.abs(x) <= 1), id);
    assert(output.some(x => Math.abs(x) > .01), id + ' is audible');
    assert(output.length !== dry.length || output.some((x, i) => Math.abs(x - dry[i]) > .01), id + ' changes the recording');
    hashes.add(crypto.createHash('sha256').update(Buffer.from(output.buffer)).digest('hex'));
  }
  assert.equal(hashes.size, newIds.length, 'each preset has a distinct result');
});

test('effect intensity at zero leaves the signal dry', () => {
  const dry = dsp(input, 32000, 0, 1, 'none', 0, 1).data;
  for (const effect of ['fairy','double','bubbly','softrobot','flutter','witch']) {
    const mutedEffect = dsp(input, 32000, 0, 1, effect, 0, 1).data;
    assert.deepEqual(mutedEffect, dry, effect);
  }
});

test('the teddy and bubbly effects add delayed copies of the recording', () => {
  const impulse = new Float32Array(16000);
  impulse[0] = .5;
  const bubbles = dsp(impulse, 32000, 0, 1, 'bubbly', 1, 1).data;
  const doubled = dsp(impulse, 32000, 0, 1, 'double', 1, 1).data;
  assert(Math.abs(bubbles[Math.round(32000 * .018)]) > .05);
  assert(Math.abs(doubled[Math.round(32000 * .028)]) > .05);
});

test('the visible choices retain a few earlier presets and remove the rest', () => {
  for (const id of ['normal','cat','child','cute','chip','comic']) assert(presets[id]);
  for (const id of ['demon','bear','ghost','host','witch','deep','robot','monster','alien','radio','distort','echo','space']) {
    assert.equal(presets[id], undefined, id);
    assert(!source.includes("['" + id + "',"), id + ' has no selectable option');
  }
});
