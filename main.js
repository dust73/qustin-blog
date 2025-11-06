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

// Pastel-leaning but higher-contrast greens
const pastel = {
    a: new THREE.Color('#86efac'), // light green
    b: new THREE.Color('#34d399'), // emerald
    c: new THREE.Color('#22c55e')  // green
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

const donut = makeDonut(pastel.a); donut.position.set(-3.0, 0.9, 0); donut.scale.setScalar(1.3);
const cube = makeCube(pastel.b); cube.position.set(0.0, -0.4, 0); cube.scale.setScalar(1.25);
const drop = makeGumdrop(pastel.c); drop.position.set(3.2, 1.2, 0); drop.scale.setScalar(1.35);
scene.add(donut, cube, drop);

// Stars-ish background (cheap points)
const starGeo = new THREE.BufferGeometry();
const starCount = 800;
const starPos = new Float32Array(starCount * 3);
for (let i = 0; i < starCount; i++) {
    const r = 60 * Math.cbrt(Math.random());
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    starPos[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
    starPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    starPos[i * 3 + 2] = r * Math.cos(phi);
}
starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ size: 0.12, color: 0xffffff, transparent: true, opacity: 1.0 }));
scene.add(stars);

// Controls (no zoom/pan, gentle autorotate)
const controls = new OrbitControls(camera, renderer.domElement);
controls.enablePan = false;
controls.enableZoom = false;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.3;

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
    donut.rotation.x = t * 0.6; donut.rotation.y = t * 0.9;
    cube.rotation.x = t * 0.4; cube.rotation.y = t * 0.5;
    drop.rotation.x = t * 0.8; drop.rotation.y = t * 1.1;
    stars.rotation.y = t * 0.02;

    renderer.render(scene, camera);
    requestAnimationFrame(tick);
}
tick();

// (Optional) mouse parallax
window.addEventListener('pointermove', (e) => {
    const nx = (e.clientX / window.innerWidth) * 2 - 1;
    const ny = (e.clientY / window.innerHeight) * 2 - 1;
    camera.position.x = nx * 0.6;
    camera.position.y = -ny * 0.4;
    camera.lookAt(0, 0, 0);
});

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

function showSection(list) {
    const posts = document.getElementById('posts');
    const postView = document.getElementById('postView');
    if (list) {
        posts.hidden = false;
        postView.hidden = true;
    } else {
        posts.hidden = true;
        postView.hidden = false;
    }
}

async function showPost(url) {
    try {
        const res = await fetch(url, { cache: 'no-store' });
        const md = await res.text();
        const html = markdownToHtml(md);
        const el = document.getElementById('postContent');
        el.innerHTML = html;
        showSection(false);
    } catch {
        const el = document.getElementById('postContent');
        el.innerHTML = '<div class="card">Could not load post.</div>';
        showSection(false);
    }
}

function handleHashRoute() {
    const h = window.location.hash || '';
    const match = h.match(/^#read=(.+)$/);
    if (match) {
        const url = decodeURIComponent(match[1]);
        showPost(url);
    } else {
        showSection(true);
    }
}
window.addEventListener('hashchange', handleHashRoute);
handleHashRoute();

// Back button: clear hash to show list
const back = document.getElementById('backToPosts');
if (back) {
    back.addEventListener('click', () => {
        // Let anchor jump to #posts and also clear reader state
        setTimeout(() => {
            if (window.location.hash.startsWith('#read=')) {
                history.replaceState(null, '', '#posts');
            }
            showSection(true);
        }, 0);
    });
}


