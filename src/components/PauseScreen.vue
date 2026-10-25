<script setup>defineEmits(['resume', 'restart', 'menu']);</script>
<template>
  <section class="overlay dim">
    <div class="panel small">
      <h2>Paused</h2>
      <button class="btn primary" @click="$emit('resume')">Resume</button>
      <button class="btn" @click="$emit('restart')">Restart</button>
      <button class="btn ghost" @click="$emit('menu')">Main menu</button>
    </div>
  </section>
</template>
