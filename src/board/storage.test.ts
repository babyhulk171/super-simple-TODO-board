import { describe, expect, it } from "vitest";
import { encodeCurrentBoard } from "./boardMigrations";
import { createInitialBoard, initialBoard } from "./initialBoard";
import { createInitialWorkspace, initialWorkspace } from "./initialWorkspace";
import { loadWorkspace, saveWorkspace, type BoardStorage } from "./storage";
import { encodeCurrentWorkspace } from "./workspaceMigrations";

class MemoryBoardStorage implements BoardStorage {
  private readonly storedValues = new Map<string, string>();

  getItem(key: string): string | null {
    return this.storedValues.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.storedValues.set(key, value);
  }

  removeItem(key: string): void {
    this.storedValues.delete(key);
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

  removeItem(): void {
    throw this.failure;
  }
}

describe("workspace storage", () => {
  it("starts with three empty blue workflow columns", () => {
    const freshBoard = createInitialBoard();

    expect(freshBoard.columns).toEqual([
      { id: "planned", title: "Planned", tone: "blue", cardIds: [] },
      { id: "progress", title: "In Progress", tone: "blue", cardIds: [] },
      { id: "done", title: "Done", tone: "blue", cardIds: [] },
    ]);
    expect(freshBoard.cards).toEqual({});
    expect(freshBoard).not.toBe(initialBoard);
  });

  it("returns the starter workspace only when storage is empty", () => {
    const storage = new MemoryBoardStorage();
    expect(loadWorkspace(storage)).toEqual({ workspace: initialWorkspace });
  });

  it("round-trips a valid workspace", () => {
    const storage = new MemoryBoardStorage();
    const workspace = createInitialWorkspace({ ...initialBoard, title: "Saved board" });
    saveWorkspace(storage, workspace);
    expect(loadWorkspace(storage)).toEqual({ workspace });
  });

  it("prefers the current workspace and migrates valid single-board data", () => {
    const storage = new MemoryBoardStorage();
    const currentWorkspace = createInitialWorkspace({ ...initialBoard, title: "Current board" });
    const legacyBoard = { ...initialBoard, title: "Legacy board" };
    storage.setItem("super-simple-todo-board", encodeCurrentWorkspace(currentWorkspace));
    storage.setItem("nimbus-kanban-board-v1", JSON.stringify(legacyBoard));

    expect(loadWorkspace(storage)).toEqual({ workspace: currentWorkspace });
    expect(storage.getItem("nimbus-kanban-board-v1")).toBeNull();
    storage.setItem("super-simple-todo-board", encodeCurrentBoard(legacyBoard));
    expect(loadWorkspace(storage)).toEqual({ workspace: createInitialWorkspace(legacyBoard) });
    expect(storage.getItem("super-simple-todo-board")).toBe(encodeCurrentWorkspace(createInitialWorkspace(legacyBoard)));
  });

  it("preserves corrupt and unsupported current storage for explicit recovery", () => {
    const storage = new MemoryBoardStorage();
    const legacyBoard = { ...initialBoard, title: "Recovered board" };
    storage.setItem("super-simple-todo-board", "invalid");
    storage.setItem("nimbus-kanban-board-v1", JSON.stringify(legacyBoard));

    expect(loadWorkspace(storage)).toEqual({ workspace: initialWorkspace, issue: "corrupt" });
    expect(storage.getItem("super-simple-todo-board")).toBe("invalid");
    storage.setItem("super-simple-todo-board", JSON.stringify({ version: 4, workspace: initialWorkspace }));
    expect(loadWorkspace(storage)).toEqual({ workspace: initialWorkspace, issue: "unsupported" });
  });

  it("classifies quota, unavailable, and unexpected save errors", () => {
    expect(saveWorkspace(new FailingBoardStorage(new DOMException("full", "QuotaExceededError")), initialWorkspace)).toEqual({ saved: false, reason: "quota" });
    expect(saveWorkspace(new FailingBoardStorage(new DOMException("blocked", "SecurityError")), initialWorkspace)).toEqual({ saved: false, reason: "unavailable" });
    expect(saveWorkspace(new FailingBoardStorage(new Error("offline")), initialWorkspace)).toEqual({ saved: false, reason: "unknown" });
  });
});
