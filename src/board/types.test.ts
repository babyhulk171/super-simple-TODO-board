import { describe, expect, it } from "vitest";
import { CARD_PRIORITIES, COLUMN_TONES, isCardPriority, isColumnTone } from "./types";

describe("board option guards", () => {
  it("shares the supported tone and priority values with runtime validation", () => {
    expect(COLUMN_TONES).toEqual(["blue", "violet", "amber", "green", "rose"]);
    expect(CARD_PRIORITIES).toEqual(["low", "medium", "high"]);
    expect(isColumnTone("green")).toBe(true);
    expect(isCardPriority("high")).toBe(true);
  });

  it("rejects unsupported option values", () => {
    expect(isColumnTone("orange")).toBe(false);
    expect(isCardPriority("urgent")).toBe(false);
    expect(isCardPriority(null)).toBe(false);
  });
});
