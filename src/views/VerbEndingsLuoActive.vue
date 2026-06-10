<script setup lang="ts">
import { computed } from 'vue'
import PersonNumberParseGame from '../components/PersonNumberParseGame.vue'
import { luoActiveForms } from '../data/luoActiveForms'

const forms = computed(() =>
  luoActiveForms.map(f => ({
    form: f.form,
    ending: f.ending,
    person: f.person,
    number: f.number,
    glossLines: [f.gloss],
  })),
)
</script>

<template>
  <PersonNumberParseGame
    gameId="luo-active-endings"
    prompt="Parse this present active form of λύω"
    :forms="forms"
  />
</template>
