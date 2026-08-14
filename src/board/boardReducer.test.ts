import { describe, expect, it } from "vitest";
import { boardReducer } from "./boardReducer";
import { initialBoard } from "./initialBoard";
import type { KanbanCard, KanbanColumn } from "./types";

const newColumn: KanbanColumn = { id: "review", title: "Review", tone: "rose", cardIds: [] };
const newCard: KanbanCard = { id: "qa", title: "QA pass", details: "", priority: "medium", completed: false };
const doneCard: KanbanCard = { id: "shipped", title: "Ship release", details: "", priority: "high", completed: true };

describe("boardReducer", () => {
  it("renames the board and adds a column", () => {
    const renamed = boardReducer(initialBoard, { type: "rename-board", title: "Website refresh" });
    const result = boardReducer(renamed, { type: "add-column", column: newColumn });
    expect(result.title).toBe("Website refresh");
    expect(result.columns.at(-1)).toEqual(newColumn);
  });

  it("updates and deletes a column with its cards", () => {
    const withCard = boardReducer(initialBoard, { type: "add-card", columnId: "planned", card: newCard });
    const updated = boardReducer(withCard, { type: "update-column", columnId: "planned", title: "Backlog", tone: "blue" });
    const result = boardReducer(updated, { type: "delete-column", columnId: "planned" });
    expect(updated.columns[0]).toMatchObject({ title: "Backlog", tone: "blue" });
    expect(result.cards.qa).toBeUndefined();
  });

  it("adds, updates, toggles, and deletes a card", () => {
    const added = boardReducer(initialBoard, { type: "add-card", columnId: "planned", card: newCard });
    const updated = boardReducer(added, { type: "update-card", card: { ...newCard, title: "Final QA" } });
    const toggled = boardReducer(updated, { type: "toggle-card", cardId: "qa" });
    const result = boardReducer(toggled, { type: "delete-card", cardId: "qa" });
    expect(toggled.cards.qa).toMatchObject({ title: "Final QA", completed: true });
    expect(result.cards.qa).toBeUndefined();
  });

  it("moves cards across columns and reorders columns", () => {
    const withPlannedCard = boardReducer(initialBoard, { type: "add-card", columnId: "planned", card: newCard });
    const withBothCards = boardReducer(withPlannedCard, { type: "add-card", columnId: "done", card: doneCard });
    const moved = boardReducer(withBothCards, { type: "move-card", cardId: "qa", toColumnId: "done", overCardId: "shipped" });
    const result = boardReducer(moved, { type: "reorder-column", columnId: "done", overColumnId: "planned" });
    expect(moved.columns.find((column) => column.id === "done")?.cardIds).toEqual(["qa", "shipped"]);
    expect(result.columns[0].id).toBe("done");
  });

  it("moves a card within a column without mutating the previous board", () => {
    const firstCard: KanbanCard = { ...newCard, id: "first" };
    const secondCard: KanbanCard = { ...doneCard, id: "second" };
    const withFirst = boardReducer(initialBoard, { type: "add-card", columnId: "planned", card: firstCard });
    const original = boardReducer(withFirst, { type: "add-card", columnId: "planned", card: secondCard });
    const result = boardReducer(original, { type: "move-card", cardId: "second", toColumnId: "planned", toIndex: 0 });

    expect(result.columns[0].cardIds).toEqual(["second", "first"]);
    expect(original.columns[0].cardIds).toEqual(["first", "second"]);
  });

  it("ignores stale actions that would create an unplaced card", () => {
    const missingCard: KanbanCard = { ...newCard, id: "missing" };
    const addResult = boardReducer(initialBoard, { type: "add-card", columnId: "unknown", card: missingCard });
    const updateResult = boardReducer(initialBoard, { type: "update-card", card: missingCard });
    const moveResult = boardReducer(initialBoard, { type: "move-card", cardId: "missing", toColumnId: "planned" });

    expect(addResult).toBe(initialBoard);
    expect(updateResult).toBe(initialBoard);
    expect(moveResult).toBe(initialBoard);
  });

  it("ignores duplicate identifiers and deletions that do not match board content", () => {
    const duplicateColumn = boardReducer(initialBoard, { type: "add-column", column: initialBoard.columns[0] });
    const withCard = boardReducer(initialBoard, { type: "add-card", columnId: "planned", card: newCard });
    const duplicateCard = boardReducer(withCard, { type: "add-card", columnId: "planned", card: newCard });
    const missingColumn = boardReducer(initialBoard, { type: "delete-column", columnId: "missing" });
    const missingCard = boardReducer(initialBoard, { type: "delete-card", cardId: "missing" });

    expect(duplicateColumn).toBe(initialBoard);
    expect(duplicateCard).toBe(withCard);
    expect(missingColumn).toBe(initialBoard);
    expect(missingCard).toBe(initialBoard);
  });

  it("restores a supplied board", () => {
    const result = boardReducer(initialBoard, { type: "reset-board", board: { ...initialBoard, title: "Restored" } });
    expect(result.title).toBe("Restored");
  });
});
