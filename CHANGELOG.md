# Changelog

All notable changes to this project will be documented in this file.

This project follows semantic versioning after the public npm release. During `0.x`, public APIs may still evolve, but breaking changes should be documented here.

## Unreleased

- Added `material-polyline` with `createMaterialPolylineEffect` for Mars3D-style solid, outline, arrow, dash, texture, cross, and navigation polyline materials.
- Added custom line image material support for `material-polyline`; `image` accepts URL strings, data URLs, image/canvas objects, `ImageBitmap`, and `OffscreenCanvas`, and takes priority over `imagePreset`.
- Added `material-polyline` demo controls, TypeScript/React/Vue usage snippets, MCP schema, knowledge docs, and tests.

## 0.2.0 - 2026-06-28

- Added the `flow` water-surface type for a stronger directional river-current style inspired by the yunzhou-onemap `WaterPrimitive` water effect.
- Preserved existing `river`, `lake`, and `flood` water-surface types.
- Updated the demo water-surface example to use the yunzhou-onemap river polygon and Flow Type defaults.
- Added a `route-scan` demo that moves either `radar-scan` or `scan-cone` along a preset route, with route visibility and controllable movement speed.
- Exported dynamic Cesium material properties for route-driven radar and scan-cone entities.
- Fixed moving `scan-cone` route animation so the cone's own sweep continues to animate while its position moves.
- Changed demo `Radius` and `Speed` defaults to their minimum slider values.
- Updated water-surface tests, manifest, and docs for the new flow water style.

## 0.1.0 - 2026-06-27

- Initial public release preparation for `@ztgkzhaohao/geo-effect-kit`.
- Added reusable Cesium effects including radar scan, ripple spread, fly line, pipe flow, water surface, light wall, scan cone, shield dome, temperature field, scene weather, post-process effects, polyline flow, and GIF fire billboards.
- Added machine-readable effect manifests and documentation for AI agents.
- Added MCP server package preparation for querying effect schemas and usage examples.
