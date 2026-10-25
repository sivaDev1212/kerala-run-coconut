import * as THREE from 'three';
import { CONFIG } from '../config/gameConfig.js';
import { AssetManager } from './AssetManager.js';
import { AudioManager } from './AudioManager.js';
import { EnvironmentManager } from './EnvironmentManager.js';
import { ParticleSystem } from './ParticleSystem.js';
import { Player } from './Player.js';
import { SpawnManager } from './SpawnManager.js';
import { disposeTree } from './AssetManager.js';

/** Owns the renderer, loop, input and simulation. Talks to Vue only through the shared game state. */
export class GameEngine {
  constructor(canvas, state) {
    this.canvas = canvas; this.state = state; this.audio = new AudioManager(state.muted);
    this.clock = new THREE.Clock(); this.speed = 0; this.dist = 0; this.invuln = 0; this.shake = 0; this.time = 0;
    this.disposed = false; this.touch = null;
  }

  async init() {
    const r = (this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, powerPreference: 'high-performance' }));
    r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap;
    const scene = (this.scene = new THREE.Scene()); scene.fog = new THREE.Fog(0xd6ecf5, 60, 150);
    this.camera = new THREE.PerspectiveCamera(62, 1, 0.1, 500); this.camera.position.set(0, 5.2, 9.5);
    scene.add(new THREE.HemisphereLight(0xbfe3ff, 0x6b8f4a, 0.9));
    const sun = (this.sun = new THREE.DirectionalLight(0xfff1d0, 1.8)); sun.position.set(10, 22, 8); sun.target.position.set(0, 0, -4);
    sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024);
    Object.assign(sun.shadow.camera, { left: -18, right: 18, top: 18, bottom: -18, near: 1, far: 70 }); sun.shadow.bias = -0.0005;
    scene.add(sun, sun.target);

    this.assets = new AssetManager(); await this.assets.loadAll();
    if (this.disposed) return;
    this.env = new EnvironmentManager(scene, this.assets);
    this.player = new Player(this.assets, scene);
    this.spawn = new SpawnManager(scene, this.assets);
    this.particles = new ParticleSystem(scene);

    this.resize();
    window.addEventListener('resize', this.resize);
    window.addEventListener('keydown', this.onKey);
    window.addEventListener('pointerdown', this.unlock);
    document.addEventListener('visibilitychange', this.onVisibility);
    this.canvas.addEventListener('touchstart', this.onTouchStart, { passive: true });
    this.canvas.addEventListener('touchend', this.onTouchEnd, { passive: true });
    this.clock.start(); r.setAnimationLoop(this.tick); // a single loop, created once
  }

  // ---- lifecycle ----
  start() {
    this.unlock(); this.audio.play('click'); this.state.start();
    this.speed = CONFIG.startSpeed; this.dist = 0; this.invuln = 0; this.shake = 0;
    this.spawn.reset(); this.player.reset(); this.particles.clear(); this.player.root.visible = true;
  }
  restart() { this.start(); }
  pause() { if (this.state.status === 'PLAYING') { this.state.pause(); this.audio.play('click'); } }
  resume() { if (this.state.status === 'PAUSED') { this.state.resume(); this.audio.play('click'); } }
  toMenu() {
    this.unlock(); this.audio.play('click'); this.state.toMenu();
    this.spawn.reset(); this.player.reset(); this.particles.clear(); this.player.root.visible = true; this.speed = 0;
  }
  setMuted(m) { this.state.setMuted(m); this.audio.muted = m; }

  // ---- input ----
  unlock = () => this.audio.unlock();
  onVisibility = () => { if (document.hidden) this.pause(); };
  onKey = (e) => {
    const k = e.code, st = this.state.status;
    if (k === 'Escape') { st === 'PLAYING' ? this.pause() : this.resume(); return; }
    if (st !== 'PLAYING') return;
    const p = this.player; let handled = true;
    if (k === 'ArrowLeft' || k === 'KeyA') p.moveLane(-1);
    else if (k === 'ArrowRight' || k === 'KeyD') p.moveLane(1);
    else if (k === 'ArrowUp' || k === 'KeyW' || k === 'Space') { if (p.jump()) this.audio.play('jump'); }
    else if (k === 'ArrowDown' || k === 'KeyS') p.slide();
    else handled = false;
    if (handled) { e.preventDefault(); e.target?.blur?.(); }
  };
  onTouchStart = (e) => { const t = e.changedTouches[0]; this.touch = { x: t.clientX, y: t.clientY }; };
  onTouchEnd = (e) => {
    if (!this.touch || this.state.status !== 'PLAYING') return;
    const t = e.changedTouches[0], dx = t.clientX - this.touch.x, dy = t.clientY - this.touch.y; this.touch = null;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 30) return;
    if (Math.abs(dx) > Math.abs(dy)) this.player.moveLane(dx > 0 ? 1 : -1);
    else if (dy < 0) { if (this.player.jump()) this.audio.play('jump'); }
    else this.player.slide();
  };
  resize = () => {
    const w = this.canvas.clientWidth || window.innerWidth, h = this.canvas.clientHeight || window.innerHeight, a = w / h;
    this.renderer.setSize(w, h, false); this.camera.aspect = a;
    this.camera.fov = Math.min(88, 62 + Math.max(0, 1 - a) * 40); this.camera.updateProjectionMatrix();
  };

  // ---- simulation ----
  collide() {
    const pb = this.player.getBox();
    for (const e of this.spawn.hits(pb)) {
      const pos = new THREE.Vector3(e.x, e.y + e.h / 2, e.z);
      if (e.type === 'coconut') { this.state.addCoconut(); this.audio.play('coconut'); this.particles.burst(pos, 0x8bd24f, 10); }
      else if (e.type === 'milk') { this.state.addMilk(); this.audio.play('milk'); this.particles.burst(pos, 0xffffff, 14, 5); this.particles.burst(pos, 0x2f80ed, 6); }
      else {
        this.particles.burst(pos, 0xa8743a, 14, 6);
        if (this.invuln <= 0) {
          this.state.hit(); this.audio.play('hit'); this.invuln = CONFIG.invulnerable; this.shake = 0.4;
          if (this.state.status === 'GAME_OVER') { this.audio.play('over'); this.invuln = 0; }
        }
      }
      this.spawn.release(e);
      if (this.state.status !== 'PLAYING') break;
    }
  }

  tick = () => {
    const dt = Math.min(this.clock.getDelta(), 0.05), s = this.state, cam = this.camera;
    if (s.status !== 'PAUSED') {
      this.time += dt;
      if (s.status === 'PLAYING') {
        this.speed = Math.min(CONFIG.maxSpeed, this.speed + CONFIG.accel * dt);
        this.dist += this.speed * dt; s.speed = Math.round(this.speed); s.distance = Math.floor(this.dist);
        this.spawn.update(dt, this.speed); this.player.update(dt, this.speed / CONFIG.startSpeed);
        this.collide();
        if (this.invuln > 0) { this.invuln -= dt; this.player.root.visible = this.invuln <= 0 || Math.floor(this.invuln * 14) % 2 === 0; }
      } else {
        const target = s.status === 'MENU' ? 7 : 0;
        this.speed += (target - this.speed) * Math.min(1, 3 * dt);
        this.player.update(dt, this.speed > 0.5 ? this.speed / CONFIG.startSpeed : 0);
      }
      this.env.update(dt, this.speed); this.particles.update(dt);
    }
    // camera
    const menu = s.status === 'MENU', px = this.player.x, k = Math.min(1, 5 * dt);
    const tx = menu ? Math.sin(this.time * 0.4) * 1.6 : px * 0.4, ty = menu ? 3.2 : 5.2, tz = menu ? 7.5 : 9.5;
    cam.position.x += (tx - cam.position.x) * k; cam.position.y += (ty - cam.position.y) * k; cam.position.z += (tz - cam.position.z) * k;
    if (this.shake > 0) { this.shake -= dt; cam.position.x += (Math.random() - 0.5) * this.shake; cam.position.y += (Math.random() - 0.5) * this.shake * 0.6; }
    cam.lookAt(menu ? 0 : px * 0.5, menu ? 1.5 : 1.6, menu ? -6 : -8);
    this.renderer.render(this.scene, cam);
  };

  dispose() {
    this.disposed = true;
    if (!this.renderer) return;
    this.renderer.setAnimationLoop(null);
    window.removeEventListener('resize', this.resize); window.removeEventListener('keydown', this.onKey);
    window.removeEventListener('pointerdown', this.unlock); document.removeEventListener('visibilitychange', this.onVisibility);
    this.canvas.removeEventListener('touchstart', this.onTouchStart); this.canvas.removeEventListener('touchend', this.onTouchEnd);
    this.player?.dispose(); this.assets?.dispose();
    this.scene.traverse((o) => { if (o.isMesh || o.isInstancedMesh) disposeTree(o); });
    this.scene.background?.dispose?.(); this.audio.ctx?.close?.();
    this.renderer.dispose(); this.renderer.forceContextLoss();
  }
}
