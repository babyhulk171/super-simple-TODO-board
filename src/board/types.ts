export type ColumnTone = "blue" | "violet" | "amber" | "green" | "rose";
export type CardPriority = "low" | "medium" | "high";
export type Theme = "light" | "dark";

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
