import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import { ASSETS } from '../config/assets.js';
import { BUILDERS } from './procedural.js';

export class AssetManager {
  constructor() { this.loader = new GLTFLoader(); this.cache = {}; this.templates = {}; }

  async loadAll() {
    await Promise.all(Object.entries(ASSETS).map(async ([key, cfg]) => {
      try { const g = await this.loader.loadAsync(cfg.path); fixMaterials(g.scene); this.cache[key] = g; }
      catch { console.warn(`[assets] "${cfg.path}" unavailable — using procedural fallback for "${key}".`); }
    }));
  }

  /** Returns { object, clips, custom }. object is a Group whose lowest point sits at y=0. */
  create(key) {
    const cfg = ASSETS[key], wrap = new THREE.Group(), gltf = this.cache[key];
    let clips = [], inner;
    if (gltf) {
      inner = SkeletonUtils.clone(gltf.scene); clips = gltf.animations || [];
      inner.scale.setScalar(1);
      let k = cfg.scale;
      if (cfg.height) { const h = new THREE.Box3().setFromObject(inner).getSize(new THREE.Vector3()).y; if (h > 0) k = cfg.height / h; } // auto-fit to a target height
      inner.scale.setScalar(k); inner.rotation.y = cfg.rotationY; wrap.add(inner);
      const box = new THREE.Box3().setFromObject(inner), c = box.getCenter(new THREE.Vector3());
      inner.position.set(-c.x, -box.min.y, -c.z);
    } else if (key === 'character') {
      inner = BUILDERS.character(); wrap.add(inner);
    } else {
      this.templates[key] ??= BUILDERS[key]();
      inner = this.templates[key].clone(true); wrap.add(inner); // shares geometry + materials
    }
    wrap.position.set(...cfg.offset);
    const holder = new THREE.Group(); holder.add(wrap); // holder is free for scaling / bobbing
    wrap.traverse((o) => { if (o.isMesh) { o.castShadow = cfg.shadow; o.receiveShadow = cfg.shadow; } });
    return { object: holder, inner, clips, custom: !!gltf };
  }

  dispose() { Object.values(this.cache).forEach((g) => disposeTree(g.scene)); Object.values(this.templates).forEach(disposeTree); }
}

export function disposeTree(root) {
  root.traverse((o) => {
    if (!o.isMesh) return;
    o.geometry?.dispose();
    [].concat(o.material || []).forEach((m) => { Object.values(m).forEach((v) => v?.isTexture && v.dispose()); m.dispose(); });
  });
}

/** Some exporters omit normals (they render dark/flat) — rebuild them and keep textured colours true. */
function fixMaterials(root) {
  root.traverse((o) => {
    if (!o.isMesh) return;
    if (!o.geometry.attributes.normal) o.geometry.computeVertexNormals();
    [].concat(o.material || []).forEach((m) => {
      m.metalness = 0; m.roughness = Math.min(m.roughness ?? 1, 0.85); m.flatShading = false; m.needsUpdate = true;
    });
  });
}
