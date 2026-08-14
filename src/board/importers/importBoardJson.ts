import { parseBoard } from "../boardValidation";
import { nativeBoardImporter } from "./nativeBoardImporter";
import { trelloBoardImporter } from "./trelloBoardImporter";
import type { BoardImportAdapter, BoardImportContext, BoardImportConversion, BoardImportOutcome } from "./importTypes";
import { countBoardCards } from "./importUtilities";

export const MAX_IMPORT_FILE_BYTES = 10 * 1024 * 1024;

const IMPORT_ADAPTERS: BoardImportAdapter[] = [nativeBoardImporter, trelloBoardImporter];

function parseJsonDocument(serializedValue: string): unknown | undefined {
  try {
    const parsedValue: unknown = JSON.parse(serializedValue);
    return parsedValue;
  } catch {
    return undefined;
  }
}

function findImportAdapter(value: unknown): BoardImportAdapter | undefined {
  const matchingAdapter = IMPORT_ADAPTERS.find((adapter) => adapter.canImport(value));
  return matchingAdapter;
}

function validateImportResult(conversion: BoardImportConversion): BoardImportOutcome {
  const board = parseBoard(conversion.board);
  if (!board) return { ok: false, message: "Converted board was invalid; expected unique columns and cards assigned to exactly one column." };
  return {
    ok: true,
    result: { ...conversion, board, summary: { columns: board.columns.length, cards: countBoardCards(board) } },
  };
}

/** Converts supported JSON into a validated local board. Example: `importBoardJson(json, context)`. */
export function importBoardJson(serializedValue: string, context: BoardImportContext): BoardImportOutcome {
  const parsedValue = parseJsonDocument(serializedValue);
  if (parsedValue === undefined) return { ok: false, message: "Invalid JSON file; expected one complete JSON document." };
  const adapter = findImportAdapter(parsedValue);
  if (!adapter) return { ok: false, message: "Unsupported JSON structure; expected a Super Simple TODO export or a Trello board export." };
  const result = adapter.convert(parsedValue, context);
  if (!result) return { ok: false, message: `Invalid ${adapter.source} data; expected a complete board export with lists and cards.` };
  return validateImportResult(result);
}
