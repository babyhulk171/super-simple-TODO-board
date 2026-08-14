import { useState, type FormEvent } from "react";
import { COLUMN_TONES, type BoardAction, type ColumnTone, type KanbanColumn } from "../board/types";
import { DialogShell } from "./DialogShell";

interface ColumnDialogProps {
  column?: KanbanColumn;
  dispatch: React.Dispatch<BoardAction>;
  onClose: () => void;
}

/** Creates or edits a list and its color. Example: `<ColumnDialog dispatch={dispatch} ... />`. */
export function ColumnDialog({ column, dispatch, onClose }: ColumnDialogProps) {
  const [title, setTitle] = useState(column?.title ?? "");
  const [tone, setTone] = useState<ColumnTone>(column?.tone ?? "blue");
  const submitColumn = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const action: BoardAction = column
      ? { type: "update-column", columnId: column.id, title, tone }
      : { type: "add-column", column: { id: crypto.randomUUID(), title, tone, cardIds: [] } };
    dispatch(action);
    onClose();
  };
  const deleteCurrentColumn = () => {
    if (!column || !window.confirm(`Delete “${column.title}” and all of its cards?`)) return;
    dispatch({ type: "delete-column", columnId: column.id });
    onClose();
  };
  return (
    <DialogShell title={column ? "Edit list" : "Add a list"} description="Give this stage a clear name and visual accent." onClose={onClose}>
      <form className="editor-form" onSubmit={submitColumn}>
        <label><span>List name</span><input autoFocus required maxLength={40} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="For example, Review" /></label>
        <fieldset><legend>Accent color</legend><div className="tone-picker">{COLUMN_TONES.map((choice) => <label key={choice} title={choice}><input type="radio" name="tone" value={choice} checked={tone === choice} onChange={() => setTone(choice)} /><span className={`tone-swatch tone-${choice}`} /></label>)}</div></fieldset>
        <div className="dialog-actions">{column && <button className="danger-button" type="button" onClick={deleteCurrentColumn}>Delete list</button>}<span /><button className="quiet-button" type="button" onClick={onClose}>Cancel</button><button className="primary-button" type="submit">{column ? "Save changes" : "Add list"}</button></div>
      </form>
    </DialogShell>
  );
}
