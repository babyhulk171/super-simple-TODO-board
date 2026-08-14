import { describe, expect, it } from "vitest";
import { initialWorkspace } from "./initialWorkspace";
import { decodeCurrentWorkspace, encodeCurrentWorkspace, inspectCurrentWorkspace } from "./workspaceMigrations";

describe("workspace migrations", () => {
  it("round-trips the current versioned workspace format", () => {
    expect(decodeCurrentWorkspace(encodeCurrentWorkspace(initialWorkspace))).toEqual(initialWorkspace);
  });

  it("rejects malformed and unsupported workspace documents", () => {
    expect(decodeCurrentWorkspace("{")).toBeUndefined();
    expect(decodeCurrentWorkspace(JSON.stringify({ version: 2, workspace: initialWorkspace }))).toBeUndefined();
    expect(decodeCurrentWorkspace(JSON.stringify({ version: 3, workspace: { boards: [] } }))).toBeUndefined();
  });

  it("distinguishes corrupt data from a newer workspace version", () => {
    expect(inspectCurrentWorkspace("{")).toEqual({ kind: "corrupt" });
    expect(inspectCurrentWorkspace(JSON.stringify({ version: 4, workspace: initialWorkspace }))).toEqual({ kind: "unsupported" });
  });
});
