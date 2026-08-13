import { useCallback, useEffect, useReducer, useState } from "react";
import { boardReducer } from "./boardReducer";
import { loadBoard, saveBoard } from "./storage";
import type { BoardAction, KanbanBoard, Theme } from "./types";

const THEME_KEY = "nimbus-theme";

/** Keeps board changes on this device. Example: `const [board, dispatch] = usePersistentBoard()`. */
export function usePersistentBoard(): [KanbanBoard, React.Dispatch<BoardAction>] {
  const [board, dispatch] = useReducer(boardReducer, window.localStorage, loadBoard);
  useEffect(() => saveBoard(window.localStorage, board), [board]);
  return [board, dispatch];
}

/** Controls the saved color theme. Example: `const [theme, toggle] = useTheme()`. */
export function useTheme(): [Theme, () => void] {
  const savedTheme = window.localStorage.getItem(THEME_KEY);
  const [theme, setTheme] = useState<Theme>(savedTheme === "dark" ? "dark" : "light");
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(THEME_KEY, theme);
  }, [theme]);
  const toggleTheme = useCallback(() => setTheme((current) => current === "light" ? "dark" : "light"), []);
  return [theme, toggleTheme];
}
