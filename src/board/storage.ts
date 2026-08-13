import { initialBoard } from "./initialBoard";
import { decodeCurrentBoard, decodeLegacyBoard, encodeCurrentBoard } from "./boardMigrations";
import type { KanbanBoard } from "./types";

const BOARD_KEY = "super-simple-todo-board";
const LEGACY_BOARD_KEY = "nimbus-kanban-board-v1";

export type SaveBoardResult =
  | { saved: true }
  | { saved: false; reason: "quota" | "unavailable" | "unknown" };

export interface BoardStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

function readStoredValue(storage: BoardStorage, key: string): string | null {
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

function classifySaveFailure(error: unknown): SaveBoardResult {
  if (!(error instanceof DOMException)) return { saved: false, reason: "unknown" };
  if (error.name === "QuotaExceededError") return { saved: false, reason: "quota" };
  if (error.name === "SecurityError") return { saved: false, reason: "unavailable" };
  return { saved: false, reason: "unknown" };
}

function loadLegacyBoard(storage: BoardStorage): KanbanBoard | undefined {
  const legacyValue = readStoredValue(storage, LEGACY_BOARD_KEY);
  if (!legacyValue) return undefined;
  const legacyBoard = decodeLegacyBoard(legacyValue);
  if (!legacyBoard) return undefined;
  saveBoard(storage, legacyBoard);
  return legacyBoard;
}

/** Reads a valid saved board or returns the starter board. Example: `loadBoard(window.localStorage)`. */
export function loadBoard(storage: BoardStorage): KanbanBoard {
  const storedValue = readStoredValue(storage, BOARD_KEY);
  const storedBoard = storedValue ? decodeCurrentBoard(storedValue) : undefined;
  if (storedBoard) return storedBoard;
  return loadLegacyBoard(storage) ?? initialBoard;
}

/** Persists a board without interrupting the UI on storage errors. Example: `saveBoard(localStorage, board)`. */
export function saveBoard(storage: BoardStorage, board: KanbanBoard): SaveBoardResult {
  try {
    storage.setItem(BOARD_KEY, encodeCurrentBoard(board));
    return { saved: true };
  } catch (error: unknown) {
    // The board remains usable when storage is blocked or full.
    return classifySaveFailure(error);
  }
}
