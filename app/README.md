# Board Games Table

A static React + MUI app that renders the game collection defined in `data/games.yaml` as a sortable table.

## Prerequisites

- [Node.js](https://nodejs.org/) 18 or later
- npm (bundled with Node)

## Setup

Install dependencies once after cloning or pulling changes:

```bash
cd boardgames/app
npm install
```

## Build a static page

Compile the entire app into a single self-contained `dist/index.html`:

```bash
npm run build
```

The output file is `dist/index.html`. All JavaScript and CSS are inlined into it, so you can open it directly in a browser from disk — no server required.

## Development

To run a local dev server with hot reload (useful when editing `data/games.yaml` or source files):

```bash
npm run dev
```

Then open the URL shown in the terminal (typically `http://localhost:5173`).

