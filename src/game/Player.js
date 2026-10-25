import * as THREE from 'three';
import { CONFIG } from '../config/gameConfig.js';
import { playerBox } from './CollisionSystem.js';

export class Player {
  constructor(assets, scene) {
    this.assets = assets; this.scene = scene; this.root = new THREE.Group(); scene.add(this.root);
    this.phase = 0; this.reset(); this.setModel();
  }
  /** (Re)builds the character. Plays the best running clip if the GLB has animations. */
  setModel() {
    this.disposeModel();
    const r = this.assets.create('character'); this.model = r.object; this.root.add(this.model);
    this.parts = ['legL', 'legR', 'armL', 'armR'].map((n) => this.model.getObjectByName(n));
    if (r.clips.length) {
      this.mixer = new THREE.AnimationMixer(r.inner);
      const clip = r.clips.find((c) => /run|sprint|jog/i.test(c.name)) || r.clips.find((c) => /walk/i.test(c.name)) || r.clips[0];
      this.mixer.clipAction(clip).play();
    }
  }
  disposeModel() {
    if (this.mixer) { this.mixer.stopAllAction(); this.mixer.uncacheRoot(this.mixer.getRoot()); this.mixer = null; }
    if (this.model) { this.root.remove(this.model); this.model = null; }
  }
  reset() { this.lane = 1; this.x = 0; this.y = 0; this.vy = 0; this.sliding = 0; if (this.model) this.model.scale.y = 1; }
  moveLane(d) { this.lane = Math.max(0, Math.min(2, this.lane + d)); }
  jump() { if (this.y > 0.01 || this.vy > 0) return false; this.vy = CONFIG.jumpVelocity; this.sliding = 0; return true; }
  slide() { this.sliding = CONFIG.slideTime; if (this.y > 0.01) this.vy = Math.min(this.vy, -18); }
  getBox() { return playerBox(this.x, this.y, this.sliding > 0); }
  update(dt, factor = 1) {
    const tx = CONFIG.lanes[this.lane];
    this.x += (tx - this.x) * Math.min(1, CONFIG.laneLerp * dt);
    if (this.y > 0 || this.vy > 0) {
      this.vy += CONFIG.gravity * dt; this.y += this.vy * dt;
      if (this.y <= 0) { this.y = 0; this.vy = 0; }
    }
    if (this.sliding > 0) this.sliding -= dt;
    this.model.scale.y += ((this.sliding > 0 ? 0.55 : 1) - this.model.scale.y) * Math.min(1, 18 * dt);
    this.root.position.set(this.x, this.y, 0);
    this.root.rotation.z = (this.x - tx) * 0.05;
    if (this.mixer) { this.mixer.update(dt * factor); return; }
    this.phase += dt * 12 * factor;
    const [lL, lR, aL, aR] = this.parts, air = this.y > 0.05;
    if (lL) { // fallback character: swing limbs
      lL.rotation.x = air ? 0.8 : Math.sin(this.phase) * 0.9; lR.rotation.x = air ? -0.4 : -Math.sin(this.phase) * 0.9;
      aL.rotation.x = -lL.rotation.x * 0.8; aR.rotation.x = -lR.rotation.x * 0.8;
      this.model.position.y = air ? 0 : Math.abs(Math.sin(this.phase)) * 0.06 * Math.min(1, factor);
    } else { // static GLB (no skeleton/clips): fake a run with bounce, forward lean, side sway and stride squash
      const f = Math.min(1, factor), s = Math.sin(this.phase), step = Math.abs(s);
      this.model.position.y = air ? 0 : step * 0.22 * f;
      this.model.rotation.x = -0.14 * f - (air ? 0.1 : 0);
      this.model.rotation.z = s * 0.1 * f;
      this.model.rotation.y = s * 0.12 * f;
    }
  }
  dispose() { this.disposeModel(); this.scene.remove(this.root); }
}
