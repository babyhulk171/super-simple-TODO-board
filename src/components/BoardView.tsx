import { DndContext, DragOverlay } from "@dnd-kit/core";
import { horizontalListSortingStrategy, SortableContext } from "@dnd-kit/sortable";
import { boardCollisionDetection } from "../board/boardCollisionDetection";
import type { BoardSaveStatus } from "../board/hooks";
import { findBoardCard } from "../board/selectors";
import type { BoardAction, KanbanBoard, Theme } from "../board/types";
import { useBoardDnd } from "../board/useBoardDnd";
import { BoardControls } from "./BoardControls";
import { CardDragPreview } from "./CardDragPreview";
import { KanbanColumnView } from "./KanbanColumnView";

interface BoardViewProps {
  board: KanbanBoard;
  theme: Theme;
  saveStatus: BoardSaveStatus;
  dispatch: React.Dispatch<BoardAction>;
  onToggleTheme: () => void;
  onReset: () => void;
  onImportBoard: () => void;
  onAddCard: (columnId: string) => void;
  onEditCard: (cardId: string) => void;
  onAddColumn: () => void;
  onEditColumn: (columnId: string) => void;
}

interface BoardTrackProps extends Pick<BoardViewProps, "dispatch" | "onAddCard" | "onEditCard" | "onAddColumn" | "onEditColumn"> {
  board: KanbanBoard;
}

function BoardTrack({ board, dispatch, onAddCard, onEditCard, onAddColumn, onEditColumn }: BoardTrackProps) {
  return (
    <SortableContext items={board.columns.map((column) => column.id)} strategy={horizontalListSortingStrategy}>
      <div className="board-scroller"><div className="board-track">
        {board.columns.map((column) => <KanbanColumnView key={column.id} board={board} column={column} dispatch={dispatch} onAddCard={onAddCard} onEditCard={onEditCard} onEditColumn={onEditColumn} />)}
        <button className="add-list-button" type="button" onClick={onAddColumn}><span aria-hidden="true">＋</span><strong>Add another list</strong><small>Shape this board around your process</small></button>
      </div></div>
    </SortableContext>
  );
}

/** Renders the horizontal drag-and-drop workspace. Example: `<BoardView board={board} ... />`. */
export function BoardView(props: BoardViewProps) {
  const { board, theme, saveStatus, dispatch, onToggleTheme, onReset, onImportBoard } = props;
  const dnd = useBoardDnd(board, dispatch);
  const activeCard = dnd.activeEntity?.kind === "card" ? findBoardCard(board, dnd.activeEntity.cardId) : undefined;
  return (
    <DndContext sensors={dnd.sensors} collisionDetection={boardCollisionDetection} onDragStart={dnd.onDragStart} onDragOver={dnd.onDragOver} onDragEnd={dnd.onDragEnd} onDragCancel={dnd.onDragCancel}>
      <main className="board-shell" id="board">
        <BoardControls title={board.title} theme={theme} saveStatus={saveStatus} dispatch={dispatch} onToggleTheme={onToggleTheme} onReset={onReset} onImportBoard={onImportBoard} />
        <BoardTrack {...props} board={dnd.projectedBoard} />
      </main>
      <DragOverlay>{activeCard && <CardDragPreview card={activeCard} />}</DragOverlay>
    </DndContext>
  );
}
