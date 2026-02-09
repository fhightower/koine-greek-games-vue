<script setup lang="ts">
import { ref, computed } from "vue";

// todo: move this to utils
function getRandomInt(max: number) {
  return Math.floor(Math.random() * Math.floor(max));
}

const questions = ref([
  {
    q: "ἄνθρωπος",
    a: {
      genders: ["masculine"],
      number: "singular",
      cases: ["nominative"],
    },
  },
]);
const currentQuestionIndex = ref(getRandomInt(questions.value.length));

function getQuestion() {
  return questions.value[currentQuestionIndex.value].q;
}
</script>

<template>
  <h3>
    Select the gender, number, and case for this word:
    <b>{{ getQuestion() }}</b>
  </h3>
</template>

<style scoped>
.missed-answers {
  margin-top: 2rem;
}

.missed-answers summary {
  cursor: pointer;
  font-weight: bold;
}

.missed-answers ul {
  margin-top: 0.5rem;
  text-align: left;
}

.missed-answers li {
  margin-top: 2rem;
}
</style>
