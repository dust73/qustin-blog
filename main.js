import * as THREE from 'https://esm.sh/three@0.160.0';
import { OrbitControls } from 'https://esm.sh/three@0.160.0/examples/jsm/controls/OrbitControls';

// ---- THEME TOGGLE (green-focused variants) ----
const themeBtn = document.getElementById('themeBtn');
if (themeBtn) {
    const themes = [
        { cls: '', label: 'mint' },
        { cls: 'theme-seafoam', label: 'seafoam' },
        { cls: 'theme-olive', label: 'olive' },
    ];
    let themeIndex = 0;
    themeBtn.addEventListener('click', () => {
        document.body.classList.remove(themes[themeIndex].cls);
        themeIndex = (themeIndex + 1) % themes.length;
        document.body.classList.add(themes[themeIndex].cls);
        themeBtn.textContent = 'theme: ' + themes[themeIndex].label;
    });
}

// ---- THREE JS SETUP ----
const canvas = document.getElementById('bg3d');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0, 8);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearAlpha(0);

// Lights
scene.add(new THREE.AmbientLight(0xffffff, 1.0));
const dir = new THREE.DirectionalLight(0xffffff, 1.2);
dir.position.set(4, 6, 4);
scene.add(dir);

// Lazy Days palette colors
const pastel = {
    a: new THREE.Color('#97B3AE'), // muted teal
    b: new THREE.Color('#D2E0D3'), // sage green
    c: new THREE.Color('#F0DDD6'), // pale peach
    d: new THREE.Color('#F2C3B9'), // salmon pink
    e: new THREE.Color('#D6CBBF')  // taupe
};

function makeDonut(color) {
    const geo = new THREE.TorusGeometry(1, 0.35, 24, 128);
    const mat = new THREE.MeshStandardMaterial({ color, metalness: 0.35, roughness: 0.2 });
    const mesh = new THREE.Mesh(geo, mat);
    return mesh;
}
function makeCube(color) {
    const geo = new THREE.BoxGeometry(1.3, 1.3, 1.3);
    const mat = new THREE.MeshStandardMaterial({ color, metalness: 0.3, roughness: 0.25 });
    const mesh = new THREE.Mesh(geo, mat);
    return mesh;
}
function makeGumdrop(color) {
    const geo = new THREE.IcosahedronGeometry(1, 0);
    const mat = new THREE.MeshStandardMaterial({ color, metalness: 0.25, roughness: 0.3 });
    return new THREE.Mesh(geo, mat);
}

// Scatter objects evenly on left and right sides
// Left side objects
const left1 = makeDonut(pastel.a); left1.position.set(-5.5, 2.5, 0); left1.scale.setScalar(0.3);
const left2 = makeCube(pastel.b); left2.position.set(-4.5, 0.5, 0); left2.scale.setScalar(0.3);
const left3 = makeGumdrop(pastel.c); left3.position.set(-5.0, -1.5, 0); left3.scale.setScalar(0.3);
const left4 = makeDonut(pastel.d); left4.position.set(-4.0, -3.0, 0); left4.scale.setScalar(0.3);

// Right side objects
const right1 = makeCube(pastel.a); right1.position.set(4.5, 2.0, 0); right1.scale.setScalar(0.3);
const right2 = makeGumdrop(pastel.b); right2.position.set(5.5, 0.0, 0); right2.scale.setScalar(0.3);
const right3 = makeDonut(pastel.c); right3.position.set(4.0, -2.0, 0); right3.scale.setScalar(0.3);
const right4 = makeCube(pastel.d); right4.position.set(5.0, -3.5, 0); right4.scale.setScalar(0.3);

scene.add(left1, left2, left3, left4, right1, right2, right3, right4);

// Space particles - floating gently
const particleLayers = [];
const layerCount = 2;
const particlesPerLayer = 400;

for (let layer = 0; layer < layerCount; layer++) {
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particlesPerLayer * 3);
    const particleVel = new Float32Array(particlesPerLayer * 3); // velocities
    const particleColors = new Float32Array(particlesPerLayer * 3);
    const particleOffsets = new Float32Array(particlesPerLayer * 3); // for floating motion

    // Palette colors array
    const paletteColors = [
        pastel.a, pastel.b, pastel.c, pastel.d, pastel.e
    ];

    for (let i = 0; i < particlesPerLayer; i++) {
        // Random positions in a sphere around the camera
        const r = 20 + Math.random() * 30;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);

        particlePos[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
        particlePos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        particlePos[i * 3 + 2] = r * Math.cos(phi) - 5;

        // Floating velocities - more noticeable movement
        const speed = 1.5 + (layer * 0.5);
        particleVel[i * 3 + 0] = (Math.random() - 0.5) * speed;
        particleVel[i * 3 + 1] = (Math.random() - 0.5) * speed;
        particleVel[i * 3 + 2] = (Math.random() - 0.5) * speed;

        // Random offsets for floating motion
        particleOffsets[i * 3 + 0] = Math.random() * Math.PI * 2;
        particleOffsets[i * 3 + 1] = Math.random() * Math.PI * 2;
        particleOffsets[i * 3 + 2] = Math.random() * Math.PI * 2;

        // Random palette color - make brighter
        const color = paletteColors[Math.floor(Math.random() * paletteColors.length)];
        // Brighten colors by mixing with white
        particleColors[i * 3 + 0] = color.r * 0.7 + 0.3;
        particleColors[i * 3 + 1] = color.g * 0.7 + 0.3;
        particleColors[i * 3 + 2] = color.b * 0.7 + 0.3;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMat = new THREE.PointsMaterial({
        size: 0.25 + layer * 0.15,
        color: 0xffffff,
        vertexColors: true,
        transparent: true,
        opacity: 1.0,
        sizeAttenuation: true
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    particles.userData.velocities = particleVel;
    particles.userData.positions = particlePos;
    particles.userData.offsets = particleOffsets;
    scene.add(particles);
    particleLayers.push(particles);
}

// Controls (no zoom/pan, gentle autorotate, no mouse interaction)
const controls = new OrbitControls(camera, renderer.domElement);
controls.enablePan = false;
controls.enableZoom = false;
controls.enableRotate = false;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.3;
controls.enabled = false;

// Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation
const clock = new THREE.Clock();
function tick() {
    const t = clock.getElapsedTime();
    const delta = clock.getDelta();

    // Animate left side objects
    left1.rotation.x = t * 0.6; left1.rotation.y = t * 0.9;
    left2.rotation.x = t * 0.4; left2.rotation.y = t * 0.5;
    left3.rotation.x = t * 0.8; left3.rotation.y = t * 1.1;
    left4.rotation.x = t * 0.7; left4.rotation.y = t * 0.8;
    // Animate right side objects
    right1.rotation.x = t * 0.5; right1.rotation.y = t * 0.7;
    right2.rotation.x = t * 0.9; right2.rotation.y = t * 1.0;
    right3.rotation.x = t * 0.6; right3.rotation.y = t * 0.85;
    right4.rotation.x = t * 0.45; right4.rotation.y = t * 0.65;

    // Animate particles - floating motion
    particleLayers.forEach((particles, layerIdx) => {
        const posAttr = particles.geometry.attributes.position;
        const positions = posAttr.array;
        const velocities = particles.userData.velocities;
        const offsets = particles.userData.offsets;
        const count = posAttr.count;
        const floatSpeed = 1.0 + layerIdx * 0.5;
        const floatAmount = 4;

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;

            // Direct velocity movement - much more noticeable
            positions[i3 + 0] += velocities[i3 + 0] * delta * 10;
            positions[i3 + 1] += velocities[i3 + 1] * delta * 10;
            positions[i3 + 2] += velocities[i3 + 2] * delta * 10;

            // Floating motion using sine waves - more pronounced
            positions[i3 + 0] += Math.sin(t * floatSpeed + offsets[i3 + 0]) * floatAmount * delta;
            positions[i3 + 1] += Math.sin(t * floatSpeed * 1.2 + offsets[i3 + 1]) * floatAmount * delta;
            positions[i3 + 2] += Math.sin(t * floatSpeed * 0.8 + offsets[i3 + 2]) * floatAmount * delta;

            // Wrap around boundaries
            if (Math.abs(positions[i3 + 0]) > 60) positions[i3 + 0] *= -0.9;
            if (Math.abs(positions[i3 + 1]) > 60) positions[i3 + 1] *= -0.9;
            if (Math.abs(positions[i3 + 2]) > 60) positions[i3 + 2] *= -0.9;
        }

        // Force update the buffer
        posAttr.needsUpdate = true;
        particles.geometry.computeBoundingSphere();
    });

    renderer.render(scene, camera);
    requestAnimationFrame(tick);
}
tick();

// Mouse parallax disabled - no interaction with 3D scene

// ---- POSTS LIST ----
function formatDate(iso) {
    try {
        const d = new Date(iso + 'T00:00:00');
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    } catch {
        return iso;
    }
}

async function loadPosts() {
    const container = document.getElementById('postList');
    if (!container) return;
    try {
        const res = await fetch('./posts/index.json', { cache: 'no-store' });
        const posts = await res.json();
        window.__postsIndex = posts;
        container.innerHTML = posts.map(p => {
            return `
<a class="card post-item" href="#read=${encodeURIComponent(p.url)}" data-url="${p.url}">
  <div class="post-meta">
    <span class="tag">${p.tag}</span>
    &nbsp;·&nbsp;
    <time datetime="${p.date}">${formatDate(p.date)}</time>
  </div>
  <div class="card-title">${p.title}</div>
  <div>${p.excerpt}</div>
</a>`;
        }).join('');
    } catch (e) {
        container.innerHTML = '<div class="card">Could not load posts.</div>';
    }
}
loadPosts();

// Experience list
async function loadExperience() {
    const container = document.getElementById('experienceList');
    if (!container) return;
    try {
        const res = await fetch('./experience/index.json', { cache: 'no-store' });
        const items = await res.json();
        window.__experienceIndex = items;
        container.innerHTML = items.map(p => {
            const range = `${p.start} – ${p.end || 'present'}`;
            return `
<a class="card post-item" href="#exp=${encodeURIComponent(p.url)}" data-url="${p.url}">
  <div class="post-meta">
    <span class="tag">${p.role} @ ${p.company}</span>
    &nbsp;·&nbsp;
    <time>${range}</time>
  </div>
  <div class="card-title">${p.company}</div>
  <div>${p.excerpt}</div>
</a>`;
        }).join('');
    } catch (e) {
        container.innerHTML = '<div class="card">Could not load experience.</div>';
    }
}
loadExperience();

// ---- Minimal markdown renderer + hash routing ----
function escapeHtml(s) {
    return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function markdownToHtml(md) {
    const lines = md.replace(/\r\n/g, '\n').split('\n');
    const out = [];
    let inCode = false;
    let codeBuffer = [];
    let listBuffer = [];
    function flushList() {
        if (listBuffer.length) {
            out.push('<ul>');
            listBuffer.forEach(li => out.push('<li>' + li + '</li>'));
            out.push('</ul>');
            listBuffer = [];
        }
    }
    for (let raw of lines) {
        if (raw.startsWith('```')) {
            if (!inCode) {
                inCode = true; codeBuffer = []; continue;
            } else {
                inCode = false;
                out.push('<pre><code>' + escapeHtml(codeBuffer.join('\n')) + '</code></pre>');
                codeBuffer = [];
                continue;
            }
        }
        if (inCode) { codeBuffer.push(raw); continue; }

        const line = raw.trimRight();
        if (line.startsWith('# ')) { flushList(); out.push('<h1>' + escapeHtml(line.slice(2)) + '</h1>'); continue; }
        if (line.startsWith('## ')) { flushList(); out.push('<h2>' + escapeHtml(line.slice(3)) + '</h2>'); continue; }
        if (line.startsWith('### ')) { flushList(); out.push('<h3>' + escapeHtml(line.slice(4)) + '</h3>'); continue; }
        if (line.startsWith('- ')) { listBuffer.push(escapeHtml(line.slice(2))); continue; }
        if (line.trim() === '') { flushList(); out.push(''); continue; }
        flushList();
        // inline code
        const withInline = escapeHtml(line).replace(/`([^`]+)`/g, '<code>$1</code>');
        out.push('<p>' + withInline + '</p>');
    }
    flushList();
    return out.join('\n').replace(/\n{3,}/g, '\n\n');
}

function setVisibility({ showPostsList = false, showPost = false, showExpList = false, showExp = false }) {
    const posts = document.getElementById('posts');
    const postView = document.getElementById('postView');
    const exp = document.getElementById('experience');
    const expView = document.getElementById('experienceView');
    posts.hidden = !showPostsList;
    postView.hidden = !showPost;
    exp.hidden = !showExpList;
    expView.hidden = !showExp;
}

async function showPost(url) {
    try {
        const res = await fetch(url, { cache: 'no-store' });
        const md = await res.text();
        const html = markdownToHtml(md);
        const el = document.getElementById('postContent');
        el.innerHTML = html;
        setVisibility({ showPost: true });
    } catch {
        const el = document.getElementById('postContent');
        el.innerHTML = '<div class="card">Could not load post.</div>';
        setVisibility({ showPost: true });
    }
}

async function showExperience(url) {
    try {
        const res = await fetch(url, { cache: 'no-store' });
        const md = await res.text();
        const html = markdownToHtml(md);
        const el = document.getElementById('experienceContent');
        el.innerHTML = html;
        setVisibility({ showExp: true });
    } catch {
        const el = document.getElementById('experienceContent');
        el.innerHTML = '<div class="card">Could not load experience item.</div>';
        setVisibility({ showExp: true });
    }
}

function handleHashRoute() {
    const h = window.location.hash || '';
    const read = h.match(/^#read=(.+)$/);
    const exp = h.match(/^#exp=(.+)$/);
    if (read) {
        const url = decodeURIComponent(read[1]);
        showPost(url);
    } else if (exp) {
        const url = decodeURIComponent(exp[1]);
        showExperience(url);
    } else {
        // Main page: show both sections
        setVisibility({ showPostsList: true, showExpList: true });
    }
}
window.addEventListener('hashchange', handleHashRoute);
handleHashRoute();

// Back links
const backPosts = document.getElementById('backToPosts');
if (backPosts) {
    backPosts.addEventListener('click', () => {
        setTimeout(() => setVisibility({ showPostsList: true, showExpList: true }), 0);
    });
}
const backExp = document.getElementById('backToExperience');
if (backExp) {
    backExp.addEventListener('click', () => {
        setTimeout(() => setVisibility({ showPostsList: true, showExpList: true }), 0);
    });
}


