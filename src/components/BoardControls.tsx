import type { BoardAction, Theme } from "../board/types";

interface BoardControlsProps {
  title: string;
  theme: Theme;
  dispatch: React.Dispatch<BoardAction>;
  onToggleTheme: () => void;
  onReset: () => void;
}

/** Renders compact board controls without a page header. Example: `<BoardControls title="Launch" ... />`. */
export function BoardControls({ title, theme, dispatch, onToggleTheme, onReset }: BoardControlsProps) {
  const nextTheme = theme === "light" ? "dark" : "light";
  return (
    <div className="board-controls" aria-label="Board controls">
      <div className="board-name"><span className="board-mark" aria-hidden="true">▦</span><input aria-label="Board title" value={title} onChange={(event) => dispatch({ type: "rename-board", title: event.target.value })} /></div>
      <div className="board-actions"><span className="save-note">Saved on this device</span><button className="quiet-button" type="button" onClick={onReset}>Reset</button><button className="icon-button" type="button" onClick={onToggleTheme} aria-label={`Use ${nextTheme} mode`} title={`Use ${nextTheme} mode`}><span aria-hidden="true">{theme === "light" ? "☾" : "☀"}</span></button></div>
    </div>
  );
}
