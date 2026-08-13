import type { KanbanBoard, KanbanCardMap, KanbanColumn } from "../types";

export interface NormalizedText {
  text: string;
  truncated: boolean;
}

/** Narrows an unknown JSON value to an object. Example: `isJsonRecord(value)`. */
export function isJsonRecord(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== "object") return false;
  return !Array.isArray(value);
}

/** Trims and limits imported text. Example: `normalizeImportedText(value, 90, "Untitled")`. */
export function normalizeImportedText(value: unknown, limit: number, fallback = ""): NormalizedText {
  const rawText = typeof value === "string" ? value.trim() : "";
  const text = rawText || fallback;
  return { text: text.slice(0, limit), truncated: text.length > limit };
}

function remapCards(board: KanbanBoard, cardIds: Map<string, string>): KanbanCardMap {
  const cards: KanbanCardMap = {};
  for (const [sourceId, card] of Object.entries(board.cards)) {
    const localId = cardIds.get(sourceId);
    if (localId) cards[localId] = { ...card, id: localId };
  }
  return cards;
}

function remapColumn(column: KanbanColumn, columnId: string, cardIds: Map<string, string>): KanbanColumn {
  const remappedCardIds = column.cardIds.flatMap((cardId) => cardIds.get(cardId) ?? []);
  return { ...column, id: columnId, cardIds: remappedCardIds };
}

/** Replaces imported identifiers with local identifiers. Example: `remapImportedBoard(board, createId)`. */
export function remapImportedBoard(board: KanbanBoard, createId: () => string): KanbanBoard {
  const columnIds = new Map(board.columns.map((column) => [column.id, createId()]));
  const cardIds = new Map(Object.keys(board.cards).map((cardId) => [cardId, createId()]));
  const columns = board.columns.flatMap((column) => {
    const columnId = columnIds.get(column.id);
    return columnId ? [remapColumn(column, columnId, cardIds)] : [];
  });
  return { title: board.title, columns, cards: remapCards(board, cardIds) };
}

/** Counts cards in a normalized board. Example: `countBoardCards(board)`. */
export function countBoardCards(board: KanbanBoard): number {
  return Object.keys(board.cards).length;
}
