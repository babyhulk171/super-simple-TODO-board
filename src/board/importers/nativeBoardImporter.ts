import { CURRENT_BOARD_VERSION } from "../boardMigrations";
import { parseBoard } from "../boardValidation";
import type { KanbanBoard } from "../types";
import type { BoardImportAdapter, BoardImportContext, BoardImportResult } from "./importTypes";
import { countBoardCards, isJsonRecord, remapImportedBoard } from "./importUtilities";

function readNativeBoard(value: unknown): KanbanBoard | undefined {
  if (!isJsonRecord(value)) return undefined;
  if (value.version === CURRENT_BOARD_VERSION) return parseBoard(value.board);
  return parseBoard(value);
}

function convertNativeBoard(value: unknown, context: BoardImportContext): BoardImportResult | undefined {
  const sourceBoard = readNativeBoard(value);
  if (!sourceBoard) return undefined;
  const board = remapImportedBoard(sourceBoard, context.createId);
  return {
    source: "super-simple-todo",
    sourceLabel: "Super Simple TODO",
    board,
    summary: { columns: board.columns.length, cards: countBoardCards(board) },
    warnings: [],
  };
}

export const nativeBoardImporter: BoardImportAdapter = {
  source: "super-simple-todo",
  canImport: (value) => Boolean(readNativeBoard(value)),
  convert: convertNativeBoard,
};
