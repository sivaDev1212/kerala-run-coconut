// Procedural fallback models. Every model has its lowest point at y = 0 and faces -Z.
import * as THREE from 'three';
const mats = new Map();
const M = (c, o = {}) => {
  const k = c + JSON.stringify(o);
  if (!mats.has(k)) mats.set(k, new THREE.MeshStandardMaterial({ color: c, roughness: 0.8, flatShading: true, ...o }));
  return mats.get(k);
};
const mesh = (geo, mat, x = 0, y = 0, z = 0, parent) => {
  const o = new THREE.Mesh(geo, mat); o.position.set(x, y, z); o.castShadow = true; o.receiveShadow = true;
  if (parent) parent.add(o); return o;
};
const pivot = (name, x, y, z, parent) => { const g = new THREE.Group(); g.name = name; g.position.set(x, y, z); parent.add(g); return g; };
const cyl = (a, b, h, s = 12) => new THREE.CylinderGeometry(a, b, h, s);

export function buildCharacter() {
  const g = new THREE.Group();
  const skin = M(0xc68a5a), shirt = M(0xffffff), mundu = M(0xf6edd2), gold = M(0xd9a520), hair = M(0x1b1210), sandal = M(0x2b1b13);
  mesh(cyl(0.34, 0.4, 0.75), shirt, 0, 1.35, 0, g);
  mesh(cyl(0.38, 0.5, 0.9, 14), mundu, 0, 0.6, 0, g);
  const border = mesh(new THREE.TorusGeometry(0.49, 0.045, 6, 18), gold, 0, 0.2, 0, g); border.rotation.x = Math.PI / 2;
  mesh(new THREE.SphereGeometry(0.27, 16, 12), skin, 0, 1.98, 0, g);
  mesh(new THREE.SphereGeometry(0.285, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.62), hair, 0, 2.0, 0.03, g);
  for (const s of [-1, 1]) {
    const n = s < 0 ? 'L' : 'R';
    const leg = pivot('leg' + n, s * 0.17, 0.4, 0, g);
    mesh(cyl(0.08, 0.07, 0.4, 8), skin, 0, -0.2, 0, leg);
    mesh(new THREE.BoxGeometry(0.18, 0.06, 0.32), sandal, 0, -0.37, -0.05, leg);
    const arm = pivot('arm' + n, s * 0.46, 1.6, 0, g);
    mesh(cyl(0.075, 0.065, 0.55, 8), skin, 0, -0.28, 0, arm);
    mesh(new THREE.SphereGeometry(0.09, 8, 8), skin, 0, -0.58, 0, arm);
  }
  return g;
}

export function buildCoconut() {
  const g = new THREE.Group();
  mesh(new THREE.SphereGeometry(0.3, 14, 12), M(0x5fae3b), 0, 0.3, 0, g);
  mesh(new THREE.ConeGeometry(0.1, 0.12, 6), M(0x8bc34a), 0, 0.63, 0, g);
  return g;
}

export function buildMilk() {
  const g = new THREE.Group(), white = M(0xffffff, { roughness: 0.3 }), blue = M(0x2f80ed);
  mesh(cyl(0.22, 0.25, 0.55, 16), white, 0, 0.275, 0, g);
  mesh(cyl(0.255, 0.255, 0.16, 16), blue, 0, 0.28, 0, g);
  mesh(cyl(0.12, 0.22, 0.2, 16), white, 0, 0.65, 0, g);
  mesh(cyl(0.095, 0.095, 0.2, 12), white, 0, 0.85, 0, g);
  mesh(cyl(0.12, 0.12, 0.1, 12), blue, 0, 0.99, 0, g);
  return g;
}

export function buildCrate() {
  const g = new THREE.Group(), wood = M(0xa8743a), dark = M(0x6b4423);
  mesh(new THREE.BoxGeometry(1.4, 1.1, 1.2), wood, 0, 0.55, 0, g);
  for (const x of [-0.7, 0.7]) for (const z of [-0.6, 0.6]) mesh(new THREE.BoxGeometry(0.14, 1.14, 0.14), dark, x, 0.55, z, g);
  for (const y of [0.06, 1.04]) mesh(new THREE.BoxGeometry(1.46, 0.12, 1.26), dark, 0, y, 0, g);
  for (const z of [-0.61, 0.61]) { const d = mesh(new THREE.BoxGeometry(0.12, 1.3, 0.05), dark, 0, 0.55, z, g); d.rotation.z = 0.7; }
  return g;
}

export function buildTree() {
  const g = new THREE.Group(), trunk = M(0x7a5a3a), leaf = M(0x2e8b3d), leaf2 = M(0x3fa34d);
  for (let i = 0; i < 6; i++) {
    const t = mesh(cyl(0.2 - i * 0.012, 0.23 - i * 0.012, 1.0, 7), trunk, i * i * 0.04, 0.5 + i * 0.95, 0, g);
    t.rotation.z = -(0.04 + i * 0.016);
  }
  const top = pivot('crown', 1.15, 6.0, 0, g);
  for (let k = 0; k < 8; k++) {
    const f = pivot('frond' + k, 0, 0, 0, top); f.rotation.y = (k * Math.PI) / 4; f.rotation.z = 0.35 + (k % 2) * 0.15;
    mesh(new THREE.BoxGeometry(2.6, 0.05, 0.5), k % 2 ? leaf : leaf2, 1.3, 0, 0, f);
  }
  for (let k = 0; k < 3; k++) mesh(new THREE.SphereGeometry(0.2, 8, 8), M(0x6b8e23), 0.2 * Math.cos(k * 2.1), -0.2, 0.2 * Math.sin(k * 2.1), top);
  return g;
}

export function buildHouse() {
  const g = new THREE.Group(), cream = M(0xf3e4c0), wood = M(0x5a3a22), tile = M(0xb5482e);
  mesh(new THREE.BoxGeometry(5.4, 0.3, 4.4), M(0x9a9a8f), 0, 0.15, 0, g);
  mesh(new THREE.BoxGeometry(5, 2.4, 4), cream, 0, 1.5, 0, g);
  const roof = mesh(new THREE.ConeGeometry(3.9, 2.2, 4), tile, 0, 3.8, 0, g);
  roof.rotation.y = Math.PI / 4; roof.scale.set(1.1, 1, 0.85);
  mesh(new THREE.BoxGeometry(0.9, 1.6, 0.1), wood, 0, 1.1, 2.02, g);
  for (const x of [-1.6, 1.6]) mesh(new THREE.BoxGeometry(0.8, 0.8, 0.1), wood, x, 1.8, 2.02, g);
  for (const x of [-2.2, 2.2]) mesh(cyl(0.1, 0.1, 2.4, 6), wood, x, 1.5, 2.5, g);
  mesh(new THREE.BoxGeometry(5, 0.15, 1.2), tile, 0, 2.75, 2.5, g);
  return g;
}

export function buildBoat() {
  const g = new THREE.Group(), wood = M(0x5a3a22), thatch = M(0xc9a45c);
  mesh(new THREE.BoxGeometry(3.6, 0.45, 1.1), wood, 0, 0.3, 0, g);
  for (const s of [-1, 1]) { const b = mesh(new THREE.ConeGeometry(0.55, 0.9, 4), wood, s * 2.05, 0.3, 0, g); b.rotation.z = -s * Math.PI / 2; b.rotation.y = Math.PI / 4; }
  const roof = mesh(new THREE.CylinderGeometry(0.62, 0.62, 2.4, 10, 1, false, 0, Math.PI), thatch, 0, 0.55, 0, g);
  roof.rotation.z = Math.PI / 2;
  return g;
}

export const BUILDERS = { character: buildCharacter, coconut: buildCoconut, milk: buildMilk, obstacle: buildCrate, tree: buildTree, house: buildHouse, boat: buildBoat };
