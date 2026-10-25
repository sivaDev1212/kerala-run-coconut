import * as THREE from 'three';
import { CONFIG } from '../config/gameConfig.js';
import { makeBox, overlaps } from './CollisionSystem.js';

const DEF = {
  coconut: { asset: 'coconut', w: 0.7, h: 0.7, d: 0.7, y: 0.9 },
  milk: { asset: 'milk', w: 0.6, h: 1, d: 0.6, y: 0.8 },
  crate: { asset: 'obstacle', w: 1.5, h: 1.1, d: 1.2, y: 0 }
};
const rnd = (a, b) => a + Math.random() * (b - a), ri = (n) => Math.floor(Math.random() * n);

/** Pooled collectibles + obstacles. Rows never block all three lanes and always leave a reachable free lane. */
export class SpawnManager {
  constructor(scene, assets) {
    this.assets = assets; this.group = new THREE.Group(); scene.add(this.group);
    this.free = { coconut: [], milk: [], crate: [] }; this.active = []; this.t = 0; this.reset();
  }
  reset() { [...this.active].forEach((e) => this.release(e)); this.countdown = 18; this.lastFree = [0, 1, 2]; }
  spawn(type, lane, z, y = DEF[type].y) {
    const d = DEF[type]; let e = this.free[type].pop();
    if (!e) { const mesh = this.assets.create(d.asset).object; this.group.add(mesh); e = { type, mesh, w: d.w, h: d.h, d: d.d, phase: 0 }; }
    Object.assign(e, { x: CONFIG.lanes[lane], y, z, phase: Math.random() * 6 });
    e.mesh.visible = true; this.active.push(e); return e;
  }
  release(e) {
    const i = this.active.indexOf(e); if (i >= 0) this.active.splice(i, 1);
    e.mesh.visible = false; this.free[e.type].push(e);
  }
  box(e) { return makeBox(e.x, e.y, e.z, e.w, e.h, e.d); }
  hits(pb) { return this.active.filter((e) => overlaps(pb, this.box(e))); }

  spawnRow(over, speed) {
    const z0 = CONFIG.spawnZ + over, r = Math.random(); let len = 2;
    if (r < 0.38) {
      let blocked = Math.random() < 0.4 ? [0, 1, 2].sort(() => Math.random() - 0.5).slice(0, 2) : [ri(3)];
      let free = [0, 1, 2].filter((l) => !blocked.includes(l));
      if (!free.some((f) => this.lastFree.some((l) => Math.abs(f - l) <= 1))) {
        blocked = [this.lastFree[0] === 1 ? 0 : 1]; free = [0, 1, 2].filter((l) => !blocked.includes(l));
      }
      blocked.forEach((l) => this.spawn('crate', l, z0));
      this.lastFree = free;
      if (Math.random() < 0.6) for (let i = -1; i <= 1; i++) this.spawn('coconut', blocked[0], z0 + i * 1.3, 2.1 + (1 - Math.abs(i)) * 0.3);
      len = 2.5;
    } else {
      this.lastFree = [0, 1, 2]; const lane = ri(3);
      if (r < 0.78) {
        const n = 5, arc = Math.random() < 0.25;
        for (let i = 0; i < n; i++) this.spawn('coconut', lane, z0 - i * 1.7, arc ? 0.9 + Math.sin((i / (n - 1)) * Math.PI) * 1.6 : 0.9);
        len = n * 1.7;
      } else {
        const n = 1 + ri(3);
        for (let i = 0; i < n; i++) this.spawn('milk', lane, z0 - i * 2.2);
        len = n * 2.2;
      }
    }
    this.countdown = len + rnd(8, 13) * Math.sqrt(speed / CONFIG.startSpeed);
  }

  update(dt, speed) {
    this.t += dt; this.countdown -= speed * dt;
    if (this.countdown <= 0) this.spawnRow(-this.countdown, speed);
    for (let i = this.active.length - 1; i >= 0; i--) {
      const e = this.active[i]; e.z += speed * dt;
      if (e.z > CONFIG.despawnZ) { this.release(e); continue; }
      const item = e.type !== 'crate', bob = item ? Math.sin(this.t * 3 + e.phase) * 0.12 : 0;
      e.mesh.position.set(e.x, e.y + bob, e.z);
      if (item) e.mesh.rotation.y += dt * 2.5;
      e.mesh.scale.setScalar(Math.max(0.01, Math.min(1, (e.z - CONFIG.spawnZ) / 12)));
    }
  }
}
