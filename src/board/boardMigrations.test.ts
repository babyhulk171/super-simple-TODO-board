import { describe, expect, it } from "vitest";
import { CURRENT_BOARD_VERSION, decodeCurrentBoard, decodeLegacyBoard, encodeCurrentBoard } from "./boardMigrations";
import { initialBoard } from "./initialBoard";

describe("board migrations", () => {
  it("encodes and decodes the current versioned board format", () => {
    const board = { ...initialBoard, title: "Portable board" };

    expect(JSON.parse(encodeCurrentBoard(board))).toEqual({ version: CURRENT_BOARD_VERSION, board });
    expect(decodeCurrentBoard(encodeCurrentBoard(board))).toEqual(board);
  });

  it("accepts valid legacy boards but rejects malformed or unsupported current data", () => {
    const legacyBoard = { ...initialBoard, title: "Legacy board" };

    expect(decodeLegacyBoard(JSON.stringify(legacyBoard))).toEqual(legacyBoard);
    expect(decodeCurrentBoard("{")).toBeUndefined();
    expect(decodeCurrentBoard(JSON.stringify({ version: 1, board: legacyBoard }))).toBeUndefined();
    expect(decodeCurrentBoard(JSON.stringify({ version: CURRENT_BOARD_VERSION, board: { title: "Broken" } }))).toBeUndefined();
  });
});
