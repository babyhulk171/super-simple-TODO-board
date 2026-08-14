import type { KanbanColumn } from "./types";

function removeCardId(columns: KanbanColumn[], cardId: string): KanbanColumn[] {
  return columns.map((column) => ({ ...column, cardIds: column.cardIds.filter((id) => id !== cardId) }));
}

/** Moves one card ID to a bounded position in a target column. Example: `relocateCardId(columns, "card-1", "done", 0)`. */
export function relocateCardId(columns: KanbanColumn[], cardId: string, targetColumnId: string, targetIndex: number): KanbanColumn[] | undefined {
  const targetColumn = columns.find((column) => column.id === targetColumnId);
  if (!targetColumn) return undefined;
  const columnsWithoutCard = removeCardId(columns, cardId);
  return columnsWithoutCard.map((column) => {
    if (column.id !== targetColumnId) return column;
    const index = Math.min(Math.max(targetIndex, 0), column.cardIds.length);
    return { ...column, cardIds: [...column.cardIds.slice(0, index), cardId, ...column.cardIds.slice(index)] };
  });
}
