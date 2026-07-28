# Flagging a Bad Answer

Date: 2026-07-27

Closes [#7](https://github.com/fhightower/koine-greek-games-vue/issues/7).

## Problem

Answer data is hand-entered in `src/data/`, and glosses are held to Machen's wording.
Mistakes and disagreements are both likely, and a player who spots one has nowhere to
report it. Players are anonymous visitors to koine.hightower.space, most of whom have
no GitHub account.

## Approach

The site is static: there is no server to receive a report, and no credential can be
shipped in the bundle. Anything that submits on the player's behalf would need a
GitHub token in the JavaScript, which would hand every visitor write access to the
repository. So capture and delivery are split:

- **Capture is local and always succeeds.** Flagging writes to localStorage. No
  network, no account, works offline, instant.
- **Delivery is a deliberate click.** After a flag is saved, the player is offered a
  prefilled GitHub issue link and a copy-to-clipboard fallback. Both require the
  player to act; nothing is transmitted automatically.

This means a flag from a player who never clicks through stays invisible. That is
accepted for now: the flags are stored, so a later change can POST them to a form
endpoint retroactively without losing anything.

## Data

New localStorage key `koine:flag-log:v1`, owned by `src/utils/flagLog.ts`:

```ts
type FlagReason = "wrong-answer" | "typo" | "should-count" | "other"

type FlagEntry = {
  gameId: string    // 'verb-voice'
  question: string  // 'λαμβάνομεν τὸ δῶρον'
  answer: string    // the expected answer the player is disputing
  reason: FlagReason
  note: string      // optional free text, trimmed, capped at FLAG_NOTE_LIMIT
  at: number        // epoch ms
}
```

`should-count` ("my answer should have counted") is the reason that matters most for
the self-graded games — `TranslationGame` and the `Focus` drill — where the dispute is
about an acceptable alternative rather than an outright error.

The log holds at most `FLAG_LOG_LIMIT` (200) entries, newest first. Entries dedupe on
`gameId|question|reason`, keeping the newest, so re-flagging the same complaint updates
in place instead of stacking up. Notes cap at 280 characters, which keeps both
localStorage and the generated issue URL bounded.

## Modules

| File | Responsibility |
| --- | --- |
| `utils/flagLog.ts` | `recordFlag`, `loadFlags`, `removeFlag`, `clearFlags`, `mergeFlags`, cap and dedupe. |
| `utils/flagReport.ts` | `flagReportTitle`, `flagReportText`, `flagIssueUrl`. Pure string building, no DOM. |
| `components/FlagQuestion.vue` | The in-game flag control and its post-save delivery offer. |
| `utils/progressTransfer.ts` | Gains `flags` in the export file and its merge on import. |
| `views/Review.vue` | A "Flagged questions" section listing pending flags. |

`flagReportText` is the single wording used by both delivery paths, so the clipboard
copy and the GitHub issue body are identical.

## The flag control

`FlagQuestion.vue` takes `gameId`, `question`, and `answer`, and renders in three
states:

1. **Closed** — a quiet `⚑ Something wrong with this question?` button.
2. **Open** — the four reasons as radios, an optional note, `Save flag` and `Cancel`.
3. **Saved** — a confirmation that the flag is stored on this device, plus
   `Report on GitHub` (opens a prefilled issue in a new tab) and `Copy report`.

The control resets to closed whenever the `question` prop changes, so a flag opened on
one question never carries into the next.

**It renders only after the answer is revealed.** Before the reveal it would both leak
that a question is contested and sit next to the answer buttons as a misclick target.

Placement per game shape:

- `TranslationGame`, `Focus` — inside the revealed-answer block, below the grade buttons.
- `VerbVoice`, `Prepositions`, `PersonNumberParseGame` — inside the feedback block, after `Next`.
- `AnswerFooter` (used by `DefiniteArticles1`, `DeclensionFlashCards`, `Demonstratives`,
  `AdjectiveAgathos`) — after the correct-answer paragraph. Wiring it here covers four
  views at once, so `AnswerFooter` gains `gameId` and `question` props.

## Delivery

`flagIssueUrl` builds:

```
https://github.com/fhightower/koine-greek-games-vue/issues/new?title=…&body=…
```

Both components are `encodeURIComponent`-escaped. No `labels` parameter — GitHub
ignores it for anyone without write access, which is every player.

The body carries the game label (via `gameLabels`), the raw `gameId`, the question, the
expected answer, the reason, and the note. The link opens with `target="_blank"` and
`rel="noopener noreferrer"`.

`Copy report` uses `navigator.clipboard.writeText`. Where the clipboard API is missing
or refused, the button reports the failure rather than silently doing nothing.

## Review page

A `Flagged questions` section, shown only when flags exist, lists each flag with its
game, question, expected answer, reason, note, and relative time. Each row carries the
same `Report on GitHub` and `Copy report` actions, plus `Remove` to drop that flag.

`Clear all` in the review footer clears flags along with misses and counts. Its confirm
wording changes to say so.

## Transfer

`ProgressFile` gains a `flags` array. `PROGRESS_FILE_VERSION` stays at 1: a file
written before this change simply has no `flags` key, and import treats a missing or
malformed array as empty. Flags merge by the same dedupe rule as the log, so importing
the same file twice adds nothing.

## Testing

- `flagLog.test.ts` — round-trip, newest-first ordering, dedupe on repeated flags, cap
  enforcement, corrupt-JSON tolerance, `removeFlag` targeting one entry, merge dedupe.
- `flagReport.test.ts` — body contains game label and all fields, note omitted when
  empty, URL escaping of Greek text and newlines.
- `FlagQuestion.test.ts` — the three states, that saving writes the log, that changing
  the question resets to closed, that the GitHub href matches `flagIssueUrl`.
- `Review.test.ts` — flags render, `Remove` drops one, `Clear all` clears flags.
- `progressTransfer.test.ts` — flags survive export/import, a file with no `flags` key
  still imports.

## Out of scope

Automatic submission of any kind, a form-endpoint backend, rate limiting, and flagging
a specific word inside a phrase.
