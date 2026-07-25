<script setup lang="ts">
import { computed, ref } from "vue";
import { gameLabel } from "../utils/gameLabels";
import {
  MISS_LOG_LIMIT,
  clearMisses,
  loadMisses,
  missedQuestions,
  summarizeMisses,
  type MissEntry,
} from "../utils/missLog";
import { clearAnswerStats } from "../utils/performanceStats";
import { relativeTime } from "../utils/relativeTime";
import {
  buildProgressExport,
  exportFileName,
  importProgress,
} from "../utils/progressTransfer";

const misses = ref<MissEntry[]>(loadMisses());
const selectedGame = ref("all");
const focusPick = ref<string[]>([]);
const notice = ref("");
const noticeIsError = ref(false);
const confirmingClear = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);

// Only games the player has actually missed something in are worth filtering by.
const gameOptions = computed(() => {
  const ids = [...new Set(misses.value.map((miss) => miss.gameId))];
  return ids.map((id) => ({ id, label: gameLabel(id) })).sort((a, b) => a.label.localeCompare(b.label));
});

// Each game the player can focus on, with the number of distinct questions the drill
// would ask — a question missed repeatedly counts once.
const focusGames = computed(() =>
  gameOptions.value.map((game) => ({ ...game, count: missedQuestions([game.id]).length })),
);

const allFocused = computed(
  () => focusGames.value.length > 0 && focusPick.value.length === focusGames.value.length,
);

const focusCount = computed(() => missedQuestions(focusPick.value).length);

// Sorted so the same selection always produces the same link, whatever order the
// boxes were ticked in.
const focusHref = computed(() => `#/focus?games=${[...focusPick.value].sort().join(",")}`);

function toggleAllFocus(event: Event) {
  const checked = (event.target as HTMLInputElement).checked;
  focusPick.value = checked ? focusGames.value.map((game) => game.id) : [];
}

const visibleMisses = computed(() =>
  selectedGame.value === "all"
    ? misses.value
    : misses.value.filter((miss) => miss.gameId === selectedGame.value),
);

// One row per question, most recent attempt shown, repeats folded into a count.
const missRows = computed(() => summarizeMisses(visibleMisses.value));

function refresh() {
  misses.value = loadMisses();
  if (selectedGame.value !== "all" && !gameOptions.value.some((g) => g.id === selectedGame.value)) {
    selectedGame.value = "all";
  }
  // Drop any focus picks whose game no longer has a miss (after a clear or import).
  focusPick.value = focusPick.value.filter((id) => gameOptions.value.some((g) => g.id === id));
}

function say(message: string, isError = false) {
  notice.value = message;
  noticeIsError.value = isError;
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

    <section v-if="focusGames.length" class="focus-panel">
      <div class="focus-panel__head">
        <h3 class="focus-panel__title">Focus on missed questions</h3>
        <label class="focus-all">
          <input type="checkbox" :checked="allFocused" @change="toggleAllFocus" />
          Select all
        </label>
      </div>

      <ul class="focus-games">
        <li v-for="game in focusGames" :key="game.id" class="focus-game">
          <label>
            <input type="checkbox" v-model="focusPick" :value="game.id" />
            <span class="focus-game__label">{{ game.label }}</span>
            <span class="focus-game__count">{{ game.count }}</span>
          </label>
        </li>
      </ul>

      <a v-if="focusPick.length" class="btn focus-launch" :href="focusHref">
        Focus on {{ focusCount }} question{{ focusCount === 1 ? "" : "s" }}
      </a>
    </section>

    <p v-if="!misses.length" class="review__empty">
      Nothing missed yet. Play a game and anything you get wrong lands here.
    </p>

    <p v-else-if="!visibleMisses.length" class="review__empty">
      Nothing missed in this game.
    </p>

    <ol v-else class="misses">
      <li v-for="miss in missRows" :key="`${miss.gameId}|${miss.question}`" class="miss">
        <div class="miss__top">
          <span class="miss__question">{{ miss.question }}</span>
          <span class="miss__game">{{ gameLabel(miss.gameId) }}</span>
        </div>
        <p v-if="miss.count > 1" class="miss__count">missed {{ miss.count }}×</p>
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

.focus-panel {
  margin: 1.25rem 0 0;
  padding: 1rem 1.1rem 1.2rem;
  background: #fffdf8;
  border: 1px solid var(--app-line);
  border-radius: 10px;
}

.focus-panel__head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.5rem;
}

.focus-panel__title {
  margin: 0;
  font-family: var(--font-display);
  font-size: 1.15rem;
  font-weight: 500;
}

.focus-all {
  font-size: 0.85rem;
  color: var(--app-muted);
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  cursor: pointer;
}

.focus-games {
  list-style: none;
  margin: 0.85rem 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.focus-game label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.3rem 0;
  cursor: pointer;
}

.focus-game__label {
  flex: 1;
}

.focus-game__count {
  font-size: 0.8rem;
  color: var(--app-muted);
  font-variant-numeric: tabular-nums;
}

.focus-launch {
  display: inline-block;
  margin-top: 1rem;
  text-decoration: none;
  border-color: var(--accent);
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

.miss__count {
  margin: 0.35rem 0 0;
  font-size: 0.8rem;
  letter-spacing: 0.04em;
  color: var(--accent);
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
