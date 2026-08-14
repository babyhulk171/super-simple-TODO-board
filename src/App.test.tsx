// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

afterEach(() => {
  cleanup();
  localStorage.clear();
  document.documentElement.dataset.theme = "";
  vi.restoreAllMocks();
});

describe("App", () => {
  it("creates, completes, and persists a card alongside the selected theme", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getAllByRole("button", { name: "Add a card" })[0]);
    await user.type(screen.getByLabelText("Title"), "Ship release");
    await user.type(screen.getByLabelText("Details"), "Deploy to production");
    await user.selectOptions(screen.getByLabelText("Priority"), "high");
    await user.click(screen.getByRole("button", { name: "Add card" }));
    await user.click(screen.getByRole("checkbox", { name: "Mark complete" }));
    await user.clear(screen.getByLabelText("Board title"));
    await user.type(screen.getByLabelText("Board title"), "Launch board");
    await user.click(screen.getByRole("button", { name: "Use dark mode" }));

    expect(screen.getByText("Ship release")).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "Completed" })).toBeChecked();
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(localStorage.getItem("super-simple-todo-theme")).toBe("dark");
    await waitFor(() => {
      const savedBoard = JSON.parse(localStorage.getItem("super-simple-todo-board") ?? "") as { board: { title: string; cards: Record<string, { completed: boolean; priority: string; title: string }> } };
      expect(savedBoard.board.title).toBe("Launch board");
      expect(Object.values(savedBoard.board.cards)).toEqual([expect.objectContaining({ title: "Ship release", priority: "high", completed: true })]);
    });
  });

  it("creates, edits, and deletes a list only after confirmation", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Add another list" }));
    await user.type(screen.getByLabelText("List name"), "Review");
    await user.click(screen.getByRole("button", { name: "Add list" }));
    await user.click(screen.getByRole("button", { name: "Edit Review" }));
    await user.clear(screen.getByLabelText("List name"));
    await user.type(screen.getByLabelText("List name"), "Quality review");
    await user.click(screen.getByRole("button", { name: "Save changes" }));
    expect(screen.getByRole("heading", { name: "Quality review" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Edit Quality review" }));
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    await user.click(screen.getByRole("button", { name: "Delete list" }));
    expect(screen.getByRole("dialog", { name: "Edit list" })).toBeInTheDocument();
    confirm.mockReturnValue(true);
    await user.click(screen.getByRole("button", { name: "Delete list" }));
    expect(screen.queryByRole("heading", { name: "Quality review" })).not.toBeInTheDocument();
  });

  it("previews a valid import before replacing the current board", async () => {
    const user = userEvent.setup();
    render(<App />);
    const file = new File([JSON.stringify({
      title: "Imported board",
      columns: [{ id: "source", title: "Imported", tone: "violet", cardIds: ["task"] }],
      cards: { task: { id: "task", title: "Imported task", details: "From JSON", priority: "low", completed: false } },
    })], "board.json", { type: "application/json" });

    await user.click(screen.getByRole("button", { name: "Import" }));
    await user.upload(screen.getByLabelText("Choose JSON file"), file);
    expect(await screen.findByLabelText("Import preview")).toBeInTheDocument();
    expect(screen.getByText("Imported board")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Replace board" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Board title")).toHaveValue("Imported board");
    expect(screen.getByText("Imported task")).toBeInTheDocument();
  });
});
