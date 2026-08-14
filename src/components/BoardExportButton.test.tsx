// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { initialBoard } from "../board/initialBoard";
import { BoardExportButton } from "./BoardExportButton";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("BoardExportButton", () => {
  it("downloads the supplied board and releases its temporary URL", async () => {
    const createObjectUrl = vi.fn(() => "blob:board-export");
    const revokeObjectUrl = vi.fn();
    const user = userEvent.setup();
    vi.stubGlobal("URL", { createObjectURL: createObjectUrl, revokeObjectURL: revokeObjectUrl });
    const linkClick = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);
    render(<BoardExportButton board={initialBoard} />);

    await user.click(screen.getByRole("button", { name: "Export" }));

    expect(createObjectUrl).toHaveBeenCalledOnce();
    expect(linkClick).toHaveBeenCalledOnce();
    expect(revokeObjectUrl).toHaveBeenCalledWith("blob:board-export");
  });
});
