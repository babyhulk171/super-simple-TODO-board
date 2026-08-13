import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { isSurfaceDragBlocked, type ColumnDragEntity } from "../board/dragTypes";
import type { BoardAction, KanbanBoard, KanbanColumn } from "../board/types";
import { KanbanCardView } from "./KanbanCardView";

interface KanbanColumnViewProps {
  board: KanbanBoard;
  column: KanbanColumn;
  dispatch: React.Dispatch<BoardAction>;
  onAddCard: (columnId: string) => void;
  onEditCard: (cardId: string) => void;
  onEditColumn: (columnId: string) => void;
}

/** Renders one sortable list and its task stack. Example: `<KanbanColumnView column={column} ... />`. */
export function KanbanColumnView(props: KanbanColumnViewProps) {
  const { board, column, dispatch, onAddCard, onEditCard, onEditColumn } = props;
  const dragEntity: ColumnDragEntity = { kind: "column", columnId: column.id };
  const sortable = useSortable({ id: column.id, data: dragEntity });
  const style = { transform: CSS.Transform.toString(sortable.transform), transition: sortable.transition };
  const startColumnDrag = (event: React.SyntheticEvent<HTMLElement>, listenerName: "onMouseDown" | "onTouchStart") => {
    if (isSurfaceDragBlocked(event.target)) return;
    sortable.listeners?.[listenerName]?.(event);
  };
  return (
    <section ref={sortable.setNodeRef} style={style} className={`kanban-column tone-${column.tone} ${sortable.isDragging ? "is-dragging" : ""}`} onMouseDown={(event) => startColumnDrag(event, "onMouseDown")} onTouchStart={(event) => startColumnDrag(event, "onTouchStart")}>
      <header className="column-header"><div><span className="tone-dot" /><h2>{column.title}</h2><span className="card-count">{column.cardIds.length}</span></div><div className="column-tools"><button ref={sortable.setActivatorNodeRef} className="drag-handle" type="button" aria-label={`Move ${column.title} list`} {...sortable.attributes} onKeyDown={(event) => sortable.listeners?.onKeyDown?.(event)}>⠿</button><button className="small-icon" type="button" data-no-drag="true" onClick={() => onEditColumn(column.id)} aria-label={`Edit ${column.title}`}>•••</button></div></header>
      <SortableContext items={column.cardIds} strategy={verticalListSortingStrategy}><div className="card-stack">{column.cardIds.map((cardId) => board.cards[cardId] && <KanbanCardView key={cardId} card={board.cards[cardId]} columnId={column.id} dispatch={dispatch} onEdit={onEditCard} />)}</div></SortableContext>
      <button className="add-card-button" type="button" data-no-drag="true" onClick={() => onAddCard(column.id)}><span aria-hidden="true">＋</span> Add a card</button>
    </section>
  );
}
