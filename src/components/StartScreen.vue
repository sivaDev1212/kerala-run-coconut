<script setup>
defineProps({ best: Number, ready: Boolean });
defineEmits(['play']);
</script>
<template>
  <section class="overlay start">
    <div class="panel">
      <h1 class="title"><span>Kerala Run</span><small>Coconut Rush</small></h1>
      <p class="lead">Race along a wooden village bridge over the backwaters. Gather tender coconuts and fresh milk, and dodge the crates.</p>
      <button class="btn primary" :disabled="!ready" @click="$emit('play')">{{ ready ? 'Play' : 'Loading…' }}</button>
      <p class="best">Best score <strong>{{ best }}</strong></p>
      <dl class="controls">
        <dt>Move</dt><dd>A / D or ← →, swipe left / right</dd>
        <dt>Jump</dt><dd>W, ↑ or Space, swipe up</dd>
        <dt>Slide</dt><dd>S or ↓, swipe down</dd>
        <dt>Pause</dt><dd>Esc</dd>
      </dl>
    </div>
  </section>
</template>
