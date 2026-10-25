<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue';
import { GameEngine } from '../game/GameEngine.js';
import { gameState } from '../composables/useGameState.js';

const canvas = ref(null);
let engine = null, unmounted = false;

onMounted(async () => {
  try {
    engine = new GameEngine(canvas.value, gameState);
    await engine.init();
    if (!unmounted) gameState.ready = true;
  } catch (err) {
    console.error(err);
    gameState.error = 'Could not start the 3D renderer. Please enable WebGL / hardware acceleration and reload.';
  }
});
onBeforeUnmount(() => { unmounted = true; engine?.dispose(); engine = null; });

defineExpose({
  start: () => engine?.start(), restart: () => engine?.restart(), pause: () => engine?.pause(),
  resume: () => engine?.resume(), toMenu: () => engine?.toMenu(), setMuted: (m) => engine?.setMuted(m)
});
</script>
<template><canvas ref="canvas" class="game-canvas" /></template>
