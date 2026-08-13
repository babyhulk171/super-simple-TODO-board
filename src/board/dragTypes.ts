export interface CardDragEntity {
  kind: "card";
  cardId: string;
  columnId: string;
}

export interface ColumnDragEntity {
  kind: "column";
  columnId: string;
}

export type BoardDragEntity = CardDragEntity | ColumnDragEntity;

/** Reads typed drag metadata. Example: `readBoardDragEntity(active.data.current)`. */
export function readBoardDragEntity(value: unknown): BoardDragEntity | undefined {
  if (!value || typeof value !== "object") return undefined;
  const candidate = value as Record<string, unknown>;
  if (candidate.kind === "column" && typeof candidate.columnId === "string") {
    return { kind: "column", columnId: candidate.columnId };
  }
  if (candidate.kind === "card" && typeof candidate.cardId === "string" && typeof candidate.columnId === "string") {
    return { kind: "card", cardId: candidate.cardId, columnId: candidate.columnId };
  }
  return undefined;
}

/** Identifies controls that must not activate a surface drag. Example: `isSurfaceDragBlocked(event.target)`. */
export function isSurfaceDragBlocked(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  const blockedControl = target.closest("[data-no-drag='true']");
  return Boolean(blockedControl);
}
