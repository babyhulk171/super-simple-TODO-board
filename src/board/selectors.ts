import type { KanbanBoard, KanbanCard, KanbanColumn } from "./types";

/** Finds the column that owns a card. Example: `findCardColumn(board, "card-1")`. */
export function findCardColumn(board: KanbanBoard, cardId: string): KanbanColumn | undefined {
  const matchingColumn = board.columns.find((column) => column.cardIds.includes(cardId));
  return matchingColumn;
}

/** Finds a card by id. Example: `findBoardCard(board, "card-1")`. */
export function findBoardCard(board: KanbanBoard, cardId: string): KanbanCard | undefined {
  return Object.hasOwn(board.cards, cardId) ? board.cards[cardId] : undefined;
}

/** Finds a column by id. Example: `findBoardColumn(board, "planned")`. */
export function findBoardColumn(board: KanbanBoard, columnId: string): KanbanColumn | undefined {
  const matchingColumn = board.columns.find((column) => column.id === columnId);
  return matchingColumn;
}
