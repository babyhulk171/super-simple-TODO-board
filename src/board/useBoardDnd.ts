import { KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useCallback } from "react";
import type { BoardAction, KanbanBoard } from "./types";

function findCardColumnId(board: KanbanBoard, cardId: string): string | undefined {
  return board.columns.find((column) => column.cardIds.includes(cardId))?.id;
}

function findTargetColumnId(board: KanbanBoard, overId: string): string | undefined {
  const directColumn = board.columns.find((column) => column.id === overId);
  if (directColumn) return directColumn.id;
  return findCardColumnId(board, overId);
}

function moveDroppedEntity(board: KanbanBoard, dispatch: React.Dispatch<BoardAction>, event: DragEndEvent): void {
  if (!event.over || event.active.id === event.over.id) return;
  const activeId = String(event.active.id);
  const overId = String(event.over.id);
  const isColumn = board.columns.some((column) => column.id === activeId);
  if (isColumn) {
    const overColumnId = findTargetColumnId(board, overId);
    if (overColumnId) dispatch({ type: "reorder-column", columnId: activeId, overColumnId });
    return;
  }
  const toColumnId = findTargetColumnId(board, overId);
  if (toColumnId) dispatch({ type: "move-card", cardId: activeId, toColumnId, overCardId: overId });
}

/** Connects mouse, touch, and keyboard dragging to board actions. Example: pass the result to `DndContext`. */
export function useBoardDnd(board: KanbanBoard, dispatch: React.Dispatch<BoardAction>) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const onDragEnd = useCallback((event: DragEndEvent) => moveDroppedEntity(board, dispatch, event), [board, dispatch]);
  return { sensors, onDragEnd };
}
