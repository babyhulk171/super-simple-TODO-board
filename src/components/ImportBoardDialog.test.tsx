// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ImportBoardDialog } from "./ImportBoardDialog";

const firstBoard = JSON.stringify({ title: "First", columns: [], cards: {} });
const secondBoard = JSON.stringify({ title: "Second", columns: [], cards: {} });

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("ImportBoardDialog", () => {
  it("disables stale confirmation while a newer file is loading", async () => {
    const user = userEvent.setup();
    const onImport = vi.fn();
    let resolveSecondFile: ((value: string) => void) | undefined;
    vi.spyOn(File.prototype, "text").mockImplementation(function (this: File): Promise<string> {
      if (this.name === "first.json") return Promise.resolve(firstBoard);
      return new Promise((resolve) => { resolveSecondFile = resolve; });
    });
    render(<ImportBoardDialog onImport={onImport} onClose={vi.fn()} />);
    const picker = screen.getByLabelText("Choose JSON file");

    await user.upload(picker, new File(["first"], "first.json", { type: "application/json" }));
    expect(await screen.findByLabelText("Import preview")).toBeInTheDocument();
    await user.upload(picker, new File(["second"], "second.json", { type: "application/json" }));

    expect(screen.getByRole("status")).toHaveTextContent("Reading board file");
    expect(screen.queryByRole("button", { name: "Replace board" })).not.toBeInTheDocument();
    resolveSecondFile?.(secondBoard);
    expect(await screen.findByText("Second")).toBeInTheDocument();
    expect(onImport).not.toHaveBeenCalled();
  });
});
