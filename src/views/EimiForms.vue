<script setup lang="ts">
import { computed } from 'vue'
import PersonNumberParseGame from '../components/PersonNumberParseGame.vue'
import { eimiForms } from '../data/eimiForms'

const forms = computed(() =>
  eimiForms.map(f => ({
    form: f.form,
    person: f.person,
    number: f.number,
    glossLines: [f.gloss],
  })),
)
</script>

<template>
  <PersonNumberParseGame
    gameId="eimi-forms"
    prompt="Parse this present indicative form of εἰμί"
    :forms="forms"
  />
</template>
