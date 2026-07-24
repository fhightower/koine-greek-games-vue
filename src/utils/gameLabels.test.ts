import { describe, expect, test } from "vitest";
import { gameLabel } from "./gameLabels";

describe("gameLabel", () => {
  test("names a grammar game", () => {
    expect(gameLabel("definite-articles-1")).toBe("Definite Articles");
  });

  test("names a translation lesson from the lesson data", () => {
    expect(gameLabel("lesson-3-translation")).toBe("Lesson III — Translation");
  });

  test("falls back to the raw id when the game is unknown", () => {
    expect(gameLabel("game-added-after-this-map")).toBe("game-added-after-this-map");
  });
});
