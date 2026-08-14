import type { BoardAction, KanbanBoard } from "./types";

export interface WorkspaceBoard {
  id: string;
  board: KanbanBoard;
}

export interface KanbanWorkspace {
  activeBoardId: string;
  boards: WorkspaceBoard[];
}

export type WorkspaceAction =
  | { type: "select-board"; boardId: string }
  | { type: "add-board"; board: WorkspaceBoard }
  | { type: "delete-board"; boardId: string }
  | { type: "apply-board-action"; boardId: string; action: BoardAction };
