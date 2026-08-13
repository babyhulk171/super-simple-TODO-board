import { closestCorners, pointerWithin, type Collision, type CollisionDetection, type DroppableContainer } from "@dnd-kit/core";
import { readBoardDragEntity, type BoardDragEntity } from "./dragTypes";

function findCollisionEntity(collision: Collision, containers: DroppableContainer[]): BoardDragEntity | undefined {
  const matchingContainer = containers.find((container) => container.id === collision.id);
  return readBoardDragEntity(matchingContainer?.data.current);
}

function findColumnCards(containers: DroppableContainer[], columnId: string): DroppableContainer[] {
  return containers.filter((container) => {
    const candidate = readBoardDragEntity(container.data.current);
    return candidate?.kind === "card" && candidate.columnId === columnId;
  });
}

/** Chooses drop targets according to the active entity type. Example: pass to `DndContext`. */
export const boardCollisionDetection: CollisionDetection = (arguments_) => {
  const activeEntity = readBoardDragEntity(arguments_.active.data.current);
  if (!activeEntity) return closestCorners(arguments_);
  const eligibleContainers = arguments_.droppableContainers.filter((container) => {
    const candidate = readBoardDragEntity(container.data.current);
    return activeEntity.kind === "column" ? candidate?.kind === "column" : Boolean(candidate);
  });
  const eligibleArguments = { ...arguments_, droppableContainers: eligibleContainers };
  if (activeEntity.kind === "column") return closestCorners(eligibleArguments);
  const pointerCollisions = pointerWithin(eligibleArguments);
  const cardCollisions = pointerCollisions.filter((collision) => findCollisionEntity(collision, eligibleContainers)?.kind === "card");
  if (cardCollisions.length > 0) return cardCollisions;
  const columnCollision = pointerCollisions.find((collision) => findCollisionEntity(collision, eligibleContainers)?.kind === "column");
  if (columnCollision) {
    const columnEntity = findCollisionEntity(columnCollision, eligibleContainers);
    const columnCards = findColumnCards(eligibleContainers, columnEntity?.columnId ?? "");
    return columnCards.length > 0
      ? closestCorners({ ...arguments_, droppableContainers: columnCards })
      : [columnCollision];
  }
  return closestCorners(eligibleArguments);
};
