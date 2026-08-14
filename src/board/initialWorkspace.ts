import { createInitialBoard } from "./initialBoard";
import type { KanbanBoard } from "./types";
import type { KanbanWorkspace } from "./workspaceTypes";

export const INITIAL_WORKSPACE_BOARD_ID = "starter";

/** Wraps a board as the first workspace board. Example: `createInitialWorkspace()`. */
export function createInitialWorkspace(board: KanbanBoard = createInitialBoard()): KanbanWorkspace {
  return { activeBoardId: INITIAL_WORKSPACE_BOARD_ID, boards: [{ id: INITIAL_WORKSPACE_BOARD_ID, board }] };
}

export const initialWorkspace = createInitialWorkspace();
