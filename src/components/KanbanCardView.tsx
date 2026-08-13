import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { isSurfaceDragBlocked, type CardDragEntity } from "../board/dragTypes";
import type { BoardAction, KanbanCard } from "../board/types";

interface KanbanCardViewProps {
  card: KanbanCard;
  columnId: string;
  dispatch: React.Dispatch<BoardAction>;
  onEdit: (cardId: string) => void;
}

/** Renders an editable, sortable task card. Example: `<KanbanCardView card={card} ... />`. */
export function KanbanCardView({ card, columnId, dispatch, onEdit }: KanbanCardViewProps) {
  const dragEntity: CardDragEntity = { kind: "card", cardId: card.id, columnId };
  const sortable = useSortable({ id: card.id, data: dragEntity });
  const style = { transform: CSS.Transform.toString(sortable.transform), transition: sortable.transition };
  const startCardDrag = (event: React.SyntheticEvent<HTMLElement>, listenerName: "onMouseDown" | "onTouchStart") => {
    event.stopPropagation();
    if (isSurfaceDragBlocked(event.target)) return;
    sortable.listeners?.[listenerName]?.(event);
  };
  return (
    <article ref={sortable.setNodeRef} style={style} className={`kanban-card ${sortable.isDragging ? "is-dragging" : ""} ${card.completed ? "is-complete" : ""}`} onMouseDown={(event) => startCardDrag(event, "onMouseDown")} onTouchStart={(event) => startCardDrag(event, "onTouchStart")}>
      <div className="card-topline"><span className={`priority priority-${card.priority}`}>{card.priority}</span><button ref={sortable.setActivatorNodeRef} className="drag-handle" type="button" aria-label={`Move ${card.title}`} {...sortable.attributes} onKeyDown={(event) => sortable.listeners?.onKeyDown?.(event)}>⠿</button></div>
      <button className="card-content" type="button" onClick={() => onEdit(card.id)}><strong>{card.title}</strong>{card.details && <span>{card.details}</span>}</button>
      <label className="complete-control" data-no-drag="true"><input type="checkbox" checked={card.completed} onChange={() => dispatch({ type: "toggle-card", cardId: card.id })} /><span>{card.completed ? "Completed" : "Mark complete"}</span></label>
    </article>
  );
}
