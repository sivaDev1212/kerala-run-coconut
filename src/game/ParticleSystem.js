import * as THREE from 'three';
export class ParticleSystem {
  constructor(scene, count = 60) {
    this.group = new THREE.Group(); scene.add(this.group);
    this.geo = new THREE.IcosahedronGeometry(0.1, 0); this.cursor = 0;
    this.items = Array.from({ length: count }, () => {
      const mesh = new THREE.Mesh(this.geo, new THREE.MeshBasicMaterial({ transparent: true }));
      mesh.visible = false; this.group.add(mesh);
      return { mesh, vel: new THREE.Vector3(), life: 0, max: 1 };
    });
  }
  burst(pos, color, n = 10, speed = 4) {
    for (let i = 0; i < n; i++) {
      const p = this.items[this.cursor++ % this.items.length];
      p.mesh.material.color.set(color); p.mesh.position.copy(pos); p.mesh.visible = true;
      p.vel.set(Math.random() - 0.5, Math.random() + 0.4, Math.random() - 0.5).multiplyScalar(speed);
      p.life = p.max = 0.5 + Math.random() * 0.3;
    }
  }
  clear() { this.items.forEach((p) => { p.life = 0; p.mesh.visible = false; }); }
  update(dt) {
    for (const p of this.items) {
      if (p.life <= 0) continue;
      p.life -= dt; p.vel.y -= 9 * dt; p.mesh.position.addScaledVector(p.vel, dt);
      const k = Math.max(0, p.life / p.max); p.mesh.scale.setScalar(k + 0.01); p.mesh.material.opacity = k;
      if (p.life <= 0) p.mesh.visible = false;
    }
  }
}
