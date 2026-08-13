import type { CardPriority, KanbanBoard, KanbanCard, KanbanCardMap, KanbanColumn } from "../types";
import type { BoardImportAdapter, BoardImportContext, BoardImportResult, BoardImportWarning } from "./importTypes";
import { countBoardCards, isJsonRecord, normalizeImportedText } from "./importUtilities";

interface TrelloSource {
  name: string;
  lists: unknown[];
  cards: unknown[];
  actions: unknown[];
  checklists: unknown[];
  customFields: unknown[];
}

interface TrelloList {
  id: string;
  name: string;
  closed: boolean;
  position: number;
}

interface TrelloCard {
  id: string;
  listId: string;
  name: string;
  description: string;
  closed: boolean;
  position: number;
  dueComplete: boolean;
  due: unknown;
  labels: unknown[];
  attachments: unknown[];
  memberIds: unknown[];
  customFieldItems: unknown[];
}

interface TrelloImportStats {
  archivedLists: number;
  archivedCards: number;
  invalidLists: number;
  invalidCards: number;
  unmappedCards: number;
  truncatedTitles: number;
  truncatedDetails: number;
  labelAssignments: number;
  dueDates: number;
  attachments: number;
  memberAssignments: number;
}

interface ConvertedTrelloLists {
  columns: KanbanColumn[];
  localIdBySourceId: Map<string, string>;
}

function readArray(record: Record<string, unknown>, key: string): unknown[] {
  const value = record[key];
  return Array.isArray(value) ? value : [];
}

function parseTrelloSource(value: unknown): TrelloSource | undefined {
  if (!isJsonRecord(value) || typeof value.name !== "string") return undefined;
  if (!Array.isArray(value.lists) || !Array.isArray(value.cards)) return undefined;
  return {
    name: value.name,
    lists: value.lists,
    cards: value.cards,
    actions: readArray(value, "actions"),
    checklists: readArray(value, "checklists"),
    customFields: readArray(value, "customFields"),
  };
}

function readPosition(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return Number.MAX_SAFE_INTEGER;
  const parsedPosition = Number.parseFloat(value);
  return Number.isFinite(parsedPosition) ? parsedPosition : Number.MAX_SAFE_INTEGER;
}

function parseTrelloList(value: unknown): TrelloList | undefined {
  if (!isJsonRecord(value)) return undefined;
  if (typeof value.id !== "string" || typeof value.name !== "string") return undefined;
  return {
    id: value.id,
    name: value.name,
    closed: value.closed === true,
    position: readPosition(value.pos),
  };
}

function parseTrelloCard(value: unknown): TrelloCard | undefined {
  if (!isJsonRecord(value)) return undefined;
  if (typeof value.id !== "string" || typeof value.idList !== "string" || typeof value.name !== "string") return undefined;
  return {
    id: value.id,
    listId: value.idList,
    name: value.name,
    description: typeof value.desc === "string" ? value.desc : "",
    closed: value.closed === true,
    position: readPosition(value.pos),
    dueComplete: value.dueComplete === true,
    due: value.due,
    labels: readArray(value, "labels"),
    attachments: readArray(value, "attachments"),
    memberIds: readArray(value, "idMembers"),
    customFieldItems: readArray(value, "customFieldItems"),
  };
}

function createImportStats(): TrelloImportStats {
  return {
    archivedLists: 0,
    archivedCards: 0,
    invalidLists: 0,
    invalidCards: 0,
    unmappedCards: 0,
    truncatedTitles: 0,
    truncatedDetails: 0,
    labelAssignments: 0,
    dueDates: 0,
    attachments: 0,
    memberAssignments: 0,
  };
}

function readOpenLists(values: unknown[], stats: TrelloImportStats): TrelloList[] {
  const seenIds = new Set<string>();
  const lists: TrelloList[] = [];
  for (const value of values) {
    const list = parseTrelloList(value);
    if (!list || seenIds.has(list.id)) { stats.invalidLists += 1; continue; }
    seenIds.add(list.id);
    if (list.closed) { stats.archivedLists += 1; continue; }
    lists.push(list);
  }
  return lists.sort((left, right) => left.position - right.position);
}

function convertTrelloLists(source: TrelloSource, context: BoardImportContext, stats: TrelloImportStats): ConvertedTrelloLists {
  const localIdBySourceId = new Map<string, string>();
  const columns = readOpenLists(source.lists, stats).map((list) => {
    const localId = context.createId();
    const title = normalizeImportedText(list.name, 40, "Untitled list");
    if (title.truncated) stats.truncatedTitles += 1;
    localIdBySourceId.set(list.id, localId);
    return { id: localId, title: title.text, tone: "blue" as const, cardIds: [] };
  });
  return { columns, localIdBySourceId };
}

function readOpenCards(values: unknown[], stats: TrelloImportStats): TrelloCard[] {
  const seenIds = new Set<string>();
  const cards: TrelloCard[] = [];
  for (const value of values) {
    const card = parseTrelloCard(value);
    if (!card || seenIds.has(card.id)) { stats.invalidCards += 1; continue; }
    seenIds.add(card.id);
    if (card.closed) { stats.archivedCards += 1; continue; }
    cards.push(card);
  }
  return cards.sort((left, right) => left.position - right.position);
}

function parsePriorityText(value: unknown): CardPriority | undefined {
  if (typeof value !== "string") return undefined;
  const normalizedValue = value.trim().toLowerCase();
  if (/\bhigh\b/.test(normalizedValue)) return "high";
  if (/\bmedium\b/.test(normalizedValue)) return "medium";
  if (/\blow\b/.test(normalizedValue)) return "low";
  return undefined;
}

function isPriorityField(value: unknown): value is Record<string, unknown> {
  if (!isJsonRecord(value) || typeof value.name !== "string") return false;
  return value.name.trim().toLowerCase() === "priority" && typeof value.id === "string";
}

function findPriorityField(customFields: unknown[]): Record<string, unknown> | undefined {
  return customFields.find(isPriorityField);
}

function readOptionPriority(field: Record<string, unknown>, item: Record<string, unknown>): CardPriority | undefined {
  const options = readArray(field, "options");
  const matchingOption = options.find((option) => isJsonRecord(option) && option.id === item.idValue);
  if (!isJsonRecord(matchingOption) || !isJsonRecord(matchingOption.value)) return undefined;
  return parsePriorityText(matchingOption.value.text);
}

function readCustomPriority(card: TrelloCard, field: Record<string, unknown> | undefined): CardPriority | undefined {
  if (!field || typeof field.id !== "string") return undefined;
  const item = card.customFieldItems.find((value) => isJsonRecord(value) && value.idCustomField === field.id);
  if (!isJsonRecord(item)) return undefined;
  if (isJsonRecord(item.value)) return parsePriorityText(item.value.text);
  return readOptionPriority(field, item);
}

function readLabelPriority(card: TrelloCard): CardPriority | undefined {
  for (const label of card.labels) {
    if (!isJsonRecord(label)) continue;
    const priority = parsePriorityText(label.name);
    if (priority) return priority;
  }
  return undefined;
}

function readCardPriority(card: TrelloCard, field: Record<string, unknown> | undefined): CardPriority {
  const customPriority = readCustomPriority(card, field);
  if (customPriority) return customPriority;
  return readLabelPriority(card) ?? "medium";
}

function recordUnsupportedCardData(card: TrelloCard, stats: TrelloImportStats): void {
  stats.labelAssignments += card.labels.length;
  stats.attachments += card.attachments.length;
  stats.memberAssignments += card.memberIds.length;
  if (card.due !== null && card.due !== undefined) stats.dueDates += 1;
}

function createImportedCard(card: TrelloCard, localId: string, priorityField: Record<string, unknown> | undefined, stats: TrelloImportStats): KanbanCard {
  const title = normalizeImportedText(card.name, 90, "Untitled card");
  const details = normalizeImportedText(card.description, 320);
  if (title.truncated) stats.truncatedTitles += 1;
  if (details.truncated) stats.truncatedDetails += 1;
  recordUnsupportedCardData(card, stats);
  return { id: localId, title: title.text, details: details.text, priority: readCardPriority(card, priorityField), completed: card.dueComplete };
}

function convertTrelloCards(source: TrelloSource, convertedLists: ConvertedTrelloLists, context: BoardImportContext, stats: TrelloImportStats): KanbanCardMap {
  const cards: KanbanCardMap = {};
  const columnById = new Map(convertedLists.columns.map((column) => [column.id, column]));
  const priorityField = findPriorityField(source.customFields);
  for (const sourceCard of readOpenCards(source.cards, stats)) {
    const columnId = convertedLists.localIdBySourceId.get(sourceCard.listId);
    const column = columnId ? columnById.get(columnId) : undefined;
    if (!column) { stats.unmappedCards += 1; continue; }
    const localId = context.createId();
    cards[localId] = createImportedCard(sourceCard, localId, priorityField, stats);
    column.cardIds.push(localId);
  }
  return cards;
}

function addWarning(warnings: BoardImportWarning[], code: string, count: number, detail: string): void {
  if (count < 1) return;
  warnings.push({ code, count, message: `${count} ${detail}` });
}

function appendSkippedWarnings(warnings: BoardImportWarning[], stats: TrelloImportStats): void {
  addWarning(warnings, "archived-lists", stats.archivedLists, "archived list(s) were skipped.");
  addWarning(warnings, "archived-cards", stats.archivedCards, "archived card(s) were skipped.");
  addWarning(warnings, "invalid-lists", stats.invalidLists, "malformed or duplicate list(s) were skipped; expected string id and name fields.");
  addWarning(warnings, "invalid-cards", stats.invalidCards, "malformed or duplicate card(s) were skipped; expected string id, idList, and name fields.");
  addWarning(warnings, "unmapped-cards", stats.unmappedCards, "card(s) belonged to unavailable lists and were skipped.");
}

function appendUnsupportedWarnings(warnings: BoardImportWarning[], source: TrelloSource, stats: TrelloImportStats): void {
  const comments = source.actions.filter((value) => isJsonRecord(value) && value.type === "commentCard").length;
  const nonPriorityFields = source.customFields.filter((value) => !isPriorityField(value)).length;
  addWarning(warnings, "labels", stats.labelAssignments, "label assignment(s) were used only to infer priority.");
  addWarning(warnings, "due-dates", stats.dueDates, "due date(s) were not imported; completion status was preserved.");
  addWarning(warnings, "attachments", stats.attachments, "attachment(s) were not imported.");
  addWarning(warnings, "members", stats.memberAssignments, "member assignment(s) were not imported.");
  addWarning(warnings, "checklists", source.checklists.length, "checklist(s) were not imported.");
  addWarning(warnings, "comments", comments, "comment(s) were not imported.");
  addWarning(warnings, "custom-fields", nonPriorityFields, "custom field definition(s) other than Priority were not imported.");
}

function buildWarnings(source: TrelloSource, stats: TrelloImportStats): BoardImportWarning[] {
  const warnings: BoardImportWarning[] = [];
  appendSkippedWarnings(warnings, stats);
  appendUnsupportedWarnings(warnings, source, stats);
  addWarning(warnings, "truncated-titles", stats.truncatedTitles, "title(s) were shortened to fit local limits.");
  addWarning(warnings, "truncated-details", stats.truncatedDetails, "description(s) were shortened to fit local limits.");
  return warnings;
}

function convertTrelloBoard(value: unknown, context: BoardImportContext): BoardImportResult | undefined {
  const source = parseTrelloSource(value);
  if (!source) return undefined;
  const stats = createImportStats();
  const convertedLists = convertTrelloLists(source, context, stats);
  const cards = convertTrelloCards(source, convertedLists, context, stats);
  const board: KanbanBoard = { title: source.name.trim() || "Imported Trello board", columns: convertedLists.columns, cards };
  return {
    source: "trello",
    sourceLabel: "Trello",
    board,
    summary: { columns: board.columns.length, cards: countBoardCards(board) },
    warnings: buildWarnings(source, stats),
  };
}

export const trelloBoardImporter: BoardImportAdapter = {
  source: "trello",
  canImport: (value) => Boolean(parseTrelloSource(value)),
  convert: convertTrelloBoard,
};
