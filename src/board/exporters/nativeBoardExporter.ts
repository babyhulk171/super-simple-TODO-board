import { encodeCurrentBoard } from "../boardMigrations";
import type { KanbanBoard } from "../types";

export interface BoardExport {
  fileName: string;
  serializedBoard: string;
}

function createFileName(title: string): string {
  const normalizedTitle = title.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return `${normalizedTitle || "board"}.json`;
}

/** Creates a portable native board export. Example: `createNativeBoardExport(board)`. */
export function createNativeBoardExport(board: KanbanBoard): BoardExport {
  return { fileName: createFileName(board.title), serializedBoard: encodeCurrentBoard(board) };
}
