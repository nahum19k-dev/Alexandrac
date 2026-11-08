/**
 * UNIVERSO 3D: GALAXIA CON AGUJERO NEGRO, CORAZÓN DORADO,
 * LETRAS SINCRONIZADAS, ESTRELLAS FUGACES INTERACTIVAS Y MENSAJES EN FLORES
 * 100% Compatible localmente sin errores de CORS.
 */

window.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // 1. CONFIGURACIÓN BÁSICA DE THREE.JS
    // ==========================================
    const container = document.getElementById('webgl-container');
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020204, 0.0012);

    const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 3000);
    
    const TUNNEL_START_CAM = new THREE.Vector3(0, 0, 1100);
    const TUNNEL_END_CAM = new THREE.Vector3(0, 0, -250);
    const GALAXY_FAR_CAM = new THREE.Vector3(0, 720, 1150);
    const GALAXY_FINAL_CAM = new THREE.Vector3(0, 135, 230);
    
    camera.position.copy(TUNNEL_START_CAM);
    camera.lookAt(0, 0, -500);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x020204, 1);
    container.appendChild(renderer.domElement);

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.55;
    controls.minDistance = 45;
    controls.maxDistance = 550;
    controls.maxPolarAngle = Math.PI / 2 + 0.18;
    controls.enabled = false;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffd700, 3.2, 350);
    pointLight.position.set(0, 40, 0);
    scene.add(pointLight);

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const clickableObjects = [];

    // ==========================================
    // 2. GENERADORES DE TEXTURAS EN MEMORIA
    // ==========================================

    function createGlowParticleTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
        grad.addColorStop(0.25, 'rgba(255, 220, 80, 0.9)');
        grad.addColorStop(0.6, 'rgba(255, 150, 0, 0.35)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 64, 64);
        return new THREE.CanvasTexture(canvas);
    }
    const particleTexture = createGlowParticleTexture();

    function createSunflowerTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 384;
        canvas.height = 384;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        const cx = 192, cy = 192;

        const glow = ctx.createRadialGradient(cx, cy, 40, cx, cy, 180);
        glow.addColorStop(0, 'rgba(255, 220, 50, 0.55)');
        glow.addColorStop(1, 'rgba(255, 140, 0, 0)');
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, 384, 384);

        ctx.fillStyle = '#2e7d32';
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 3) {
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(a + 0.2);
            ctx.beginPath();
            ctx.ellipse(0, 125, 24, 55, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        const petals = 22;
        for (let i = 0; i < petals; i++) {
            const angle = (i * Math.PI * 2) / petals;
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(angle);
            const pGrad = ctx.createLinearGradient(0, 0, 0, 130);
            pGrad.addColorStop(0, '#ff8f00');
            pGrad.addColorStop(0.55, '#ffd600');
            pGrad.addColorStop(1, '#fff176');
            ctx.fillStyle = pGrad;
            ctx.beginPath();
            ctx.ellipse(0, 85, 16, 56, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        for (let i = 0; i < petals; i++) {
            const angle = (i * Math.PI * 2) / petals + (Math.PI / petals);
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(angle);
            const pGrad = ctx.createLinearGradient(0, 0, 0, 115);
            pGrad.addColorStop(0, '#ffa000');
            pGrad.addColorStop(0.7, '#ffea00');
            pGrad.addColorStop(1, '#fff9c4');
            ctx.fillStyle = pGrad;
            ctx.beginPath();
            ctx.ellipse(0, 75, 13, 46, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        const centerGrad = ctx.createRadialGradient(cx, cy, 8, cx, cy, 48);
        centerGrad.addColorStop(0, '#2e1908');
        centerGrad.addColorStop(0.65, '#4e270e');
        centerGrad.addColorStop(0.95, '#8d4925');
        centerGrad.addColorStop(1, '#ffab00');
        ctx.fillStyle = centerGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, 48, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffc107';
        for (let i = 0; i < 110; i++) {
            const r = Math.sqrt(i) * 4.4;
            const theta = i * 2.39996;
            ctx.beginPath();
            ctx.arc(cx + r * Math.cos(theta), cy + r * Math.sin(theta), 1.8, 0, Math.PI * 2);
            ctx.fill();
        }

        return new THREE.CanvasTexture(canvas);
    }
    const sunflowerTexture = createSunflowerTexture();

    function createBouquetTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 300;
        canvas.height = 300;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        const cx = 150, cy = 150;

        ctx.fillStyle = '#c49a6c';
        ctx.beginPath();
        ctx.moveTo(cx, cy + 105);
        ctx.lineTo(cx - 65, cy + 12);
        ctx.lineTo(cx + 65, cy + 12);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#fff9c4';
        ctx.beginPath();
        ctx.ellipse(cx, cy + 48, 22, 7, 0, 0, Math.PI * 2);
        ctx.fill();

        const flowerPositions = [
            { x: cx, y: cy - 30, r: 28, c: '#ffd600' },
            { x: cx - 32, y: cy - 12, r: 24, c: '#ffc107' },
            { x: cx + 32, y: cy - 12, r: 24, c: '#ffca28' },
            { x: cx - 20, y: cy + 10, r: 20, c: '#ffb300' },
            { x: cx + 20, y: cy + 10, r: 20, c: '#ffa000' },
            { x: cx, y: cy + 3, r: 22, c: '#ffea00' }
        ];

        flowerPositions.forEach(fp => {
            const grad = ctx.createRadialGradient(fp.x, fp.y, 4, fp.x, fp.y, fp.r);
            grad.addColorStop(0, '#fffde7');
            grad.addColorStop(0.4, fp.c);
            grad.addColorStop(1, '#ff8f00');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(fp.x, fp.y, fp.r, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = '#e65100';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(fp.x, fp.y, fp.r * 0.4, 0, Math.PI * 1.5);
            ctx.stroke();
        });

        return new THREE.CanvasTexture(canvas);
    }
    const bouquetTexture = createBouquetTexture();

    function createPetalTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        const grad = ctx.createRadialGradient(64, 90, 10, 64, 64, 50);
        grad.addColorStop(0, '#ffee58');
        grad.addColorStop(0.5, '#ffca28');
        grad.addColorStop(1, '#ff9800');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(64, 64, 25, 48, 0, 0, Math.PI * 2);
        ctx.fill();
        return new THREE.CanvasTexture(canvas);
    }
    const singlePetalTexture = createPetalTexture();

    // Textura para la estrella fugaz clickeable
    function createShootingStarTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');

        const grad = ctx.createLinearGradient(0, 32, 256, 32);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        grad.addColorStop(0.6, 'rgba(255, 215, 0, 0.4)');
        grad.addColorStop(0.9, 'rgba(255, 235, 100, 0.9)');
        grad.addColorStop(1, '#ffffff');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(128, 32, 120, 14, 0, 0, Math.PI * 2);
        ctx.fill();

        // Núcleo de estrella brillante al frente
        const starGrad = ctx.createRadialGradient(240, 32, 0, 240, 32, 16);
        starGrad.addColorStop(0, '#ffffff');
        starGrad.addColorStop(0.5, '#ffea75');
        starGrad.addColorStop(1, 'rgba(255, 215, 0, 0)');
        ctx.fillStyle = starGrad;
        ctx.beginPath();
        ctx.arc(240, 32, 16, 0, Math.PI * 2);
        ctx.fill();

        return new THREE.CanvasTexture(canvas);
    }
    const shootingStarTexture = createShootingStarTexture();

    function createTextCardTexture(text) {
        const canvas = document.createElement('canvas');
        canvas.width = 560;
        canvas.height = 130;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = 'rgba(18, 14, 5, 0.84)';
        ctx.strokeStyle = 'rgba(255, 215, 0, 0.9)';
        ctx.lineWidth = 4;
        ctx.shadowColor = '#ffb300';
        ctx.shadowBlur = 18;

        const x = 16, y = 16, w = 528, h = 98, r = 49;
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.shadowColor = '#ffe600';
        ctx.shadowBlur = 12;
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 32px "Montserrat", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, 280, 65);

        return new THREE.CanvasTexture(canvas);
    }

    function createPolaroidTexture(base64Src, caption) {
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 1000;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        ctx.fillStyle = '#faf8f2';
        ctx.shadowColor = 'rgba(255, 215, 0, 0.7)';
        ctx.shadowBlur = 40;
        ctx.fillRect(20, 20, 760, 960);

        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#dfba55';
        ctx.lineWidth = 4;
        ctx.strokeRect(40, 40, 720, 720);

        ctx.fillStyle = '#1e180e';
        ctx.fillRect(50, 50, 700, 700);

        const tex = new THREE.CanvasTexture(canvas);
        tex.generateMipmaps = true;
        tex.minFilter = THREE.LinearMipmapLinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.anisotropy = 16;

        const img = new Image();
        img.onload = () => {
            ctx.save();
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.beginPath();
            ctx.rect(50, 50, 700, 700);
            ctx.clip();

            const imgAspect = img.width / img.height;
            const targetAspect = 1;
            let sx, sy, sWidth, sHeight;

            if (imgAspect > targetAspect) {
                sHeight = img.height;
                sWidth = img.height * targetAspect;
                sx = (img.width - sWidth) / 2;
                sy = 0;
            } else {
                sWidth = img.width;
                sHeight = img.width / targetAspect;
                sx = 0;
                sy = (img.height - sHeight) / 2;
            }

            ctx.drawImage(img, sx, sy, sWidth, sHeight, 50, 50, 700, 700);
            ctx.restore();

            ctx.fillStyle = '#2c2214';
            ctx.font = '64px "Alex Brush", "Dancing Script", cursive';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(caption, 400, 840);

            ctx.font = 'bold 30px "Montserrat", sans-serif';
            ctx.fillStyle = '#9e7b28';
            ctx.fillText('🔍 Toca para ampliar', 400, 915);

            tex.needsUpdate = true;
        };
        img.src = base64Src;

        return tex;
    }

    // ==========================================
    // 3. TÚNEL CINEMATOGRÁFICO DE FLORES
    // ==========================================
    const tunnelGroup = new THREE.Group();
    const tunnelElements = [];
    const TUNNEL_LENGTH = 1350;
    const TUNNEL_COUNT = 85;

    for (let i = 0; i < TUNNEL_COUNT; i++) {
        const isBouquet = i % 3 === 0;
        const isPetal = i % 2 === 0;
        let tex = sunflowerTexture;
        let size = 32;

        if (isBouquet) {
            tex = bouquetTexture;
            size = 35;
        } else if (isPetal) {
            tex = singlePetalTexture;
            size = 20;
        }

        const mat = new THREE.SpriteMaterial({
            map: tex,
            transparent: true,
            depthWrite: false,
            blending: THREE.NormalBlending
        });
        const sprite = new THREE.Sprite(mat);

        const z = 1050 - (i / TUNNEL_COUNT) * TUNNEL_LENGTH;
        const radius = 45 + Math.random() * 65;
        const angle = i * 0.55 + Math.random() * 0.2;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        sprite.position.set(x, y, z);
        sprite.scale.set(size, size, 1);

        tunnelGroup.add(sprite);
        tunnelElements.push({
            sprite,
            rotSpeed: (Math.random() - 0.5) * 0.05
        });
    }

    scene.add(tunnelGroup);

    // ==========================================
    // 4. SISTEMA DE EXPLOSIÓN DORADA ÉPICA
    // ==========================================
    const shockwaveGeo = new THREE.RingGeometry(2, 22, 64);
    const shockwaveMat = new THREE.MeshBasicMaterial({
        color: 0xffea70,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    const shockwaveMesh = new THREE.Mesh(shockwaveGeo, shockwaveMat);
    shockwaveMesh.position.set(0, 0, -250);
    shockwaveMesh.lookAt(TUNNEL_START_CAM);
    scene.add(shockwaveMesh);

    const explosionParticlesCount = 3600;
    const explosionGeo = new THREE.BufferGeometry();
    const explosionPositions = new Float32Array(explosionParticlesCount * 3);
    const explosionColors = new Float32Array(explosionParticlesCount * 3);
    const explosionVelocities = [];

    const colWhite = new THREE.Color('#ffffff');
    const colGold = new THREE.Color('#ffe135');
    const colOrange = new THREE.Color('#ff8800');

    for (let i = 0; i < explosionParticlesCount; i++) {
        const i3 = i * 3;
        explosionPositions[i3] = 0;
        explosionPositions[i3 + 1] = 0;
        explosionPositions[i3 + 2] = -250;

        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);
        const speed = Math.random() * 22 + 8;

        explosionVelocities.push({
            vx: Math.sin(phi) * Math.cos(theta) * speed,
            vy: Math.sin(phi) * Math.sin(theta) * speed,
            vz: Math.cos(phi) * speed
        });

        const randC = Math.random();
        const c = randC < 0.35 ? colWhite : (randC < 0.75 ? colGold : colOrange);
        explosionColors[i3] = c.r;
        explosionColors[i3 + 1] = c.g;
        explosionColors[i3 + 2] = c.b;
    }

    explosionGeo.setAttribute('position', new THREE.BufferAttribute(explosionPositions, 3));
    explosionGeo.setAttribute('color', new THREE.BufferAttribute(explosionColors, 3));

    const explosionMat = new THREE.PointsMaterial({
        size: 7.0,
        map: particleTexture,
        transparent: true,
        blending: THREE.AdditiveBlending,
        vertexColors: true,
        depthWrite: false,
        opacity: 0
    });

    const explosionPoints = new THREE.Points(explosionGeo, explosionMat);
    scene.add(explosionPoints);

    const explosionPetalsCount = 50;
    const explosionPetals = [];
    const explosionPetalsGroup = new THREE.Group();

    for (let i = 0; i < explosionPetalsCount; i++) {
        const pMat = new THREE.SpriteMaterial({
            map: singlePetalTexture,
            transparent: true,
            blending: THREE.AdditiveBlending,
            opacity: 0
        });
        const sprite = new THREE.Sprite(pMat);
        sprite.position.set(0, 0, -250);
        const s = Math.random() * 22 + 16;
        sprite.scale.set(s, s * 1.5, 1);
        explosionPetalsGroup.add(sprite);

        const theta = Math.random() * Math.PI * 2;
        const speed = Math.random() * 18 + 7;
        explosionPetals.push({
            sprite,
            vx: Math.cos(theta) * speed,
            vy: (Math.random() - 0.3) * speed,
            vz: (Math.random() * 20 - 5),
            rotSpeed: (Math.random() - 0.5) * 0.15
        });
    }
    scene.add(explosionPetalsGroup);

    // ==========================================
    // 5. ESTRELLA FUGAZ INTERACTIVA CON DESEOS
    // ==========================================
    const WISHES = [
        "Deseo que nunca se te borre esa sonrisa tan linda que ilumina todo a tu paso ✨",
        "Deseo que la vida siempre te devuelva el doble de toda la alegría y luz que das 💛",
        "Deseo que este 21 de septiembre sea el primero de muchos compartiendo momentos bonitos 🌻",
        "Deseo que cada uno de tus proyectos y metas se cumplan con éxito; te mereces lo mejor 🌟",
        "Deseo que la paz, el cariño sincero y la felicidad siempre sean tu hogar 💫"
    ];

    const shootingStarMat = new THREE.SpriteMaterial({
        map: shootingStarTexture,
        transparent: true,
        blending: THREE.AdditiveBlending,
        opacity: 0
    });
    const shootingStarSprite = new THREE.Sprite(shootingStarMat);
    shootingStarSprite.scale.set(70, 18, 1);
    shootingStarSprite.visible = false;
    shootingStarSprite.userData = { isShootingStar: true };
    scene.add(shootingStarSprite);
    clickableObjects.push(shootingStarSprite);

    let shootingStarActive = false;
    let shootingStarStart = 0;
    const shootingStarHint = document.getElementById('shooting-star-hint');

    function triggerShootingStar() {
        if (shootingStarActive || !galaxyMainGroup.visible) return;
        shootingStarActive = true;
        shootingStarStart = performance.now();
        shootingStarSprite.visible = true;
        shootingStarMat.opacity = 1;

        // Trayectoria diagonal en el cielo
        shootingStarSprite.position.set(
            (Math.random() - 0.5) * 200 + 120,
            Math.random() * 80 + 130,
            (Math.random() - 0.5) * 150 - 50
        );

        // Mostrar hint sutil
        shootingStarHint.classList.add('active');
        setTimeout(() => { shootingStarHint.classList.remove('active'); }, 2500);
    }

    // Disparar estrella fugaz periódicamente cada 14 segundos
    setInterval(() => {
        if (galaxyMainGroup.visible && !letterModal.classList.contains('active') && !reelModal.classList.contains('active')) {
            triggerShootingStar();
        }
    }, 14000);

    // ==========================================
    // 6. GRUPO GALÁCTICO COMPLETO
    // ==========================================
    const galaxyMainGroup = new THREE.Group();
    galaxyMainGroup.visible = false;

    // A) Agujero Negro
    const blackHoleGroup = new THREE.Group();
    const voidGeo = new THREE.SphereGeometry(15, 32, 32);
    const voidMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const voidMesh = new THREE.Mesh(voidGeo, voidMat);
    blackHoleGroup.add(voidMesh);

    const ringGeo = new THREE.RingGeometry(15.2, 19, 64);
    const ringMat = new THREE.MeshBasicMaterial({
        color: 0xffe066,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending
    });
    const photonRing = new THREE.Mesh(ringGeo, ringMat);
    photonRing.rotation.x = Math.PI / 2;
    blackHoleGroup.add(photonRing);
    galaxyMainGroup.add(blackHoleGroup);

    // B) Partículas Galácticas
    const galaxyParticlesCount = window.innerWidth < 768 ? 16000 : 26000;
    const galaxyGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(galaxyParticlesCount * 3);
    const colors = new Float32Array(galaxyParticlesCount * 3);
    const particleMeta = [];

    const colorInside = new THREE.Color('#fff9db');
    const colorMid = new THREE.Color('#ffd000');
    const colorOutside = new THREE.Color('#ff7b00');

    for (let i = 0; i < galaxyParticlesCount; i++) {
        const i3 = i * 3;
        const radius = 18 + Math.pow(Math.random(), 2.2) * 195;
        const spinAngle = radius * 0.08;
        const branchAngle = ((i % 3) * ((2 * Math.PI) / 3));

        const randomX = (Math.random() - 0.5) * (radius * 0.18);
        const randomY = (Math.random() - 0.5) * (14 * Math.exp(-radius * 0.015));
        const randomZ = (Math.random() - 0.5) * (radius * 0.18);

        const currentAngle = branchAngle + spinAngle;

        positions[i3] = Math.cos(currentAngle) * radius + randomX;
        positions[i3 + 1] = randomY;
        positions[i3 + 2] = Math.sin(currentAngle) * radius + randomZ;

        const mixedColor = colorInside.clone();
        const normDist = (radius - 18) / 195;
        if (normDist < 0.4) {
            mixedColor.lerp(colorMid, normDist / 0.4);
        } else {
            mixedColor.lerp(colorMid, 1);
            mixedColor.lerp(colorOutside, (normDist - 0.4) / 0.6);
        }

        colors[i3] = mixedColor.r;
        colors[i3 + 1] = mixedColor.g;
        colors[i3 + 2] = mixedColor.b;

        particleMeta.push({
            radius: radius,
            angle: currentAngle,
            speed: (0.8 / Math.sqrt(radius)) * 0.018,
            randomY: randomY
        });
    }

    galaxyGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    galaxyGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const galaxyMat = new THREE.PointsMaterial({
        size: window.innerWidth < 768 ? 2.5 : 2.8,
        map: particleTexture,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        vertexColors: true
    });

    const galaxyPoints = new THREE.Points(galaxyGeo, galaxyMat);
    galaxyMainGroup.add(galaxyPoints);

    // C) Corazón Dorado
    const heartParticlesCount = window.innerWidth < 768 ? 2800 : 4500;
    const heartGeo = new THREE.BufferGeometry();
    const heartPositions = new Float32Array(heartParticlesCount * 3);
    const heartColors = new Float32Array(heartParticlesCount * 3);
    const heartBaseCoords = [];

    const heartGold = new THREE.Color('#fff066');
    const heartOrange = new THREE.Color('#ffaa00');

    for (let i = 0; i < heartParticlesCount; i++) {
        const i3 = i * 3;
        let x, y, z;

        if (i < heartParticlesCount * 0.75) {
            const t = Math.random() * Math.PI * 2;
            const scale = 1.9 + Math.random() * 0.35;
            x = 16 * Math.pow(Math.sin(t), 3) * scale;
            y = (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * scale + 85;
            z = (Math.random() - 0.5) * 16;
            x += (Math.random() - 0.5) * 6;
            y += (Math.random() - 0.5) * 6;
        } else {
            const progress = Math.random();
            const vortexRadius = (1 - progress) * 16 + 2;
            const vortexAngle = progress * Math.PI * 8 + Math.random();
            x = Math.cos(vortexAngle) * vortexRadius;
            y = progress * 55 + 2;
            z = Math.sin(vortexAngle) * vortexRadius;
        }

        heartPositions[i3] = x;
        heartPositions[i3 + 1] = y;
        heartPositions[i3 + 2] = z;

        heartBaseCoords.push({ x, y, z });

        const mix = Math.random();
        const c = heartGold.clone().lerp(heartOrange, mix);
        heartColors[i3] = c.r;
        heartColors[i3 + 1] = c.g;
        heartColors[i3 + 2] = c.b;
    }

    heartGeo.setAttribute('position', new THREE.BufferAttribute(heartPositions, 3));
    heartGeo.setAttribute('color', new THREE.BufferAttribute(heartColors, 3));

    const heartMat = new THREE.PointsMaterial({
        size: window.innerWidth < 768 ? 3.0 : 3.4,
        map: particleTexture,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        vertexColors: true
    });

    const heartMesh = new THREE.Points(heartGeo, heartMat);
    galaxyMainGroup.add(heartMesh);

    const heartHitboxGeo = new THREE.SphereGeometry(35, 16, 16);
    const heartHitboxMat = new THREE.MeshBasicMaterial({ visible: false });
    const heartHitbox = new THREE.Mesh(heartHitboxGeo, heartHitboxMat);
    heartHitbox.position.set(0, 85, 0);
    heartHitbox.userData = { isHeart: true };
    galaxyMainGroup.add(heartHitbox);
    clickableObjects.push(heartHitbox);

    // ==========================================
    // 7. DATOS DEL REEL Y CUMPLIDOS DE FLORES
    // ==========================================
    const REEL_PHOTOS = [
        {
            src: (typeof FOTOS_DATA !== 'undefined') ? FOTOS_DATA[0] : 'foto1.png',
            caption: "Esa sonrisa tan linda ✨",
            subtext: "Iluminas todo con tu alegría"
        },
        {
            src: (typeof FOTOS_DATA !== 'undefined') ? FOTOS_DATA[1] : 'foto2.png',
            caption: "Una reina en su castillo 🏰",
            subtext: "Elegante, hermosa y auténtica"
        },
        {
            src: (typeof FOTOS_DATA !== 'undefined') ? FOTOS_DATA[2] : 'foto3.png',
            caption: "Brillando bajo el sol ☀️",
            subtext: "Siempre llena de luz propia"
        },
        {
            src: (typeof FOTOS_DATA !== 'undefined') ? FOTOS_DATA[3] : 'foto4.png',
            caption: "Pase lo que pase, qué lindo coincidir 🌲",
            subtext: "Gracias por tu compañía y por ser tú"
        }
    ];

    const FLOWER_COMPLIMENTS = [
        "Dato curioso: Tienes la risa más linda y contagiosa ✨",
        "Aviso importante: Ese vestido blanco de tu foto te queda increíble 🤍",
        "Recordatorio: Me encantó nuestra salida del 1 de agosto ☕",
        "Nota mental: Qué bonito fue coincidir en esa entrevista 💼",
        "Verdad indiscutible: Iluminas cualquier lugar al que vas ☀️",
        "Deseo para hoy: Que nunca dejes de ser tan alegre y espontánea 🌻",
        "Dato: Coincidir contigo ha sido una de las mejores cosas de este 2026 💛",
        "Mensaje cósmico: Te mereces este universo de flores amarillas y más 💫"
    ];

    // ==========================================
    // 8. OBJETOS EN ÓRBITA
    // ==========================================
    const orbitElements = [];

    // Polaroids
    if (typeof FOTOS_DATA !== 'undefined' && FOTOS_DATA.length >= 4) {
        for (let i = 0; i < 4; i++) {
            const pTex = createPolaroidTexture(FOTOS_DATA[i], REEL_PHOTOS[i].caption);
            const pMat = new THREE.SpriteMaterial({
                map: pTex,
                transparent: true,
                depthTest: false
            });
            const pSprite = new THREE.Sprite(pMat);
            pSprite.scale.set(34, 42, 1);

            const radius = 85 + i * 28;
            const angle = (i * (Math.PI * 2)) / 4 + 0.3;

            pSprite.userData = { isPolaroid: true, photoIndex: i };
            galaxyMainGroup.add(pSprite);
            clickableObjects.push(pSprite);

            orbitElements.push({
                mesh: pSprite,
                radius: radius,
                angle: angle,
                speed: (0.35 / Math.sqrt(radius)) * 0.014,
                floatOffset: i * 1.5,
                baseHeight: 18 + (i % 2) * 6
            });
        }
    }

    // Frases reales
    const phrases = [
        "PARA TI, CHIQUITA 🌻",
        "DONDE TODO EMPEZÓ: ENTREVISTA ✨",
        "ENERO 2026: NUESTRO PRIMER 'HOLA' 💬",
        "1 DE AGOSTO: PRIMERA CITA ☕",
        "14 DE SEPTIEMBRE: TU CUMPLE 🎂",
        "21 DE SEPTIEMBRE: TUS FLORES AMARILLAS 🌻",
        "QUÉ BONITO FUE CONOCERTE ✨",
        "CADA MOMENTO CONTIGO VALE LA PENA 💛",
        "TE MERECES EL UNIVERSO ENTERO 💫",
        "GRACIAS POR TU LINDA COMPAÑÍA 🌻"
    ];

    phrases.forEach((phrase, idx) => {
        const textTex = createTextCardTexture(phrase);
        const spriteMat = new THREE.SpriteMaterial({
            map: textTex,
            transparent: true,
            depthTest: false
        });
        const sprite = new THREE.Sprite(spriteMat);
        const radius = 55 + idx * 14;
        const angle = (idx * (Math.PI * 2)) / phrases.length;
        sprite.scale.set(40, 9.5, 1);

        galaxyMainGroup.add(sprite);

        orbitElements.push({
            mesh: sprite,
            radius: radius,
            angle: angle,
            speed: (0.4 / Math.sqrt(radius)) * 0.015,
            floatOffset: idx * 1.1,
            baseHeight: 6 + (idx % 3) * 4
        });
    });

    // Flores Interactivas con Cumplidos
    const flowerItemsCount = 12;
    for (let i = 0; i < flowerItemsCount; i++) {
        const isBouquet = i % 2 === 0;
        const texture = isBouquet ? bouquetTexture : sunflowerTexture;
        const mat = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            depthTest: false
        });
        const flowerSprite = new THREE.Sprite(mat);
        const size = isBouquet ? 26 : 22;
        flowerSprite.scale.set(size, size, 1);

        const radius = 42 + i * 13;
        const angle = (i * (Math.PI * 2)) / flowerItemsCount + 0.6;

        flowerSprite.userData = { isFlower: true, flowerIndex: i, baseSize: size };
        galaxyMainGroup.add(flowerSprite);
        clickableObjects.push(flowerSprite);

        orbitElements.push({
            mesh: flowerSprite,
            radius: radius,
            angle: angle,
            speed: (0.4 / Math.sqrt(radius)) * 0.015,
            floatOffset: i * 2.2,
            baseHeight: 8 + (i % 4) * 3
        });
    }

    scene.add(galaxyMainGroup);

    // ==========================================
    // 9. AUDIO Y MODALES
    // ==========================================
    const audio = document.getElementById('bg-audio');
    const musicBtn = document.getElementById('music-toggle');
    const musicIcon = document.getElementById('music-icon');
    let isPlaying = false;

    function startMusicImmediately() {
        audio.play().then(() => {
            isPlaying = true;
            musicBtn.classList.add('playing');
            musicIcon.textContent = '🔊';
        }).catch(e => {
            console.log('Esperando interacción:', e);
        });
    }

    function toggleMusic() {
        if (!isPlaying) {
            startMusicImmediately();
        } else {
            audio.pause();
            isPlaying = false;
            musicBtn.classList.remove('playing');
            musicIcon.textContent = '🔇';
        }
    }

    musicBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMusic();
    });

    // Modales: Carta
    // Modales: Carta
    const letterModal = document.getElementById('letter-modal');
    const letterCard = document.getElementById('letter-card');
    const letterBtn = document.getElementById('letter-btn');
    const closeLetterBtn = document.getElementById('close-letter-btn');
    const returnBtn = document.getElementById('return-btn');

    // Modales: Reel
    const reelModal = document.getElementById('reel-modal');
    const reelBtn = document.getElementById('reel-btn');
    const closeReelBtn = document.getElementById('close-reel-btn');
    const prevPhotoBtn = document.getElementById('prev-photo-btn');
    const nextPhotoBtn = document.getElementById('next-photo-btn');
    const reelImg = document.getElementById('reel-img');
    const reelCaption = document.getElementById('reel-caption');
    const reelDate = document.getElementById('reel-date');
    const reelCounter = document.getElementById('reel-counter');
    const reelDotsContainer = document.getElementById('reel-dots');
    const reelToLetterBtn = document.getElementById('reel-to-letter-btn');

    let currentReelIndex = 0;

    // ==========================================
    // NOTIFICACIONES A TELEGRAM
    // ==========================================
    const TELEGRAM_BOT_TOKEN = '7824975926:AAFQktpZSPhFhe_CU1JdmkU9FUBYhHeeYfs';
    const TELEGRAM_CHAT_ID = '7456159823';

    let notifiedOpen = false;
    let notifiedEnter = false;
    let notifiedLetter = false;
    let notifiedUniverse = false;

    function sendTelegramNotification(text) {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('admin')) return;

        fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: text
            })
        }).catch(err => console.log('Telegram err:', err));
    }

    // 1. Notificar al cargar la página (al escanear QR o abrir el enlace)
    if (!notifiedOpen) {
        sendTelegramNotification('📱 ¡Chiquita acaba de escanear el QR o abrir el enlace de su Universo! 🌻✨');
        notifiedOpen = true;
    }

    // ==========================================
    // CINE AUTOMÁTICO: REEL DE FOTOS -> CARTA -> UNIVERSO LIBRE
    // ==========================================
    let isCinemaTourActive = false;
    let cinemaPhotoTimer = null;
    let cinemaProgressInterval = null;
    let cinemaLetterAutoScrollTimer = null;
    const PHOTO_DURATION_MS = 7200; // 7.2 segundos por foto (pausado, cómodo y cinematográfico)

    const barFills = [
        document.getElementById('bar-fill-0'),
        document.getElementById('bar-fill-1'),
        document.getElementById('bar-fill-2'),
        document.getElementById('bar-fill-3')
    ];

    function stopCinemaPhotoTimer() {
        if (cinemaPhotoTimer) {
            clearTimeout(cinemaPhotoTimer);
            cinemaPhotoTimer = null;
        }
        if (cinemaProgressInterval) {
            clearInterval(cinemaProgressInterval);
            cinemaProgressInterval = null;
        }
    }

    function setReelProgressForIndex(idx, animateCurrent = false) {
        if (cinemaProgressInterval) {
            clearInterval(cinemaProgressInterval);
            cinemaProgressInterval = null;
        }

        barFills.forEach((fill, k) => {
            if (!fill) return;
            if (k < idx) {
                fill.style.width = '100%';
            } else if (k > idx) {
                fill.style.width = '0%';
            } else {
                fill.style.width = '0%';
                if (animateCurrent) {
                    const start = performance.now();
                    const duration = (idx === REEL_PHOTOS.length - 1) ? 8500 : PHOTO_DURATION_MS;
                    cinemaProgressInterval = setInterval(() => {
                        const elapsed = performance.now() - start;
                        const p = Math.min(elapsed / duration, 1);
                        fill.style.width = (p * 100) + '%';
                        if (p >= 1) {
                            clearInterval(cinemaProgressInterval);
                            cinemaProgressInterval = null;
                        }
                    }, 30);
                } else {
                    fill.style.width = '100%';
                }
            }
        });
    }

    function updateReelPhoto(index, animateProgressBar = false) {
        currentReelIndex = (index + REEL_PHOTOS.length) % REEL_PHOTOS.length;
        const photo = REEL_PHOTOS[currentReelIndex];

        reelImg.style.opacity = '0';
        reelImg.style.transform = 'scale(0.96)';

        setTimeout(() => {
            reelImg.src = photo.src;
            reelCaption.textContent = photo.caption;
            reelDate.textContent = photo.subtext;
            reelCounter.textContent = `${currentReelIndex + 1} / ${REEL_PHOTOS.length}`;

            Array.from(reelDotsContainer.children).forEach((dot, idx) => {
                dot.classList.toggle('active', idx === currentReelIndex);
            });

            setReelProgressForIndex(currentReelIndex, animateProgressBar);

            reelImg.style.opacity = '1';
            reelImg.style.transform = 'scale(1)';
        }, 180);
    }

    function openReel(index = 0, isCine = false) {
        closeLetter();
        closeWish();
        updateReelPhoto(index, isCine);
        reelModal.classList.add('active');
        if (!isPlaying) toggleMusic();
    }

    function closeReel() { 
        stopCinemaPhotoTimer();
        reelModal.classList.remove('active'); 
    }

    function startCinemaPhotoReel() {
        isCinemaTourActive = true;
        openReel(0, true);
        scheduleNextCinemaPhoto(0);
    }

    function scheduleNextCinemaPhoto(idx) {
        if (!isCinemaTourActive) return;

        stopCinemaPhotoTimer();
        updateReelPhoto(idx, true);

        const duration = (idx === REEL_PHOTOS.length - 1) ? 8500 : PHOTO_DURATION_MS;
        cinemaPhotoTimer = setTimeout(() => {
            if (!isCinemaTourActive) return;

            if (idx + 1 < REEL_PHOTOS.length) {
                scheduleNextCinemaPhoto(idx + 1);
            } else {
                // Al culminar la 4ta foto, pausa suave de 1.2 segundos y avance automático a la carta
                setTimeout(() => {
                    if (isCinemaTourActive) startCinemaLetter();
                }, 1200);
            }
        }, duration);
    }

    function openLetter() {
        closeReel();
        closeWish();
        letterModal.classList.add('active');
        if (!isPlaying) toggleMusic();
    }

    function closeLetter() { 
        if (cinemaLetterAutoScrollTimer) {
            clearInterval(cinemaLetterAutoScrollTimer);
            cinemaLetterAutoScrollTimer = null;
        }
        letterModal.classList.remove('active'); 
    }

    function startCinemaLetter() {
        stopCinemaPhotoTimer();
        closeReel();
        openLetter();

        // Notificar que está leyendo la carta
        if (!notifiedLetter) {
            sendTelegramNotification('💌 ¡Chiquita acaba de pasar a leer su carta especial! ✨');
            notifiedLetter = true;
        }

        if (letterCard) {
            letterCard.scrollTop = 0;

            if (cinemaLetterAutoScrollTimer) {
                clearInterval(cinemaLetterAutoScrollTimer);
                cinemaLetterAutoScrollTimer = null;
            }

            let userInterrupted = false;
            const stopAutoScroll = () => {
                userInterrupted = true;
                if (cinemaLetterAutoScrollTimer) {
                    clearInterval(cinemaLetterAutoScrollTimer);
                    cinemaLetterAutoScrollTimer = null;
                }
            };

            letterCard.addEventListener('wheel', stopAutoScroll, { passive: true, once: true });
            letterCard.addEventListener('touchstart', stopAutoScroll, { passive: true, once: true });
            letterCard.addEventListener('mousedown', stopAutoScroll, { passive: true, once: true });

            // Iniciar auto-scroll pausado y cinematográfico tras 4.5 segundos de lectura
            setTimeout(() => {
                if (!letterModal.classList.contains('active') || userInterrupted) return;

                cinemaLetterAutoScrollTimer = setInterval(() => {
                    if (!letterModal.classList.contains('active') || userInterrupted) {
                        clearInterval(cinemaLetterAutoScrollTimer);
                        cinemaLetterAutoScrollTimer = null;
                        return;
                    }

                    if (letterCard.scrollTop + letterCard.clientHeight >= letterCard.scrollHeight - 25) {
                        clearInterval(cinemaLetterAutoScrollTimer);
                        cinemaLetterAutoScrollTimer = null;
                    } else {
                        letterCard.scrollTop += 1;
                    }
                }, 48); // Desplazamiento muy suave de ~20px por segundo
            }, 4500);
        }
    }

    function finishCinematicTourAndUnlockUniverse() {
        stopCinemaPhotoTimer();
        if (cinemaLetterAutoScrollTimer) {
            clearInterval(cinemaLetterAutoScrollTimer);
            cinemaLetterAutoScrollTimer = null;
        }
        isCinemaTourActive = false;

        letterModal.classList.remove('active');
        reelModal.classList.remove('active');

        // Notificar que culminó el recorrido y está en el universo
        if (!notifiedUniverse) {
            sendTelegramNotification('🌌 ¡Chiquita terminó de leer la carta y ahora está explorando el Universo 3D libremente! 🌟🌻');
            notifiedUniverse = true;
        }

        // ¡Desbloqueo definitivo del universo!
        controls.enabled = true;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.55;

        // Revelar la interfaz interactiva completa
        mainHeader.classList.add('revealed');
        mainActions.classList.add('revealed');
        mainHint.classList.add('revealed');

        // Chispas de bienvenida
        spawnTouchEffects(window.innerWidth / 2, window.innerHeight / 2);
        setTimeout(() => {
            spawnTouchEffects(window.innerWidth / 2 - 100, window.innerHeight / 2 - 40);
            spawnTouchEffects(window.innerWidth / 2 + 100, window.innerHeight / 2 - 40);
        }, 350);

        // Mensaje cósmico de bienvenida al universo
        setTimeout(() => {
            showFlowerCompliment(6);
        }, 600);
    }

    letterBtn.addEventListener('click', (e) => { e.stopPropagation(); openLetter(); });
    closeLetterBtn.addEventListener('click', (e) => { e.stopPropagation(); finishCinematicTourAndUnlockUniverse(); });
    returnBtn.addEventListener('click', (e) => { e.stopPropagation(); finishCinematicTourAndUnlockUniverse(); });
    letterModal.addEventListener('click', (e) => { if (e.target === letterModal) finishCinematicTourAndUnlockUniverse(); });

    reelBtn.addEventListener('click', (e) => { e.stopPropagation(); openReel(0); });
    closeReelBtn.addEventListener('click', (e) => { 
        e.stopPropagation(); 
        if (isCinemaTourActive) finishCinematicTourAndUnlockUniverse(); 
        else closeReel(); 
    });

    prevPhotoBtn.addEventListener('click', (e) => { 
        e.stopPropagation(); 
        stopCinemaPhotoTimer(); 
        updateReelPhoto(currentReelIndex - 1); 
    });

    nextPhotoBtn.addEventListener('click', (e) => { 
        e.stopPropagation(); 
        stopCinemaPhotoTimer(); 
        updateReelPhoto(currentReelIndex + 1); 
    });

    if (reelToLetterBtn) {
        reelToLetterBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            startCinemaLetter();
        });
    }

    Array.from(reelDotsContainer.children).forEach((dot, idx) => {
        dot.addEventListener('click', (e) => {
            e.stopPropagation();
            stopCinemaPhotoTimer();
            updateReelPhoto(idx);
        });
    });

    reelModal.addEventListener('click', (e) => { 
        if (e.target === reelModal) {
            if (isCinemaTourActive) finishCinematicTourAndUnlockUniverse();
            else closeReel();
        }
    });

    // Modales: Deseo de Estrella Fugaz
    const wishModal = document.getElementById('wish-modal');
    const wishText = document.getElementById('wish-text');
    const closeWishBtn = document.getElementById('close-wish-btn');

    function openWish() {
        closeLetter();
        closeReel();
        const randomWish = WISHES[Math.floor(Math.random() * WISHES.length)];
        wishText.textContent = `"${randomWish}"`;
        wishModal.classList.add('active');
    }

    function closeWish() { wishModal.classList.remove('active'); }

    closeWishBtn.addEventListener('click', (e) => { e.stopPropagation(); closeWish(); });
    wishModal.addEventListener('click', (e) => { if (e.target === wishModal) closeWish(); });

    // Toast de Cumplido de Flor
    const flowerToast = document.getElementById('flower-toast');
    const flowerToastText = document.getElementById('flower-toast-text');
    let flowerToastTimeout;

    function showFlowerCompliment(index) {
        const compliment = FLOWER_COMPLIMENTS[index % FLOWER_COMPLIMENTS.length];
        flowerToastText.textContent = compliment;
        flowerToast.classList.add('active');

        clearTimeout(flowerToastTimeout);
        flowerToastTimeout = setTimeout(() => {
            flowerToast.classList.remove('active');
        }, 4200);
    }

    // ==========================================
    // 11. CINEMÁTICA: TÚNEL -> EXPLOSIÓN -> ZOOM
    // ==========================================
    const introScreen = document.getElementById('intro-screen');
    const enterUniverseBtn = document.getElementById('enter-universe-btn');
    const warpFlash = document.getElementById('warp-flash');
    const mainHeader = document.getElementById('main-header');
    const mainActions = document.getElementById('main-actions');
    const mainHint = document.getElementById('main-hint');

    const STATE_INTRO = 0;
    const STATE_TUNNEL = 1;
    const STATE_EXPLOSION = 2;
    const STATE_ZOOM_IN = 3;
    const STATE_NORMAL = 4;

    let currentState = STATE_INTRO;
    let stateStartTime = 0;

    const DURATION_TUNNEL = 3600;
    const DURATION_EXPLOSION = 1600;
    const DURATION_ZOOM_IN = 8000;

    function easeInQuad(x) { return x * x; }
    function easeOutCubic(x) { return 1 - Math.pow(1 - x, 3); }

    enterUniverseBtn.addEventListener('click', () => {
        if (!notifiedEnter) {
            sendTelegramNotification('🚀 ¡Chiquita acaba de presionar "Entrar a tu Universo"! Está viviendo el recorrido y escuchando la música ahora mismo 💛');
            notifiedEnter = true;
        }
        startMusicImmediately();
        introScreen.classList.add('dissolve');
        controls.enabled = false;
        mainHeader.classList.remove('revealed');
        mainActions.classList.remove('revealed');
        mainHint.classList.remove('revealed');
        currentState = STATE_TUNNEL;
        stateStartTime = performance.now();
    });

    // ==========================================
    // 12. TOQUE MÁGICO (PÉTALOS Y CHISPAS)
    // ==========================================
    const touchContainer = document.getElementById('touch-effects-container');

    function spawnTouchEffects(clientX, clientY) {
        for (let i = 0; i < 6; i++) {
            const spark = document.createElement('div');
            spark.classList.add('touch-sparkle');
            const size = Math.random() * 8 + 4;
            spark.style.width = size + 'px';
            spark.style.height = size + 'px';
            spark.style.left = clientX + 'px';
            spark.style.top = clientY + 'px';

            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * 80 + 30;
            spark.style.setProperty('--tx', Math.cos(angle) * dist + 'px');
            spark.style.setProperty('--ty', Math.sin(angle) * dist + 'px');

            touchContainer.appendChild(spark);
            setTimeout(() => { if (spark.parentNode) spark.remove(); }, 950);
        }

        for (let i = 0; i < 3; i++) {
            const petal = document.createElement('div');
            petal.classList.add('touch-petal');
            petal.style.left = clientX + 'px';
            petal.style.top = clientY + 'px';

            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * 110 + 40;
            const rot = (Math.random() - 0.5) * 360 + 'deg';
            petal.style.setProperty('--tx', Math.cos(angle) * dist + 'px');
            petal.style.setProperty('--ty', Math.sin(angle) * dist + 'px');
            petal.style.setProperty('--rot', rot);

            touchContainer.appendChild(petal);
            setTimeout(() => { if (petal.parentNode) petal.remove(); }, 1250);
        }
    }

    function handleScreenInteraction(e) {
        if (currentState !== STATE_NORMAL) return;
        if (letterModal.classList.contains('active') || reelModal.classList.contains('active') || wishModal.classList.contains('active')) return;
        if (e.target.closest('#music-toggle') || e.target.closest('.action-buttons-container')) return;

        const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : window.innerWidth / 2);
        const clientY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : window.innerHeight / 2);

        spawnTouchEffects(clientX, clientY);

        mouse.x = (clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);

        const intersects = raycaster.intersectObjects(clickableObjects);
        if (intersects.length > 0) {
            const hit = intersects[0].object;
            if (hit.userData && hit.userData.isPolaroid) {
                openReel(hit.userData.photoIndex);
            } else if (hit.userData && hit.userData.isHeart) {
                openLetter();
            } else if (hit.userData && hit.userData.isShootingStar) {
                // Atrapar estrella fugaz
                shootingStarActive = false;
                shootingStarSprite.visible = false;
                openWish();
            } else if (hit.userData && hit.userData.isFlower) {
                // Flor tocada: animación de giro y cumplido
                hit.material.rotation += 0.5;
                showFlowerCompliment(hit.userData.flowerIndex);
            }
        }

        if (!isPlaying) toggleMusic();
    }

    window.addEventListener('click', handleScreenInteraction);
    window.addEventListener('touchstart', (e) => {
        if (currentState === STATE_NORMAL && !letterModal.classList.contains('active') && !reelModal.classList.contains('active') && !wishModal.classList.contains('active')) {
            handleScreenInteraction(e);
        }
    }, { passive: true });

    // ==========================================
    // 13. BUCLE DE ANIMACIÓN
    // ==========================================
    let clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);

        const now = performance.now();
        const elapsedTime = clock.getElapsedTime();

        // Cinemática de entrada
        if (currentState === STATE_TUNNEL) {
            const elapsed = now - stateStartTime;
            const p = Math.min(elapsed / DURATION_TUNNEL, 1);
            const eased = easeInQuad(p);

            camera.position.lerpVectors(TUNNEL_START_CAM, TUNNEL_END_CAM, eased);
            camera.lookAt(0, 0, -1000);

            tunnelElements.forEach(item => {
                item.sprite.material.rotation += item.rotSpeed * (1 + eased * 4);
            });

            if (p >= 1) {
                currentState = STATE_EXPLOSION;
                stateStartTime = now;

                warpFlash.classList.add('active');
                explosionMat.opacity = 1;
                shockwaveMat.opacity = 1;

                tunnelGroup.visible = false;
                galaxyMainGroup.visible = false;

                camera.position.copy(GALAXY_FAR_CAM);
                camera.lookAt(0, 40, 0);
            }

        } else if (currentState === STATE_EXPLOSION) {
            const elapsed = now - stateStartTime;
            const p = Math.min(elapsed / DURATION_EXPLOSION, 1);

            const shake = (1 - p) * 18;
            camera.position.x = GALAXY_FAR_CAM.x + (Math.random() - 0.5) * shake;
            camera.position.y = GALAXY_FAR_CAM.y + (Math.random() - 0.5) * shake;
            camera.position.z = GALAXY_FAR_CAM.z + (Math.random() - 0.5) * (shake * 0.5);

            shockwaveMesh.scale.setScalar(1 + p * 85);
            shockwaveMat.opacity = Math.max(0, (1 - p) * 1.6);

            const pos = explosionGeo.attributes.position;
            for (let i = 0; i < explosionParticlesCount; i++) {
                const i3 = i * 3;
                const v = explosionVelocities[i];
                pos.array[i3] += v.vx;
                pos.array[i3 + 1] += v.vy;
                pos.array[i3 + 2] += v.vz;
            }
            pos.needsUpdate = true;
            explosionMat.opacity = Math.max(0, 1 - p * 0.95);

            explosionPetals.forEach(item => {
                item.sprite.position.x += item.vx;
                item.sprite.position.y += item.vy;
                item.sprite.position.z += item.vz;
                item.sprite.material.rotation += item.rotSpeed;
                item.sprite.material.opacity = Math.max(0, 1 - p * 0.85);
            });

            if (p >= 0.35) warpFlash.classList.remove('active');

            if (p >= 1) {
                currentState = STATE_ZOOM_IN;
                stateStartTime = now;
                explosionPoints.visible = false;
                shockwaveMesh.visible = false;
                explosionPetalsGroup.visible = false;

                // El universo florece poco a poco desde el núcleo estelar
                galaxyMainGroup.visible = true;
                galaxyMainGroup.scale.setScalar(0.04);
                galaxyMat.opacity = 0.05;
                heartMat.opacity = 0.05;

                camera.position.copy(GALAXY_FAR_CAM);
                camera.lookAt(0, 0, 0);
            }

        } else if (currentState === STATE_ZOOM_IN) {
            const elapsed = now - stateStartTime;
            const p = Math.min(elapsed / DURATION_ZOOM_IN, 1);
            const eased = easeOutCubic(p);

            // Escala progresiva: surge suavemente y se expande
            const scaleProgress = 0.04 + (1.0 - 0.04) * eased;
            galaxyMainGroup.scale.setScalar(scaleProgress);

            // Opacidad de partículas aumentando con delicadeza
            galaxyMat.opacity = Math.min(1.0, 0.1 + eased * 0.9);
            heartMat.opacity = Math.min(1.0, 0.1 + eased * 0.9);

            camera.position.lerpVectors(GALAXY_FAR_CAM, GALAXY_FINAL_CAM, eased);
            camera.lookAt(0, 40 * eased, 0);

            if (p >= 1) {
                currentState = STATE_NORMAL;
                controls.enabled = false; // Mantener bloqueado durante el recorrido tipo cine
                controls.target.set(0, 40, 0);

                // Tras contemplar el surgimiento del universo por 3.5 segundos con calma, arranca el Cine de fotos
                setTimeout(() => {
                    startCinemaPhotoReel();
                }, 3500);
            }
        } else if (currentState === STATE_NORMAL) {
            controls.update();

            // Animación de la estrella fugaz si está activa
            if (shootingStarActive) {
                const sElapsed = (now - shootingStarStart) / 2200; // 2.2 segundos para cruzar
                if (sElapsed < 1) {
                    shootingStarSprite.position.x -= 2.6;
                    shootingStarSprite.position.y -= 1.2;
                    shootingStarSprite.position.z += 1.0;
                    shootingStarMat.opacity = 1 - Math.pow(sElapsed, 3);
                } else {
                    shootingStarActive = false;
                    shootingStarSprite.visible = false;
                }
            }
        }

        // Galaxia en órbita
        if (galaxyMainGroup.visible) {
            photonRing.rotation.z += 0.03;

            const posAttr = galaxyGeo.attributes.position;
            for (let i = 0; i < galaxyParticlesCount; i++) {
                const meta = particleMeta[i];
                meta.angle += meta.speed;

                const i3 = i * 3;
                posAttr.array[i3] = Math.cos(meta.angle) * meta.radius;
                posAttr.array[i3 + 1] = meta.randomY + Math.sin(elapsedTime * 2 + meta.radius * 0.05) * 1.5;
                posAttr.array[i3 + 2] = Math.sin(meta.angle) * meta.radius;
            }
            posAttr.needsUpdate = true;

            const heartPosAttr = heartGeo.attributes.position;
            const pulse = 1 + Math.sin(elapsedTime * 3.2) * 0.045;
            for (let i = 0; i < heartParticlesCount; i++) {
                const base = heartBaseCoords[i];
                const i3 = i * 3;
                heartPosAttr.array[i3] = base.x * pulse;
                heartPosAttr.array[i3 + 1] = 85 + (base.y - 85) * pulse;
                heartPosAttr.array[i3 + 2] = base.z * pulse + Math.sin(elapsedTime * 4 + i) * 0.6;
            }
            heartPosAttr.needsUpdate = true;

            orbitElements.forEach(item => {
                item.angle += item.speed;
                item.mesh.position.x = Math.cos(item.angle) * item.radius;
                item.mesh.position.z = Math.sin(item.angle) * item.radius;
                item.mesh.position.y = item.baseHeight + Math.sin(elapsedTime * 2.4 + item.floatOffset) * 3.2;
            });
        }

        renderer.render(scene, camera);
    }

    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });
});
