import type { BoardAction, KanbanBoard, Theme } from "../board/types";
import { MAX_BOARD_TITLE_LENGTH } from "../board/boardLimits";
import type { BoardSaveStatus } from "../board/hooks";
import type { WorkspaceLoadIssue } from "../board/storage";
import type { WorkspaceBoard } from "../board/workspaceTypes";
import { BoardExportButton } from "./BoardExportButton";
import { BoardSwitcher } from "./BoardSwitcher";

interface BoardControlsProps {
  title: string;
  board: KanbanBoard;
  theme: Theme;
  saveStatus: BoardSaveStatus;
  storageIssue?: WorkspaceLoadIssue;
  dispatch: React.Dispatch<BoardAction>;
  onToggleTheme: () => void;
  onReset: () => void;
  onImportBoard: () => void;
  onReplaceStoredWorkspace: () => void;
  activeBoardId: string;
  boards: WorkspaceBoard[];
  onSelectBoard: (boardId: string) => void;
  onCreateBoard: () => void;
  onDeleteBoard: () => void;
}

/** Renders compact board controls without a page header. Example: `<BoardControls title="Launch" ... />`. */
export function BoardControls({ title, board, theme, saveStatus, storageIssue, dispatch, onToggleTheme, onReset, onImportBoard, onReplaceStoredWorkspace, activeBoardId, boards, onSelectBoard, onCreateBoard, onDeleteBoard }: BoardControlsProps) {
  const nextTheme = theme === "light" ? "dark" : "light";
  const saveMessage = storageIssue ? "Saved data needs recovery" : saveStatus === "conflict" ? "Another tab changed this workspace" : saveStatus === "error" ? "Changes aren’t being saved" : "Saved on this device";
  return (
    <div className="board-controls" aria-label="Board controls">
      <div className="board-name"><span className="board-mark" aria-hidden="true">▦</span><BoardSwitcher activeBoardId={activeBoardId} boards={boards} onSelectBoard={onSelectBoard} onCreateBoard={onCreateBoard} onDeleteBoard={onDeleteBoard} /><input aria-label="Board title" maxLength={MAX_BOARD_TITLE_LENGTH} value={title} onChange={(event) => dispatch({ type: "rename-board", title: event.target.value })} /></div>
      <div className="board-actions"><span className={`save-note ${saveStatus !== "saved" || storageIssue ? "is-error" : ""}`} role="status">{saveMessage}</span>{storageIssue && <button className="quiet-button" type="button" onClick={onReplaceStoredWorkspace}>Replace saved data</button>}<BoardExportButton board={board} /><button className="quiet-button import-button" type="button" onClick={onImportBoard}>Import</button><button className="quiet-button reset-button" type="button" onClick={onReset}>Reset</button><button className="icon-button" type="button" onClick={onToggleTheme} aria-label={`Use ${nextTheme} mode`} title={`Use ${nextTheme} mode`}><span aria-hidden="true">{theme === "light" ? "☾" : "☀"}</span></button></div>
    </div>
  );
}
