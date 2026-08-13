import { describe, expect, it } from "vitest";
import { CURRENT_BOARD_VERSION } from "../boardMigrations";
import type { KanbanBoard } from "../types";
import { importBoardJson } from "./importBoardJson";

class SequentialIdFactory {
  private nextValue = 0;

  readonly createId = (): string => {
    this.nextValue += 1;
    return `local-${this.nextValue}`;
  };
}

function importJson(value: unknown) {
  const idFactory = new SequentialIdFactory();
  return importBoardJson(JSON.stringify(value), { createId: idFactory.createId });
}

const nativeBoard: KanbanBoard = {
  title: "Portable board",
  columns: [{ id: "source-column", title: "Queue", tone: "violet", cardIds: ["source-card"] }],
  cards: {
    "source-card": { id: "source-card", title: "Ship it", details: "Ready", priority: "high", completed: false },
  },
};

describe("board JSON import", () => {
  it("imports a versioned native board with fresh local identifiers", () => {
    const outcome = importJson({ version: CURRENT_BOARD_VERSION, board: nativeBoard });

    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.result.source).toBe("super-simple-todo");
    expect(outcome.result.summary).toEqual({ columns: 1, cards: 1 });
    expect(outcome.result.board.columns[0]).toMatchObject({ id: "local-1", cardIds: ["local-2"] });
    expect(outcome.result.board.cards["local-2"]).toMatchObject({ id: "local-2", title: "Ship it" });
  });

  it("converts active Trello lists and cards while reporting skipped fields", () => {
    const outcome = importJson({
      name: "Release board",
      lists: [
        { id: "doing", name: "Doing", closed: false, pos: 20 },
        { id: "todo", name: "To do", closed: false, pos: 10 },
        { id: "old", name: "Archived", closed: true, pos: 5 },
      ],
      cards: [
        { id: "orphan", idList: "missing", name: "Lost", closed: false, pos: 5 },
        { id: "first", idList: "todo", name: "Critical task", desc: "Details", closed: false, pos: 10, dueComplete: true, due: "2026-08-14", labels: [{ name: "High" }], attachments: [{}], idMembers: ["member"], customFieldItems: [] },
        { id: "second", idList: "doing", name: "Small task", desc: "", closed: false, pos: 20, dueComplete: false, labels: [{ name: "Backend" }], attachments: [], idMembers: [], customFieldItems: [{ idCustomField: "priority-field", idValue: "low-option" }] },
        { id: "archived", idList: "todo", name: "Old", closed: true, pos: 30 },
        { id: "invalid", idList: "todo", closed: false, pos: 40 },
      ],
      customFields: [
        { id: "priority-field", name: "priority", options: [{ id: "low-option", value: { text: "Low" } }] },
        { id: "effort-field", name: "Effort" },
      ],
      actions: [{ type: "commentCard" }],
      checklists: [{ id: "checklist" }],
    });

    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.result.source).toBe("trello");
    expect(outcome.result.board.columns.map((column) => column.title)).toEqual(["To do", "Doing"]);
    expect(outcome.result.board.columns.map((column) => column.tone)).toEqual(["blue", "blue"]);
    expect(outcome.result.board.columns[0].cardIds).toEqual(["local-3"]);
    expect(outcome.result.board.cards["local-3"]).toMatchObject({ title: "Critical task", priority: "high", completed: true });
    expect(outcome.result.board.cards["local-4"]).toMatchObject({ title: "Small task", priority: "low", completed: false });
    expect(outcome.result.warnings.map((warning) => warning.code)).toEqual(expect.arrayContaining(["archived-lists", "archived-cards", "invalid-cards", "unmapped-cards", "due-dates", "attachments", "members", "checklists", "comments", "custom-fields"]));
  });

  it("rejects malformed and unsupported JSON documents", () => {
    const idFactory = new SequentialIdFactory();
    const malformed = importBoardJson("{", { createId: idFactory.createId });
    const unsupported = importJson({ name: "Not a board" });

    expect(malformed).toEqual({ ok: false, message: "Invalid JSON file; expected one complete JSON document." });
    expect(unsupported).toEqual({ ok: false, message: "Unsupported JSON structure; expected a Super Simple TODO export or a Trello board export." });
  });
});
