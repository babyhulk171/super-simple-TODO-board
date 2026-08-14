import { describe, expect, it } from "vitest";
import { createInitialWorkspace } from "./initialWorkspace";
import { initialBoard } from "./initialBoard";
import { workspaceReducer } from "./workspaceReducer";

describe("workspaceReducer", () => {
  it("creates and selects a new board without changing the existing board", () => {
    const workspace = createInitialWorkspace({ ...initialBoard, title: "Personal" });
    const result = workspaceReducer(workspace, { type: "add-board", board: { id: "work", board: { ...initialBoard, title: "Work" } } });

    expect(result.activeBoardId).toBe("work");
    expect(result.boards.map((entry) => entry.board.title)).toEqual(["Personal", "Work"]);
    expect(workspace.boards).toHaveLength(1);
  });

  it("scopes updates to their board and ignores unknown board identifiers", () => {
    const workspace = workspaceReducer(createInitialWorkspace(), { type: "add-board", board: { id: "work", board: { ...initialBoard, title: "Work" } } });
    const updated = workspaceReducer(workspace, { type: "apply-board-action", boardId: "starter", action: { type: "rename-board", title: "Personal" } });
    const unknown = workspaceReducer(updated, { type: "apply-board-action", boardId: "missing", action: { type: "rename-board", title: "Ignored" } });

    expect(updated.boards.map((entry) => entry.board.title)).toEqual(["Personal", "Work"]);
    expect(unknown).toBe(updated);
  });

  it("selects a valid board and chooses a neighbor when deleting the active board", () => {
    const withWork = workspaceReducer(createInitialWorkspace(), { type: "add-board", board: { id: "work", board: { ...initialBoard, title: "Work" } } });
    const selected = workspaceReducer(withWork, { type: "select-board", boardId: "starter" });
    const deleted = workspaceReducer(selected, { type: "delete-board", boardId: "starter" });

    expect(selected.activeBoardId).toBe("starter");
    expect(deleted.activeBoardId).toBe("work");
    expect(deleted.boards).toHaveLength(1);
    expect(workspaceReducer(deleted, { type: "delete-board", boardId: "work" })).toBe(deleted);
  });
});
