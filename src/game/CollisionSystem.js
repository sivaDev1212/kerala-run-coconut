import { CONFIG } from '../config/gameConfig.js';
// Axis-aligned boxes: x/z are centres, y is the bottom.
export const makeBox = (x, y, z, w, h, d) => ({ x, y, z, w, h, d });
export const overlaps = (a, b) =>
  Math.abs(a.x - b.x) * 2 < a.w + b.w && Math.abs(a.z - b.z) * 2 < a.d + b.d && a.y < b.y + b.h && b.y < a.y + a.h;
export const playerBox = (x, y, sliding) =>
  makeBox(x, y, 0, CONFIG.playerBox.w, sliding ? CONFIG.playerBox.slideH : CONFIG.playerBox.h, CONFIG.playerBox.d);
