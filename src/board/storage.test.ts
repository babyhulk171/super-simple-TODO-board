import { describe, expect, it } from "vitest";
import { initialBoard } from "./initialBoard";
import { loadBoard, saveBoard, type BoardStorage } from "./storage";

class MemoryBoardStorage implements BoardStorage {
  private storedValue: string | null = null;

  getItem(): string | null {
    return this.storedValue;
  }

  setItem(_key: string, value: string): void {
    this.storedValue = value;
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
    storage.setItem("ignored", "not-json");
    expect(loadBoard(storage)).toEqual(initialBoard);
  });

  it("round-trips a valid board", () => {
    const storage = new MemoryBoardStorage();
    const changedBoard = { ...initialBoard, title: "Saved board" };
    saveBoard(storage, changedBoard);
    expect(loadBoard(storage)).toEqual(changedBoard);
  });
});
