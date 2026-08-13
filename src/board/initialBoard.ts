import type { KanbanBoard } from "./types";

export const initialBoard: KanbanBoard = {
  title: "Product launch",
  columns: [
    { id: "ideas", title: "Ideas", tone: "violet", cardIds: ["interviews", "pricing"] },
    { id: "planned", title: "Planned", tone: "blue", cardIds: ["copy", "analytics"] },
    { id: "progress", title: "In progress", tone: "amber", cardIds: ["landing", "emails"] },
    { id: "done", title: "Done", tone: "green", cardIds: ["brief", "domain"] },
  ],
  cards: {
    interviews: { id: "interviews", title: "Customer interviews", details: "Talk with five early users and collect the recurring themes.", priority: "high", completed: false },
    pricing: { id: "pricing", title: "Explore pricing options", details: "Compare a simple free plan with a two-tier model.", priority: "medium", completed: false },
    copy: { id: "copy", title: "Write launch copy", details: "Draft the homepage headline, feature summary, and FAQ.", priority: "high", completed: false },
    analytics: { id: "analytics", title: "Set up analytics", details: "Track sign-up, activation, and share events.", priority: "low", completed: false },
    landing: { id: "landing", title: "Build landing page", details: "Finish the responsive page and final call to action.", priority: "high", completed: false },
    emails: { id: "emails", title: "Prepare launch emails", details: "Create the announcement and onboarding sequence.", priority: "medium", completed: false },
    brief: { id: "brief", title: "Approve launch brief", details: "Scope, audience, timeline, and success criteria are signed off.", priority: "medium", completed: true },
    domain: { id: "domain", title: "Connect the domain", details: "DNS and HTTPS are working in production.", priority: "low", completed: true },
  },
};
