import type { BoardAction, Theme } from "../board/types";

interface AppHeaderProps {
  title: string;
  theme: Theme;
  dispatch: React.Dispatch<BoardAction>;
  onToggleTheme: () => void;
  onReset: () => void;
}

/** Renders identity, editable board name, and global controls. Example: `<AppHeader title="Launch" ... />`. */
export function AppHeader({ title, theme, dispatch, onToggleTheme, onReset }: AppHeaderProps) {
  return (
    <header className="app-header">
      <a className="brand" href="#board" aria-label="Nimbus board home"><span className="brand-mark">N</span><span>Nimbus</span></a>
      <div className="title-wrap"><span className="eyebrow">My board</span><input aria-label="Board title" value={title} onChange={(event) => dispatch({ type: "rename-board", title: event.target.value })} /></div>
      <nav className="header-actions" aria-label="Board controls">
        <button className="quiet-button" type="button" onClick={onReset}>Reset</button>
        <button className="icon-button" type="button" onClick={onToggleTheme} aria-label={`Use ${theme === "light" ? "dark" : "light"} mode`} title={`Use ${theme === "light" ? "dark" : "light"} mode`}><span aria-hidden="true">{theme === "light" ? "☾" : "☀"}</span></button>
      </nav>
    </header>
  );
}
