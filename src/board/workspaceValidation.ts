import { parseBoard } from "./boardValidation";
import type { KanbanWorkspace, WorkspaceBoard } from "./workspaceTypes";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function parseWorkspaceBoards(value: unknown): WorkspaceBoard[] | undefined {
  if (!Array.isArray(value) || value.length === 0) return undefined;
  const boardIds = new Set<string>();
  const boards: WorkspaceBoard[] = [];
  for (const item of value) {
    if (!isRecord(item) || typeof item.id !== "string" || boardIds.has(item.id)) return undefined;
    const board = parseBoard(item.board);
    if (!board) return undefined;
    boardIds.add(item.id);
    boards.push({ id: item.id, board });
  }
  return boards;
}

/** Parses a workspace with a selected, valid board. Example: `parseWorkspace(candidate)`. */
export function parseWorkspace(value: unknown): KanbanWorkspace | undefined {
  if (!isRecord(value) || typeof value.activeBoardId !== "string") return undefined;
  const boards = parseWorkspaceBoards(value.boards);
  if (!boards || !boards.some((board) => board.id === value.activeBoardId)) return undefined;
  return { activeBoardId: value.activeBoardId, boards };
}
