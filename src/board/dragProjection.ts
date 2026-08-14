import { relocateCardId } from "./cardPlacement";
import { findBoardColumn, findCardColumn } from "./selectors";
import type { BoardDragEntity } from "./dragTypes";
import type { KanbanBoard, KanbanColumn } from "./types";

export interface CardDragProjection {
  cardId: string;
  targetColumnId: string;
  targetIndex: number;
}

function resolveTargetColumn(board: KanbanBoard, target: BoardDragEntity): KanbanColumn | undefined {
  const targetColumn = findBoardColumn(board, target.columnId);
  return targetColumn;
}

function resolveTargetIndex(column: KanbanColumn, cardId: string, target: BoardDragEntity, insertAfter: boolean): number | undefined {
  const availableCardIds = column.cardIds.filter((candidateId) => candidateId !== cardId);
  if (target.kind === "column") return availableCardIds.length;
  const overIndex = availableCardIds.indexOf(target.cardId);
  if (overIndex < 0) return undefined;
  return overIndex + (insertAfter ? 1 : 0);
}

/** Calculates a card's temporary destination. Example: `calculateCardProjection(board, id, target, false)`. */
export function calculateCardProjection(board: KanbanBoard, cardId: string, target: BoardDragEntity, insertAfter: boolean): CardDragProjection | undefined {
  if (target.kind === "card" && target.cardId === cardId) return undefined;
  const targetColumn = resolveTargetColumn(board, target);
  if (!targetColumn) return undefined;
  const targetIndex = resolveTargetIndex(targetColumn, cardId, target, insertAfter);
  if (targetIndex === undefined) return undefined;
  return { cardId, targetColumnId: targetColumn.id, targetIndex };
}

/** Builds an ephemeral board for live drag feedback. Example: `projectCardPosition(board, projection)`. */
export function projectCardPosition(board: KanbanBoard, projection: CardDragProjection | null): KanbanBoard {
  if (!projection) return board;
  if (!board.cards[projection.cardId] || !findCardColumn(board, projection.cardId)) return board;
  const columns = relocateCardId(board.columns, projection.cardId, projection.targetColumnId, projection.targetIndex);
  if (!columns) return board;
  return { ...board, columns };
}
