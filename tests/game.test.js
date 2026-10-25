import test from 'node:test';
import assert from 'node:assert/strict';
import { createGameState } from '../src/composables/useGameState.js';
import { overlaps, makeBox, playerBox } from '../src/game/CollisionSystem.js';

test('scoring: coconut 10, milk 20', () => {
  const s = createGameState(); s.start(); s.addCoconut(); s.addMilk();
  assert.equal(s.score, 30); assert.equal(s.coconuts, 1); assert.equal(s.milk, 1);
});
test('state transitions', () => {
  const s = createGameState();
  assert.equal(s.status, 'MENU'); s.pause(); assert.equal(s.status, 'MENU');
  s.start(); assert.equal(s.status, 'PLAYING'); s.pause(); assert.equal(s.status, 'PAUSED');
  s.resume(); assert.equal(s.status, 'PLAYING'); s.end(); assert.equal(s.status, 'GAME_OVER');
  s.toMenu(); assert.equal(s.status, 'MENU');
});
test('health: three hits end the game and best score updates', () => {
  const s = createGameState(); s.start(); s.addMilk();
  s.hit(); s.hit(); assert.equal(s.health, 1); assert.equal(s.status, 'PLAYING');
  s.hit(); assert.equal(s.health, 0); assert.equal(s.status, 'GAME_OVER'); assert.equal(s.best >= 20, true);
  s.hit(); assert.equal(s.health, 0);
});
test('restart resets counters', () => {
  const s = createGameState(); s.start(); s.addCoconut(); s.hit(); s.start();
  assert.equal(s.score, 0); assert.equal(s.health, 3);
});
test('collision: lane, height and jump clearance', () => {
  const crate = makeBox(0, 0, 0, 1.5, 1.1, 1.2);
  assert.equal(overlaps(playerBox(0, 0, false), crate), true);
  assert.equal(overlaps(playerBox(2.4, 0, false), crate), false, 'adjacent lane is safe');
  assert.equal(overlaps(playerBox(0, 1.5, false), crate), false, 'jumping clears the crate');
  assert.equal(overlaps(playerBox(0, 0, false), makeBox(0, 0, -5, 1.5, 1.1, 1.2)), false, 'far away');
});
