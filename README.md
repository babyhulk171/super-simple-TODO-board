# Super Simple TODO

A small, customizable Kanban board built with React, TypeScript, Vite, and dnd-kit. Everything is stored locally in the browser, so the app needs no account, database, or backend.

## Features

- Add, edit, delete, and reorder lists
- Add, edit, delete, complete, and drag cards
- Move cards with pointer, touch, or keyboard controls
- Rename the board and choose list accent colors
- Light and dark themes
- Create, switch, and delete locally persisted boards
- Export the active board as portable JSON
- Automatic local persistence
- Responsive horizontal board layout
- Static build ready for GitHub Pages

## Local development

```bash
npm install
npm run dev
```

## Checks

```bash
npm test
npm run lint
npm run build
```

## Data and privacy

Boards are stored as plaintext in this browser profile and are never sent to a server. Avoid storing sensitive information on shared devices, export important boards regularly, and clear this site's browser data when you no longer need it.

## GitHub Pages

Push the project to a GitHub repository with `main` as its default branch. In the repository settings, open **Pages** and set **Source** to **GitHub Actions**. The included workflow publishes every push to `main`.

Because Vite uses relative asset paths, the same build works for both user sites and repository subpaths.
