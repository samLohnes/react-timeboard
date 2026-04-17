# Contributing to react-timeboard

Thanks for your interest in the project. This document covers local dev setup, common commands, project structure, and the workflow for submitting changes.

## Dev setup

```bash
git clone https://github.com/samlohnes/react-timeboard.git
cd react-timeboard
npm install
```

Node >=18 is required.

## Commands

| Command | Description |
|---------|-------------|
| `npm run build` | Build the library to `dist/` (ESM + CJS + `.d.ts` + `styles.css`). |
| `npm run test` | Run the unit test suite once. **Sets `TZ=America/Los_Angeles`** so DST tests are deterministic. Running `vitest` directly without this script may fail on a machine in a different timezone. |
| `npm run test:watch` | Run tests in watch mode (also sets `TZ=America/Los_Angeles`). |
| `npm run lint` | Run ESLint over `src/` and `stories/`. |
| `npm run format` | Format files with Prettier. |
| `npm run typecheck` | Run TypeScript with `--noEmit`. |
| `npm run storybook` | Launch Storybook for interactive development at `http://localhost:6006`. |
| `npm run build-storybook` | Build a static Storybook to `storybook-static/` (not deployed). |

## Project structure

```
src/
├── atoms/              # Leaf UI primitives (Cell, EventBlock, GroupHeader, ...)
├── molecules/          # Composed sections (TimeAxis, Sidebar, Body, DroppableCell)
├── lib/                # Pure utilities (time math, lane assignment, grouping, drop IDs)
├── types.ts            # Public TypeScript types
├── ResourceTimeline.tsx # Top-level organism (the main exported component)
├── styles.css          # Single stylesheet shipped to consumers
└── index.ts            # Public exports

stories/                # Committed Storybook demo (MarchMadnessBroadcast)
dev-stories/            # Local scratchpad, gitignored
.storybook/             # Storybook config
```

## Making changes

1. Create a branch off `main`.
2. Write or update tests for any behavior change. Pure utilities live in `src/lib/` and have tests; UI contracts (keyboard handling, ARIA, the event positioning formula) are covered by a small number of RTL tests in the relevant component folder.
3. Before committing, run `npm run lint && npm run test && npm run build`.
4. Open a pull request with a clear description of what changed and why.

## Code style

- TypeScript strict mode, including `noUncheckedIndexedAccess`. No `any`.
- Atomic design — atoms stateless, molecules compose atoms, organism composes molecules.
- Every pure utility in `src/lib/` has a `*.test.ts`. Non-trivial component behavior has an RTL smoke test.
- No new runtime dependencies without discussion. `react`, `react-dom`, and `@dnd-kit/core` are the only peer deps and nothing else ships at runtime.
- CSS is the single file at `src/styles.css`, scoped under `.rtb-root`. No CSS-in-JS, no external frameworks.

## Publishing (maintainers)

1. Bump the version in `package.json`.
2. Update `CHANGELOG.md` if present.
3. Run `npm publish --dry-run` to verify the tarball contents.
4. `npm publish` to release.
