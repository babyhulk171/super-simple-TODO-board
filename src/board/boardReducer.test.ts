import { describe, expect, it } from "vitest";
import { boardReducer } from "./boardReducer";
import { initialBoard } from "./initialBoard";
import type { KanbanCard, KanbanColumn } from "./types";

const newColumn: KanbanColumn = { id: "review", title: "Review", tone: "rose", cardIds: [] };
const newCard: KanbanCard = { id: "qa", title: "QA pass", details: "", priority: "medium", completed: false };

describe("boardReducer", () => {
  it("renames the board and adds a column", () => {
    const renamed = boardReducer(initialBoard, { type: "rename-board", title: "Website refresh" });
    const result = boardReducer(renamed, { type: "add-column", column: newColumn });
    expect(result.title).toBe("Website refresh");
    expect(result.columns.at(-1)).toEqual(newColumn);
  });

  it("updates and deletes a column with its cards", () => {
    const updated = boardReducer(initialBoard, { type: "update-column", columnId: "ideas", title: "Backlog", tone: "blue" });
    const result = boardReducer(updated, { type: "delete-column", columnId: "ideas" });
    expect(updated.columns[0]).toMatchObject({ title: "Backlog", tone: "blue" });
    expect(result.cards.interviews).toBeUndefined();
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
    const moved = boardReducer(initialBoard, { type: "move-card", cardId: "pricing", toColumnId: "done", overCardId: "domain" });
    const result = boardReducer(moved, { type: "reorder-column", columnId: "done", overColumnId: "ideas" });
    expect(moved.columns.find((column) => column.id === "done")?.cardIds).toEqual(["brief", "pricing", "domain"]);
    expect(result.columns[0].id).toBe("done");
  });

  it("restores a supplied board", () => {
    const result = boardReducer(initialBoard, { type: "reset-board", board: { ...initialBoard, title: "Restored" } });
    expect(result.title).toBe("Restored");
  });
});
