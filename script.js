document.addEventListener('DOMContentLoaded', function() {
    var openBtn = document.getElementById('open-btn');
    var landingScreen = document.getElementById('landing-screen');
    var constellationScreen = document.getElementById('constellation-screen');
    var muteBtn = document.getElementById('mute-btn');
    var nodesContainer = document.getElementById('nodes-container');
    var canvas = document.getElementById('star-canvas');
    var ctx = canvas.getContext('2d');
    var contentModal = document.getElementById('content-modal');
    var modalBody = document.getElementById('modal-body');
    var nextBtn = document.getElementById('next-btn');
    var bgMusic = document.getElementById('bg-music');
    var zoomContainer = document.getElementById('zoom-container');

    var isMuted = false;
    var width = 0;
    var height = 0;
    var bgStars = [];
    var shootingStars = [];
    var constellationNodes = [];
    var currentNodeIndex = 0;
    var showMeyliName = false;
    var nameAlpha = 0;
    var explosionParticles = [];
    var explosionFlash = 0;

    var letterSteps = [
        { html: '<div class="photo-container"><img src="WhatsApp%20Image%202026-11-08%20at%201.53.35%20PM.jpeg" alt="Meyli" class="meyli-photo"></div><p>Hay personas que llegan a tu vida en los momentos m\u00e1s inesperados... como en una entrevista de trabajo donde supuestamente uno deber\u00eda estar concentrado en otras cosas. Pero entonces alguien te habla, te pregunta algo, y sin darte cuenta ya capt\u00f3 toda tu atenci\u00f3n.</p>' },
        { html: '<p>Lo primero que not\u00e9 fueron tus ojos. Esos ojos chinitos y llenos de ternura que tienen algo dif\u00edcil de explicar... no s\u00e9 si es la forma en que miran o simplemente lo que hay detr\u00e1s de ellos, pero desde ese momento algo me dijo que val\u00eda la pena conocerte mejor.</p>' },
        { html: '<p>Y mientras m\u00e1s te conozco, m\u00e1s confirmo que detr\u00e1s de esa mirada hay una persona disciplinada, inteligente, segura de s\u00ed misma, que se levanta a las 6am a cycling sin falta, que sufre con las pel\u00edculas sangrientas pero ama las rom\u00e1nticas, que tiene buen gusto para la comida porque el saltado no falla...</p>' },
        { html: '<p>...y que hace que las conversaciones no quieran terminar... incluso cuando ya son las 4am y ambos deber\u00edamos estar durmiendo \ud83d\ude0f</p>' },
        { html: '<p>Hablar contigo se siente como hablar con alguien que conoces de toda la vida. Hay una amabilidad en ti que no es com\u00fan, algo genuino que hace que las horas pasen sin que uno se d\u00e9 cuenta... y no me arrepiento para nada \ud83d\ude0f</p><p>No s\u00e9 exactamente qu\u00e9 es esto todav\u00eda, pero s\u00ed s\u00e9 que hay algo en ti que me genera curiosidad, que me hace querer seguir descubriendo m\u00e1s... y eso no le pasa a cualquiera.</p>' },
        { html: '<p>As\u00ed que solo quer\u00eda que supieras que me importas, que disfruto cada conversaci\u00f3n contigo, y que me gustar\u00eda seguir conoci\u00e9ndote... en persona, sin pantallas de por medio \ud83d\ude0a</p>' }
    ];

    var meyliLines = [
        [{x:0,y:2},{x:0,y:0}], [{x:0,y:0},{x:0.5,y:1}], [{x:0.5,y:1},{x:1,y:0}], [{x:1,y:0},{x:1,y:2}],
        [{x:1.5,y:0},{x:2.5,y:0}], [{x:1.5,y:0},{x:1.5,y:1}], [{x:1.5,y:1},{x:2.3,y:1}], [{x:1.5,y:1},{x:1.5,y:2}], [{x:1.5,y:2},{x:2.5,y:2}],
        [{x:3,y:0},{x:3.5,y:1}], [{x:4,y:0},{x:3.5,y:1}], [{x:3.5,y:1},{x:3.5,y:2}],
        [{x:4.5,y:0},{x:4.5,y:2}], [{x:4.5,y:2},{x:5.5,y:2}],
        [{x:6,y:0},{x:6,y:2}]
    ];

    function resize() {
        var rect = canvas.getBoundingClientRect();
        width = rect.width || window.innerWidth;
        height = rect.height || window.innerHeight;
        
        var dpr = window.devicePixelRatio || 1;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        
        initBgStars();
    }
    
    var prevWidth = window.innerWidth;
    var prevHeight = window.innerHeight;
    
    window.addEventListener('resize', function() {
        var oldWidth = prevWidth || window.innerWidth;
        var oldHeight = prevHeight || window.innerHeight;
        resize();
        
        // Si ya hay estrellas, reposicionarlas proporcionalmente
        if (constellationNodes && constellationNodes.length > 0 && currentNodeIndex !== -1) {
            for (var i = 0; i < constellationNodes.length; i++) {
                var node = constellationNodes[i];
                node.x = (node.x / oldWidth) * width;
                node.y = (node.y / oldHeight) * height;
                node.el.style.left = node.x + "px";
                node.el.style.top = node.y + "px";
            }
        }
        prevWidth = width;
        prevHeight = height;
    });

    function initBgStars() {
        bgStars = [];
        for (var i = 0; i < 180; i++) {
            bgStars.push({
                x: Math.random() * width,
                y: Math.random() * height,
                r: Math.random() * 1.5 + 0.3,
                alpha: Math.random() * 0.6 + 0.3,
                speed: Math.random() * 0.02 + 0.005
            });
        }
    }

    setInterval(function() {
        if (Math.random() < 0.5) {
            shootingStars.push({
                x: Math.random() * width * 0.7,
                y: Math.random() * height * 0.3,
                len: Math.random() * 60 + 30,
                spd: Math.random() * 5 + 4,
                alpha: 1
            });
        }
    }, 4000);

    function draw() {
        ctx.clearRect(0, 0, width, height);
        var i, s;
        for (i = 0; i < bgStars.length; i++) {
            s = bgStars[i];
            s.alpha += (Math.random() - 0.5) * s.speed;
            if (s.alpha < 0.15) s.alpha = 0.15;
            if (s.alpha > 1) s.alpha = 1;
            ctx.fillStyle = "rgba(255,255,255," + s.alpha + ")";
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fill();
        }

        for (i = shootingStars.length - 1; i >= 0; i--) {
            var ss = shootingStars[i];
            ss.x += ss.spd;
            ss.y += ss.spd * 0.6;
            ss.alpha -= 0.012;
            if (ss.alpha <= 0) { shootingStars.splice(i, 1); continue; }
            var tx = ss.x - ss.len * 0.7;
            var ty = ss.y - ss.len * 0.42;
            var grad = ctx.createLinearGradient(tx, ty, ss.x, ss.y);
            grad.addColorStop(0, "rgba(255,255,255,0)");
            grad.addColorStop(1, "rgba(255,255,255," + ss.alpha + ")");
            ctx.strokeStyle = grad;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(tx, ty);
            ctx.lineTo(ss.x, ss.y);
            ctx.stroke();
        }

        if (!showMeyliName) {
            if (currentNodeIndex > 0) {
                ctx.strokeStyle = "rgba(255,215,0,0.15)";
                ctx.lineWidth = 6;
                ctx.beginPath();
                for (i = 1; i <= currentNodeIndex && i < constellationNodes.length; i++) {
                    ctx.moveTo(constellationNodes[i-1].x, constellationNodes[i-1].y);
                    ctx.lineTo(constellationNodes[i].x, constellationNodes[i].y);
                }
                ctx.stroke();
                ctx.strokeStyle = "rgba(255,215,0,0.7)";
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                for (i = 1; i <= currentNodeIndex && i < constellationNodes.length; i++) {
                    ctx.moveTo(constellationNodes[i-1].x, constellationNodes[i-1].y);
                    ctx.lineTo(constellationNodes[i].x, constellationNodes[i].y);
                }
                ctx.stroke();
            }
        } else {
            if (nameAlpha < 1) nameAlpha += 0.006; // Un poco mas lento
            var scale = Math.min(width / 8, 80);
            var totalW = 6 * scale;
            var sx = (width - totalW) / 2;
            var sy = height / 2 - scale;

            ctx.strokeStyle = "rgba(255,75,130," + (nameAlpha * 0.15) + ")";
            ctx.lineWidth = 8;
            ctx.beginPath();
            for (i = 0; i < meyliLines.length; i++) {
                ctx.moveTo(sx + meyliLines[i][0].x * scale, sy + meyliLines[i][0].y * scale);
                ctx.lineTo(sx + meyliLines[i][1].x * scale, sy + meyliLines[i][1].y * scale);
            }
            ctx.stroke();

            ctx.strokeStyle = "rgba(255,75,130," + (nameAlpha * 0.8) + ")";
            ctx.lineWidth = 2;
            ctx.beginPath();
            for (i = 0; i < meyliLines.length; i++) {
                ctx.moveTo(sx + meyliLines[i][0].x * scale, sy + meyliLines[i][0].y * scale);
                ctx.lineTo(sx + meyliLines[i][1].x * scale, sy + meyliLines[i][1].y * scale);
            }
            ctx.stroke();

            ctx.fillStyle = "rgba(255,255,255," + nameAlpha + ")";
            for (i = 0; i < meyliLines.length; i++) {
                ctx.beginPath();
                ctx.arc(sx + meyliLines[i][0].x * scale, sy + meyliLines[i][0].y * scale, 3, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(sx + meyliLines[i][1].x * scale, sy + meyliLines[i][1].y * scale, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Renderizar Explosion
        if (explosionFlash > 0) {
            var rad = (1.2 - explosionFlash) * 500;
            var grad = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, rad);
            grad.addColorStop(0, "rgba(255, 255, 255, " + explosionFlash + ")");
            grad.addColorStop(0.3, "rgba(255, 75, 130, " + (explosionFlash * 0.8) + ")");
            grad.addColorStop(1, "rgba(0, 0, 0, 0)");
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(width/2, height/2, rad, 0, Math.PI * 2);
            ctx.fill();
            explosionFlash -= 0.025;
        }

        for (i = explosionParticles.length - 1; i >= 0; i--) {
            var p = explosionParticles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vx *= 0.94; // Friccion
            p.vy *= 0.94;
            p.alpha -= 0.015;
            if (p.alpha <= 0) { explosionParticles.splice(i, 1); continue; }
            
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1.0;

        requestAnimationFrame(draw);
    }

    function setupConstellation() {
        var px = width * 0.12;
        var py = height * 0.15;
        var uw = width - px * 2;
        var uh = height - py * 2;
        for (var i = 0; i < letterSteps.length; i++) {
            var progress = i / (letterSteps.length - 1);
            var x = px + (uw * progress);
            var yp = (i % 2 === 0) ? 0.15 + Math.random() * 0.2 : 0.55 + Math.random() * 0.2;
            var y = py + (uh * yp);
            var div = document.createElement('div');
            div.className = 'constellation-node';
            div.style.left = x + "px";
            div.style.top = y + "px";
            (function(idx, posX, posY) {
                div.addEventListener('click', function() {
                    if (idx <= currentNodeIndex && !showMeyliName) {
                        if (idx === 0) {
                            var guide = document.getElementById('click-guide');
                            if (guide) guide.style.opacity = "0";
                        }
                        
                        // Zoom 3D - Fade out to prevent ugly blob
                        var ox = (posX / width) * 100;
                        var oy = (posY / height) * 100;
                        zoomContainer.style.transformOrigin = ox + "% " + oy + "%";
                        zoomContainer.style.transform = "scale(6)";
                        zoomContainer.style.opacity = "0"; 
                        
                        setTimeout(function() {
                            showModal(idx);
                        }, 800);
                    }
                });
            })(i, x, y);
            nodesContainer.appendChild(div);
            constellationNodes.push({ x: x, y: y, el: div });
        }
        setTimeout(function() { 
            revealNode(0);
            var guide = document.getElementById('click-guide');
            if (guide && constellationNodes[0]) {
                guide.style.left = (constellationNodes[0].x + 25) + "px";
                guide.style.top = (constellationNodes[0].y - 12) + "px";
                guide.style.opacity = "1";
            }
        }, 1500); // Aparecer un ratito despues
    }

    function revealNode(idx) {
        if (idx < constellationNodes.length) constellationNodes[idx].el.classList.add('visible');
    }

    function showModal(idx) {
        modalBody.innerHTML = letterSteps[idx].html;
        contentModal.classList.remove('hidden');
        nextBtn.innerHTML = (idx === letterSteps.length - 1) ? "Cerrar \u2764\uFE0F" : "Siguiente \uD83C\uDF1F";
    }

    nextBtn.addEventListener('click', function() {
        contentModal.classList.add('hidden');
        
        // Volver del Zoom
        zoomContainer.style.transform = "scale(1)";
        zoomContainer.style.opacity = "1";
        
        setTimeout(function() {
            if (currentNodeIndex < constellationNodes.length) constellationNodes[currentNodeIndex].el.classList.add('visited');
            if (currentNodeIndex < letterSteps.length - 1) {
                currentNodeIndex++;
                revealNode(currentNodeIndex);
            } else {
                // Secuencia Final: Juntar estrellas y explotar
                var cx = width / 2;
                var cy = height / 2;
                
                // 1. Juntar todas las estrellas en el centro
                for (var i = 0; i < constellationNodes.length; i++) {
                    var el = constellationNodes[i].el;
                    el.style.transition = 'left 1.2s cubic-bezier(0.5, 0, 0.75, 0), top 1.2s cubic-bezier(0.5, 0, 0.75, 0), transform 1.2s ease, opacity 0.5s ease';
                    el.style.left = cx + "px";
                    el.style.top = cy + "px";
                    el.style.transform = "translate(-50%, -50%) scale(0.5)"; // se hacen peque\u00f1as al juntarse
                }
                
                // Borrar las l\u00edneas de la constelacion ocultandolas logicamente
                currentNodeIndex = -1; // Esto evita que se sigan dibujando las lineas en draw()
                
                // 2. Explotar!
                setTimeout(function() {
                    // Ocultar los nodos DOM originales
                    for (var i = 0; i < constellationNodes.length; i++) {
                        constellationNodes[i].el.style.opacity = '0';
                        constellationNodes[i].el.style.display = 'none';
                    }
                    
                    // Iniciar destello flash y particulas
                    explosionFlash = 1.0;
                    for (var k = 0; k < 120; k++) {
                        var angle = Math.random() * Math.PI * 2;
                        var speed = Math.random() * 20 + 5;
                        explosionParticles.push({
                            x: cx, y: cy,
                            vx: Math.cos(angle) * speed,
                            vy: Math.sin(angle) * speed,
                            alpha: 1,
                            color: (Math.random() > 0.5) ? '#ff4b82' : '#ffffff',
                            size: Math.random() * 4 + 1
                        });
                    }
                    
                    // 3. Mostrar el nombre de Meyli
                    showMeyliName = true;
                }, 1200); // Esperar a que se junten
            }
        }, 1000);
    });

    function createMeteorShower() {
        for (var i = 0; i < 40; i++) {
            shootingStars.push({
                x: Math.random() * width * 1.5 - width * 0.2,
                y: Math.random() * height * -1.5,
                len: Math.random() * 100 + 50,
                spd: Math.random() * 25 + 15, // Muy r\u00e1pidas
                alpha: 1
            });
        }
    }

    // ===== INICIAR =====
    openBtn.addEventListener('click', function() {
        landingScreen.classList.add('fade-out');
        setTimeout(function() {
            landingScreen.classList.remove('active');
            constellationScreen.classList.add('active');
            resize();
            setupConstellation();
            draw();
            createMeteorShower(); // Disparar la lluvia de meteoritos!
        }, 1000);

        // Reproducir musica - simple y directo
        bgMusic.volume = 0.5;
        bgMusic.play().catch(function(e) {
            console.log("Audio play error:", e);
        });
    });

    // ===== MUTE =====
    muteBtn.addEventListener('click', function() {
        if (isMuted) {
            bgMusic.muted = false;
            muteBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>';
        } else {
            bgMusic.muted = true;
            muteBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>';
        }
        isMuted = !isMuted;
    });
});
