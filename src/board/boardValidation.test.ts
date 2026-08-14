import { describe, expect, it } from "vitest";
import { parseBoard } from "./boardValidation";

const validBoard = {
  title: "Release board",
  columns: [{ id: "planned", title: "Planned", tone: "blue", cardIds: ["release"] }],
  cards: {
    release: { id: "release", title: "Ship", details: "Deploy", priority: "high", completed: false },
  },
};

describe("parseBoard", () => {
  it("parses a complete board and copies card placement arrays", () => {
    const result = parseBoard(validBoard);

    expect(result).toEqual(validBoard);
    expect(result?.columns[0].cardIds).not.toBe(validBoard.columns[0].cardIds);
  });

  it("rejects non-board shapes and invalid primitive fields", () => {
    expect(parseBoard(null)).toBeUndefined();
    expect(parseBoard({ ...validBoard, title: 42 })).toBeUndefined();
    expect(parseBoard({ ...validBoard, columns: {} })).toBeUndefined();
    expect(parseBoard({ ...validBoard, cards: [] })).toBeUndefined();
  });

  it("rejects invalid column and card values", () => {
    expect(parseBoard({ ...validBoard, columns: [{ ...validBoard.columns[0], tone: "orange" }] })).toBeUndefined();
    expect(parseBoard({ ...validBoard, columns: [{ ...validBoard.columns[0], cardIds: [1] }] })).toBeUndefined();
    expect(parseBoard({ ...validBoard, cards: { release: { ...validBoard.cards.release, priority: "urgent" } } })).toBeUndefined();
    expect(parseBoard({ ...validBoard, cards: { release: { ...validBoard.cards.release, id: "other" } } })).toBeUndefined();
  });

  it("rejects duplicate columns and inconsistent card placement", () => {
    const duplicateColumns = { ...validBoard, columns: [validBoard.columns[0], { ...validBoard.columns[0], title: "Duplicate" }] };
    const duplicateCard = { ...validBoard, columns: [{ ...validBoard.columns[0], cardIds: ["release", "release"] }] };
    const missingCard = { ...validBoard, columns: [{ ...validBoard.columns[0], cardIds: ["missing"] }] };
    const orphanCard = { ...validBoard, columns: [{ ...validBoard.columns[0], cardIds: [] }] };

    expect(parseBoard(duplicateColumns)).toBeUndefined();
    expect(parseBoard(duplicateCard)).toBeUndefined();
    expect(parseBoard(missingCard)).toBeUndefined();
    expect(parseBoard(orphanCard)).toBeUndefined();
  });

  it("rejects unsafe identifiers and unbounded text", () => {
    const prototypeCard = JSON.parse('{"title":"Release board","columns":[{"id":"planned","title":"Planned","tone":"blue","cardIds":["__proto__"]}],"cards":{"__proto__":{"id":"__proto__","title":"Unsafe","details":"","priority":"low","completed":false}}}');
    const longTitle = { ...validBoard, title: "x".repeat(91) };
    const longDetails = { ...validBoard, cards: { release: { ...validBoard.cards.release, details: "x".repeat(321) } } };

    expect(parseBoard(prototypeCard)).toBeUndefined();
    expect(parseBoard(longTitle)).toBeUndefined();
    expect(parseBoard(longDetails)).toBeUndefined();
  });
});
