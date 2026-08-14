import { describe, expect, it } from "vitest";
import { encodeCurrentBoard } from "./boardMigrations";
import { initialBoard } from "./initialBoard";
import { loadBoard, saveBoard, type BoardStorage } from "./storage";

class MemoryBoardStorage implements BoardStorage {
  private readonly storedValues = new Map<string, string>();

  getItem(key: string): string | null {
    return this.storedValues.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.storedValues.set(key, value);
  }
}

class FailingBoardStorage implements BoardStorage {
  constructor(private readonly failure: unknown) {}

  getItem(): string | null {
    return null;
  }

  setItem(): void {
    throw this.failure;
  }
}

describe("board storage", () => {
  it("starts with three empty blue workflow columns", () => {
    expect(initialBoard.columns).toEqual([
      { id: "planned", title: "Planned", tone: "blue", cardIds: [] },
      { id: "progress", title: "In Progress", tone: "blue", cardIds: [] },
      { id: "done", title: "Done", tone: "blue", cardIds: [] },
    ]);
    expect(initialBoard.cards).toEqual({});
  });

  it("returns the starter board when storage is empty or malformed", () => {
    const storage = new MemoryBoardStorage();
    expect(loadBoard(storage)).toEqual(initialBoard);
    storage.setItem("super-simple-todo-board", "not-json");
    expect(loadBoard(storage)).toEqual(initialBoard);
  });

  it("round-trips a valid board", () => {
    const storage = new MemoryBoardStorage();
    const changedBoard = { ...initialBoard, title: "Saved board" };
    saveBoard(storage, changedBoard);
    expect(loadBoard(storage)).toEqual(changedBoard);
  });

  it("prefers the current board and migrates a valid legacy board", () => {
    const storage = new MemoryBoardStorage();
    const currentBoard = { ...initialBoard, title: "Current board" };
    const legacyBoard = { ...initialBoard, title: "Legacy board" };
    storage.setItem("super-simple-todo-board", encodeCurrentBoard(currentBoard));
    storage.setItem("nimbus-kanban-board-v1", JSON.stringify(legacyBoard));

    expect(loadBoard(storage)).toEqual(currentBoard);
    storage.setItem("super-simple-todo-board", "invalid");
    expect(loadBoard(storage)).toEqual(legacyBoard);
    expect(storage.getItem("super-simple-todo-board")).toBe(encodeCurrentBoard(legacyBoard));
  });

  it("classifies quota, unavailable, and unexpected save errors", () => {
    expect(saveBoard(new FailingBoardStorage(new DOMException("full", "QuotaExceededError")), initialBoard)).toEqual({ saved: false, reason: "quota" });
    expect(saveBoard(new FailingBoardStorage(new DOMException("blocked", "SecurityError")), initialBoard)).toEqual({ saved: false, reason: "unavailable" });
    expect(saveBoard(new FailingBoardStorage(new Error("offline")), initialBoard)).toEqual({ saved: false, reason: "unknown" });
  });
});
