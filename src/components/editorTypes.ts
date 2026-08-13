export type EditorState =
  | { kind: "new-card"; columnId: string }
  | { kind: "card"; cardId: string }
  | { kind: "new-column" }
  | { kind: "column"; columnId: string }
  | null;
