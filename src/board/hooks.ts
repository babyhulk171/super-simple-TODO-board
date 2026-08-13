import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import { boardReducer } from "./boardReducer";
import { loadBoard, saveBoard, type BoardStorage } from "./storage";
import type { BoardAction, KanbanBoard, Theme } from "./types";

const THEME_KEY = "super-simple-todo-theme";
const LEGACY_THEME_KEY = "nimbus-theme";

export type BoardSaveStatus = "saved" | "error";

const UNAVAILABLE_STORAGE: BoardStorage = {
  getItem(): null {
    return null;
  },
  setItem(key: string): void {
    throw new DOMException(`Storage is unavailable for key "${key}"; expected writable localStorage.`, "SecurityError");
  },
};

function getBoardStorage(): BoardStorage {
  try {
    return window.localStorage;
  } catch {
    return UNAVAILABLE_STORAGE;
  }
}

function readStoragePreference(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStoragePreference(key: string, value: string): boolean {
  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

function loadStoredTheme(): Theme {
  const currentTheme = readStoragePreference(THEME_KEY);
  const legacyTheme = readStoragePreference(LEGACY_THEME_KEY);
  const storedTheme = currentTheme ?? legacyTheme;
  const theme: Theme = storedTheme === "dark" ? "dark" : "light";
  if (!currentTheme && legacyTheme) writeStoragePreference(THEME_KEY, theme);
  return theme;
}

function applyThemeToDocument(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
  const themeColor = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (themeColor) themeColor.content = theme === "dark" ? "#11151a" : "#fbfcfe";
}

/** Keeps board changes on this device. Example: `const [board, dispatch] = usePersistentBoard()`. */
export function usePersistentBoard(): [KanbanBoard, React.Dispatch<BoardAction>, BoardSaveStatus] {
  const storage = useMemo(() => getBoardStorage(), []);
  const [board, dispatch] = useReducer(boardReducer, storage, loadBoard);
  const [saveStatus, setSaveStatus] = useState<BoardSaveStatus>("saved");
  useEffect(() => {
    const saveResult = saveBoard(storage, board);
    const statusUpdate = window.setTimeout(() => setSaveStatus(saveResult.saved ? "saved" : "error"), 0);
    return () => window.clearTimeout(statusUpdate);
  }, [board, storage]);
  return [board, dispatch, saveStatus];
}

/** Controls the saved color theme. Example: `const [theme, toggle] = useTheme()`. */
export function useTheme(): [Theme, () => void] {
  const [theme, setTheme] = useState<Theme>(loadStoredTheme);
  useEffect(() => {
    applyThemeToDocument(theme);
    writeStoragePreference(THEME_KEY, theme);
  }, [theme]);
  const toggleTheme = useCallback(() => setTheme((current) => current === "light" ? "dark" : "light"), []);
  return [theme, toggleTheme];
}
