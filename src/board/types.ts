export const COLUMN_TONES = ["blue", "violet", "amber", "green", "rose"] as const;
export const CARD_PRIORITIES = ["low", "medium", "high"] as const;

export type ColumnTone = typeof COLUMN_TONES[number];
export type CardPriority = typeof CARD_PRIORITIES[number];
export type Theme = "light" | "dark";

/** Checks whether a value is a supported column tone. Example: `isColumnTone(value)`. */
export function isColumnTone(value: unknown): value is ColumnTone {
  return typeof value === "string" && COLUMN_TONES.includes(value as ColumnTone);
}

/** Checks whether a value is a supported card priority. Example: `isCardPriority(value)`. */
export function isCardPriority(value: unknown): value is CardPriority {
  return typeof value === "string" && CARD_PRIORITIES.includes(value as CardPriority);
}

export interface KanbanCard {
  id: string;
  title: string;
  details: string;
  priority: CardPriority;
  completed: boolean;
}

export interface KanbanColumn {
  id: string;
  title: string;
  tone: ColumnTone;
  cardIds: string[];
}

export interface KanbanCardMap {
  [cardId: string]: KanbanCard;
}

export interface KanbanBoard {
  title: string;
  columns: KanbanColumn[];
  cards: KanbanCardMap;
}

export type BoardAction =
  | { type: "rename-board"; title: string }
  | { type: "add-column"; column: KanbanColumn }
  | { type: "update-column"; columnId: string; title: string; tone: ColumnTone }
  | { type: "delete-column"; columnId: string }
  | { type: "add-card"; columnId: string; card: KanbanCard }
  | { type: "update-card"; card: KanbanCard }
  | { type: "delete-card"; cardId: string }
  | { type: "toggle-card"; cardId: string }
  | { type: "move-card"; cardId: string; toColumnId: string; toIndex?: number; overCardId?: string }
  | { type: "reorder-column"; columnId: string; overColumnId: string }
  | { type: "reset-board"; board: KanbanBoard };
