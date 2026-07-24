# Retrying and Reviewing Missed Translations

Date: 2026-07-24

## Problem

`TranslationGame` picks the next sentence at random and explicitly avoids repeating
the one just shown. A sentence graded "Missed it" is therefore the one sentence
guaranteed *not* to come next. The player logs the miss, sees the model translation
for a moment, and then the sentence disappears back into the pool. Nothing brings it
back while the correction is still fresh, and nothing checks later whether the
correction stuck.

## Scope

In `TranslationGame` only — the Greek → English exercises. A missed sentence is
retried immediately until the player claims it, then returns three more times at
widening intervals.

Out of scope: the grid-based games (`DefiniteArticles1`, `DeclensionFlashCards`,
`VerbVoice`, and the rest), which already let the player keep guessing until the
answer is found, and clicking words within a phrase to mark what was wrong. Both
remain in `todo`.

## Behavior

**Immediate retry.** A sentence graded "Missed it" becomes the next question and
repeats without limit. Missing it four times in a row shows it four more times; only
"I got it" releases it. The player is never carried past a sentence they have not yet
claimed.

**Spaced returns.** Claiming a retried sentence schedules it to reappear 2, 5, and 10
questions later. Widening gaps are what turn a correction into recall; a sentence the
player got wrong once and then saw only once more has not really been tested.

A sentence answered correctly on the first try schedules nothing — there is nothing to
reinforce.

**Missing a scheduled return restarts the whole cycle.** Any returns still pending for
that sentence are dropped, it is retried until claimed, and a fresh 2/5/10 schedule is
laid down. A sentence still being missed on its third showing is not partway through
learning; it is unlearned.

Two banners above the Greek distinguish a deliberate repeat from an unlucky draw:

> Try again — you missed this one.

> Back again — you missed this earlier.

## Implementation

State added to `TranslationGame.vue`:

```ts
const REVIEW_SPACING = [2, 5, 10]
type ScheduledReview = { index: number; dueIn: number }

const retryIndex = ref<number | null>(null)   // repeats until claimed
const reviews = ref<ScheduledReview[]>([])    // spaced returns, counting down
const showingReview = ref(false)
```

The two are kept separate because they behave differently: the retry blocks progress,
the reviews wait their turn. `retrying` is derived — `retryIndex === currentIndex` —
which is unambiguous because a pending retry is always the question on screen.

Control flow:

| Event | Effect |
| --- | --- |
| `grade(false)` | Record, add to `missed`, drop pending reviews for this index, set `retryIndex = currentIndex`, advance. |
| `grade(true)` while retrying | Record, schedule 2/5/10 for this index, clear `retryIndex`, advance. |
| `grade(true)` otherwise | Record, advance. Nothing scheduled. |
| `nextQuestion()` | Serve `retryIndex` if set. Otherwise tick every `dueIn` down one, serve the first review at `dueIn <= 0`, else draw at random as today. |
| `gameId` watcher | Clear `retryIndex`, `reviews`, and `showingReview` with the rest of the per-game state. |

A blocked retry deliberately does *not* tick the countdowns. However many attempts a
sentence takes, the whole episode occupies one slot in the spacing — otherwise a
player who struggles badly would burn through the 2/5/10 gaps without seeing anything
in between.

The random branch keeps its existing "don't repeat the current index" loop. Both the
retry and review branches bypass it — repeating is the point.

`attempt` and `revealed` reset on every advance, retry and review included, so the
player re-types the translation rather than editing the wrong one in place.

The queue is self-limiting: a sentence's pending returns are dropped before it is
rescheduled, so `reviews` never exceeds three entries per distinct sentence.

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
- A claimed sentence returns after exactly one other question, under the review banner.
- Three returns are scheduled per miss, and none for a first-try correct answer.
- Missing a scheduled return yields three fresh returns, not the two left over.
- Switching `gameId` clears the pending returns.

Scheduled returns are counted by the review banner rather than by matching the Greek,
since a random draw can land on the same sentence by chance and would make the count
flaky. The suite was run repeatedly to confirm the randomness does not leak into the
assertions.
