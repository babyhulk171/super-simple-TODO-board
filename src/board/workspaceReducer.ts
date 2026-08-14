import { boardReducer } from "./boardReducer";
import type { KanbanWorkspace, WorkspaceAction, WorkspaceBoard } from "./workspaceTypes";

function hasBoard(workspace: KanbanWorkspace, boardId: string): boolean {
  return workspace.boards.some((board) => board.id === boardId);
}

function selectBoard(workspace: KanbanWorkspace, boardId: string): KanbanWorkspace {
  if (!hasBoard(workspace, boardId) || workspace.activeBoardId === boardId) return workspace;
  return { ...workspace, activeBoardId: boardId };
}

function addBoard(workspace: KanbanWorkspace, board: WorkspaceBoard): KanbanWorkspace {
  if (hasBoard(workspace, board.id)) return workspace;
  return { activeBoardId: board.id, boards: [...workspace.boards, board] };
}

function deleteBoard(workspace: KanbanWorkspace, boardId: string): KanbanWorkspace {
  const removedIndex = workspace.boards.findIndex((board) => board.id === boardId);
  if (removedIndex < 0 || workspace.boards.length === 1) return workspace;
  const boards = workspace.boards.filter((board) => board.id !== boardId);
  const activeBoardId = workspace.activeBoardId === boardId ? boards[Math.min(removedIndex, boards.length - 1)].id : workspace.activeBoardId;
  return { activeBoardId, boards };
}

function applyBoardAction(workspace: KanbanWorkspace, action: Extract<WorkspaceAction, { type: "apply-board-action" }>): KanbanWorkspace {
  const board = workspace.boards.find((candidate) => candidate.id === action.boardId);
  if (!board) return workspace;
  const updatedBoard = boardReducer(board.board, action.action);
  if (updatedBoard === board.board) return workspace;
  const boards = workspace.boards.map((candidate) => candidate.id === board.id ? { ...candidate, board: updatedBoard } : candidate);
  return { ...workspace, boards };
}

/** Applies one scoped workspace change. Example: `workspaceReducer(workspace, { type: "select-board", boardId })`. */
export function workspaceReducer(workspace: KanbanWorkspace, action: WorkspaceAction): KanbanWorkspace {
  switch (action.type) {
    case "select-board": return selectBoard(workspace, action.boardId);
    case "add-board": return addBoard(workspace, action.board);
    case "delete-board": return deleteBoard(workspace, action.boardId);
    case "apply-board-action": return applyBoardAction(workspace, action);
  }
}
