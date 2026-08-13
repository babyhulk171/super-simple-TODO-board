import { useCallback, useState } from "react";
import { initialBoard } from "./board/initialBoard";
import { usePersistentBoard, useTheme } from "./board/hooks";
import { findBoardCard, findBoardColumn, findCardColumn } from "./board/selectors";
import type { KanbanBoard } from "./board/types";
import { BoardView } from "./components/BoardView";
import { CardDialog } from "./components/CardDialog";
import { ColumnDialog } from "./components/ColumnDialog";
import { ImportBoardDialog } from "./components/ImportBoardDialog";
import type { EditorState } from "./components/editorTypes";
import "./styles.css";

/** Composes the complete local-first Kanban app. Example: `createRoot(node).render(<App />)`. */
export default function App() {
  const [board, dispatch, saveStatus] = usePersistentBoard();
  const [theme, toggleTheme] = useTheme();
  const [editor, setEditor] = useState<EditorState>(null);
  const closeEditor = useCallback(() => setEditor(null), []);
  const resetBoard = () => window.confirm("Reset this board to the starter content?") && dispatch({ type: "reset-board", board: initialBoard });
  const openNewCard = (columnId: string) => setEditor({ kind: "new-card", columnId });
  const openCard = (cardId: string) => setEditor({ kind: "card", cardId });
  const openNewColumn = () => setEditor({ kind: "new-column" });
  const openColumn = (columnId: string) => setEditor({ kind: "column", columnId });
  const openBoardImport = () => setEditor({ kind: "import-board" });
  const replaceBoard = (importedBoard: KanbanBoard) => {
    dispatch({ type: "reset-board", board: importedBoard });
    closeEditor();
  };
  const editedCard = editor?.kind === "card" ? findBoardCard(board, editor.cardId) : undefined;
  const cardColumnId = editor?.kind === "new-card" ? editor.columnId : findCardColumn(board, editedCard?.id ?? "")?.id;
  const editedColumn = editor?.kind === "column" ? findBoardColumn(board, editor.columnId) : undefined;
  return (
    <div className="app-frame">
      <BoardView board={board} theme={theme} saveStatus={saveStatus} dispatch={dispatch} onToggleTheme={toggleTheme} onReset={resetBoard} onImportBoard={openBoardImport} onAddCard={openNewCard} onEditCard={openCard} onAddColumn={openNewColumn} onEditColumn={openColumn} />
      {(editor?.kind === "new-card" || editedCard) && cardColumnId && <CardDialog card={editedCard} columnId={cardColumnId} dispatch={dispatch} onClose={closeEditor} />}
      {(editor?.kind === "new-column" || editedColumn) && <ColumnDialog column={editedColumn} dispatch={dispatch} onClose={closeEditor} />}
      {editor?.kind === "import-board" && <ImportBoardDialog onImport={replaceBoard} onClose={closeEditor} />}
    </div>
  );
}
