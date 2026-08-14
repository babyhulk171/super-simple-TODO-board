import { useCallback, useState } from "react";
import { createInitialBoard } from "./board/initialBoard";
import { usePersistentWorkspace, useTheme } from "./board/hooks";
import { findBoardCard, findBoardColumn, findCardColumn } from "./board/selectors";
import type { BoardAction, KanbanBoard } from "./board/types";
import { BoardView } from "./components/BoardView";
import { CardDialog } from "./components/CardDialog";
import { ColumnDialog } from "./components/ColumnDialog";
import { ImportBoardDialog } from "./components/ImportBoardDialog";
import type { EditorState } from "./components/editorTypes";
import "./styles.css";

/** Composes the complete local-first Kanban app. Example: `createRoot(node).render(<App />)`. */
export default function App() {
  const [workspace, dispatchWorkspace, saveStatus, storageIssue, replaceInvalidStorage] = usePersistentWorkspace();
  const [theme, toggleTheme] = useTheme();
  const [editor, setEditor] = useState<EditorState>(null);
  const closeEditor = useCallback(() => setEditor(null), []);
  const activeBoard = workspace.boards.find((entry) => entry.id === workspace.activeBoardId);
  if (!activeBoard) return null;
  const dispatchBoard: React.Dispatch<BoardAction> = (action) => dispatchWorkspace({ type: "apply-board-action", boardId: activeBoard.id, action });
  const selectBoard = (boardId: string) => {
    closeEditor();
    dispatchWorkspace({ type: "select-board", boardId });
  };
  const createBoard = () => {
    const board = { ...createInitialBoard(), title: "Untitled board" };
    dispatchWorkspace({ type: "add-board", board: { id: crypto.randomUUID(), board } });
  };
  const deleteBoard = () => {
    if (workspace.boards.length === 1 || !window.confirm(`Delete “${activeBoard.board.title}”?`)) return;
    closeEditor();
    dispatchWorkspace({ type: "delete-board", boardId: activeBoard.id });
  };
  const replaceStoredWorkspace = () => {
    if (window.confirm("Replace the unreadable saved workspace with the boards currently on screen?")) replaceInvalidStorage();
  };
  const resetBoard = () => window.confirm("Reset this board to the starter content?") && dispatchBoard({ type: "reset-board", board: createInitialBoard() });
  const openNewCard = (columnId: string) => setEditor({ kind: "new-card", columnId });
  const openCard = (cardId: string) => setEditor({ kind: "card", cardId });
  const openNewColumn = () => setEditor({ kind: "new-column" });
  const openColumn = (columnId: string) => setEditor({ kind: "column", columnId });
  const openBoardImport = () => setEditor({ kind: "import-board" });
  const replaceBoard = (importedBoard: KanbanBoard) => {
    dispatchBoard({ type: "reset-board", board: importedBoard });
    closeEditor();
  };
  const editedCard = editor?.kind === "card" ? findBoardCard(activeBoard.board, editor.cardId) : undefined;
  const cardColumnId = editor?.kind === "new-card" ? editor.columnId : findCardColumn(activeBoard.board, editedCard?.id ?? "")?.id;
  const editedColumn = editor?.kind === "column" ? findBoardColumn(activeBoard.board, editor.columnId) : undefined;
  return (
    <div className="app-frame">
      <BoardView key={activeBoard.id} board={activeBoard.board} theme={theme} saveStatus={saveStatus} storageIssue={storageIssue} dispatch={dispatchBoard} onToggleTheme={toggleTheme} onReset={resetBoard} onImportBoard={openBoardImport} onReplaceStoredWorkspace={replaceStoredWorkspace} onAddCard={openNewCard} onEditCard={openCard} onAddColumn={openNewColumn} onEditColumn={openColumn} activeBoardId={activeBoard.id} boards={workspace.boards} onSelectBoard={selectBoard} onCreateBoard={createBoard} onDeleteBoard={deleteBoard} />
      {(editor?.kind === "new-card" || editedCard) && cardColumnId && <CardDialog card={editedCard} columnId={cardColumnId} dispatch={dispatchBoard} onClose={closeEditor} />}
      {(editor?.kind === "new-column" || editedColumn) && <ColumnDialog column={editedColumn} dispatch={dispatchBoard} onClose={closeEditor} />}
      {editor?.kind === "import-board" && <ImportBoardDialog onImport={replaceBoard} onClose={closeEditor} />}
    </div>
  );
}
