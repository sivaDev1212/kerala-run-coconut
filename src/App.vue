<script setup>
import { ref } from 'vue';
import GameCanvas from './components/GameCanvas.vue';
import GameHUD from './components/GameHUD.vue';
import StartScreen from './components/StartScreen.vue';
import PauseScreen from './components/PauseScreen.vue';
import GameOverScreen from './components/GameOverScreen.vue';
import { gameState as s } from './composables/useGameState.js';

const game = ref(null);
const toggleMute = () => game.value?.setMuted(!s.muted);
</script>

<template>
  <GameCanvas ref="game" />
  <div v-if="s.hits" :key="s.hits" class="flash" />
  <Transition name="fade"><GameHUD v-if="s.status === 'PLAYING' || s.status === 'PAUSED'" :state="s" @pause="game.pause()" @mute="toggleMute" /></Transition>
  <Transition name="fade"><StartScreen v-if="s.status === 'MENU'" :best="s.best" :ready="s.ready" @play="game.start()" /></Transition>
  <Transition name="fade"><PauseScreen v-if="s.status === 'PAUSED'" @resume="game.resume()" @restart="game.restart()" @menu="game.toMenu()" /></Transition>
  <Transition name="fade"><GameOverScreen v-if="s.status === 'GAME_OVER'" :state="s" @restart="game.restart()" @menu="game.toMenu()" /></Transition>
  <div v-if="s.error" class="error">{{ s.error }}</div>
</template>
