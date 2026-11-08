// ===== CONFIGURACIÓN DE SINCRONIZACIÓN Y AUDIO =====
const CONFIG = {
    // Si tu audio de voz tiene silencio al inicio antes de que empieces a hablar, pon aquí los segundos.
    silencioInicial: 0.0,
    // Si hay silencio al final del audio después de que terminaste de hablar.
    silencioFinal: 0.0,
    // (NUEVO) Para una sincronización PERFECTA: anota el segundo exacto en el que empiezas a leer cada párrafo.
    // Si lo dejas vacío [], el código lo adivinará repartiendo el tiempo equitativamente.
    // Ejemplo: [ 0.0, 12.5, 25.0, 36.2, 45.0 ]
    tiemposParrafos: [ 0.0, 13.0, 23.0, 38.0, 50.0 ],
    // Multiplicador de volumen de tu voz (2.5 = se escuchará más del doble de fuerte)
    boostVoz: 3.0,
    // Volumen de la música de fondo en la primera pantalla (0.3 = 30%)
    volumenFondoInicio: 0.3,
    // Volumen de la música de fondo cuando empieza el poema (0.05 = 5% bien bajito para no taparte)
    volumenFondoPoema: 0.08
};

// === NOTIFICACIÓN A TELEGRAM ===
let notificacionEnviada = false;
function notifyTelegram() {
    if (notificacionEnviada) return; // Solo avisar una vez por recarga
    
    const urlParams = new URLSearchParams(window.location.search);
    // Si la URL NO tiene admin=1, asumimos que es Meyli
    if (!urlParams.has('admin')) {
        const botToken = '7824975926:AAFQktpZSPhFhe_CU1JdmkU9FUBYhHeeYfs';
        const chatId = '7456159823';
        const text = '🚨 ¡Meyli acaba de ROMPER EL SELLO y abrir la carta en este preciso instante! ❤️';
        
        fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, text: text })
        }).catch(e => console.log(e));
        
        notificacionEnviada = true;
    }
}

// ===== ACRÓSTICO =====
const poemParagraphs = [
    "Más de una vez me pregunté qué era esa calma,<br>esa sensación extraña de sentir que ya te conocía,<br>como si algo en el universo le dijera a mi alma<br>que ibas a llegar, y que la espera valdría.",
    "Eres de esas personas difíciles de ignorar,<br>de las que sin querer se meten en el pecho,<br>y cuando intentas dejar de pensar<br>ya tienen en tu mente un sitio hecho.",
    "Yo podría pasarme la noche entera escuchándote,<br>tu voz es la melodía más hermosa,<br>tu hermana diría que es odiosa,<br>pero yo me quedo con que eres una diosa.",
    "Llevo contando los días desde que no te veo,<br>y volverte a verte es mi mayor anhelo,<br>espero que tú sientas lo mismo que yo creo,<br>porque sin ti el tiempo vuela sin consuelo.",
    "Imagino el día en que volvamos a vernos,<br>y no tengo palabras, solo tengo certeza,<br>hay algo en ti que no termino de descubrir,<br>y si el universo concede esa belleza,<br>quiero ser esa persona que te hace sonreír."
];

// ===== ELEMENTOS =====
const envelopeClick = document.getElementById('envelope-click');
const envelopeFlap = document.getElementById('envelope-flap');
const waxSeal = document.getElementById('wax-seal');
const card = document.getElementById('card');
const cardName = document.getElementById('card-name');
const poemContainer = document.getElementById('poem-container');
const fairyDustContainer = document.getElementById('fairy-dust-container');
const explosionContainer = document.getElementById('explosion-container');
const ribbonText = document.getElementById('ribbon-txt');
// ===== VARIABLES GLOBALES =====
let finaleTriggered = false;
let opened = false;
let voiceDuration = 30; // Fallback

// Referencias del DOM
const startScreen = document.getElementById('start-screen');
const envelopeScene = document.querySelector('.envelope-scene');
const audioFondo = document.getElementById('audio-fondo');
const audioPoema = document.getElementById('audio-poema');
const lanternsContainer = document.getElementById('lanterns-container');
const bg1 = document.getElementById('bg-1');
const bg2 = document.getElementById('bg-2');
const bg3 = document.getElementById('bg-3');
const bg4 = document.getElementById('bg-4');
const btnCloseCard = document.getElementById('btn-close-card');

// Asegurar que sabemos cuánto dura el audio antes de empezar para que la sincronización sea perfecta
audioPoema.addEventListener('loadedmetadata', () => {
    if (!isNaN(audioPoema.duration) && audioPoema.duration > 0) {
        voiceDuration = audioPoema.duration;
    }
});

// ===== POLVO DE HADAS (Apertura) =====
function burstFairyDust() {
    for (let i = 0; i < 20; i++) {
        setTimeout(() => {
            const dust = document.createElement('div');
            dust.classList.add('fairy-dust');
            const tx = (Math.random() - 0.5) * 600 + 'px';
            const ty = (Math.random() - 0.5) * 600 + 'px';
            dust.style.setProperty('--tx', tx);
            dust.style.setProperty('--ty', ty);
            const size = Math.random() * 7 + 3;
            dust.style.width = size + 'px';
            dust.style.height = size + 'px';
            const duration = Math.random() * 2 + 1;
            dust.style.animation = `fairyExplode ${duration}s cubic-bezier(0.2, 0.8, 0.2, 1) forwards`;
            fairyDustContainer.appendChild(dust);
            setTimeout(() => { if (dust.parentNode) dust.remove(); }, duration * 1000);
        }, i * 40);
    }
}

// ===== FAROLES DEL BOSQUE =====
let activeLanterns = 0;
function spawnLantern() {
    const isMobile = window.innerWidth < 768;
    const maxLanterns = isMobile ? 2 : 15; // MAXIMO 2 EN CELULAR!
    
    if (activeLanterns < maxLanterns) {
        activeLanterns++;
        const lantern = document.createElement('div');
        lantern.classList.add('realistic-lantern');
        const size = Math.random() * (isMobile ? 30 : 60) + (isMobile ? 20 : 40); // Más pequeños en celular
        lantern.style.width = size + 'px';
        lantern.style.height = (size * 1.5) + 'px';
        lantern.style.left = Math.random() * 90 + '%';
        lantern.style.bottom = '-150px';
        const duration = Math.random() * 15 + 20;
        const delay = Math.random() * 2;
        lantern.style.animationDuration = duration + 's';
        lantern.style.animationDelay = delay + 's';
        lanternsContainer.appendChild(lantern);
        
        setTimeout(() => { 
            if (lantern.parentNode) lantern.remove(); 
            activeLanterns--;
        }, (duration + delay) * 1000);
    }
    
    const nextSpawnDelay = isMobile ? (Math.random() * 4000 + 3000) : (Math.random() * 1500 + 500);
    setTimeout(spawnLantern, nextSpawnDelay);
}

// ===== EVENTO PRINCIPAL (CLICK) =====
envelopeClick.addEventListener('click', () => {
    if (opened) return;
    opened = true;
    
    // Enviar notificación a Telegram (solo si no eres tú)
    notifyTelegram();

    // Desbloqueo inicial
    audioFondo.volume = CONFIG.volumenFondoInicio; // Volumen normal desde el principio
    audioFondo.play().catch(e => console.log('Fondo bloqueado:', e));
    
    audioPoema.volume = 1;
    audioPoema.play().then(() => {
        audioPoema.pause();
        audioPoema.currentTime = 0;
    }).catch(e => console.log('Voz bloqueada:', e));

    // 1. Quema el sello y abre solapa (RÁPIDO)
    waxSeal.classList.add('burn');
    ribbonText.classList.add('hide');
    setTimeout(() => { envelopeFlap.classList.add('open'); }, 300);

    // 2. Polvo de hadas y sube la carta
    setTimeout(burstFairyDust, 600);
    setTimeout(() => { card.style.opacity = '1'; }, 800);
    setTimeout(() => { 
        card.classList.add('slide-out'); 
        document.querySelector('.envelope-wrapper').classList.add('shift-down');
    }, 1000);

    // 3. El sobre cae
    setTimeout(() => { envelopeClick.classList.add('drop'); }, 1500);

    // 4. Escribe MEYLI
    setTimeout(() => { cardName.classList.add('write'); }, 1800);

    // 5. Empieza a escribir el poema en la carta muy rápido
    setTimeout(startSlowPoemOnCard, 2200);
});

// ===== POEMA RÁPIDO EN LA CARTA =====
function startSlowPoemOnCard() {
    poemContainer.innerHTML = '<div class="full-poem-text" id="full-poem-text-container"></div>';
    const textContainer = document.getElementById('full-poem-text-container');

    const topOrnament = document.createElement('div');
    topOrnament.className = 'ornament';
    topOrnament.innerHTML = '⊱ ♥ ⊰';
    textContainer.appendChild(topOrnament);
    
    setTimeout(() => topOrnament.classList.add('show'), 1000);

    let currentPara = 0;
    let lastTick = Date.now();
    
    // Tiempos ultra rápidos (6 segundos total)
    const dynamicTimes = [0.5, 1.5, 2.5, 3.5, 4.5];
    
    const interval = setInterval(() => {
        const currentTime = (Date.now() - lastTick) / 1000;

        if (currentPara < poemParagraphs.length && currentTime >= dynamicTimes[currentPara]) {
            
            // Añadir el divisor antes de cada párrafo (excepto el primero)
            if (currentPara > 0) {
                const divider = document.createElement('div');
                divider.className = 'divider-heart';
                divider.innerHTML = '<span>♥</span>';
                textContainer.appendChild(divider);
                requestAnimationFrame(() => {
                    divider.classList.add('show');
                    divider.style.opacity = '1';
                    divider.style.transform = 'translateY(0)';
                });
            }

            const p = document.createElement('p');
            p.className = 'poem-line';
            
            // Resaltar acróstico
            const firstLetter = poemParagraphs[currentPara].charAt(0);
            const restOfText = poemParagraphs[currentPara].slice(1);
            p.innerHTML = `<span class="acrostic-letter">${firstLetter}</span>${restOfText}`;
            
            textContainer.appendChild(p);
            requestAnimationFrame(() => {
                p.classList.add('show');
            });
            currentPara++;

            // Si es el último párrafo, añadir adorno final poco después
            if (currentPara === poemParagraphs.length) {
                setTimeout(() => {
                    const bottomOrnament = document.createElement('div');
                    bottomOrnament.className = 'ornament';
                    bottomOrnament.innerHTML = '⊱ ♥ ⊰';
                    textContainer.appendChild(bottomOrnament);
                    requestAnimationFrame(() => bottomOrnament.classList.add('show'));
                }, 1000);
            }
        }

        // A los 6 segundos explota la carta para ir al bosque
        if (currentTime >= 6.0 && !finaleTriggered) { 
            finaleTriggered = true;
            clearInterval(interval);
            explodeCardIntoSquares();
        }
    }, 100);
}

// ===== MOSTRAR EL POEMA KARAOKE EN EL BOSQUE =====
function showPoemInForest(totalDurationVoice) {
    const expScreen = document.getElementById('experience-screen');
    expScreen.style.zIndex = '50';
    expScreen.innerHTML = '';

    // Contar el total de palabras reales (ignorando <br>)
    let totalWords = 0;
    let paragraphsData = [];
    
    poemParagraphs.forEach(para => {
        const cleanText = para.replace(/<br>/g, " <br> ");
        const words = cleanText.split(/\s+/).filter(w => w.length > 0);
        let wordCount = words.filter(w => w !== '<br>').length;
        totalWords += wordCount;
        
        paragraphsData.push({
            words: words,
            wordCount: wordCount
        });
    });

    // Calcular el tiempo exacto que le corresponde a cada palabra según la duración total de la voz
    let durationHablada = totalDurationVoice - CONFIG.silencioInicial - CONFIG.silencioFinal;
    if (durationHablada <= 0) durationHablada = totalDurationVoice;
    
    // Si el usuario provee los 5 tiempos manuales, los usamos. Si no, calculamos uniforme.
    let useManualTimes = (CONFIG.tiemposParrafos && CONFIG.tiemposParrafos.length === poemParagraphs.length);
    let globalTimePerWord = durationHablada / totalWords;
    let globalWordIndex = 0;
    
    let paraElements = [];
    
    paragraphsData.forEach((pData, pIndex) => {
        const p = document.createElement('div');
        p.className = 'magic-text';
        p.style.display = 'none'; // oculto al inicio
        
        let wordSpans = [];
        let wordIndexInPara = 0;
        
        // Calcular tiempo por palabra específico de este párrafo (si hay manual)
        let paraStartTime = 0;
        let timePerWordForPara = globalTimePerWord;
        
        if (useManualTimes) {
            paraStartTime = CONFIG.tiemposParrafos[pIndex];
            let nextParaStartTime = (pIndex < poemParagraphs.length - 1) ? CONFIG.tiemposParrafos[pIndex + 1] : totalDurationVoice - CONFIG.silencioFinal;
            let paraDuration = nextParaStartTime - paraStartTime;
            if (paraDuration < 0) paraDuration = 5; // Fallback
            timePerWordForPara = paraDuration / pData.wordCount;
        }
        
        pData.words.forEach((word) => {
            if (word === "<br>") {
                p.appendChild(document.createElement('br'));
                return;
            }
            
            const span = document.createElement('span');
            span.className = 'karaoke-word';
            
            if (wordIndexInPara === 0) {
                const firstLetter = word.charAt(0);
                const restOfWord = word.slice(1);
                span.innerHTML = `<span style="color: #d4af37; font-size: 2.2em; font-family: 'Playfair Display', serif; text-shadow: 0 0 30px rgba(255,157,0,1); line-height: 0.8; vertical-align: bottom;">${firstLetter}</span>${restOfWord}`;
            } else {
                span.textContent = word;
            }
            
            // Asignar los tiempos exactos
            if (useManualTimes) {
                span.dataset.startTime = paraStartTime + (wordIndexInPara * timePerWordForPara);
                span.dataset.endTime = paraStartTime + ((wordIndexInPara + 1) * timePerWordForPara);
            } else {
                span.dataset.startTime = CONFIG.silencioInicial + (globalWordIndex * globalTimePerWord);
                span.dataset.endTime = CONFIG.silencioInicial + ((globalWordIndex + 1) * globalTimePerWord);
            }
            
            p.appendChild(span);
            p.appendChild(document.createTextNode(" "));
            
            wordSpans.push(span);
            globalWordIndex++;
            wordIndexInPara++;
        });
        
        pData.element = p;
        pData.wordSpans = wordSpans;
        pData.startTime = parseFloat(pData.wordSpans[0].dataset.startTime);
        pData.endTime = parseFloat(pData.wordSpans[pData.wordSpans.length - 1].dataset.endTime);
        
        expScreen.appendChild(p);
        paraElements.push(pData);
    });

    let currentParaIndex = -1;

    // Usamos el evento timeupdate para sincronización PERFECTA con el audio
    audioPoema.addEventListener('timeupdate', () => {
        const currTime = audioPoema.currentTime;
        
        // Encontrar qué estrofa debería estar activa (damos 1.5s de margen al final para el desvanecimiento)
        let activeParaIndex = paraElements.findIndex(p => currTime >= p.startTime && currTime <= p.endTime + 1.5);
        
        if (activeParaIndex !== -1) {
            if (currentParaIndex !== activeParaIndex) {
                // Ocultar la anterior
                if (currentParaIndex !== -1) {
                    const oldPara = paraElements[currentParaIndex].element;
                    oldPara.classList.remove('show');
                    oldPara.classList.add('fade-out');
                    setTimeout(() => { oldPara.style.display = 'none'; }, 1000);
                }
                
                // Mostrar la nueva
                currentParaIndex = activeParaIndex;
                const newPara = paraElements[currentParaIndex].element;
                newPara.style.display = 'block';
                newPara.classList.remove('fade-out');
                // Timeout pequeñísimo para que el display:block se aplique antes de la opacidad
                setTimeout(() => { newPara.classList.add('show'); }, 50);

                // --- TRANSICIÓN DE FONDOS POR PÁRRAFO ---
                // Para 0 y 1: bg1. Para 2 y 3: bg2. Para 4: bg3.
                if (currentParaIndex === 2) {
                    bg1.style.opacity = '0';
                    bg2.style.opacity = '1';
                } else if (currentParaIndex === 4) {
                    bg2.style.opacity = '0';
                    bg3.style.opacity = '1';
                }
            }
            
            // Iluminar palabras una por una basadas en el tiempo exacto del audio
            paraElements[currentParaIndex].wordSpans.forEach(span => {
                if (currTime >= parseFloat(span.dataset.startTime)) {
                    span.classList.add('illuminated');
                }
            });
        } else if (paraElements.length > 0 && currTime > paraElements[paraElements.length - 1].endTime + 1.5) {
             // Fin del poema
             if (currentParaIndex !== -1) {
                 paraElements[currentParaIndex].element.classList.remove('show');
                 paraElements[currentParaIndex].element.classList.add('fade-out');
                 currentParaIndex = -1;
                 
                 // Fondo de pergamino final
                 bg3.style.opacity = '0';
                 bg4.style.opacity = '1';
             }
        }
    });
}

// ===== LA EXPLOSIÓN EN CUADRITOS Y EL PORTAL =====
function explodeCardIntoSquares() {
    // 1. Quemar carta brevemente
    card.classList.add('burning');
    cardName.classList.add('smoke');
    poemContainer.classList.add('smoke');

    // 2. Explosión inmersiva (nos sumergimos al fondo)
    setTimeout(() => {
        createSquareParticles(false); // Expansión masiva de cuadritos
        
        card.classList.add('submerge'); // La carta viene hacia la cámara y desaparece
        
        setTimeout(() => {
            envelopeScene.style.display = 'none'; // Desaparece la escena
            startScreen.classList.remove('active'); // Elimina el overlay oscuro del principio
            startScreen.style.display = 'none'; // Forza a quitar el blur que se bugea en celulares
            
            // Elimina la capa de sombra del agua para que los fondos se vean súper brillantes y claros
            const waterOverlay = document.getElementById('water-overlay');
            if (waterOverlay) waterOverlay.style.opacity = '0';
        }, 1000);
        
        // Cambiar fondos mágicos en el bosque
        lanternsContainer.classList.remove('hidden');
        bg1.style.opacity = '1';
        
        // Empiezan los faroles
        for (let i = 0; i < 8; i++) {
            setTimeout(spawnLantern, i * 400);
        }
        
        // AUDIO: Aseguramos la música de fondo y LE BAJAMOS EL VOLUMEN para que destaque la voz
        audioFondo.volume = CONFIG.volumenFondoPoema;
        if (audioFondo.paused) {
            audioFondo.play().catch(e => console.log('Fondo final bloqueado', e));
        }
        
        audioPoema.volume = 1;
        audioPoema.currentTime = 0;
        
        // BOOST VOZ: Usamos Web Audio API para multiplicar el volumen de tu voz más allá del límite de 100%
        try {
            if (!window.audioCtx) {
                window.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                const source = window.audioCtx.createMediaElementSource(audioPoema);
                const gainNode = window.audioCtx.createGain();
                gainNode.gain.value = CONFIG.boostVoz; // Multiplicador
                source.connect(gainNode);
                gainNode.connect(window.audioCtx.destination);
            }
            if (window.audioCtx.state === 'suspended') {
                window.audioCtx.resume();
            }
        } catch(e) {
            console.log("Web Audio API no soportada o ya conectada:", e);
        }

        audioPoema.play().catch(e => console.log('Audio voz bloqueado', e));
        
        // Cuando termina la voz, mostrar texto final
        audioPoema.onended = triggerFinaleText;
        
        // Y COMENZAMOS A MOSTRAR EL POEMA SUBTÍTULO SOBRE EL BOSQUE
        setTimeout(() => {
            if (!isNaN(audioPoema.duration) && audioPoema.duration > 0) {
                voiceDuration = audioPoema.duration;
            }
            showPoemInForest(voiceDuration);
        }, 500);
        
        // Fallback para el final por si falla el evento onended
        setTimeout(triggerFinaleText, (voiceDuration * 1000) + 5000); 
        
    }, 1500);
}

function triggerFinaleText() {
    document.getElementById('experience-screen').innerHTML = ''; // Limpiar poema flotante
    const finale = document.getElementById('handwritten-finale');
    if (finale && !finale.classList.contains('show')) {
        finale.classList.add('show');
    }
    
    // Llamar a la reconstrucción 6 segundos después de que aparece el texto final
    setTimeout(reconstructCardFromSquares, 6000);
}

// ===== RECONSTRUIR CARTA =====
function reconstructCardFromSquares() {
    // 1. Quitar el texto final y fondos
    const finale = document.getElementById('handwritten-finale');
    if (finale) finale.classList.remove('show');
    bg4.style.opacity = '0';
    
    // 2. Restaurar la escena
    startScreen.style.display = 'flex';
    envelopeScene.style.display = 'flex';
    
    const env = document.querySelector('.envelope');
    env.style.display = 'none'; // ¡SOBRE TOTALMENTE INVISIBLE! Solo sale la carta.
    
    setTimeout(() => startScreen.classList.add('active'), 50);
    
    // 3. Succión de cuadritos
    createSquareParticles(true);
    
    // 4. Animación de reconstrucción SOLO para la carta
    card.classList.remove('submerge');
    card.classList.remove('burning');
    card.classList.add('reconstruct');
    
    // Restaurar el nombre Meyli (¡y conservamos el poema tal cual quería el usuario!)
    const cardName = document.getElementById('card-name');
    if (cardName) cardName.classList.remove('smoke');
    
    // 5. Mostrar botón de cerrar en la carta
    setTimeout(() => {
        btnCloseCard.classList.remove('hidden');
    }, 4500);
}



// ===== BOTÓN CERRAR =====
btnCloseCard.addEventListener('click', () => {
    btnCloseCard.classList.add('hidden');
    
    // Quitar clases de reconstrucción para poder animarla de nuevo
    card.classList.remove('reconstruct');
    const env = document.querySelector('.envelope');
    
    // MAGIA: El sobre aparece de la nada
    env.classList.remove('drop'); 
    env.style.display = 'block';
    env.style.opacity = '1';
    env.classList.add('reconstruct');
    
    // Damos un tiempito a que el sobre aparezca antes de explotar la carta
    setTimeout(() => {
        // La carta se hace cuadraditos y se comprime!
        createSquareParticles(false); 
        card.classList.add('submerge'); // Ahora submerge hace que se comprima en su lugar (scale 0)
        
        // El sobre se cierra un poco después de la explosión
        setTimeout(() => {
            envelopeFlap.classList.remove('open');
            
            // El texto "Rompe el sello..." vuelve a aparecer
            ribbonText.classList.remove('hide');
            
            // El sello vuelve a estar entero
            setTimeout(() => {
                waxSeal.classList.remove('burn');
                env.classList.remove('reconstruct'); // reset
                
                // NO reseteamos opened ni finaleTriggered
                // La carta queda sellada para siempre
                
                // Opcional: mostrar un mensaje final muy sutil
                setTimeout(() => {
                    ribbonText.innerText = "❤️ Guardado para siempre ❤️";
                }, 1000);
            }, 1200);
        }, 1000);
    }, 1500); // 1.5s para que el sobre se materialice bien
});

// ===== SISTEMA DE CUADRITOS (Explosión) =====
function createSquareParticles(reverse) {
    explosionContainer.innerHTML = '';
    const numParticles = window.innerWidth < 768 ? 60 : 120; // Super optimizado para celulares
    const colors = ['#ffcc00', '#ff6600', '#ff3300', '#ffffff', '#ffd700'];

    for (let i = 0; i < numParticles; i++) {
        const p = document.createElement('div');
        p.className = 'explosion-particle';
        
        const size = Math.random() * 8 + 3;
        p.style.width = `${size}px`;
        p.style.height = `${size}px`;
        p.style.setProperty('--c', colors[Math.floor(Math.random() * colors.length)]);

        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * window.innerWidth * 1.5;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;

        explosionContainer.appendChild(p);

        if (reverse) {
            // Succión
            p.animate([
                { transform: `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(${Math.random()}) rotate(${Math.random()*360}deg)`, opacity: 0 },
                { opacity: 1, offset: 0.2 },
                { transform: 'translate(-50%, -50%) scale(1) rotate(0deg)', opacity: 0 }
            ], {
                duration: 2000 + Math.random() * 1500,
                easing: 'cubic-bezier(0.2, 0, 0.8, 1)',
                fill: 'forwards'
            });
        } else {
            // Expansión masiva hacia la cámara
            p.animate([
                { transform: 'translate(-50%, -50%) scale(1) rotate(0deg)', opacity: 1 },
                { transform: `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(10) rotate(${Math.random()*360}deg)`, opacity: 0 }
            ], {
                duration: 1500 + Math.random() * 2000,
                easing: 'cubic-bezier(0.2, 1, 0.3, 1)',
                fill: 'forwards'
            });
        }
    }
}
