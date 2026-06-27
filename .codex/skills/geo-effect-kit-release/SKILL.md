---
name: geo-effect-kit-release
description: Use when preparing, versioning, tagging, publishing, or verifying npm releases for the cesiumDesign geo-effect-kit workspace, including @ztgkzhaohao/geo-effect-kit and @ztgkzhaohao/geo-effect-kit-mcp.
---

# Geo Effect Kit Release

## Overview

这个 skill 约束 geo-effect-kit 的版本管理和 npm 发布流程。每次发布都必须让代码版本、npm 版本、Git tag、CHANGELOG 和验证记录保持一致。

## Release Rules

发布前先确认当前仓库是 `/Users/zhaohao/ztgk/cesiumDesign`，并且包名仍是：

- SDK: `@ztgkzhaohao/geo-effect-kit`
- MCP: `@ztgkzhaohao/geo-effect-kit-mcp`

版本号必须遵守语义化版本：

- `patch`: bug 修复、文档修正、兼容性小调整，例如 `0.1.0 -> 0.1.1`
- `minor`: 新增效果、新增参数、新增 MCP 能力，例如 `0.1.0 -> 0.2.0`
- `major`: `1.0.0` 后才用于破坏性 API 变更

同一次发布中，这些文件的版本号必须一致：

- `package.json`
- `packages/core/package.json`
- `mcp-server/package.json`

如果只发布其中一个 npm 包，仍要明确说明另一个包为什么不发布。

## Local Release

按下面顺序执行，不要跳过验证：

```bash
git status --short --branch
pnpm typecheck
pnpm test
pnpm build
pnpm pack:check
pnpm smoke:external
```

升级版本号后更新 `CHANGELOG.md`，提交并打 tag：

```bash
git add .
git commit -m "chore: release v0.1.1"
git tag v0.1.1
git push origin master
git push origin v0.1.1
```

发布 npm：

```bash
pnpm --filter @ztgkzhaohao/geo-effect-kit publish --access public
pnpm --filter @ztgkzhaohao/geo-effect-kit-mcp publish --access public
```

如果 npm 要求 WebAuthn/2FA，等待用户在浏览器中确认 security key。不要让用户粘贴 recovery codes。

## GitHub Actions Release

仓库已有 `.github/workflows/release.yml`。长期推荐用 GitHub Actions 发布：

1. 确认 GitHub Secrets 配置 `NPM_TOKEN`。
2. 手动运行 `Release Packages` workflow。
3. 先用 `dry_run=true` 验证。
4. 再用 `dry_run=false` 发布 `core`、`mcp` 或 `both`。

GitHub Actions 发布前仍必须先提交版本号、CHANGELOG 和 tag，除非用户明确选择另一种自动化版本策略。

## Post-Release Verification

发布后必须查询 npm registry：

```bash
npm view @ztgkzhaohao/geo-effect-kit version dist-tags.latest --json
npm view @ztgkzhaohao/geo-effect-kit-mcp version dist-tags.latest --json
```

再用临时目录验证真实安装或拉包：

```bash
tmp=$(mktemp -d)
cd "$tmp"
npm init -y
npm install @ztgkzhaohao/geo-effect-kit cesium
node --input-type=module -e "import { createRadarScanEffect } from '@ztgkzhaohao/geo-effect-kit'; console.log(typeof createRadarScanEffect)"
```

MCP 包如果刚发布后 `npm view` 暂时 404，但 `npm dist-tag ls`、`npm access get status` 或 `npm pack` 能看到包，优先判断为 npm registry 元数据传播延迟；等待后重查，不要急着重复发布同一版本。

## Guardrails

- 不要重复发布已经存在的同版本 npm 包；npm 不允许覆盖同版本。
- 不要在 git 工作区有未解释改动时发布。
- 不要发布旧 scope `@ztgk/geo-effect-kit` 或 `@ztgk/geo-effect-kit-mcp`。
- 不要把 npm token、Tianditu token、recovery codes 写入仓库。
- 如果发布失败，先读完整错误并定位根因，再决定是改权限、改版本号、等 registry 同步，还是重试。
