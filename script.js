document.addEventListener('DOMContentLoaded', function () {
    'use strict';
    var canvas = document.getElementById('star-canvas');
    var ctx = canvas.getContext('2d');
    var landing = document.getElementById('landing-screen');
    var journey = document.getElementById('constellation-screen');
    var modal = document.getElementById('content-modal');
    var card = modal.querySelector('.glass-card');
    var modalBody = document.getElementById('modal-body');
    var nextBtn = document.getElementById('next-btn');
    var guide = document.getElementById('click-guide');
    var progress = document.getElementById('journey-progress');
    var finale = document.getElementById('finale');
    var music = document.getElementById('bg-music');
    var muteBtn = document.getElementById('mute-btn');
    var motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    var reducedMotion = motionQuery.matches;
    motionQuery.addEventListener('change', function (event) { reducedMotion = event.matches; });
    var width, height, stars = [], nodes = [], meteors = [], nameParticles = [];
    var pointer = { x: 0, y: 0, smoothX: 0, smoothY: 0 };
    var state = 'landing', current = 0, reading = 0, visited = new Set();
    var lastTime = 0, skyTime = 0, finaleTime = 0, nextMeteor = 9;
    var frameId = null, audioFadeId = null, focusTimer = null;
    var camera = 0, cameraTarget = 0;
    var chapterTitles = ['Una coincidencia', 'Tu mirada', 'Lo que admiro de ti', 'Sin mirar el reloj', 'Pequeños recuerdos', 'Lo que sigue'];
    var letterSteps = [
        { html: '<div class="photo-container"><img src="WhatsApp%20Image%202026-11-08%20at%201.53.35%20PM.jpeg" alt="Alexandra" class="alexandra-photo"></div><p>Alexandra, hay personas que llegan a tu vida en los momentos más inesperados. Como en el trabajo, donde supuestamente estás concentrado en otras cosas, hasta que te cruzas con una mirada que te hace olvidar por un instante lo que estabas haciendo. Así me pasó contigo: sin darme cuenta, ya habías captado toda mi atención.</p>' },
        { html: '<p>Lo primero que noté fueron tus ojos. Hay algo en tu forma de mirar que me gusta, algo que hace que quiera quedarme un momento más cerca de ti. Al principio fue esa mirada; después, las ganas de conocer a la persona que había detrás.</p>' },
        { html: '<p>Y mientras más te conozco, más cosas encuentro para admirar. Eres disciplinada, inteligente y segura de ti misma. Entre el trabajo y tus estudios de Obstetricia en la universidad, veo la dedicación que pones en lo que haces. Me gusta descubrir esa parte de ti, la que se esfuerza cada día por lo que quiere.</p>' },
        { html: '<p>También me gustan nuestras conversaciones. Esa facilidad para pasar de una cosa a otra y encontrar siempre una razón para seguir hablando. Contigo las horas pasan sin que me dé cuenta, y al despedirnos me quedo con ganas de la próxima conversación.</p>' },
        { html: '<p>Entre nuestras conversaciones, las miradas y aquel beso, se han ido quedando pequeños recuerdos que hacen más bonito conocerte. Me gusta que todo se dé con esa naturalidad, sin tener que buscar demasiado qué decir.</p><p>Y cuando creo que ya sé qué es lo que más me gusta de ti, aparece algún detalle que no había notado.</p>' },
        { html: '<p>Quién iba a decir que, entre las cosas de todos los días en el trabajo, iba a encontrar una mirada como la tuya. Ahora hay conversaciones y pequeños momentos que le dan otro encanto a coincidir contigo, Alexandra.</p><p>Lo curioso es que todo empezó con algo tan sencillo como mirarnos.</p><p>Quizá lo más bonito de coincidir contigo todavía esté por pasar.</p>' }
    ];

    var nameGlyphs = {
        A: [[[0,2],[0.5,0]], [[0.5,0],[1,2]], [[0.25,1],[0.75,1]]],
        L: [[[0,0],[0,2]], [[0,2],[1,2]]],
        E: [[[0,0],[0,2]], [[0,0],[1,0]], [[0,1],[0.8,1]], [[0,2],[1,2]]],
        X: [[[0,0],[1,2]], [[1,0],[0,2]]],
        N: [[[0,2],[0,0]], [[0,0],[1,2]], [[1,2],[1,0]]],
        D: [[[0,0],[0,2]], [[0,0],[0.7,0]], [[0.7,0],[1,0.5]], [[1,0.5],[1,1.5]], [[1,1.5],[0.7,2]], [[0.7,2],[0,2]]],
        R: [[[0,2],[0,0]], [[0,0],[0.8,0]], [[0.8,0],[1,0.5]], [[1,0.5],[0.8,1]], [[0.8,1],[0,1]], [[0.5,1],[1,2]]]
    };
    var constellationName = 'Alexandra';
    var nameWidth = (constellationName.length - 1) * 1.5 + 1;
    var alexandraLines = [];
    constellationName.toUpperCase().split('').forEach(function(letter, index) {
        nameGlyphs[letter].forEach(function(segment) {
            alexandraLines.push(segment.map(function(point) {
                return { x: point[0] + index * 1.5, y: point[1] };
            }));
        });
    });


    function nameLayout() {
        var scale = Math.min(width / (nameWidth + 2.5), height / 7, 60);
        return { scale: scale, x: (width - nameWidth * scale) / 2, y: height * 0.43 - scale };
    }

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        var dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        if (!stars.length) {
            for (var i = 0; i < 260; i++) {
                var depth = Math.random();
                stars.push({ x: Math.random(), y: Math.random(), depth: depth,
                    r: 0.3 + depth * 1.25, phase: Math.random() * Math.PI * 2,
                    speed: 0.25 + Math.random() * 0.65, warm: Math.random() > 0.78 });
            }
        }
    }
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', function (event) {
        pointer.x = event.clientX / width - 0.5;
        pointer.y = event.clientY / height - 0.5;
    }, { passive: true });
    document.addEventListener('pointerleave', function () { pointer.x = pointer.y = 0; });

    function draw(time) {
        var dt = Math.min((time - (lastTime || time)) / 1000, 0.05);
        lastTime = time;
        skyTime += dt;
        ctx.clearRect(0, 0, width, height);
        var ease = 1 - Math.exp(-dt * 3);
        pointer.smoothX += ((reducedMotion ? 0 : pointer.x) - pointer.smoothX) * ease;
        pointer.smoothY += ((reducedMotion ? 0 : pointer.y) - pointer.smoothY) * ease;
        camera += ((reducedMotion ? 0 : cameraTarget) - camera) * ease;
        stars.forEach(function (star) {
            var drift = reducedMotion ? 0 : skyTime * (0.5 + star.depth * 1.2);
            var x = ((star.x * width + drift) % (width + 40)) - 20;
            var y = star.y * height;
            x += pointer.smoothX * star.depth * 22 + (x - width / 2) * camera * star.depth;
            y += pointer.smoothY * star.depth * 16 + (y - height / 2) * camera * star.depth;
            var alpha = 0.22 + star.depth * 0.4 + (reducedMotion ? 0.1 : Math.sin(skyTime * star.speed + star.phase) * 0.16);
            ctx.fillStyle = 'rgba(' + (star.warm ? '237,211,168,' : '215,228,246,') + alpha + ')';
            if (star.depth > 0.9) {
                ctx.shadowColor = star.warm ? '#e9cf9f' : '#bfd7ff';
                ctx.shadowBlur = 7;
            }
            ctx.beginPath();
            ctx.arc(x, y, star.r, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        });
        if (!reducedMotion && skyTime > nextMeteor) {
            meteors.push({ x: width * (0.3 + Math.random() * 0.6), y: height * Math.random() * 0.3, life: 1 });
            nextMeteor = skyTime + 12 + Math.random() * 14;
        }
        for (var i = meteors.length - 1; i >= 0; i--) {
            var meteor = meteors[i];
            meteor.x += dt * 170; meteor.y += dt * 75; meteor.life -= dt * 0.65;
            if (meteor.life <= 0) { meteors.splice(i, 1); continue; }
            var tail = ctx.createLinearGradient(meteor.x - 90, meteor.y - 40, meteor.x, meteor.y);
            tail.addColorStop(0, 'rgba(215,228,246,0)');
            tail.addColorStop(1, 'rgba(215,228,246,' + meteor.life * 0.6 + ')');
            ctx.strokeStyle = tail; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(meteor.x - 90, meteor.y - 40); ctx.lineTo(meteor.x, meteor.y); ctx.stroke();
        }
        if (state !== 'landing' && state !== 'ending') {
            ctx.strokeStyle = 'rgba(219,195,151,0.28)';
            ctx.lineWidth = 0.7;
            ctx.beginPath();
            for (var n = 1; n <= current && n < nodes.length; n++) {
                ctx.moveTo(nodes[n-1].x * width, nodes[n-1].y * height);
                ctx.lineTo(nodes[n].x * width, nodes[n].y * height);
            }
            ctx.stroke();
        }
        if (state === 'ending') {
            finaleTime += dt;
            var t = reducedMotion ? 1 : Math.min(finaleTime / 4, 1);
            var eased = t * t * (3 - 2 * t);
            var layout = nameLayout();
            nameParticles.forEach(function (p) {
                var x = p.x * width * (1 - eased) + (layout.x + p.tx * layout.scale) * eased;
                var y = p.y * height * (1 - eased) + (layout.y + p.ty * layout.scale) * eased;
                ctx.fillStyle = 'rgba(244,224,185,' + (0.5 + Math.sin(skyTime + p.phase) * 0.2) + ')';
                ctx.beginPath(); ctx.arc(x, y, p.r, 0, Math.PI * 2); ctx.fill();
            });
            if (t > 0.55) {
                ctx.strokeStyle = 'rgba(227,204,165,' + Math.min((t - 0.55) / 0.45, 1) * 0.55 + ')';
                ctx.lineWidth = 0.8;
                ctx.beginPath();
                alexandraLines.forEach(function (segment) {
                    ctx.moveTo(layout.x + segment[0].x * layout.scale, layout.y + segment[0].y * layout.scale);
                    ctx.lineTo(layout.x + segment[1].x * layout.scale, layout.y + segment[1].y * layout.scale);
                });
                ctx.stroke();
            }
            if (t === 1 && finale.hidden) {
                finale.hidden = false;
                document.getElementById('replay-btn').focus({ preventScroll: true });
            }
        }
        frameId = requestAnimationFrame(draw);
    }

    function updateNodes() {
        nodes.forEach(function (node, index) {
            node.el.disabled = index !== current || state !== 'exploring';
            node.el.classList.toggle('visible', index <= current);
            node.el.classList.toggle('visited', visited.has(index));
            node.el.classList.toggle('current', index === current);
        });
    }
    function setupNodes() {
        var container = document.getElementById('nodes-container');
        container.replaceChildren(); nodes = [];
        var positions = [[.16,.34],[.31,.60],[.44,.36],[.57,.62],[.70,.33],[.84,.55]];
        positions.forEach(function (pos, index) {
            var el = document.createElement('button');
            el.className = 'constellation-node';
            el.setAttribute('aria-label', 'Leer ' + chapterTitles[index]);
            el.innerHTML = '<span class="star-core" aria-hidden="true"></span><span class="star-label">0' + (index + 1) + '</span>';
            el.style.left = pos[0] * 100 + '%'; el.style.top = pos[1] * 100 + '%';
            el.addEventListener('click', function () { openChapter(index); });
            container.appendChild(el);
            nodes.push({ x: pos[0], y: pos[1], el: el });
        });
        updateNodes();
    }
    function openChapter(index) {
        if (state !== 'exploring' || index !== current) return;
        reading = index; state = 'reading'; updateNodes();
        guide.style.opacity = '0'; cameraTarget = 0.13;
        document.body.classList.add('is-reading');
        document.getElementById('chapter-number').textContent = 'ESTRELLA 0' + (index + 1) + ' / 06';
        document.getElementById('chapter-title').textContent = chapterTitles[index];
        modalBody.innerHTML = letterSteps[index].html;
        document.getElementById('chapter-dots').innerHTML = letterSteps.map(function (_, i) {
            return '<span class="' + (i === index ? 'active' : '') + '"></span>';
        }).join('');
        nextBtn.innerHTML = (index === 5 ? 'Contemplar el cielo' : 'Seguir el hilo') + ' <span aria-hidden="true">&#8594;</span>';
        card.scrollTop = 0;
        modal.inert = false; modal.classList.remove('hidden');
        focusTimer = setTimeout(function () { if (state === 'reading') nextBtn.focus({ preventScroll: true }); }, reducedMotion ? 0 : 650);
        progress.textContent = '0' + (index + 1) + ' / 06';
    }
    nextBtn.addEventListener('click', function () {
        if (state !== 'reading') return;
        clearTimeout(focusTimer);
        state = 'transition'; nextBtn.blur();
        modal.inert = true; modal.classList.add('hidden');
        document.body.classList.remove('is-reading'); cameraTarget = 0;
        visited.add(reading);
        setTimeout(function () {
            if (reading === letterSteps.length - 1) { startEnding(); return; }
            current = reading + 1; state = 'exploring'; updateNodes();
            guide.textContent = 'Sigue la luz de la siguiente estrella'; guide.style.opacity = '1';
            nodes[current].el.focus({ preventScroll: true });
        }, reducedMotion ? 0 : 700);
    });
    modal.addEventListener('keydown', function (event) {
        if (event.key === 'Tab') { event.preventDefault(); nextBtn.focus(); }
    });
    function startEnding() {
        state = 'ending'; finaleTime = 0; nameParticles = [];
        guide.style.opacity = '0'; progress.textContent = 'Cada encuentro dibuja algo distinto';
        nodes.forEach(function (node) { node.el.disabled = true; node.el.classList.add('departing'); });
        alexandraLines.forEach(function (segment, index) {
            for (var j = 0; j <= 5; j++) {
                var node = nodes[index % nodes.length], f = j / 5;
                nameParticles.push({ x: node.x, y: node.y,
                    tx: segment[0].x + (segment[1].x - segment[0].x) * f,
                    ty: segment[0].y + (segment[1].y - segment[0].y) * f,
                    r: j === 0 || j === 5 ? 1.6 : 0.7, phase: Math.random() * 6 });
            }
        });
    }
    function beginJourney() {
        state = 'exploring'; current = 0; visited.clear();
        finale.hidden = true; landing.hidden = true; landing.classList.remove('active');
        journey.hidden = false; journey.classList.add('active');
        document.body.classList.add('journey-started');
        progress.textContent = 'Una historia en seis estrellas';
        guide.textContent = 'Toca la estrella que brilla para comenzar'; guide.style.opacity = '1';
        muteBtn.hidden = false; setupNodes();
        nodes[0].el.focus({ preventScroll: true });
    }
    document.getElementById('open-btn').addEventListener('click', function () {
        if (state !== 'landing') return;
        beginJourney();
        music.volume = 0;
        music.play().catch(function () { updateAudio(); });
    });
    music.addEventListener('playing', function () {
        updateAudio();
        var start = performance.now();
        cancelAnimationFrame(audioFadeId);
        function fade(now) {
            music.volume = Math.min((now - start) / 4500, 1) * 0.38;
            if (now - start < 4500) audioFadeId = requestAnimationFrame(fade);
        }
        audioFadeId = requestAnimationFrame(fade);
    });
    function updateAudio() {
        var playing = !music.paused && !music.muted;
        muteBtn.setAttribute('aria-pressed', String(playing));
        muteBtn.setAttribute('aria-label', playing ? 'Silenciar música' : 'Activar música');
        document.getElementById('sound-label').textContent = playing ? 'Sonido activo' : 'Activar sonido';
    }
    muteBtn.addEventListener('click', function () {
        if (music.paused) { music.muted = false; music.play().catch(updateAudio); }
        else { music.muted = !music.muted; }
        updateAudio();
    });
    document.getElementById('replay-btn').addEventListener('click', beginJourney);
    document.addEventListener('visibilitychange', function () {
        if (document.hidden) { cancelAnimationFrame(frameId); frameId = null; }
        else if (frameId === null) { lastTime = 0; frameId = requestAnimationFrame(draw); }
    });
    resize(); frameId = requestAnimationFrame(draw);
});
