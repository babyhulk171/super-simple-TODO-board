import { useRef, useState, type ChangeEvent } from "react";
import { importBoardJson, MAX_IMPORT_FILE_BYTES } from "../board/importers/importBoardJson";
import type { BoardImportResult } from "../board/importers/importTypes";
import type { KanbanBoard } from "../board/types";
import { DialogShell } from "./DialogShell";

interface ImportBoardDialogProps {
  onImport: (board: KanbanBoard) => void;
  onClose: () => void;
}

type ImportDialogState =
  | { kind: "select" }
  | { kind: "error"; message: string }
  | { kind: "preview"; result: BoardImportResult };

function formatFileSizeLimit(): string {
  const megabytes = MAX_IMPORT_FILE_BYTES / (1024 * 1024);
  return `${megabytes} MB`;
}

async function readImportFile(file: File): Promise<ImportDialogState> {
  if (file.size > MAX_IMPORT_FILE_BYTES) {
    return { kind: "error", message: `File is too large; expected a JSON file no larger than ${formatFileSizeLimit()}.` };
  }
  try {
    const outcome = importBoardJson(await file.text(), { createId: () => crypto.randomUUID() });
    return outcome.ok ? { kind: "preview", result: outcome.result } : { kind: "error", message: outcome.message };
  } catch {
    return { kind: "error", message: `Could not read “${file.name}”; expected an accessible UTF-8 JSON file.` };
  }
}

interface ImportFilePickerProps {
  onSelected: (file: File) => void;
}

function ImportFilePicker({ onSelected }: ImportFilePickerProps) {
  const selectFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (file) onSelected(file);
  };
  return <label className="quiet-button import-file-button" htmlFor="board-import-file">Choose JSON file<input id="board-import-file" className="visually-hidden" type="file" accept=".json,application/json" onChange={selectFile} /></label>;
}

function ImportPreview({ result }: { result: BoardImportResult }) {
  return (
    <section className="import-preview" aria-label="Import preview">
      <div className="import-source"><span>Detected format</span><strong>{result.sourceLabel}</strong></div>
      <h3>{result.board.title}</h3>
      <div className="import-summary"><div><strong>{result.summary.columns}</strong><span>Lists</span></div><div><strong>{result.summary.cards}</strong><span>Cards</span></div></div>
      {result.warnings.length > 0 && <div className="import-warnings"><strong>Import notes</strong><ul>{result.warnings.map((warning) => <li key={warning.code}>{warning.message}</li>)}</ul></div>}
      <p className="import-replace-note">Importing will replace the current board after this confirmation.</p>
    </section>
  );
}

/** Previews and confirms a supported JSON board import. Example: `<ImportBoardDialog onImport={replaceBoard} />`. */
export function ImportBoardDialog({ onImport, onClose }: ImportBoardDialogProps) {
  const [state, setState] = useState<ImportDialogState>({ kind: "select" });
  const latestFileRequest = useRef(0);
  const selectFile = (file: File) => {
    const requestId = latestFileRequest.current + 1;
    latestFileRequest.current = requestId;
    void readImportFile(file).then((nextState) => {
      if (requestId === latestFileRequest.current) setState(nextState);
    });
  };
  const confirmImport = () => {
    if (state.kind !== "preview") return;
    onImport(state.result.board);
  };
  return (
    <DialogShell title="Import a board" description="Choose a Super Simple TODO or Trello JSON board export." onClose={onClose}>
      <div className="import-dialog">
        <ImportFilePicker onSelected={selectFile} />
        <small>Maximum file size: {formatFileSizeLimit()}</small>
        {state.kind === "error" && <p className="import-error" role="alert">{state.message}</p>}
        {state.kind === "preview" && <ImportPreview result={state.result} />}
        <div className="dialog-actions import-dialog-actions"><span /><button className="quiet-button" type="button" onClick={onClose}>Cancel</button>{state.kind === "preview" && <button className="primary-button" type="button" onClick={confirmImport}>Replace board</button>}</div>
      </div>
    </DialogShell>
  );
}
