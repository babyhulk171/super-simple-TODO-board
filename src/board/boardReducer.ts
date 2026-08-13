import type { BoardAction, KanbanBoard, KanbanCard, KanbanColumn } from "./types";

function addColumn(board: KanbanBoard, column: KanbanColumn): KanbanBoard {
  return { ...board, columns: [...board.columns, column] };
}

function updateColumn(board: KanbanBoard, action: Extract<BoardAction, { type: "update-column" }>): KanbanBoard {
  const columns = board.columns.map((column) => column.id === action.columnId
    ? { ...column, title: action.title, tone: action.tone }
    : column);
  return { ...board, columns };
}

function deleteColumn(board: KanbanBoard, columnId: string): KanbanBoard {
  const removed = board.columns.find((column) => column.id === columnId);
  const removedIds = new Set(removed?.cardIds ?? []);
  const cards = Object.fromEntries(Object.entries(board.cards).filter(([id]) => !removedIds.has(id)));
  return { ...board, columns: board.columns.filter((column) => column.id !== columnId), cards };
}

function addCard(board: KanbanBoard, columnId: string, card: KanbanCard): KanbanBoard {
  const columns = board.columns.map((column) => column.id === columnId
    ? { ...column, cardIds: [...column.cardIds, card.id] }
    : column);
  return { ...board, columns, cards: { ...board.cards, [card.id]: card } };
}

function updateCard(board: KanbanBoard, card: KanbanCard): KanbanBoard {
  return { ...board, cards: { ...board.cards, [card.id]: card } };
}

function deleteCard(board: KanbanBoard, cardId: string): KanbanBoard {
  const { [cardId]: removedCard, ...cards } = board.cards;
  void removedCard;
  const columns = board.columns.map((column) => ({ ...column, cardIds: column.cardIds.filter((id) => id !== cardId) }));
  return { ...board, columns, cards };
}

function toggleCard(board: KanbanBoard, cardId: string): KanbanBoard {
  const card = board.cards[cardId];
  if (!card) return board;
  return updateCard(board, { ...card, completed: !card.completed });
}

function moveCard(board: KanbanBoard, action: Extract<BoardAction, { type: "move-card" }>): KanbanBoard {
  const columns = board.columns.map((column) => ({ ...column, cardIds: column.cardIds.filter((id) => id !== action.cardId) }));
  const targetIndex = columns.findIndex((column) => column.id === action.toColumnId);
  if (targetIndex < 0) return board;
  const target = columns[targetIndex];
  const overIndex = action.overCardId ? target.cardIds.indexOf(action.overCardId) : -1;
  const insertAt = overIndex < 0 ? target.cardIds.length : overIndex;
  target.cardIds.splice(insertAt, 0, action.cardId);
  return { ...board, columns };
}

function reorderColumn(board: KanbanBoard, columnId: string, overColumnId: string): KanbanBoard {
  const fromIndex = board.columns.findIndex((column) => column.id === columnId);
  const toIndex = board.columns.findIndex((column) => column.id === overColumnId);
  if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return board;
  const columns = [...board.columns];
  const [moved] = columns.splice(fromIndex, 1);
  columns.splice(toIndex, 0, moved);
  return { ...board, columns };
}

/** Applies one immutable board change. Example: `boardReducer(board, { type: "rename-board", title: "Roadmap" })`. */
export function boardReducer(board: KanbanBoard, action: BoardAction): KanbanBoard {
  switch (action.type) {
    case "rename-board": return { ...board, title: action.title };
    case "add-column": return addColumn(board, action.column);
    case "update-column": return updateColumn(board, action);
    case "delete-column": return deleteColumn(board, action.columnId);
    case "add-card": return addCard(board, action.columnId, action.card);
    case "update-card": return updateCard(board, action.card);
    case "delete-card": return deleteCard(board, action.cardId);
    case "toggle-card": return toggleCard(board, action.cardId);
    case "move-card": return moveCard(board, action);
    case "reorder-column": return reorderColumn(board, action.columnId, action.overColumnId);
    case "reset-board": return action.board;
  }
}
