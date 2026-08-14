import { CURRENT_BOARD_VERSION } from "../boardMigrations";
import { parseBoard } from "../boardValidation";
import type { KanbanBoard } from "../types";
import type { BoardImportAdapter, BoardImportContext, BoardImportConversion } from "./importTypes";
import { isJsonRecord, remapImportedBoard } from "./importUtilities";

function readNativeBoard(value: unknown): KanbanBoard | undefined {
  if (!isJsonRecord(value)) return undefined;
  if (value.version === CURRENT_BOARD_VERSION) return parseBoard(value.board);
  return parseBoard(value);
}

function convertNativeBoard(value: unknown, context: BoardImportContext): BoardImportConversion | undefined {
  const sourceBoard = readNativeBoard(value);
  if (!sourceBoard) return undefined;
  const board = remapImportedBoard(sourceBoard, context.createId);
  return {
    source: "super-simple-todo",
    sourceLabel: "Super Simple TODO",
    board,
    warnings: [],
  };
}

export const nativeBoardImporter: BoardImportAdapter = {
  source: "super-simple-todo",
  canImport: (value) => Boolean(readNativeBoard(value)),
  convert: convertNativeBoard,
};
