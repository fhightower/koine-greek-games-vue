<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
const games = router.getRoutes().filter(route => route.meta?.isGame)
</script>

<template>
  <h3>Games:</h3>
  <ul>
    <li v-for="route in games" :key="route.path">
      <router-link :to="route.path">{{ route.meta.description || route.name }}</router-link>
    </li>
  </ul>
</template>

<style scoped></style>
