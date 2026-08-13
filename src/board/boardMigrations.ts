import { parseBoard } from "./boardValidation";
import type { KanbanBoard } from "./types";

export const CURRENT_BOARD_VERSION = 2;

interface CurrentBoardEnvelope {
  version: typeof CURRENT_BOARD_VERSION;
  board: KanbanBoard;
}

function parseStoredJson(serializedValue: string): unknown | undefined {
  try {
    const parsedValue: unknown = JSON.parse(serializedValue);
    return parsedValue;
  } catch {
    return undefined;
  }
}

function isCurrentEnvelope(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const envelope = value as Record<string, unknown>;
  return envelope.version === CURRENT_BOARD_VERSION;
}

/** Reads the current versioned board format. Example: `decodeCurrentBoard(json)`. */
export function decodeCurrentBoard(serializedValue: string): KanbanBoard | undefined {
  const parsedValue = parseStoredJson(serializedValue);
  if (!isCurrentEnvelope(parsedValue)) return undefined;
  return parseBoard(parsedValue.board);
}

/** Reads the legacy raw-board format. Example: `decodeLegacyBoard(json)`. */
export function decodeLegacyBoard(serializedValue: string): KanbanBoard | undefined {
  const parsedValue = parseStoredJson(serializedValue);
  return parseBoard(parsedValue);
}

/** Encodes a board with an explicit schema version. Example: `encodeCurrentBoard(board)`. */
export function encodeCurrentBoard(board: KanbanBoard): string {
  const envelope: CurrentBoardEnvelope = { version: CURRENT_BOARD_VERSION, board };
  return JSON.stringify(envelope);
}
