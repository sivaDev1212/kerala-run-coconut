import { reactive } from 'vue';
import { CONFIG } from '../config/gameConfig.js';

export const STATUS = { MENU: 'MENU', PLAYING: 'PLAYING', PAUSED: 'PAUSED', GAME_OVER: 'GAME_OVER' };
const BEST_KEY = 'kerala-run-best', MUTE_KEY = 'kerala-run-muted';
const read = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
const write = (k, v) => { try { localStorage.setItem(k, v); } catch { /* ignore */ } };

export function createGameState() {
  const s = reactive({
    status: STATUS.MENU, ready: false, error: '',
    score: 0, coconuts: 0, milk: 0, health: CONFIG.startHealth, maxHealth: CONFIG.startHealth,
    best: Number(read(BEST_KEY)) || 0, newBest: false,
    speed: 0, distance: 0, muted: read(MUTE_KEY) === '1',
    hits: 0, pickup: { id: 0, pts: 0 }
  });
  const reset = () => {
    Object.assign(s, { score: 0, coconuts: 0, milk: 0, health: s.maxHealth, newBest: false, speed: 0, distance: 0, hits: 0 });
  };
  const pickup = (pts) => { s.score += pts; s.pickup = { id: s.pickup.id + 1, pts }; };
  const api = {
    start() { reset(); s.status = STATUS.PLAYING; },
    pause() { if (s.status === STATUS.PLAYING) s.status = STATUS.PAUSED; },
    resume() { if (s.status === STATUS.PAUSED) s.status = STATUS.PLAYING; },
    toMenu() { s.status = STATUS.MENU; },
    addCoconut() { s.coconuts++; pickup(CONFIG.points.coconut); },
    addMilk() { s.milk++; pickup(CONFIG.points.milk); },
    hit() {
      if (s.status !== STATUS.PLAYING) return s.health;
      s.health = Math.max(0, s.health - 1); s.hits++;
      if (s.health === 0) api.end();
      return s.health;
    },
    end() {
      s.status = STATUS.GAME_OVER;
      if (s.score > s.best) { s.best = s.score; s.newBest = true; write(BEST_KEY, String(s.best)); }
    },
    setMuted(m) { s.muted = m; write(MUTE_KEY, m ? '1' : '0'); }
  };
  return Object.assign(s, api);
}
export const gameState = createGameState();
