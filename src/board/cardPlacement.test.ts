import { describe, expect, it } from "vitest";
import { relocateCardId } from "./cardPlacement";
import type { KanbanColumn } from "./types";

const columns: KanbanColumn[] = [
  { id: "planned", title: "Planned", tone: "blue", cardIds: ["first", "second"] },
  { id: "done", title: "Done", tone: "green", cardIds: [] },
];

describe("relocateCardId", () => {
  it("moves a card immutably and bounds its target index", () => {
    const result = relocateCardId(columns, "first", "done", 99);

    expect(result?.map((column) => column.cardIds)).toEqual([["second"], ["first"]]);
    expect(columns.map((column) => column.cardIds)).toEqual([["first", "second"], []]);
  });

  it("returns undefined for a missing target column", () => {
    expect(relocateCardId(columns, "first", "missing", 0)).toBeUndefined();
  });
});
