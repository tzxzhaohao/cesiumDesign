# Open Source Growth Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve the public-facing entry points for `geo-effect-kit` so new users can quickly understand, try, star, and share the project.

**Architecture:** Keep the existing monorepo and release setup. This pass changes documentation, package metadata, and GitHub repository metadata; it does not change Cesium runtime behavior.

**Tech Stack:** Markdown, npm package metadata, GitHub repository settings, GitHub Pages demo workflow.

---

### Task 1: README And npm Discovery

**Files:**
- Modify: `README.md`
- Modify: `README.zh-CN.md`
- Modify: `packages/core/README.md`
- Modify: `packages/core/package.json`
- Modify: `mcp-server/package.json`

- [ ] Rewrite the README first screen around online demo, npm install, effect coverage, and AI/MCP positioning.
- [ ] Keep Chinese README aligned with the same conversion path.
- [ ] Add npm keywords that match likely searches for Cesium, WebGIS, map effects, digital twin, and MCP.

### Task 2: Contributor And Promotion Playbook

**Files:**
- Modify: `CONTRIBUTING.md`
- Create: `docs/open-source-growth.md`

- [ ] Add concrete beginner-friendly contribution ideas.
- [ ] Create a reusable promotion playbook with launch checklist, channel order, and copy-paste post drafts.

### Task 3: GitHub Repository Metadata

**Remote:**
- Repository: `tzxzhaohao/cesiumDesign`

- [ ] Set repository description to describe the Cesium effects SDK.
- [ ] Set homepage to the GitHub Pages demo URL.
- [ ] Set topics for Cesium, WebGIS, map visualization, TypeScript, MCP, and AI agents.
- [ ] Check Pages status and report whether it is enabled.

### Task 4: Verification

- [ ] Run focused docs/metadata checks with `rg` and `npm view`.
- [ ] Run `pnpm typecheck` and `pnpm test` because package metadata and docs should not break the workspace.
- [ ] Run `pnpm build` if the focused checks pass.
- [ ] Report remaining manual follow-ups, especially GitHub Pages enablement or release creation if not possible from the current auth/context.
