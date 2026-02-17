<script setup lang="ts">
import { computed, ref } from "vue";
import type { Combination } from "../types/nominalForms";

type CheatSheetEntry = {
  question: string;
  combos: Combination[];
};

const props = withDefaults(
  defineProps<{
    title?: string;
    buttonLabel?: string;
    entries: CheatSheetEntry[];
  }>(),
  {
    title: "Cheat Sheet",
    buttonLabel: "Open Cheat Sheet",
  }
);

const isOpen = ref(false);
const genders = ["masculine", "feminine", "neuter"];
const numbers = ["singular", "plural"];
const caseOrder = ["nominative", "genitive", "dative", "accusative", "vocative"];

const cases = computed(() => {
  const availableCases = new Set(
    props.entries.flatMap((entry) => entry.combos.map((combo) => combo.case_))
  );
  return caseOrder.filter((case_) => availableCases.has(case_));
});

const formsByCombo = computed(() => {
  const map = new Map<string, string[]>();

  for (const entry of props.entries) {
    for (const combo of entry.combos) {
      const key = `${combo.gender}-${combo.number}-${combo.case_}`;
      const current = map.get(key) ?? [];
      if (!current.includes(entry.question)) {
        current.push(entry.question);
      }
      map.set(key, current);
    }
  }

  return map;
});

function openModal() {
  isOpen.value = true;
}

function closeModal() {
  isOpen.value = false;
}

function getForms(gender: string, number: string, case_: string) {
  return formsByCombo.value.get(`${gender}-${number}-${case_}`) ?? [];
}
</script>

<template>
  <button class="button" @click="openModal">{{ buttonLabel }}</button>

  <Teleport to="body">
    <div v-if="isOpen" class="overlay" @click.self="closeModal">
      <section class="modal" role="dialog" aria-modal="true" :aria-label="title">
        <header class="modal-header">
          <h3>{{ title }}</h3>
          <button class="button close" @click="closeModal" aria-label="Close cheat sheet">Close</button>
        </header>

        <table class="cheatsheet-table">
          <tbody>
            <tr v-for="case_ in cases" :key="case_">
              <template v-for="(gender, gi) in genders" :key="gender">
                <td v-if="gi > 0" class="gender-gap"></td>
                <td v-for="number in numbers" :key="`${gender}-${number}`">
                  <div class="cell" :class="[gender, number, case_]">
                    <template v-if="getForms(gender, number, case_).length">
                      {{ getForms(gender, number, case_).join(" / ") }}
                    </template>
                    <template v-else>—</template>
                  </div>
                </td>
              </template>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  </Teleport>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: grid;
  place-items: center;
  padding: 1rem;
  z-index: 1000;
}

.modal {
  width: min(900px, 100%);
  max-height: 85vh;
  overflow-y: auto;
  background: var(--app-bg);
  color: var(--app-text);
  border: 1px solid rgba(128, 128, 128, 0.35);
  border-radius: 0.75rem;
  padding: 1rem;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.close {
  white-space: nowrap;
}

.cheatsheet-table {
  margin-top: 1rem;
  width: 100%;
}

.cell {
  width: 7rem;
  min-height: 5rem;
  display: grid;
  place-items: center;
  text-align: center;
  border-radius: 0.25rem;
  padding: 0.6rem 0.4rem;
}

.gender-gap {
  width: 0.25rem;
}
</style>
