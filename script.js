// Splash screen
setTimeout(() => {
    document.getElementById("splash").classList.add("hide");
    setTimeout(() => { document.getElementById("splash").remove(); }, 800);
}, 3500);

// Custom cursor
const cursor = document.getElementById('cursor'),
    dot = document.getElementById('cursorDot'),
    trail = document.getElementById('cursorTrail');
let mx = 0,
    my = 0,
    tx = 0,
    ty = 0;
document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    dot.style.left = mx - 3 + 'px';
    dot.style.top = my - 3 + 'px';
});

function animateCursor() {
    tx += (mx - tx) * 0.15;
    ty += (my - ty) * 0.15;
    cursor.style.left = tx - 10 + 'px';
    cursor.style.top = ty - 10 + 'px';
    trail.style.left = tx - 20 + 'px';
    trail.style.top = ty - 20 + 'px';
    requestAnimationFrame(animateCursor);
}
animateCursor();

document.querySelectorAll('a,button,.sktab,.titem,.stat,.pcard2,.intcard,.plink').forEach(el => {
    el.addEventListener('mouseenter', () => {
        cursor.style.transform = 'scale(1.5)';
        cursor.style.background = 'rgba(230,194,0,0.1)';
    });
    el.addEventListener('mouseleave', () => {
        cursor.style.transform = 'scale(1)';
        cursor.style.background = 'transparent';
    });
});

// Mouse glow
const mouseGlow = document.getElementById('mouse-glow');
document.addEventListener('mousemove', (e) => {
    if (!mouseGlow) return;
    mouseGlow.style.background =
        `radial-gradient(180px circle at ${e.clientX}px ${e.clientY}px, rgba(245,197,24,0.14), transparent 70%), radial-gradient(600px circle at ${e.clientX}px ${e.clientY}px, rgba(245,197,24,0.07), transparent 65%)`;
});

// Audio
let audioCtx;
let isDark = true;

function initAudio() {
    try {
        if (!audioCtx) audioCtx = new(window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        return audioCtx;
    } catch (e) { return null; }
}

function playClick() {
    const ctx = initAudio();
    if (!ctx) return;
    try {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(450, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.12);
        const punch = ctx.createOscillator();
        punch.type = 'square';
        punch.frequency.setValueAtTime(120, now);
        punch.frequency.exponentialRampToValueAtTime(30, now + 0.1);
        const bufferSize = ctx.sampleRate * 0.1;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const gain = ctx.createGain();
        const noiseGain = ctx.createGain();
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.25, now + 0.005);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
        noiseGain.gain.setValueAtTime(0.12, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);
        osc.connect(gain);
        punch.connect(gain);
        noise.connect(noiseGain);
        gain.connect(ctx.destination);
        noiseGain.connect(ctx.destination);
        osc.start();
        punch.start();
        noise.start();
        osc.stop(now + 0.12);
        punch.stop(now + 0.12);
        noise.stop(now + 0.08);
    } catch (e) {}
}

window.addEventListener('mousedown', playClick);
window.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') playClick(); });

// RAIN CANVAS
const canvas = document.getElementById('rain-canvas');
const ctx2 = canvas.getContext('2d');
let w, h;
const drops = [];
const maxDrops = 300;

function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

class Drop {
    constructor() { this.reset(); }
    reset() {
        this.x = Math.random() * w;
        this.y = Math.random() * -h;
        this.len = Math.random() * 20 + 10;
        this.speed = Math.random() * 8 + 4;
        this.opacity = Math.random() * 0.3 + 0.1;
        this.width = Math.random() * 1 + 0.5;
    }
    update() { this.y += this.speed; if (this.y > h) this.reset(); }
    draw() {
        ctx2.beginPath();
        ctx2.strokeStyle = `rgba(200, 210, 255, ${this.opacity})`;
        ctx2.lineWidth = this.width;
        ctx2.moveTo(this.x, this.y);
        ctx2.lineTo(this.x, this.y + this.len);
        ctx2.stroke();
    }
}

for (let i = 0; i < maxDrops; i++) drops.push(new Drop());

function animateRain() {
    ctx2.clearRect(0, 0, w, h);
    drops.forEach(d => { d.update();
        d.draw(); });
    requestAnimationFrame(animateRain);
}
animateRain();

// 3D BATS
function initBats() {
    const container = document.getElementById('bat-scene-container');
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x080810, 15, 60);
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 15);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const pointLight1 = new THREE.PointLight(0xf5c518, 10, 100);
    pointLight1.position.set(0, -20, 10);
    scene.add(pointLight1);
    const pointLight2 = new THREE.PointLight(0x00f5ff, 8, 100);
    pointLight2.position.set(0, 30, -10);
    scene.add(pointLight2);

    const batMaterial = new THREE.MeshPhysicalMaterial({
        color: '#f5c518',
        emissive: '#00f5ff',
        emissiveIntensity: 0.9,
        metalness: 1.0,
        roughness: 0.1,
        transparent: true,
        opacity: 0.65,
        wireframe: true
    });

    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.quadraticCurveTo(1.5, 1.8, 3.2, 1.2);
    shape.quadraticCurveTo(5.2, 1.8, 6.5, 0);
    shape.quadraticCurveTo(5.0, -1.0, 5.5, -3.5);
    shape.quadraticCurveTo(3.5, -2.0, 3.0, -4.0);
    shape.quadraticCurveTo(1.5, -2.0, 0.5, -4.5);
    shape.lineTo(0, -2.0);
    shape.lineTo(0, 0);
    const extrudeSettings = { depth: 0.15, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.08,
        bevelThickness: 0.08 };
    const wingGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    const bodyGeo = new THREE.OctahedronGeometry(1.2, 1);
    bodyGeo.scale(0.8, 2.5, 0.6);

    const bats = [];
    const batCount = 30;
    for (let i = 0; i < batCount; i++) {
        const group = new THREE.Group();
        const body = new THREE.Mesh(bodyGeo, batMaterial);
        group.add(body);
        const leftWingGroup = new THREE.Group();
        leftWingGroup.position.set(-0.4, 1.0, 0);
        const leftWing = new THREE.Mesh(wingGeo, batMaterial);
        leftWingGroup.add(leftWing);
        group.add(leftWingGroup);
        const rightWingGroup = new THREE.Group();
        rightWingGroup.position.set(0.4, 1.0, 0);
        const rightWing = new THREE.Mesh(wingGeo, batMaterial);
        rightWing.scale.set(-1, 1, 1);
        rightWingGroup.add(rightWing);
        group.add(rightWingGroup);
        group.position.set((Math.random() - 0.5) * 80, (Math.random() - 0.5) * 60 - 20, (Math.random() - 0.5) *
            80 - 40);
        group.scale.set(0.18, 0.18, 0.18);
        group.userData = {
            speed: 0.4 + Math.random() * 2.5,
            flapSpeed: 5 + Math.random() * 5,
            offset: Math.random() * 100,
            type: Math.floor(Math.random() * 4),
            driftX: (Math.random() - 0.5) * 0.12,
            driftY: (Math.random() - 0.5) * 0.08,
            leftWing: leftWingGroup,
            rightWing: rightWingGroup
        };
        scene.add(group);
        bats.push(group);
    }

    function animateBats() {
        requestAnimationFrame(animateBats);
        const time = performance.now() / 1000;
        bats.forEach(group => {
            const {
                speed,
                flapSpeed,
                offset,
                type,
                driftX,
                driftY,
                leftWing,
                rightWing
            } = group.userData;
            const t = time + offset;
            const flap = Math.sin(t * flapSpeed);
            if (leftWing && rightWing) {
                leftWing.rotation.y = flap * 0.6 + 0.2;
                leftWing.rotation.z = flap * 0.4;
                rightWing.rotation.y = -flap * 0.6 - 0.2;
                rightWing.rotation.z = -flap * 0.4;
            }
            switch (type) {
                case 0:
                    group.position.z += speed * 0.03;
                    group.position.x += Math.sin(t) * 0.01;
                    group.position.y += Math.cos(t) * 0.08;
                    break;
                case 1:
                    group.position.x += speed * 0.15;
                    group.position.z += 0.04;
                    group.position.y += Math.sin(t) * 0.002;
                    break;
                case 2:
                    group.position.x += driftX * 2.2;
                    group.position.y += driftY * 2.2;
                    group.position.z += speed * 0.07;
                    break;
                case 3:
                    group.position.z += speed * 0.12;
                    group.position.x += driftX * 0.6;
                    group.position.y += driftY * 0.6;
                    const s = THREE.MathUtils.clamp((group.position.z + 80) / 100, 0.08, 0.55);
                    group.scale.set(s, s, s);
                    break;
            }
            group.rotation.z = Math.sin(t * speed) * 0.4;
            group.rotation.x = Math.PI / 2.2 + flap * 0.15;
            if (
                group.position.z > 30 ||
                group.position.x > 60 ||
                group.position.x < -60 ||
                group.position.y > 45 ||
                group.position.y < -45
            ) {
                group.position.set(
                    (Math.random() - 0.5) * 80,
                    (Math.random() - 0.5) * 60,
                    -80
                );
                group.scale.set(0.18, 0.18, 0.18);
                group.userData.offset = Math.random() * 100;
                group.userData.type = Math.floor(Math.random() * 4);
            }
        });
        renderer.render(scene, camera);
    }

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
    animateBats();
}

if (typeof THREE !== 'undefined') initBats();

// GSAP SCROLL
gsap.registerPlugin(ScrollTrigger);
gsap.utils.toArray('.reveal').forEach(el => {
    gsap.to(el, { scrollTrigger: { trigger: el, start: 'top 85%', once: true }, opacity: 1, y: 0,
        duration: 0.8, ease: 'power3.out' });
});

const heroTl = gsap.timeline({ delay: 0.3 });
heroTl.to('.hero-pretitle', { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' })
    .to('.hero-name', { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }, '-=0.3')
    .to('.hero-role', { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, '-=0.6')
    .to('.hero-desc', { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, '-=0.4')
    .to('.hero-btns', { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, '-=0.3')
    .to('.hero-socials', { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, '-=0.3')
    .to('.flavor-text', { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, '-=0.3');

// SKILLS TABS
document.querySelectorAll('.skill-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.skill-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.skill-panel').forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById('panel-' + tab.dataset.tab).classList.add('active');
    });
});

// THEME TOGGLE
const themeToggle = document.getElementById('theme-toggle');
const flavorText = document.getElementById('flavorText');
const batContainer = document.getElementById('bat-scene-container');

themeToggle.addEventListener('click', () => {
    isDark = !isDark;
    document.body.classList.toggle('light-mode');
    batContainer.style.opacity = isDark ? '1' : '0';
    if (isDark) {
        flavorText.innerHTML =
            `Don&apos;t mind the bats. They&apos;re just here to <span style="color: #00f5ff; text-shadow: 0 0 12px rgba(0,245,255,0.7); font-weight: 700;">hunt down the bugs.</span>`;
    } else {
        flavorText.innerHTML =
            `☀️ Enjoying the sunshine? The code runs smoother in <span style="color: #e89020; font-weight: 700;">golden hour.</span>`;
    }
});

// NAVIGATION ACTIVE LINK
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(sec => {
        const secTop = sec.offsetTop;
        if (scrollY >= secTop - 200) current = sec.getAttribute('id');
    });
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + current) link.classList.add('active');
    });
});

// SMOOTH SCROLL FOR NAV
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) { target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    });
});

// NAVBAR SCROLL EFFECT
let lastScroll = 0;
window.addEventListener('scroll', () => {
    const nav = document.querySelector('nav');
    const currentScroll = window.pageYOffset;
    nav.style.padding = currentScroll > 50 ? '6px 12px' : '8px 12px';
    nav.style.background = 'rgba(10,12,22,.90)';
    lastScroll = currentScroll;
});
const menuBtn = document.getElementById("menu-btn");
const mobileNav = document.getElementById("nav-links");

menuBtn.addEventListener("click", () => {
    mobileNav.classList.toggle("show");
});

document.querySelectorAll(".nav-links a").forEach(link => {
    link.addEventListener("click", () => {
        mobileNav.classList.remove("show");
    });
});