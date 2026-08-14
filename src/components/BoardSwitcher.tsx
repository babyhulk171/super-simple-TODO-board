import type { WorkspaceBoard } from "../board/workspaceTypes";

interface BoardSwitcherProps {
  activeBoardId: string;
  boards: WorkspaceBoard[];
  onSelectBoard: (boardId: string) => void;
  onCreateBoard: () => void;
  onDeleteBoard: () => void;
}

/** Selects the visible board and exposes board lifecycle controls. Example: `<BoardSwitcher boards={boards} ... />`. */
export function BoardSwitcher({ activeBoardId, boards, onSelectBoard, onCreateBoard, onDeleteBoard }: BoardSwitcherProps) {
  return (
    <div className="board-switcher">
      <label className="visually-hidden" htmlFor="board-select">Choose board</label>
      <select id="board-select" value={activeBoardId} onChange={(event) => onSelectBoard(event.target.value)}>{boards.map((entry) => <option key={entry.id} value={entry.id}>{entry.board.title || "Untitled board"}</option>)}</select>
      <button className="quiet-button" type="button" onClick={onCreateBoard}>New</button>
      <button className="small-icon" type="button" onClick={onDeleteBoard} disabled={boards.length === 1} aria-label="Delete current board" title="Delete current board">×</button>
    </div>
  );
}
