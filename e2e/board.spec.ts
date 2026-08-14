import { expect, test } from "@playwright/test";

test("persists a completed card and theme after a reload", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Add a card" }).first().click();
  await page.getByLabel("Title", { exact: true }).fill("Ship release");
  await page.getByLabel("Priority").selectOption("high");
  await page.getByRole("button", { name: "Add card" }).click();
  await page.getByRole("checkbox", { name: "Mark complete" }).check();
  await page.getByRole("button", { name: "Use dark mode" }).click();

  await expect.poll(() => page.evaluate(() => localStorage.getItem("super-simple-todo-theme"))).toBe("dark");
  await page.reload();

  await expect(page.getByText("Ship release", { exact: true })).toBeVisible();
  await expect(page.getByRole("checkbox", { name: "Completed" })).toBeChecked();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});

test("moves a card to another list and persists its new location", async ({ page }) => {
  const serializedWorkspace = JSON.stringify({
    version: 3,
    workspace: {
      activeBoardId: "drag",
      boards: [{
        id: "drag",
        board: {
          title: "Drag board",
          columns: [
            { id: "planned", title: "Planned", tone: "blue", cardIds: ["first"] },
            { id: "done", title: "Done", tone: "green", cardIds: [] },
          ],
          cards: {
            first: { id: "first", title: "First task", details: "", priority: "medium", completed: false },
          },
        },
      }],
    },
  });
  await page.addInitScript((board) => {
    if (!localStorage.getItem("super-simple-todo-board")) localStorage.setItem("super-simple-todo-board", board);
  }, serializedWorkspace);
  await page.goto("/");
  const doneColumn = page.locator("section.kanban-column").filter({ has: page.getByRole("heading", { name: "Done" }) });

  const dragHandle = page.getByRole("button", { name: "Move First task" });
  const dragBox = await dragHandle.boundingBox();
  const targetBox = await doneColumn.boundingBox();
  if (!dragBox || !targetBox) throw new Error("Expected visible card and destination list for the drag smoke test.");
  await page.mouse.move(dragBox.x + dragBox.width / 2, dragBox.y + dragBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(dragBox.x + dragBox.width / 2 + 10, dragBox.y + dragBox.height / 2, { steps: 2 });
  await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2, { steps: 12 });
  await page.mouse.up();
  await expect(doneColumn.getByText("First task", { exact: true })).toBeVisible();
  await expect.poll(() => page.evaluate(() => {
    const serializedBoard = localStorage.getItem("super-simple-todo-board");
    if (!serializedBoard) return [];
    const workspace = JSON.parse(serializedBoard) as { workspace: { boards: Array<{ board: { columns: Array<{ id: string; cardIds: string[] }> } }> } };
    return workspace.workspace.boards[0].board.columns.find((column) => column.id === "done")?.cardIds;
  })).toEqual(["first"]);
  await page.reload();

  await expect(doneColumn.getByText("First task", { exact: true })).toBeVisible();
});

test("creates, switches, and restores the selected board", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "New" }).click();
  await page.getByLabel("Board title").fill("Work board");
  const boardSelect = page.getByLabel("Choose board");
  const workBoardId = await boardSelect.inputValue();

  await boardSelect.selectOption("starter");
  await expect(page.getByLabel("Board title")).toHaveValue("Super Simple TODO");
  await boardSelect.selectOption(workBoardId);
  await page.reload();

  await expect(boardSelect).toHaveValue(workBoardId);
  await expect(page.getByLabel("Board title")).toHaveValue("Work board");
});

test("exports the active board as a native JSON file", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Board title").fill("Release board");
  const downloadPromise = page.waitForEvent("download");

  await page.getByRole("button", { name: "Export" }).click();
  const download = await downloadPromise;

  expect(download.suggestedFilename()).toBe("release-board.json");
});
