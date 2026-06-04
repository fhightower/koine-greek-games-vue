<template>
  <nav v-if="!isHome" class="topnav">
    <RouterLink to="/" class="back">
      <span class="back__arrow">←</span>
      <span class="back__mark">Κοινή</span>
    </RouterLink>
  </nav>

  <RouterView />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'

const route = useRoute()
const isHome = computed(() => route.path === '/')
</script>

<style scoped>
.topnav {
  max-width: 720px;
  margin: 0 auto;
  padding: 0.5rem 0 0.25rem;
  text-align: left;
}

.back {
  display: inline-flex;
  align-items: baseline;
  gap: 0.45rem;
  color: var(--app-muted);
  font-size: 0.95rem;
  letter-spacing: 0.02em;
}
.back:hover {
  color: var(--accent);
}
.back:hover .back__arrow {
  transform: translateX(-2px);
}

.back__arrow {
  display: inline-block;
  transition: transform 0.2s ease;
}

.back__mark {
  font-family: var(--font-display);
  font-size: 1.15rem;
  font-weight: 500;
}
</style>
