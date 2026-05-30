<script setup lang="ts">
import { RouterLink } from 'vue-router'

</script>

<template>
  <div class="breadcrumbs text-sm">
    <ul>
      <li><RouterLink to="/" class="underline">Главная</RouterLink></li>
      <li><RouterLink to="/" class="underline">Игры</RouterLink></li>
      <li>Brooklyn Bowler</li>
    </ul>
  </div>
</template>
