<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  selectedAnswers: Set<string>;
  includeVocative?: boolean;
}>();

const emit = defineEmits<{
  select: [gender: string, number: string, case_: string];
}>();

const genders = ["masculine", "feminine", "neuter"];
const numbers = ["singular", "plural"];
const baseCases = ["nominative", "genitive", "dative", "accusative"];
const cases = computed(() =>
  props.includeVocative ? [...baseCases, "vocative"] : baseCases
);

function isSelected(selectedAnswers: Set<string>, gender: string, number: string, case_: string) {
  return selectedAnswers.has(`${gender}-${number}-${case_}`);
}
</script>

<template>
  <table>
    <tbody>
      <tr v-for="case_ in cases" :key="case_">
        <template v-for="(gender, gi) in genders" :key="gender">
          <td v-if="gi > 0" class="gender-gap"></td>
          <td v-for="number in numbers" :key="number">
            <button
              class="button answer"
              :class="[gender, case_, number, { selected: isSelected(selectedAnswers, gender, number, case_) }]"
              :disabled="isSelected(selectedAnswers, gender, number, case_)"
              @click="emit('select', gender, number, case_)"
            >
              {{ gender }}<br />{{ number }}<br />{{ case_ }}
            </button>
          </td>
        </template>
      </tr>
    </tbody>
  </table>
</template>

<style scoped>
table {
  width: 100%;
}

.button.answer {
  width: 7rem;
  height: 7rem;
}

.button.answer.selected {
  outline: 3px solid #333;
  outline-offset: -3px;
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.3);
  opacity: 0.8;
}

.gender-gap {
  width: 0.25rem;
}
</style>
