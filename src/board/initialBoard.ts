import type { KanbanBoard } from "./types";

const STARTER_COLUMNS = [
  { id: "planned", title: "Planned", tone: "blue" as const, cardIds: [] },
  { id: "progress", title: "In Progress", tone: "blue" as const, cardIds: [] },
  { id: "done", title: "Done", tone: "blue" as const, cardIds: [] },
];

/** Creates an independent starter board. Example: `createInitialBoard()`. */
export function createInitialBoard(): KanbanBoard {
  return { title: "Super Simple TODO", columns: STARTER_COLUMNS.map((column) => ({ ...column, cardIds: [] })), cards: {} };
}

export const initialBoard = createInitialBoard();
