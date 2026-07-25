/**
 * The in-memory drill queue for the focus session. Pure and immutable: every
 * transition returns a fresh queue, so the component holds one ref and reassigns.
 * Nothing here touches localStorage — a focus session records nothing.
 */

export type FocusCard = {
  gameId: string;
  question: string;
  answer: string;
  /** Consecutive correct answers so far. Two in a row retires the card. */
  streak: number;
};

export type FocusQueue = {
  cards: FocusCard[];
};

/** Correct answers in a row needed to retire a card. */
const RETIRE_AT = 2;

/** How many cards a missed card is placed behind, when the queue is long enough. */
const MISS_GAP = 3;

export function createQueue(cards: Omit<FocusCard, "streak">[]): FocusQueue {
  return { cards: cards.map((card) => ({ ...card, streak: 0 })) };
}

export function current(queue: FocusQueue): FocusCard | null {
  return queue.cards[0] ?? null;
}

export function remaining(queue: FocusQueue): number {
  return queue.cards.length;
}

export function grade(queue: FocusQueue, gotIt: boolean): FocusQueue {
  const [front, ...rest] = queue.cards;
  if (!front) {
    return queue;
  }

  if (gotIt) {
    const streak = front.streak + 1;
    if (streak >= RETIRE_AT) {
      return { cards: rest };
    }
    // Spaced from this correct answer, so the second correct is not back-to-back.
    return { cards: [...rest, { ...front, streak }] };
  }

  // Missed: back to a cold streak, reinserted a few slots back so it returns soon
  // without the answer still on screen. In a short queue that is simply the end.
  const reset = { ...front, streak: 0 };
  const at = Math.min(MISS_GAP, rest.length);
  const cards = [...rest];
  cards.splice(at, 0, reset);
  return { cards };
}
