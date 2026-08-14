import { describe, expect, it } from "vitest";
import { decodeCurrentBoard } from "../boardMigrations";
import { initialBoard } from "../initialBoard";
import { createNativeBoardExport } from "./nativeBoardExporter";

describe("createNativeBoardExport", () => {
  it("creates a versioned board document and safe file name", () => {
    const board = { ...initialBoard, title: "Release / August" };
    const result = createNativeBoardExport(board);

    expect(result.fileName).toBe("release-august.json");
    expect(decodeCurrentBoard(result.serializedBoard)).toEqual(board);
  });

  it("uses a fallback file name for a blank title", () => {
    expect(createNativeBoardExport({ ...initialBoard, title: " " }).fileName).toBe("board.json");
  });
});
