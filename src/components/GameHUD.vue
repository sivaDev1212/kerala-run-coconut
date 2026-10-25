<script setup>
defineProps({ state: Object });
defineEmits(['pause', 'mute']);
</script>
<template>
  <header class="hud">
    <div class="hud-left">
      <div class="score"><span :key="state.score" class="pop">{{ state.score }}</span>
        <span v-if="state.pickup.id" :key="state.pickup.id" class="plus">+{{ state.pickup.pts }}</span></div>
      <div class="counts">
        <span class="chip" title="Coconuts"><svg viewBox="0 0 24 24"><circle cx="12" cy="13" r="8" fill="#5fae3b"/><circle cx="9" cy="10" r="2" fill="#a5dd7f"/><path d="M12 3l-2 3h4z" fill="#8bc34a"/></svg>{{ state.coconuts }}</span>
        <span class="chip" title="Milk bottles"><svg viewBox="0 0 24 24"><rect x="8" y="2" width="8" height="3" rx="1" fill="#2f80ed"/><path d="M9 5h6v3l2 3v10a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V11l2-3z" fill="#fff"/><rect x="7" y="13" width="10" height="4" fill="#2f80ed"/></svg>{{ state.milk }}</span>
        <span class="chip dist">{{ state.distance }} m</span>
      </div>
    </div>
    <div class="hud-right">
      <div class="hearts" aria-label="Health">
        <svg v-for="i in state.maxHealth" :key="i" viewBox="0 0 24 24" :class="{ lost: i > state.health }"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
      </div>
      <button class="icon-btn" :aria-label="state.muted ? 'Unmute' : 'Mute'" @click="$emit('mute')">
        <svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor"/><path v-if="!state.muted" d="M16 8a5 5 0 0 1 0 8M18.5 5.5a9 9 0 0 1 0 13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path v-else d="M16 9l5 6m0-6l-5 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
      </button>
      <button class="icon-btn" aria-label="Pause" @click="$emit('pause')"><svg viewBox="0 0 24 24"><rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor"/><rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor"/></svg></button>
    </div>
  </header>
</template>
