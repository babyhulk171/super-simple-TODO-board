import { closestCorners, DndContext } from "@dnd-kit/core";
import { horizontalListSortingStrategy, SortableContext } from "@dnd-kit/sortable";
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
  return (
    <DndContext sensors={dnd.sensors} collisionDetection={closestCorners} onDragEnd={dnd.onDragEnd}>
      <main className="board-shell" id="board"><BoardControls title={board.title} theme={theme} dispatch={dispatch} onToggleTheme={onToggleTheme} onReset={onReset} />
        <SortableContext items={board.columns.map((column) => column.id)} strategy={horizontalListSortingStrategy}><div className="board-track">{board.columns.map((column) => <KanbanColumnView key={column.id} board={board} column={column} dispatch={dispatch} onAddCard={onAddCard} onEditCard={onEditCard} onEditColumn={onEditColumn} />)}<button className="add-list-button" type="button" onClick={onAddColumn}><span aria-hidden="true">＋</span><strong>Add another list</strong><small>Shape this board around your process</small></button></div></SortableContext>
      </main>
    </DndContext>
  );
}
