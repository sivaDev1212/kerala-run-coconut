<script setup>
defineProps({ state: Object });
defineEmits(['restart', 'menu']);
</script>
<template>
  <section class="overlay dim">
    <div class="panel small">
      <h2>Run over</h2>
      <p v-if="state.newBest" class="newbest">New best score!</p>
      <div class="final">{{ state.score }}</div>
      <ul class="stats">
        <li>Coconuts <strong>{{ state.coconuts }}</strong></li>
        <li>Milk bottles <strong>{{ state.milk }}</strong></li>
        <li>Distance <strong>{{ state.distance }} m</strong></li>
        <li>Best score <strong>{{ state.best }}</strong></li>
      </ul>
      <button class="btn primary" @click="$emit('restart')">Run again</button>
      <button class="btn ghost" @click="$emit('menu')">Main menu</button>
    </div>
  </section>
</template>
