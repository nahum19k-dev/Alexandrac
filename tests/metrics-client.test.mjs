import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
const source = await readFile(new URL('../metrics.js', import.meta.url), 'utf8');
function harness(search = '') {
    let time = 0;
    const events = [], requests = [], windowListeners = {}, documentListeners = {};
    const storage = () => { const m = new Map(); return { getItem: k => m.get(k) || null, setItem: (k, v) => m.set(k, v) }; };
    const context = {
        location: { search }, URLSearchParams, crypto: { randomUUID }, Date, Blob,
        localStorage: storage(), sessionStorage: storage(), performance: { now: () => time },
        setTimeout, clearTimeout, setInterval() {},
        navigator: { sendBeacon(url, blob) { blob.text().then(text => events.push(JSON.parse(text).event)); return true; } },
        window: { addEventListener: (type, handler) => { windowListeners[type] = handler; } },
        document: { hidden: false, addEventListener: (type, handler) => { documentListeners[type] = handler; } },
        async fetch(url, options) {
            requests.push(url);
            if (url.endsWith('/session')) return { ok: true, json: async () => ({ token: 'test-token' }) };
            events.push(JSON.parse(options.body).event);
            return { ok: true };
        }
    };
    vm.runInNewContext(source, context);
    return { api: context.window.AlexandraMetrics, events, requests,
        tick: value => { time = value; },
        visible(value) { context.document.hidden = !value; documentListeners.visibilitychange(); },
        close() { windowListeners.pagehide({ persisted: false }); },
        async settle() { for (let i = 0; i < 8; i++) await new Promise(setImmediate); }
    };
}
test('admin mode sends no requests or events', async () => {
    const h = harness('?admin=1');
    h.api.start(); h.api.read(0); h.api.next(); h.api.complete();
    await h.settle(); assert.equal(h.requests.length, 0);
});
test('reading excludes hidden time and enlarged-photo time; replay is counted once', async () => {
    const h = harness(); await h.settle();
    h.api.start(); h.api.start(); h.tick(200); h.api.read(0);
    h.tick(4200); h.visible(false);
    h.tick(13200); h.visible(true);
    h.tick(15200); h.api.photo();
    h.tick(19200); h.api.photoClosed();
    h.tick(21200); h.api.next();
    for (let i = 1; i < 6; i++) { h.api.read(i); h.api.next(); }
    h.api.complete(); h.api.complete();
    await h.settle();
    const completed = h.events.find(e => e.type === 'run_completed');
    assert.equal(completed.reading_ms, 8000);
    assert.equal(completed.elapsed_ms, 21200);
    assert.equal(completed.completed_steps, 6);
    assert.equal(h.events.filter(e => e.type === 'run_started').length, 1);
    assert.equal(h.events.filter(e => e.type === 'run_completed').length, 1);
    h.api.start(); await h.settle();
    assert.equal(h.events.filter(e => e.type === 'run_started')[1].run_number, 2);
});
test('leaving sends the final measured snapshot by beacon', async () => {
    const h = harness(); await h.settle(); h.api.start(); h.api.read(0);
    h.tick(5000); h.close(); await h.settle();
    const left = h.events.find(e => e.type === 'run_left');
    assert.equal(left.reading_ms, 5000); assert.equal(left.last_step, 1);
});

