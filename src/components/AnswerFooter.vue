<script setup lang="ts">
import type { Answer, Combination, MissedAnswer } from "../types/nominalForms";

const props = defineProps<{
  correctAnswer: Answer | null;
  correctCombinations: Combination[];
  message: string;
  missedAnswers: MissedAnswer[];
}>();

const emit = defineEmits<{
  nextQuestion: [];
}>();
</script>

<template>
  <div>
    <br />
    <template v-if="correctAnswer">
      <p>
        Correct! This word is
        <template v-for="(combo, i) in correctCombinations" :key="i">
          <template
            v-if="
              correctCombinations.length > 2 &&
              i > 0 &&
              i < correctCombinations.length - 1
            "
            >,
          </template>
          <template
            v-if="
              correctCombinations.length > 2 &&
              i === correctCombinations.length - 1
            "
            >, and
          </template>
          <template v-if="correctCombinations.length === 2 && i === 1">
            and
          </template>
          <span
            class="correctAnswer"
            :class="[combo.gender, combo.case_, combo.number]"
          >
            {{ combo.gender }} {{ combo.number }} {{ combo.case_ }}
          </span>
        </template>
      </p>
      <br />
      <button class="button" @click="emit('nextQuestion')">Next ></button>
    </template>
    <template v-else>
      {{ message }}
    </template>
  </div>

  <details v-if="missedAnswers.length" class="missed-answers">
    <summary>Missed answers ({{ missedAnswers.length }})</summary>
    <br />
    <ul>
      <li v-for="(entry, i) in missedAnswers" :key="i">
        <b>{{ entry.question }}</b> —
        <template v-for="(combo, j) in entry.combos" :key="j">
          <template v-if="j > 0">, </template>
          <span
            class="correctAnswer"
            :class="[combo.gender, combo.case_, combo.number]"
          >
            {{ combo.gender }} {{ combo.number }} {{ combo.case_ }}
          </span>
        </template>
      </li>
    </ul>
  </details>
</template>

<style scoped>
.correctAnswer {
  border-radius: 0.2rem;
  padding: 1rem;
}

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
