import { describe, expect, test } from "vitest";
import { createQueue, current, grade, remaining, type FocusCard } from "./focusQueue";

function card(question: string): Omit<FocusCard, "streak"> {
  return { gameId: "verb-voice", question, answer: `${question}!` };
}

describe("focusQueue", () => {
  test("starts on the first card", () => {
    const queue = createQueue([card("a"), card("b")]);

    expect(current(queue)?.question).toBe("a");
    expect(remaining(queue)).toBe(2);
  });

  test("current is null and remaining is zero for an empty queue", () => {
    const queue = createQueue([]);

    expect(current(queue)).toBeNull();
    expect(remaining(queue)).toBe(0);
  });

  test("retires a card after two correct answers in a row", () => {
    let queue = createQueue([card("a"), card("b")]);

    queue = grade(queue, true); // a: streak 1, sent to back -> [b, a]
    expect(current(queue)?.question).toBe("b");

    queue = grade(queue, true); // b: streak 1, to back -> [a, b]
    queue = grade(queue, true); // a: streak 2, retired -> [b]
    expect(remaining(queue)).toBe(1);
    expect(current(queue)?.question).toBe("b");

    queue = grade(queue, true); // b: streak 2, retired -> []
    expect(remaining(queue)).toBe(0);
    expect(current(queue)).toBeNull();
  });

  test("a single card needs two corrects to clear", () => {
    let queue = createQueue([card("only")]);

    queue = grade(queue, true);
    expect(remaining(queue)).toBe(1);

    queue = grade(queue, true);
    expect(remaining(queue)).toBe(0);
  });

  test("a miss resets the streak so two fresh corrects are needed", () => {
    let queue = createQueue([card("only")]);

    queue = grade(queue, true); // streak 1
    queue = grade(queue, false); // streak back to 0
    expect(remaining(queue)).toBe(1);

    queue = grade(queue, true); // streak 1
    expect(remaining(queue)).toBe(1);
    queue = grade(queue, true); // streak 2, retired
    expect(remaining(queue)).toBe(0);
  });

  test("a missed card returns after a gap rather than immediately", () => {
    let queue = createQueue([card("a"), card("b"), card("c"), card("d"), card("e")]);

    queue = grade(queue, false); // a missed, reinserted 3 back
    // Front is no longer 'a'; 'a' comes back within the next few questions.
    expect(current(queue)?.question).not.toBe("a");

    // Walk far enough forward that the reinserted card must have surfaced.
    const upcoming = [current(queue)?.question];
    for (let i = 0; i < 4; i += 1) {
      queue = grade(queue, true);
      upcoming.push(current(queue)?.question);
    }
    expect(upcoming).toContain("a");
  });

  test("a missed card in a short queue simply goes to the back", () => {
    let queue = createQueue([card("a"), card("b")]);

    queue = grade(queue, false); // a missed -> [b, a]
    expect(current(queue)?.question).toBe("b");
  });

  test("grade returns a new queue and leaves the old one untouched", () => {
    const queue = createQueue([card("a"), card("b")]);
    grade(queue, true);

    expect(current(queue)?.question).toBe("a");
    expect(remaining(queue)).toBe(2);
  });
});
