import { createInitialWorkspace, initialWorkspace } from "./initialWorkspace";
import { decodeCurrentBoard, decodeLegacyBoard } from "./boardMigrations";
import type { KanbanWorkspace } from "./workspaceTypes";
import { decodeCurrentWorkspace, encodeCurrentWorkspace, inspectCurrentWorkspace } from "./workspaceMigrations";

export const BOARD_KEY = "super-simple-todo-board";
const LEGACY_BOARD_KEY = "nimbus-kanban-board-v1";

export type WorkspaceLoadIssue = "corrupt" | "unsupported";

export interface WorkspaceLoadResult {
  workspace: KanbanWorkspace;
  issue?: WorkspaceLoadIssue;
}

export type SaveBoardResult =
  | { saved: true }
  | { saved: false; reason: "quota" | "unavailable" | "unknown" };

export interface BoardStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

function readStoredValue(storage: BoardStorage, key: string): string | null {
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

function removeStoredValue(storage: BoardStorage, key: string): void {
  try {
    storage.removeItem(key);
  } catch {
    // The valid migrated workspace remains available even when old data cannot be removed.
  }
}

function classifySaveFailure(error: unknown): SaveBoardResult {
  if (!(error instanceof DOMException)) return { saved: false, reason: "unknown" };
  if (error.name === "QuotaExceededError") return { saved: false, reason: "quota" };
  if (error.name === "SecurityError") return { saved: false, reason: "unavailable" };
  return { saved: false, reason: "unknown" };
}

function loadLegacyBoard(storage: BoardStorage): KanbanWorkspace | undefined {
  const legacyValue = readStoredValue(storage, LEGACY_BOARD_KEY);
  if (!legacyValue) return undefined;
  const legacyBoard = decodeLegacyBoard(legacyValue);
  if (!legacyBoard) return undefined;
  return createInitialWorkspace(legacyBoard);
}

function saveMigratedWorkspace(storage: BoardStorage, workspace: KanbanWorkspace): KanbanWorkspace {
  const saveResult = saveWorkspace(storage, workspace);
  if (saveResult.saved) removeStoredValue(storage, LEGACY_BOARD_KEY);
  return workspace;
}

function migrateLegacyWorkspace(storage: BoardStorage): KanbanWorkspace | undefined {
  const workspace = loadLegacyBoard(storage);
  if (!workspace) return undefined;
  return saveMigratedWorkspace(storage, workspace);
}

function migrateBoard(storage: BoardStorage, serializedBoard: string): KanbanWorkspace | undefined {
  const board = decodeCurrentBoard(serializedBoard);
  if (!board) return undefined;
  const workspace = createInitialWorkspace(board);
  return saveMigratedWorkspace(storage, workspace);
}

/** Reads a workspace or flags unsafe persisted data for explicit recovery. Example: `loadWorkspace(window.localStorage)`. */
export function loadWorkspace(storage: BoardStorage): WorkspaceLoadResult {
  const storedValue = readStoredValue(storage, BOARD_KEY);
  const workspace = storedValue ? decodeCurrentWorkspace(storedValue) : undefined;
  if (workspace) {
    removeStoredValue(storage, LEGACY_BOARD_KEY);
    return { workspace };
  }
  if (storedValue) {
    const migratedWorkspace = migrateBoard(storage, storedValue);
    if (migratedWorkspace) return { workspace: migratedWorkspace };
    const inspection = inspectCurrentWorkspace(storedValue);
    return { workspace: initialWorkspace, issue: inspection.kind === "unsupported" ? "unsupported" : "corrupt" };
  }
  return { workspace: migrateLegacyWorkspace(storage) ?? initialWorkspace };
}

/** Persists a workspace without interrupting the UI on storage errors. Example: `saveWorkspace(localStorage, workspace)`. */
export function saveWorkspace(storage: BoardStorage, workspace: KanbanWorkspace): SaveBoardResult {
  try {
    storage.setItem(BOARD_KEY, encodeCurrentWorkspace(workspace));
    return { saved: true };
  } catch (error: unknown) {
    // The board remains usable when storage is blocked or full.
    return classifySaveFailure(error);
  }
}
