import * as THREE from 'three';
import { CONFIG } from '../config/gameConfig.js';

const L = CONFIG.segmentLength, N = CONFIG.segments, rnd = (a, b) => a + Math.random() * (b - a);
const tex = (w, h, draw, rx, ry) => {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'));
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.colorSpace = THREE.SRGBColorSpace; return t;
};

/** Recycles N pooled path segments (path, rails, banks, palms, houses, boats, bushes) as they pass the player. */
export class EnvironmentManager {
  constructor(scene, assets) {
    this.assets = assets; this.time = 0; this.root = new THREE.Group(); scene.add(this.root);
    // sky gradient + sun + clouds
    scene.background = tex(8, 256, (x) => {
      const g = x.createLinearGradient(0, 0, 0, 256); g.addColorStop(0, '#3a9ad9'); g.addColorStop(0.6, '#9bd3ee'); g.addColorStop(1, '#f6ecd0');
      x.fillStyle = g; x.fillRect(0, 0, 8, 256);
    }, 1, 1);
    scene.background.wrapS = scene.background.wrapT = THREE.ClampToEdgeWrapping;
    const sun = new THREE.Mesh(new THREE.SphereGeometry(9, 16, 12), new THREE.MeshBasicMaterial({ color: 0xfff3b0, fog: false }));
    sun.position.set(40, 55, -230); this.root.add(sun);
    this.clouds = [];
    const cloudMat = new THREE.MeshBasicMaterial({ color: 0xffffff, fog: false, transparent: true, opacity: 0.9 });
    for (let i = 0; i < 7; i++) {
      const c = new THREE.Group();
      for (let k = 0; k < 3; k++) { const s = new THREE.Mesh(new THREE.SphereGeometry(rnd(5, 8), 10, 8), cloudMat); s.position.set(k * 7 - 7, rnd(-1, 1), 0); s.scale.y = 0.5; c.add(s); }
      c.position.set(rnd(-120, 120), rnd(35, 60), rnd(-220, -120)); this.root.add(c); this.clouds.push(c);
    }
    // water
    this.waterMap = tex(128, 128, (x) => {
      x.fillStyle = '#2a9d9a'; x.fillRect(0, 0, 128, 128); x.strokeStyle = 'rgba(255,255,255,.22)'; x.lineWidth = 2;
      for (let i = 0; i < 14; i++) { const px = Math.random() * 128, py = Math.random() * 128; x.beginPath(); x.moveTo(px - 14, py); x.quadraticCurveTo(px, py - 5, px + 14, py); x.stroke(); }
    }, 30, 42);
    this.water = new THREE.Mesh(new THREE.PlaneGeometry(300, 420), new THREE.MeshStandardMaterial({ map: this.waterMap, roughness: 0.25, metalness: 0.1 }));
    this.water.rotation.x = -Math.PI / 2; this.water.position.set(0, -0.5, -120); this.water.receiveShadow = true; this.root.add(this.water);
    // shared segment resources
    const planks = tex(128, 128, (x) => {
      for (let i = 0; i < 4; i++) { x.fillStyle = i % 2 ? '#a97a46' : '#c29760'; x.fillRect(0, i * 32, 128, 30); x.fillStyle = '#7a5530'; x.fillRect(0, i * 32 + 30, 128, 2); }
    }, 1, L / 2);
    const wood = new THREE.MeshStandardMaterial({ color: 0x6b4423, roughness: 0.9 });
    this.S = {
      pathGeo: new THREE.BoxGeometry(8.6, 0.4, L), pathMat: new THREE.MeshStandardMaterial({ map: planks, roughness: 0.85 }),
      bankGeo: new THREE.BoxGeometry(22, 0.6, L), grassMat: new THREE.MeshStandardMaterial({ color: 0x4caf50, roughness: 1, flatShading: true }),
      railGeo: new THREE.BoxGeometry(0.1, 0.1, L), lineGeo: new THREE.BoxGeometry(0.08, 0.02, L),
      postGeo: new THREE.BoxGeometry(0.2, 0.9, 0.2), wood, gold: new THREE.MeshStandardMaterial({ color: 0xe0a82e, emissive: 0x442e00 }),
      bushGeo: new THREE.IcosahedronGeometry(0.8, 1),
      bushMats: [0x2f8f3a, 0x3fa34d, 0x56b94e].map((c) => new THREE.MeshStandardMaterial({ color: c, flatShading: true }))
    };
    this.segments = Array.from({ length: N }, (_, i) => { const s = this.buildSegment(); s.position.z = 12 - i * L; this.root.add(s); return s; });
  }

  buildSegment() {
    const g = new THREE.Group(), S = this.S; g.userData = { palms: [], houses: [], boats: [], bushes: [] };
    const add = (geo, mat, x, y) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, 0); m.receiveShadow = true; g.add(m); return m; };
    add(S.pathGeo, S.pathMat, 0, -0.2);
    const posts = new THREE.InstancedMesh(S.postGeo, S.wood, 2 * (L / 3)), m4 = new THREE.Matrix4(); let n = 0;
    for (const s of [-1, 1]) {
      add(S.bankGeo, S.grassMat, s * 20.75, -0.4); add(S.railGeo, S.wood, s * 4.4, 0.85); add(S.lineGeo, S.gold, s * 1.2, 0.01);
      for (let z = -L / 2 + 1.5; z < L / 2; z += 3) { m4.setPosition(s * 4.4, 0.45, z); posts.setMatrixAt(n++, m4); }
      for (let k = 0; k < 3; k++) { const p = this.assets.create('tree').object; p.userData = { phase: rnd(0, 6.28), side: s, k }; g.add(p); g.userData.palms.push(p); }
      const h = this.assets.create('house').object; h.userData.side = s; g.add(h); g.userData.houses.push(h);
      const b = this.assets.create('boat').object; b.userData = { side: s, phase: rnd(0, 6.28) }; g.add(b); g.userData.boats.push(b);
      for (let k = 0; k < 3; k++) { const bu = new THREE.Mesh(S.bushGeo, S.bushMats[k]); bu.userData.side = s; g.add(bu); g.userData.bushes.push(bu); }
    }
    g.add(posts); this.shuffle(g); return g;
  }

  shuffle(g) {
    const u = g.userData;
    u.palms.forEach((p) => { const s = p.userData.side; p.position.set(s * (9.8 + p.userData.k * 5 + rnd(0, 4)), 0, rnd(-L / 2, L / 2)); p.scale.setScalar(rnd(0.85, 1.3)); p.rotation.y = rnd(0, 6.28); });
    u.houses.forEach((h) => { const s = h.userData.side; h.visible = Math.random() < 0.65; h.position.set(s * rnd(18, 25), 0, rnd(-L / 2 + 4, L / 2 - 4)); h.rotation.y = -s * Math.PI / 2; });
    u.boats.forEach((b) => { const s = b.userData.side; b.visible = Math.random() < 0.7; b.position.set(s * rnd(6.2, 8), -0.42, rnd(-L / 2, L / 2)); b.rotation.y = Math.PI / 2 + rnd(-0.1, 0.1); });
    u.bushes.forEach((b) => { b.position.set(b.userData.side * rnd(9.8, 17), 0.1, rnd(-L / 2, L / 2)); b.scale.setScalar(rnd(0.8, 1.5)); });
  }

  update(dt, speed) {
    this.time += dt;
    for (const seg of this.segments) {
      seg.position.z += speed * dt;
      if (seg.position.z > L / 2 + 18) { seg.position.z -= N * L; this.shuffle(seg); }
      for (const p of seg.userData.palms) p.rotation.z = Math.sin(this.time * 1.1 + p.userData.phase) * 0.03;
      for (const b of seg.userData.boats) b.position.y = -0.42 + Math.sin(this.time * 1.5 + b.userData.phase) * 0.05;
    }
    this.waterMap.offset.y += (dt * speed) / 10; this.waterMap.offset.x += dt * 0.02;
    for (const c of this.clouds) { c.position.x += dt * 1.2; if (c.position.x > 140) c.position.x = -140; }
  }
}
