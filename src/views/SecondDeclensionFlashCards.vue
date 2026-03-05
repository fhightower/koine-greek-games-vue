<script setup lang="ts">
import DeclensionFlashCards from "../components/DeclensionFlashCards.vue";
import { secondDeclensionCheatSheetEntries } from "../data/declensionEndingCheatSheetEntries";
import { secondDeclensionWords } from "../data/secondDeclensionWords";
</script>

<template>
  <DeclensionFlashCards
    gameId="second-declension-flash-cards"
    :words="secondDeclensionWords"
    :cheatSheetEntries="secondDeclensionCheatSheetEntries"
    cheatSheetTitle="Second Declension Endings"
  />
</template>
