import { closestCorners, DndContext } from "@dnd-kit/core";
import { horizontalListSortingStrategy, SortableContext } from "@dnd-kit/sortable";
import type { BoardAction, KanbanBoard } from "../board/types";
import { useBoardDnd } from "../board/useBoardDnd";
import { KanbanColumnView } from "./KanbanColumnView";

interface BoardViewProps {
  board: KanbanBoard;
  dispatch: React.Dispatch<BoardAction>;
  onAddCard: (columnId: string) => void;
  onEditCard: (cardId: string) => void;
  onAddColumn: () => void;
  onEditColumn: (columnId: string) => void;
}

/** Renders the horizontal drag-and-drop workspace. Example: `<BoardView board={board} ... />`. */
export function BoardView(props: BoardViewProps) {
  const { board, dispatch, onAddCard, onEditCard, onAddColumn, onEditColumn } = props;
  const dnd = useBoardDnd(board, dispatch);
  return (
    <DndContext sensors={dnd.sensors} collisionDetection={closestCorners} onDragEnd={dnd.onDragEnd}>
      <main className="board-shell" id="board"><div className="board-intro"><div><p className="eyebrow">Workspace</p><h1>Make progress visible.</h1></div><p>Drag cards between lists, or use the handles with your keyboard.</p></div>
        <SortableContext items={board.columns.map((column) => column.id)} strategy={horizontalListSortingStrategy}><div className="board-track">{board.columns.map((column) => <KanbanColumnView key={column.id} board={board} column={column} dispatch={dispatch} onAddCard={onAddCard} onEditCard={onEditCard} onEditColumn={onEditColumn} />)}<button className="add-list-button" type="button" onClick={onAddColumn}><span aria-hidden="true">＋</span><strong>Add another list</strong><small>Shape this board around your process</small></button></div></SortableContext>
      </main>
    </DndContext>
  );
}
