# Immediate Retry on a Missed Translation

Date: 2026-07-24

## Problem

`TranslationGame` picks the next sentence at random and explicitly avoids repeating
the one just shown. A sentence graded "Missed it" is therefore the one sentence
guaranteed *not* to come next. The player logs the miss, sees the model translation
for a moment, and then the sentence disappears back into the pool. Nothing brings it
back while the correction is still fresh.

## Scope

In `TranslationGame` only — the Greek → English exercises — a sentence graded
"Missed it" becomes the next sentence, and keeps coming back until the player grades
it "I got it".

Out of scope: reworking missed questions into the queue on a delay rather than
immediately, and the grid-based games (`DefiniteArticles1`, `DeclensionFlashCards`,
`VerbVoice`, and the rest), which already let the player keep guessing until the
answer is found. Both remain in `todo`.

## Behavior

The retry repeats without limit. Missing a sentence four times in a row shows it four
more times; only "I got it" releases it. The player is never carried past a sentence
they have not yet claimed.

A banner above the Greek marks a repeat as deliberate:

> Try again — you missed this one.

Without it, a repeated sentence is indistinguishable from an unlucky random draw.

## Implementation

One new piece of state in `TranslationGame.vue`:

```ts
const retryIndex = ref<number | null>(null)
```

Because the retry repeats until correct, at most one sentence is ever pending, so a
single ref is sufficient. A queue would be the right shape for the deferred-requeue
todo, but nothing today would read past its first element.

Control flow:

| Event | Effect |
| --- | --- |
| `grade(false)` | Record the outcome, add to `missed`, set `retryIndex = currentIndex`, advance. |
| `grade(true)` | Record the outcome, set `retryIndex = null`, advance. |
| `nextQuestion()` | If `retryIndex !== null`, set `currentIndex` to it and skip the random draw. Otherwise draw at random as today. |
| `gameId` watcher | Clear `retryIndex` along with the other per-game state. |

The random branch keeps its existing "don't repeat the current index" loop. The retry
branch deliberately bypasses that loop — repeating is the whole point.

`attempt` and `revealed` reset on a retry exactly as they do on a fresh question, so
the player re-types the translation rather than editing the wrong one in place.

## Recording

Every graded attempt records, retries included. Missing a sentence three times before
getting it yields `{ seen: 4, correct: 1 }` and three miss-log rows. Each retry is a
real attempt at a question the player did not know, and the review page should show
that struggle rather than flatten it to a single event.

The in-component `missed` list is the one place that deduplicates. It is a study
aid — a `<details>` summary of what to go back over — so it keys on `greek` and holds
one entry per sentence no matter how many attempts it took. Its count reads as
"sentences to review", not "attempts failed".

## Testing

Added to `TranslationGame.test.ts`, which mounts the real component against real
`localStorage`. Tests use a fixture of several sentences, since a one-sentence pool
cannot distinguish a retry from the only available draw.

- Grading "Missed it" shows the same Greek next, and renders the retry banner.
- Missing that retry shows the same Greek a third time.
- Grading "I got it" on a retry clears the banner and moves to a different sentence.
- Grading "I got it" first time never shows the banner.
- Each attempt in a retry chain writes its own miss-log row, and the aggregate `seen`
  counts every attempt.
- The `missed` summary lists a repeatedly-missed sentence once.
- Switching `gameId` mid-retry clears the pending retry.
