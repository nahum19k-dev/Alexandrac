(function () {
    'use strict';
    var endpoint = 'https://alexandra-metricas-lectura.regalantelope2.chatgpt.site';
    var admin = new URLSearchParams(location.search).has('admin');
    var noop = function () {};
    if (admin) {
        window.AlexandraMetrics = { start: noop, read: noop, next: noop, photo: noop, photoClosed: noop, complete: noop };
        return;
    }
    function id() { return crypto.randomUUID(); }
    function get(store, key, fallback) {
        try { return JSON.parse(store.getItem(key)) || fallback; } catch (_) { return fallback; }
    }
    function put(store, key, value) {
        try { store.setItem(key, JSON.stringify(value)); } catch (_) { /* Private browsing can deny storage. */ }
    }
    var visitor = get(localStorage, 'alexandra.browser', null) || id();
    put(localStorage, 'alexandra.browser', visitor);
    var visit = id();
    var token = null, queue = [], pending = false, retries = 0, retryTimer = null;
    var run = null, reading = null, viewingPhoto = false, activeSince = null;
    var pageVisible = !document.hidden, leaving = false;
    var now = function () { return performance.now(); };
    function accrue() {
        if (run && reading !== null && activeSince !== null) {
            run.steps[reading] += Math.max(0, now() - activeSince);
        }
        activeSince = null;
    }
    function resume() {
        if (run && !run.finished && reading !== null && pageVisible && !viewingPhoto && !leaving) activeSince = now();
    }
    function snapshot() {
        if (!run) return {};
        var steps = run.steps.slice();
        if (reading !== null && activeSince !== null) steps[reading] += Math.max(0, now() - activeSince);
        return {
            run_id: run.id, run_number: run.number,
            elapsed_ms: Math.round(Math.max(0, now() - run.started)),
            reading_ms: Math.round(steps.reduce(function (a, b) { return a + b; }, 0)),
            step_ms: steps.map(Math.round), completed_steps: run.completed.size,
            last_step: reading === null ? run.lastStep : reading + 1,
            finished: run.finished
        };
    }
    function enqueue(type, extra) {
        var event = Object.assign({ event_id: id(), type: type, visitor_id: visitor, visit_id: visit,
            timestamp: new Date().toISOString() }, snapshot(), extra || {});
        queue.push(event);
        if (queue.length > 60) queue.shift();
        flush();
    }
    async function session() {
        if (token) return;
        var response = await fetch(endpoint + '/session', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ visitor_id: visitor, visit_id: visit }), credentials: 'omit'
        });
        if (!response.ok) throw new Error('metrics session');
        var data = await response.json();
        if (!data.token) throw new Error('metrics token');
        token = data.token;
    }
    async function flush() {
        if (pending || !queue.length || leaving) return;
        pending = true;
        try {
            await session();
            while (queue.length && !leaving) {
                var event = queue[0];
                var response = await fetch(endpoint + '/events', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token: token, event: event }), credentials: 'omit', keepalive: true
                });
                if (!response.ok) {
                    if (response.status === 401) token = null;
                    throw new Error('metrics delivery');
                }
                queue.shift(); retries = 0;
            }
        } catch (_) {
            clearTimeout(retryTimer);
            if (retries < 4) retryTimer = setTimeout(flush, Math.min(1000 * Math.pow(2, retries++), 15000));
        } finally { pending = false; }
    }
    function beacon(type) {
        if (!run || run.finished) return;
        accrue();
        var event = Object.assign({ event_id: id(), type: type, visitor_id: visitor, visit_id: visit,
            timestamp: new Date().toISOString() }, snapshot());
        if (token) {
            var payload = JSON.stringify({ token: token, event: event });
            // text/plain allows a cross-origin beacon without a preflight during navigation.
            if (navigator.sendBeacon(endpoint + '/events', new Blob([payload], { type: 'text/plain' }))) return;
        }
        queue.push(event);
    }
    window.AlexandraMetrics = {
        start: function () {
            if (run && !run.finished) return;
            var number = get(localStorage, 'alexandra.runs', 0) + 1;
            put(localStorage, 'alexandra.runs', number);
            run = { id: id(), number: number, started: now(), steps: [0, 0, 0, 0, 0, 0],
                completed: new Set(), lastStep: 0, finished: false, photos: 0 };
            reading = null; viewingPhoto = false; activeSince = null;
            enqueue('run_started');
        },
        read: function (index) {
            if (!run || run.finished || index < 0 || index > 5) return;
            accrue(); reading = index; run.lastStep = index + 1; resume();
            enqueue('step_opened', { step: index + 1 });
        },
        next: function () {
            if (!run || run.finished || reading === null) return;
            accrue();
            var step = reading + 1;
            run.completed.add(step); reading = null;
            enqueue('step_finished', { step: step });
        },
        photo: function () {
            if (!run || run.finished) return;
            accrue(); viewingPhoto = true; run.photos++;
            if (run.photos === 1) enqueue('photo_opened');
        },
        photoClosed: function () { viewingPhoto = false; resume(); },
        complete: function () {
            if (!run || run.finished) return;
            accrue(); reading = null; run.finished = true;
            enqueue('run_completed');
        }
    };
    document.addEventListener('visibilitychange', function () {
        pageVisible = !document.hidden;
        if (!pageVisible) beacon('run_checkpoint');
        else { resume(); flush(); }
    });
    window.addEventListener('pagehide', function (event) {
        leaving = true;
        beacon(event.persisted ? 'run_checkpoint' : 'run_left');
    });
    window.addEventListener('pageshow', function () { leaving = false; pageVisible = !document.hidden; resume(); flush(); });
    window.addEventListener('online', function () { retries = 0; flush(); });
    setInterval(function () { if (run && !run.finished && pageVisible) enqueue('run_checkpoint'); }, 15000);
    enqueue('visit_opened');
})();
