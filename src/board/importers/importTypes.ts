import type { KanbanBoard } from "../types";

export type BoardImportSource = "super-simple-todo" | "trello";

export interface BoardImportWarning {
  code: string;
  count: number;
  message: string;
}

export interface BoardImportSummary {
  columns: number;
  cards: number;
}

export interface BoardImportResult {
  source: BoardImportSource;
  sourceLabel: string;
  board: KanbanBoard;
  summary: BoardImportSummary;
  warnings: BoardImportWarning[];
}

export interface BoardImportContext {
  createId: () => string;
}

export interface BoardImportAdapter {
  source: BoardImportSource;
  canImport: (value: unknown) => boolean;
  convert: (value: unknown, context: BoardImportContext) => BoardImportResult | undefined;
}

export type BoardImportOutcome =
  | { ok: true; result: BoardImportResult }
  | { ok: false; message: string };
