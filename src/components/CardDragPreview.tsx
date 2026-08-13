import type { KanbanCard } from "../board/types";

interface CardDragPreviewProps {
  card: KanbanCard;
}

/** Renders the floating representation of a dragged card. Example: `<CardDragPreview card={card} />`. */
export function CardDragPreview({ card }: CardDragPreviewProps) {
  return (
    <article className={`kanban-card card-drag-preview ${card.completed ? "is-complete" : ""}`} aria-hidden="true">
      <div className="card-topline"><span className={`priority priority-${card.priority}`}>{card.priority}</span></div>
      <strong className="card-drag-preview-title">{card.title}</strong>
      {card.details && <span className="card-drag-preview-details">{card.details}</span>}
    </article>
  );
}
