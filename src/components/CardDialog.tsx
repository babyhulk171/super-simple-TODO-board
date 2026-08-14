import { useState, type FormEvent } from "react";
import { CARD_PRIORITIES, isCardPriority, type BoardAction, type KanbanCard } from "../board/types";
import { DialogShell } from "./DialogShell";

interface CardDialogProps {
  card?: KanbanCard;
  columnId: string;
  dispatch: React.Dispatch<BoardAction>;
  onClose: () => void;
}

function makeCard(card?: KanbanCard): KanbanCard {
  if (card) return card;
  return { id: crypto.randomUUID(), title: "", details: "", priority: "medium", completed: false };
}

/** Creates or edits one card. Example: `<CardDialog columnId="ideas" ... />`. */
export function CardDialog({ card, columnId, dispatch, onClose }: CardDialogProps) {
  const [draft, setDraft] = useState<KanbanCard>(() => makeCard(card));
  const submitCard = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    dispatch(card ? { type: "update-card", card: draft } : { type: "add-card", columnId, card: draft });
    onClose();
  };
  const deleteCurrentCard = () => {
    if (!card || !window.confirm(`Delete “${card.title}”?`)) return;
    dispatch({ type: "delete-card", cardId: card.id });
    onClose();
  };
  return (
    <DialogShell title={card ? "Edit card" : "Add a card"} description="Keep it short, clear, and easy to act on." onClose={onClose}>
      <form className="editor-form" onSubmit={submitCard}>
        <label><span>Title</span><input autoFocus required maxLength={90} value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="What needs to happen?" /></label>
        <label><span>Details</span><textarea rows={4} maxLength={320} value={draft.details} onChange={(event) => setDraft({ ...draft, details: event.target.value })} placeholder="Add a helpful note (optional)" /></label>
        <label><span>Priority</span><select value={draft.priority} onChange={(event) => isCardPriority(event.target.value) && setDraft({ ...draft, priority: event.target.value })}>{CARD_PRIORITIES.map((priority) => <option key={priority} value={priority}>{priority[0].toUpperCase() + priority.slice(1)}</option>)}</select></label>
        <label className="check-row"><input type="checkbox" checked={draft.completed} onChange={(event) => setDraft({ ...draft, completed: event.target.checked })} /><span>Completed</span></label>
        <div className="dialog-actions">{card && <button className="danger-button" type="button" onClick={deleteCurrentCard}>Delete</button>}<span /><button className="quiet-button" type="button" onClick={onClose}>Cancel</button><button className="primary-button" type="submit">{card ? "Save changes" : "Add card"}</button></div>
      </form>
    </DialogShell>
  );
}
