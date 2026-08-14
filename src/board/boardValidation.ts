import { isCardPriority, isColumnTone, type KanbanBoard, type KanbanCard, type KanbanCardMap, type KanbanColumn } from "./types";

function isRecord(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== "object") return false;
  return !Array.isArray(value);
}

function parseStoredCard(cardId: string, value: unknown): KanbanCard | undefined {
  if (!isRecord(value) || value.id !== cardId) return undefined;
  if (typeof value.title !== "string" || typeof value.details !== "string") return undefined;
  if (typeof value.completed !== "boolean" || !isCardPriority(value.priority)) return undefined;
  return {
    id: cardId,
    title: value.title,
    details: value.details,
    priority: value.priority,
    completed: value.completed,
  };
}

function parseStoredColumn(value: unknown): KanbanColumn | undefined {
  if (!isRecord(value)) return undefined;
  if (typeof value.id !== "string" || typeof value.title !== "string") return undefined;
  if (!isColumnTone(value.tone)) return undefined;
  if (!Array.isArray(value.cardIds) || !value.cardIds.every((cardId) => typeof cardId === "string")) return undefined;
  return {
    id: value.id,
    title: value.title,
    tone: value.tone,
    cardIds: [...value.cardIds],
  };
}

function parseStoredCards(value: unknown): KanbanCardMap | undefined {
  if (!isRecord(value)) return undefined;
  const cards: KanbanCardMap = {};
  for (const [cardId, rawCard] of Object.entries(value)) {
    const card = parseStoredCard(cardId, rawCard);
    if (!card) return undefined;
    cards[cardId] = card;
  }
  return cards;
}

function parseStoredColumns(value: unknown): KanbanColumn[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const columns: KanbanColumn[] = [];
  for (const rawColumn of value) {
    const column = parseStoredColumn(rawColumn);
    if (!column) return undefined;
    columns.push(column);
  }
  return columns;
}

function hasUniqueColumnIds(columns: KanbanColumn[]): boolean {
  const columnIds = columns.map((column) => column.id);
  const uniqueColumnIds = new Set(columnIds);
  return uniqueColumnIds.size === columnIds.length;
}

function hasConsistentCardPlacement(columns: KanbanColumn[], cards: KanbanCardMap): boolean {
  const placedCardIds = columns.flatMap((column) => column.cardIds);
  const uniqueCardIds = new Set(placedCardIds);
  if (uniqueCardIds.size !== placedCardIds.length) return false;
  if (!placedCardIds.every((cardId) => Boolean(cards[cardId]))) return false;
  return Object.keys(cards).every((cardId) => uniqueCardIds.has(cardId));
}

/** Parses a complete, internally consistent board. Example: `parseBoard(candidate)`. */
export function parseBoard(value: unknown): KanbanBoard | undefined {
  if (!isRecord(value) || typeof value.title !== "string") return undefined;
  const columns = parseStoredColumns(value.columns);
  const cards = parseStoredCards(value.cards);
  if (!columns || !cards) return undefined;
  if (!hasUniqueColumnIds(columns)) return undefined;
  if (!hasConsistentCardPlacement(columns, cards)) return undefined;
  return { title: value.title, columns, cards };
}
