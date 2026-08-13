import type { KanbanBoard } from "./types";

export const initialBoard: KanbanBoard = {
  title: "Super Simple TODO",
  columns: [
    { id: "planned", title: "Planned", tone: "blue", cardIds: [] },
    { id: "progress", title: "In Progress", tone: "blue", cardIds: [] },
    { id: "done", title: "Done", tone: "blue", cardIds: [] },
  ],
  cards: {},
};
