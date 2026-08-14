export const MAX_WORKSPACE_BOARDS = 25;
export const MAX_COLUMNS_PER_BOARD = 50;
export const MAX_CARDS_PER_BOARD = 1000;
export const MAX_CARDS_PER_COLUMN = 1000;
export const MAX_IDENTIFIER_LENGTH = 128;
export const MAX_BOARD_TITLE_LENGTH = 90;
export const MAX_COLUMN_TITLE_LENGTH = 40;
export const MAX_CARD_TITLE_LENGTH = 90;
export const MAX_CARD_DETAILS_LENGTH = 320;

const RESERVED_IDENTIFIERS = new Set(["__proto__", "constructor", "prototype"]);

/** Checks identifiers used as object keys and drag targets. Example: `isSafeIdentifier(value)`. */
export function isSafeIdentifier(value: unknown): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= MAX_IDENTIFIER_LENGTH && !RESERVED_IDENTIFIERS.has(value);
}
