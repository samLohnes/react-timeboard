# react-timeboard

A resource × time grid React component with external drag-and-drop support.

> **Status: pre-release.** Active development. API may change before v1.

## Planned features

- Resource × time grid with three fixed interval modes: `hourly`, `daily`, `weekly`.
- External drag-and-drop via `@dnd-kit/core` — drop items from a sidebar onto cells.
- Collapsible resource groups as a first-class feature.
- Greedy first-fit lane assignment for overlapping events.
- Fully themeable via `--rtb-*` CSS custom properties. No CSS-in-JS.
- TypeScript-first; generic over event and resource types.
- Dual ESM + CJS build with `.d.ts` declarations.

## Install

Not yet published to npm. Once released:

```bash
npm install react-timeboard @dnd-kit/core react react-dom
```

## License

[MIT](./LICENSE)
