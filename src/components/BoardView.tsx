import { closestCorners, DndContext, DragOverlay } from "@dnd-kit/core";
import { horizontalListSortingStrategy, SortableContext } from "@dnd-kit/sortable";
import { useState } from "react";
import type { BoardAction, KanbanBoard, Theme } from "../board/types";
import { useBoardDnd } from "../board/useBoardDnd";
import { BoardControls } from "./BoardControls";
import { KanbanColumnView } from "./KanbanColumnView";

interface BoardViewProps {
  board: KanbanBoard;
  theme: Theme;
  dispatch: React.Dispatch<BoardAction>;
  onToggleTheme: () => void;
  onReset: () => void;
  onAddCard: (columnId: string) => void;
  onEditCard: (cardId: string) => void;
  onAddColumn: () => void;
  onEditColumn: (columnId: string) => void;
}

/** Renders the horizontal drag-and-drop workspace. Example: `<BoardView board={board} ... />`. */
export function BoardView(props: BoardViewProps) {
  const { board, theme, dispatch, onToggleTheme, onReset, onAddCard, onEditCard, onAddColumn, onEditColumn } = props;
  const dnd = useBoardDnd(board, dispatch);
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const activeCard = activeCardId ? board.cards[activeCardId] : undefined;
  return (
    <DndContext sensors={dnd.sensors} collisionDetection={closestCorners} onDragStart={(event) => { const activeId = String(event.active.id); setActiveCardId(board.cards[activeId] ? activeId : null); }} onDragEnd={(event) => { dnd.onDragEnd(event); setActiveCardId(null); }} onDragCancel={() => setActiveCardId(null)}>
      <main className="board-shell" id="board"><BoardControls title={board.title} theme={theme} dispatch={dispatch} onToggleTheme={onToggleTheme} onReset={onReset} />
        <SortableContext items={board.columns.map((column) => column.id)} strategy={horizontalListSortingStrategy}><div className="board-track">{board.columns.map((column) => <KanbanColumnView key={column.id} board={board} column={column} dispatch={dispatch} onAddCard={onAddCard} onEditCard={onEditCard} onEditColumn={onEditColumn} />)}<button className="add-list-button" type="button" onClick={onAddColumn}><span aria-hidden="true">＋</span><strong>Add another list</strong><small>Shape this board around your process</small></button></div></SortableContext>
      </main>
      <DragOverlay>{activeCard && <article className={`kanban-card card-drag-preview ${activeCard.completed ? "is-complete" : ""}`} aria-hidden="true"><div className="card-topline"><span className={`priority priority-${activeCard.priority}`}>{activeCard.priority}</span></div><strong className="card-drag-preview-title">{activeCard.title}</strong>{activeCard.details && <span className="card-drag-preview-details">{activeCard.details}</span>}</article>}</DragOverlay>
    </DndContext>
  );
}
