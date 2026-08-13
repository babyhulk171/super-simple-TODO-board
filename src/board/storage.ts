import { initialBoard } from "./initialBoard";
import type { KanbanBoard, KanbanColumn } from "./types";

const BOARD_KEY = "nimbus-kanban-board-v1";

export interface BoardStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

function isColumn(value: unknown): value is KanbanColumn {
  if (!value || typeof value !== "object") return false;
  const column = value as Partial<KanbanColumn>;
  return typeof column.id === "string" && typeof column.title === "string" && Array.isArray(column.cardIds);
}

function isBoard(value: unknown): value is KanbanBoard {
  if (!value || typeof value !== "object") return false;
  const board = value as Partial<KanbanBoard>;
  return typeof board.title === "string" && Array.isArray(board.columns)
    && board.columns.every(isColumn) && typeof board.cards === "object" && board.cards !== null;
}

/** Reads a valid saved board or returns the starter board. Example: `loadBoard(window.localStorage)`. */
export function loadBoard(storage: BoardStorage): KanbanBoard {
  try {
    const storedBoard = storage.getItem(BOARD_KEY);
    if (!storedBoard) return initialBoard;
    const parsedBoard: unknown = JSON.parse(storedBoard);
    return isBoard(parsedBoard) ? parsedBoard : initialBoard;
  } catch {
    return initialBoard;
  }
}

/** Persists a board without interrupting the UI on storage errors. Example: `saveBoard(localStorage, board)`. */
export function saveBoard(storage: BoardStorage, board: KanbanBoard): void {
  try {
    storage.setItem(BOARD_KEY, JSON.stringify(board));
  } catch {
    // The board remains usable when storage is blocked or full.
  }
}
