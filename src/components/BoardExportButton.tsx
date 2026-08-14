import { createNativeBoardExport } from "../board/exporters/nativeBoardExporter";
import type { KanbanBoard } from "../board/types";

interface BoardExportButtonProps {
  board: KanbanBoard;
}

function downloadBoard(board: KanbanBoard): void {
  const exportFile = createNativeBoardExport(board);
  const objectUrl = URL.createObjectURL(new Blob([exportFile.serializedBoard], { type: "application/json" }));
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = exportFile.fileName;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
}

/** Downloads the active board as a native JSON file. Example: `<BoardExportButton board={board} />`. */
export function BoardExportButton({ board }: BoardExportButtonProps) {
  return <button className="quiet-button" type="button" onClick={() => downloadBoard(board)}>Export</button>;
}
