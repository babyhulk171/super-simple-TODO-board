import { describe, expect, it } from "vitest";
import { calculateCardProjection, projectCardPosition } from "./dragProjection";
import type { KanbanBoard } from "./types";

const board: KanbanBoard = {
  title: "Drag board",
  columns: [
    { id: "planned", title: "Planned", tone: "blue", cardIds: ["first", "second"] },
    { id: "done", title: "Done", tone: "green", cardIds: [] },
  ],
  cards: {
    first: { id: "first", title: "First", details: "", priority: "medium", completed: false },
    second: { id: "second", title: "Second", details: "", priority: "medium", completed: false },
  },
};

describe("card drag projection", () => {
  it("calculates before, after, and empty-column destinations", () => {
    expect(calculateCardProjection(board, "first", { kind: "card", cardId: "second", columnId: "planned" }, false)).toEqual({ cardId: "first", targetColumnId: "planned", targetIndex: 0 });
    expect(calculateCardProjection(board, "first", { kind: "card", cardId: "second", columnId: "planned" }, true)).toEqual({ cardId: "first", targetColumnId: "planned", targetIndex: 1 });
    expect(calculateCardProjection(board, "first", { kind: "column", columnId: "done" }, false)).toEqual({ cardId: "first", targetColumnId: "done", targetIndex: 0 });
  });

  it("rejects invalid targets and keeps the original board untouched", () => {
    const projection = { cardId: "first", targetColumnId: "done", targetIndex: 99 };

    expect(calculateCardProjection(board, "first", { kind: "card", cardId: "first", columnId: "planned" }, false)).toBeUndefined();
    expect(calculateCardProjection(board, "first", { kind: "card", cardId: "missing", columnId: "planned" }, false)).toBeUndefined();
    expect(calculateCardProjection(board, "first", { kind: "column", columnId: "missing" }, false)).toBeUndefined();
    expect(projectCardPosition(board, projection).columns.map((column) => column.cardIds)).toEqual([["second"], ["first"]]);
    expect(board.columns.map((column) => column.cardIds)).toEqual([["first", "second"], []]);
  });

  it("returns the original board when no projection is active", () => {
    expect(projectCardPosition(board, null)).toBe(board);
  });

  it("ignores stale projections that would remove or invent cards", () => {
    const missingCard = projectCardPosition(board, { cardId: "missing", targetColumnId: "done", targetIndex: 0 });
    const missingColumn = projectCardPosition(board, { cardId: "first", targetColumnId: "missing", targetIndex: 0 });

    expect(missingCard).toBe(board);
    expect(missingColumn).toBe(board);
  });
});
