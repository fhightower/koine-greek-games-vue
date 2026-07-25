# Focus on Missed Questions

Date: 2026-07-24

Closes issue #2.

## Problem

Missed answers are stored and shown on `/review`, but the only way to practice them
is to replay a whole game and hope the ones you got wrong come around. There is no way
to drill *just* your misses, for one game or several.

## Scope

A focus drill at `/focus` that re-asks the player's missed questions for a chosen set
of games. Launched from the Review page, which gains a multi-select panel. Reveal and
self-grade, the same interaction as `TranslationGame`. A question retires after two
correct answers in a row. Nothing the drill does is written to the miss log or the
aggregate stats — the session is entirely in memory.

Out of scope: rebuilding each game's original input UI inside the drill. Every game
already stores its question and correct answer as plain text, so one reveal / self-grade
screen drills all game types uniformly.

## Why self-grade works for every game

`recordQuestionOutcome` writes a `MissEntry` with `question` and `answer` as strings,
for all games — grids, parse games, and translation alike. The drill needs nothing
game-specific: it shows `question`, reveals `answer`, and the player grades themselves.
A grid game's answer reads as text like "fem. nom. pl."; a translation reads as the
English. Both are legible on their own.

## Data source

The drill reads the existing miss log (`utils/missLog.ts`). A new pure helper:

```ts
// Distinct missed questions for the given games, newest miss first.
// One entry per gameId|question, carrying its correct answer.
missedQuestions(gameIds: string[]): { gameId: string; question: string; answer: string }[]
```

Dedupe is by `gameId|question`: a question missed five times is one card. The most
recent miss supplies the displayed `answer`, in case a game's answer text ever changed.

## Queue logic — `utils/focusQueue.ts`

Pure, no DOM, unit-tested in isolation. A card is `{ gameId, question, answer, streak }`.

```ts
createQueue(cards): FocusQueue      // streak 0 for each, order preserved
current(queue): Card | null         // front card, or null when done
grade(queue, gotIt): FocusQueue     // returns the next queue state
remaining(queue): number            // distinct cards not yet retired
```

`grade` rules:

- **Correct** → `streak + 1`. At `streak === 2` the card retires (leaves the queue).
  Otherwise it moves to the back, so the second correct is spaced from the first.
- **Missed** → `streak` resets to 0 and the card reinserts a few slots back (default 3,
  or the end if the queue is shorter). It returns soon, but not so immediately that the
  player only parrots the answer they just saw.

The queue is immutable-in, immutable-out so the component holds one ref and reassigns.

## Route and component — `views/Focus.vue`, `/focus`

Query parameter `games` selects the set: a comma-separated list of game ids, or `all`.

- On mount: parse `games`, call `missedQuestions`, build the queue.
- Empty result (no `games`, unknown ids, or none missed) → empty state with a link back
  to `/review`.
- Drilling: game label (from `gameLabels.ts`) and question, a "Reveal answer" button,
  then the answer with "I got it" / "Missed it". A small progress line shows remaining.
- Queue empty → done state, "Cleared N questions", link back to `/review`.

Nothing is persisted. Reloading `/focus` restarts the session from the current miss log.

## Review page entry point — `views/Review.vue`

A "Focus" panel above the miss list:

- One row per game the player has misses in (reusing `gameOptions`), each with its miss
  count and a checkbox. A "Select all" toggle.
- A **Focus on N questions** button, disabled until at least one game is checked, where
  N is the distinct-question count across the checked games. It navigates to
  `/focus?games=<ids>`.

The existing single-select list filter is left as is; the panel is a separate control.

## Testing

- `missLog.test.ts` — `missedQuestions`: filter by game, dedupe by question, answer
  comes from the newest miss, empty for unknown ids.
- `focusQueue.test.ts` — retire after two consecutive corrects, streak resets on a miss,
  missed card returns after the gap, `remaining` counts distinct live cards, a
  correct-then-missed-then-two-correct sequence retires correctly.
- `Focus.test.ts` — mounts with a seeded miss log, drills a small queue, asserts a card
  retires after two corrects and reappears after a miss, and that the empty and done
  states render. Asserts the miss log is unchanged after drilling.
