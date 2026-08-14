import { parseWorkspace } from "./workspaceValidation";
import type { KanbanWorkspace } from "./workspaceTypes";

export const CURRENT_WORKSPACE_VERSION = 3;

export type WorkspaceDecodeResult =
  | { kind: "valid"; workspace: KanbanWorkspace }
  | { kind: "corrupt" }
  | { kind: "unsupported" };

interface WorkspaceEnvelope {
  version: typeof CURRENT_WORKSPACE_VERSION;
  workspace: KanbanWorkspace;
}

function parseStoredJson(serializedValue: string): unknown | undefined {
  try {
    return JSON.parse(serializedValue) as unknown;
  } catch {
    return undefined;
  }
}

function isWorkspaceEnvelope(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  return (value as Record<string, unknown>).version === CURRENT_WORKSPACE_VERSION;
}

/** Reads the current versioned workspace format. Example: `decodeCurrentWorkspace(json)`. */
export function decodeCurrentWorkspace(serializedValue: string): KanbanWorkspace | undefined {
  const result = inspectCurrentWorkspace(serializedValue);
  return result.kind === "valid" ? result.workspace : undefined;
}

/** Classifies a stored workspace without replacing unrecognized data. Example: `inspectCurrentWorkspace(json)`. */
export function inspectCurrentWorkspace(serializedValue: string): WorkspaceDecodeResult {
  const parsedValue = parseStoredJson(serializedValue);
  if (!parsedValue || typeof parsedValue !== "object" || Array.isArray(parsedValue)) return { kind: "corrupt" };
  const record = parsedValue as Record<string, unknown>;
  if (typeof record.version === "number" && record.version !== CURRENT_WORKSPACE_VERSION) return { kind: "unsupported" };
  const workspace = isWorkspaceEnvelope(record) ? parseWorkspace(record.workspace) : undefined;
  return workspace ? { kind: "valid", workspace } : { kind: "corrupt" };
}

/** Encodes a workspace with an explicit schema version. Example: `encodeCurrentWorkspace(workspace)`. */
export function encodeCurrentWorkspace(workspace: KanbanWorkspace): string {
  const envelope: WorkspaceEnvelope = { version: CURRENT_WORKSPACE_VERSION, workspace };
  return JSON.stringify(envelope);
}
