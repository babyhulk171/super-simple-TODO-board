import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { BoardAction, KanbanCard } from "../board/types";

interface KanbanCardViewProps {
  card: KanbanCard;
  dispatch: React.Dispatch<BoardAction>;
  onEdit: (cardId: string) => void;
}

/** Renders an editable, sortable task card. Example: `<KanbanCardView card={card} ... />`. */
export function KanbanCardView({ card, dispatch, onEdit }: KanbanCardViewProps) {
  const sortable = useSortable({ id: card.id });
  const style = { transform: CSS.Transform.toString(sortable.transform), transition: sortable.transition };
  return (
    <article ref={sortable.setNodeRef} style={style} className={`kanban-card ${sortable.isDragging ? "is-dragging" : ""} ${card.completed ? "is-complete" : ""}`}>
      <div className="card-topline"><span className={`priority priority-${card.priority}`}>{card.priority}</span><button className="drag-handle" type="button" aria-label={`Move ${card.title}`} {...sortable.attributes} {...sortable.listeners}>⠿</button></div>
      <button className="card-content" type="button" onClick={() => onEdit(card.id)}><strong>{card.title}</strong>{card.details && <span>{card.details}</span>}</button>
      <label className="complete-control"><input type="checkbox" checked={card.completed} onChange={() => dispatch({ type: "toggle-card", cardId: card.id })} /><span>{card.completed ? "Completed" : "Mark complete"}</span></label>
    </article>
  );
}
