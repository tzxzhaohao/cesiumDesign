# Contributing

Thanks for helping improve `geo-effect-kit`.

## Development

```bash
pnpm install
pnpm typecheck
pnpm test
pnpm build
pnpm --filter geo-effect-kit-demo dev
```

## Project layout

- `packages/core`: the public Cesium effects SDK.
- `apps/demo`: Vite demo for previewing effects and generated usage snippets.
- `knowledge/effects`: machine-readable effect manifests.
- `knowledge/docs`: effect-level documentation for humans and AI agents.
- `mcp-server`: optional MCP server for querying effect manifests and examples.

## Pull requests

Before opening a pull request:

- Keep runtime SDK changes inside `packages/core` unless the demo or knowledge layer also needs updates.
- Add or update tests for SDK behavior changes.
- Update `knowledge/effects` and `knowledge/docs` when adding or changing public effect options.
- Run `pnpm typecheck`, `pnpm test`, and `pnpm build`.
- Keep generated or vendor files out of unrelated changes.

## Public API expectations

Effects should accept an existing Cesium `Viewer` and return an instance with the common lifecycle methods:

- `update(options)`
- `show()`
- `hide()`
- `flyTo(options?)`
- `destroy()`
- `isVisible()`
- `isDestroyed()`
- `getOptions()`
