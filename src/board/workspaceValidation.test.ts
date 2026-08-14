import { describe, expect, it } from "vitest";
import { initialWorkspace } from "./initialWorkspace";
import { parseWorkspace } from "./workspaceValidation";

describe("parseWorkspace", () => {
  it("parses a workspace with a valid active board", () => {
    expect(parseWorkspace(initialWorkspace)).toEqual(initialWorkspace);
  });

  it("rejects empty, duplicate, missing-active, and invalid board entries", () => {
    expect(parseWorkspace({ activeBoardId: "starter", boards: [] })).toBeUndefined();
    expect(parseWorkspace({ ...initialWorkspace, activeBoardId: "missing" })).toBeUndefined();
    expect(parseWorkspace({ ...initialWorkspace, boards: [initialWorkspace.boards[0], initialWorkspace.boards[0] as typeof initialWorkspace.boards[number]] })).toBeUndefined();
    expect(parseWorkspace({ ...initialWorkspace, boards: [{ id: "starter", board: { title: "Broken" } }] })).toBeUndefined();
  });
});
