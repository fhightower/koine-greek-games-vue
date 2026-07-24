<script setup lang="ts">
import { computed, ref } from "vue";
import { gameLabel } from "../utils/gameLabels";
import { MISS_LOG_LIMIT, clearMisses, loadMisses, type MissEntry } from "../utils/missLog";
import { clearAnswerStats } from "../utils/performanceStats";
import {
  buildProgressExport,
  exportFileName,
  importProgress,
} from "../utils/progressTransfer";

const misses = ref<MissEntry[]>(loadMisses());
const selectedGame = ref("all");
const notice = ref("");
const noticeIsError = ref(false);
const confirmingClear = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);

// Only games the player has actually missed something in are worth filtering by.
const gameOptions = computed(() => {
  const ids = [...new Set(misses.value.map((miss) => miss.gameId))];
  return ids.map((id) => ({ id, label: gameLabel(id) })).sort((a, b) => a.label.localeCompare(b.label));
});

const visibleMisses = computed(() =>
  selectedGame.value === "all"
    ? misses.value
    : misses.value.filter((miss) => miss.gameId === selectedGame.value),
);

function refresh() {
  misses.value = loadMisses();
  if (selectedGame.value !== "all" && !gameOptions.value.some((g) => g.id === selectedGame.value)) {
    selectedGame.value = "all";
  }
}

function say(message: string, isError = false) {
  notice.value = message;
  noticeIsError.value = isError;
}

function relativeTime(at: number): string {
  const seconds = Math.round((Date.now() - at) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  return new Date(at).toLocaleDateString();
}

function exportProgress() {
  const exportedAt = Date.now();
  const blob = new Blob([JSON.stringify(buildProgressExport(exportedAt), null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = exportFileName(exportedAt);
  // Firefox only follows anchors that are in the document, and revoking in the
  // same tick as the click can cancel the download in Safari.
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
  say(`Exported ${misses.value.length} misses.`);
}

async function onFileChosen(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) {
    return;
  }

  const result = importProgress(await file.text());
  input.value = ""; // let the same file be picked again

  if (!result.ok) {
    say(result.error, true);
    return;
  }

  refresh();
  const skipped = result.skipped > 0 ? `, ${result.skipped} skipped as unreadable` : "";
  say(`Imported ${result.imported} misses (${result.added} new)${skipped}.`);
}

function clearEverything() {
  clearMisses();
  clearAnswerStats();
  refresh();
  confirmingClear.value = false;
  say("Cleared all stored progress.");
}
</script>

<template>
  <main class="review">
    <header class="review__head">
      <h2 class="review__title">Missed answers</h2>
      <p class="review__count">
        {{ misses.length }} stored{{
          misses.length === MISS_LOG_LIMIT ? " — the log is full, so the oldest now drop off" : ""
        }}
      </p>
    </header>

    <div class="review__controls">
      <label class="review__filter">
        <span class="review__filter-label">Game</span>
        <select v-model="selectedGame">
          <option value="all">All games</option>
          <option v-for="game in gameOptions" :key="game.id" :value="game.id">
            {{ game.label }}
          </option>
        </select>
      </label>

      <div class="review__actions">
        <button class="btn" @click="exportProgress">Export</button>
        <button class="btn" @click="fileInput?.click()">Import</button>
        <input
          ref="fileInput"
          class="review__file"
          type="file"
          accept="application/json,.json"
          @change="onFileChosen"
        />
      </div>
    </div>

    <p v-if="notice" class="review__notice" :class="{ 'is-error': noticeIsError }">
      {{ notice }}
    </p>

    <p v-if="!misses.length" class="review__empty">
      Nothing missed yet. Play a game and anything you get wrong lands here.
    </p>

    <p v-else-if="!visibleMisses.length" class="review__empty">
      Nothing missed in this game.
    </p>

    <ol v-else class="misses">
      <li v-for="miss in visibleMisses" :key="`${miss.gameId}|${miss.question}|${miss.at}`" class="miss">
        <div class="miss__top">
          <span class="miss__question">{{ miss.question }}</span>
          <span class="miss__game">{{ gameLabel(miss.gameId) }}</span>
        </div>
        <dl class="miss__answers">
          <dt>you gave</dt>
          <dd class="miss__given">{{ miss.given || "—" }}</dd>
          <dt>correct</dt>
          <dd class="miss__correct">{{ miss.answer }}</dd>
        </dl>
        <time class="miss__time" :datetime="new Date(miss.at).toISOString()">
          {{ relativeTime(miss.at) }}
        </time>
      </li>
    </ol>

    <footer v-if="misses.length" class="review__foot">
      <button v-if="!confirmingClear" class="btn btn--quiet" @click="confirmingClear = true">
        Clear all
      </button>
      <template v-else>
        <span class="review__confirm">Delete every stored miss and count?</span>
        <button class="btn btn--danger" @click="clearEverything">Yes, clear</button>
        <button class="btn btn--quiet" @click="confirmingClear = false">Cancel</button>
      </template>
    </footer>
  </main>
</template>

<style scoped>
.review {
  max-width: 640px;
  margin: 0 auto;
  text-align: left;
}

.review__head {
  margin-bottom: 1.25rem;
}

.review__title {
  margin: 0;
  font-family: var(--font-display);
  font-size: 1.9rem;
  font-weight: 500;
}

.review__count {
  margin: 0.15rem 0 0;
  font-size: 0.9rem;
  color: var(--app-muted);
}

.review__controls {
  display: flex;
  flex-wrap: wrap;
  align-items: end;
  justify-content: space-between;
  gap: 0.75rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--app-line);
}

.review__filter {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.review__filter-label {
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--app-muted);
}

.review__filter select {
  padding: 0.4rem 0.5rem;
  font: inherit;
  font-size: 0.95rem;
  border: 1px solid var(--app-line);
  border-radius: 6px;
  background: #fffdf8;
  color: var(--app-text);
}

.review__actions {
  display: flex;
  gap: 0.5rem;
}

.review__file {
  display: none;
}

.btn {
  padding: 0.45rem 0.9rem;
  font: inherit;
  font-size: 0.95rem;
  background: #fffdf8;
  color: var(--app-text);
  border: 1px solid var(--app-line);
  border-radius: 6px;
  cursor: pointer;
}

.btn:hover {
  border-color: var(--accent);
}

.btn--quiet {
  background: none;
  color: var(--app-muted);
}

.btn--danger {
  border-color: var(--accent);
  color: var(--accent);
}

.review__notice {
  margin: 0.9rem 0 0;
  font-size: 0.9rem;
  color: var(--app-muted);
}

.review__notice.is-error {
  color: var(--accent);
}

.review__empty {
  margin: 2.5rem 0;
  text-align: center;
  font-style: italic;
  color: var(--app-muted);
}

.misses {
  list-style: none;
  margin: 1.25rem 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}

.miss {
  padding: 0.85rem 1rem;
  background: #fffdf8;
  border: 1px solid var(--app-line);
  border-radius: 10px;
}

.miss__top {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.5rem;
}

.miss__question {
  font-family: var(--font-display);
  font-size: 1.25rem;
}

.miss__game {
  font-size: 0.78rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--app-muted);
}

.miss__answers {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.15rem 0.6rem;
  margin: 0.6rem 0 0;
  font-size: 0.95rem;
}

.miss__answers dt {
  font-size: 0.78rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--app-muted);
  align-self: center;
}

.miss__answers dd {
  margin: 0;
}

.miss__given {
  color: var(--accent);
}

.miss__time {
  display: block;
  margin-top: 0.5rem;
  font-size: 0.78rem;
  color: var(--app-muted);
}

.review__foot {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--app-line);
}

.review__confirm {
  font-size: 0.9rem;
  color: var(--app-muted);
}
</style>
