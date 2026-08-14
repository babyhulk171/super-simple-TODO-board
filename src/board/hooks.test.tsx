// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { BOARD_KEY } from "./storage";
import { usePersistentWorkspace } from "./hooks";

function WorkspaceStatus() {
  const [, , saveStatus, loadIssue, replaceInvalidStorage] = usePersistentWorkspace();
  return <button type="button" onClick={replaceInvalidStorage}>{loadIssue ?? saveStatus}</button>;
}

afterEach(() => {
  cleanup();
  localStorage.clear();
});

describe("usePersistentWorkspace", () => {
  it("waits for explicit confirmation before replacing corrupt storage", async () => {
    localStorage.setItem(BOARD_KEY, "invalid");
    render(<WorkspaceStatus />);

    expect(screen.getByRole("button")).toHaveTextContent("corrupt");
    expect(localStorage.getItem(BOARD_KEY)).toBe("invalid");
    screen.getByRole("button").click();
    await waitFor(() => expect(localStorage.getItem(BOARD_KEY)).not.toBe("invalid"));
  });

  it("stops persistence and reports an external workspace change", async () => {
    render(<WorkspaceStatus />);
    window.dispatchEvent(new StorageEvent("storage", { key: BOARD_KEY, newValue: "{}", storageArea: localStorage }));

    await waitFor(() => expect(screen.getByRole("button")).toHaveTextContent("conflict"));
  });
});
