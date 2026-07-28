<script setup lang="ts">
import { ref, watch } from "vue";
import {
  FLAG_NOTE_LIMIT,
  FLAG_REASONS,
  recordFlag,
  type FlagEntry,
  type FlagReason,
} from "../utils/flagLog";
import { flagIssueUrl, flagReportText } from "../utils/flagReport";

const props = defineProps<{
  gameId: string;
  question: string;
  /** The expected answer, as the player was just shown it. */
  answer: string;
}>();

type Stage = "closed" | "open" | "saved";

const stage = ref<Stage>("closed");
const reason = ref<FlagReason>(FLAG_REASONS[0].value);
const note = ref("");
const saved = ref<FlagEntry | null>(null);
const copyNotice = ref("");

function open() {
  stage.value = "open";
}

function close() {
  stage.value = "closed";
  reason.value = FLAG_REASONS[0].value;
  note.value = "";
  saved.value = null;
  copyNotice.value = "";
}

function save() {
  const flag: FlagEntry = {
    gameId: props.gameId,
    question: props.question,
    answer: props.answer,
    reason: reason.value,
    note: note.value,
    at: Date.now(),
  };
  // Keep what the log stored, not what was typed, so the report offered matches the
  // trimmed and capped note that was actually kept.
  saved.value = recordFlag(flag);
  stage.value = "saved";
}

async function copyReport() {
  if (!saved.value) {
    return;
  }

  const text = flagReportText(saved.value);
  try {
    await navigator.clipboard.writeText(text);
    copyNotice.value = "Report copied.";
  } catch {
    copyNotice.value = "Copying failed — your browser blocked the clipboard.";
  }
}

// A flag belongs to the question it was opened on; the next question starts clean.
watch(() => props.question, close);
</script>

<template>
  <div class="flag">
    <button v-if="stage === 'closed'" class="flag__open" @click="open">
      ⚑ Something wrong with this question?
    </button>

    <div v-else-if="stage === 'open'" class="flag__form">
      <p class="flag__legend">What is wrong with it?</p>
      <label v-for="option in FLAG_REASONS" :key="option.value" class="flag__reason">
        <input type="radio" :value="option.value" v-model="reason" />
        <span>{{ option.label }}</span>
      </label>

      <textarea
        v-model="note"
        class="flag__note"
        rows="2"
        :maxlength="FLAG_NOTE_LIMIT"
        placeholder="Anything to add? (optional)"
      ></textarea>

      <div class="flag__buttons">
        <button class="flag__btn flag__btn--save" @click="save">Save flag</button>
        <button class="flag__btn" @click="close">Cancel</button>
      </div>
    </div>

    <div v-else class="flag__done">
      <p class="flag__saved">
        Flagged, and saved on this device. Nothing was sent — send it along if you would
        like it fixed.
      </p>
      <div class="flag__buttons">
        <a
          v-if="saved"
          class="flag__btn flag__send"
          :href="flagIssueUrl(saved)"
          target="_blank"
          rel="noopener noreferrer"
        >
          Report on GitHub
        </a>
        <button class="flag__btn" @click="copyReport">Copy report</button>
        <button class="flag__btn" @click="close">Done</button>
      </div>
      <p v-if="copyNotice" class="flag__notice">{{ copyNotice }}</p>
    </div>
  </div>
</template>

<style scoped>
.flag {
  margin-top: 1.75rem;
  text-align: left;
  font-size: 0.9rem;
}

.flag__open {
  padding: 0.3rem 0;
  background: none;
  border: none;
  font: inherit;
  color: var(--app-muted);
  text-decoration: underline;
  text-underline-offset: 3px;
  cursor: pointer;
}

.flag__open:hover {
  color: var(--accent);
}

.flag__form,
.flag__done {
  padding: 0.9rem 1rem 1rem;
  background: #fffdf8;
  border: 1px solid var(--app-line);
  border-radius: 10px;
}

.flag__legend {
  margin: 0 0 0.6rem;
  font-size: 0.78rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--app-muted);
}

.flag__reason {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.2rem 0;
  cursor: pointer;
}

.flag__note {
  width: 100%;
  box-sizing: border-box;
  margin-top: 0.7rem;
  padding: 0.5rem 0.6rem;
  font: inherit;
  font-size: 0.9rem;
  line-height: 1.45;
  color: var(--app-text);
  background: #fff;
  border: 1px solid var(--app-line);
  border-radius: 8px;
  resize: vertical;
}

.flag__note:focus {
  outline: none;
  border-color: var(--accent);
}

.flag__buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.8rem;
}

.flag__btn {
  padding: 0.4rem 0.8rem;
  font: inherit;
  font-size: 0.88rem;
  color: var(--app-text);
  background: #fffdf8;
  border: 1px solid var(--app-line);
  border-radius: 6px;
  text-decoration: none;
  cursor: pointer;
}

.flag__btn:hover {
  border-color: var(--accent);
}

.flag__btn--save {
  border-color: var(--accent);
  color: var(--accent);
}

.flag__saved {
  margin: 0;
  line-height: 1.5;
  color: var(--app-muted);
}

.flag__notice {
  margin: 0.6rem 0 0;
  font-size: 0.85rem;
  color: var(--app-muted);
}
</style>
