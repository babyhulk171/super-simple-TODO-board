import { KeyboardSensor, MouseSensor, TouchSensor, useSensor, useSensors, type DragEndEvent, type DragOverEvent, type DragStartEvent } from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useCallback, useMemo, useState } from "react";
import { calculateCardProjection, projectCardPosition, type CardDragProjection } from "./dragProjection";
import { readBoardDragEntity, type BoardDragEntity } from "./dragTypes";
import type { BoardAction, KanbanBoard } from "./types";

function projectionFromEvent(board: KanbanBoard, cardId: string, event: DragOverEvent | DragEndEvent): CardDragProjection | undefined {
  if (!event.over) return undefined;
  const target = readBoardDragEntity(event.over.data.current);
  if (!target) return undefined;
  const translatedRect = event.active.rect.current.translated;
  const activeCenter = translatedRect ? translatedRect.top + translatedRect.height / 2 : 0;
  const targetCenter = event.over.rect.top + event.over.rect.height / 2;
  return calculateCardProjection(board, cardId, target, activeCenter > targetCenter);
}

function commitDrag(board: KanbanBoard, dispatch: React.Dispatch<BoardAction>, event: DragEndEvent, projection: CardDragProjection | null): void {
  const activeEntity = readBoardDragEntity(event.active.data.current);
  const targetEntity = event.over ? readBoardDragEntity(event.over.data.current) : undefined;
  if (!activeEntity || !targetEntity) return;
  if (activeEntity.kind === "column" && targetEntity.kind === "column") {
    dispatch({ type: "reorder-column", columnId: activeEntity.columnId, overColumnId: targetEntity.columnId });
    return;
  }
  if (activeEntity.kind !== "card") return;
  const finalProjection = projectionFromEvent(board, activeEntity.cardId, event) ?? projection;
  if (!finalProjection) return;
  dispatch({ type: "move-card", cardId: activeEntity.cardId, toColumnId: finalProjection.targetColumnId, toIndex: finalProjection.targetIndex });
}

function useBoardDragSession(board: KanbanBoard, dispatch: React.Dispatch<BoardAction>) {
  const [activeEntity, setActiveEntity] = useState<BoardDragEntity | null>(null);
  const [projection, setProjection] = useState<CardDragProjection | null>(null);
  const projectedBoard = useMemo(() => projectCardPosition(board, projection), [board, projection]);
  const onDragStart = useCallback((event: DragStartEvent) => setActiveEntity(readBoardDragEntity(event.active.data.current) ?? null), []);
  const onDragOver = useCallback((event: DragOverEvent) => {
    const entity = readBoardDragEntity(event.active.data.current);
    if (entity?.kind !== "card") return;
    const nextProjection = projectionFromEvent(board, entity.cardId, event);
    if (nextProjection) setProjection(nextProjection);
  }, [board]);
  const clearSession = useCallback(() => { setActiveEntity(null); setProjection(null); }, []);
  const onDragEnd = useCallback((event: DragEndEvent) => { commitDrag(board, dispatch, event, projection); clearSession(); }, [board, clearSession, dispatch, projection]);
  return { activeEntity, projectedBoard, onDragStart, onDragOver, onDragEnd, onDragCancel: clearSession };
}

/** Connects typed drag sessions to one final board action. Example: pass the result to `DndContext`. */
export function useBoardDnd(board: KanbanBoard, dispatch: React.Dispatch<BoardAction>) {
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  return { sensors, ...useBoardDragSession(board, dispatch) };
}
