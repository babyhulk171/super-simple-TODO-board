import { parseWorkspace } from "./workspaceValidation";
import type { KanbanWorkspace } from "./workspaceTypes";

export const CURRENT_WORKSPACE_VERSION = 3;

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
  const parsedValue = parseStoredJson(serializedValue);
  return isWorkspaceEnvelope(parsedValue) ? parseWorkspace(parsedValue.workspace) : undefined;
}

/** Encodes a workspace with an explicit schema version. Example: `encodeCurrentWorkspace(workspace)`. */
export function encodeCurrentWorkspace(workspace: KanbanWorkspace): string {
  const envelope: WorkspaceEnvelope = { version: CURRENT_WORKSPACE_VERSION, workspace };
  return JSON.stringify(envelope);
}
