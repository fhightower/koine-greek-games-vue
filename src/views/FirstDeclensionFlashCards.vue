<script setup lang="ts">
import DeclensionFlashCards from "../components/DeclensionFlashCards.vue";
import { firstDeclensionCheatSheetEntries } from "../data/declensionEndingCheatSheetEntries";
import { firstDeclensionWords } from "../data/firstDeclensionWords";
</script>

<template>
  <DeclensionFlashCards
    gameId="first-declension-flash-cards"
    :words="firstDeclensionWords"
    :cheatSheetEntries="firstDeclensionCheatSheetEntries"
    cheatSheetTitle="First Declension Endings"
  />
</template>
