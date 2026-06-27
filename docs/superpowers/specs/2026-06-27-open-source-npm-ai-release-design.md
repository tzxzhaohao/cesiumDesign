# 开源、npm 发布与 AI 智能体接入设计

## 目标

将 `geo-effect-kit` 从本地可用的 Cesium 动效工作区整理成公开可用的开源项目，满足四类使用场景：

- 普通开发者可以从 GitHub 了解项目、运行 demo、复制示例，并通过 npm 安装 `@ztgk/geo-effect-kit`。
- Cesium/Vite/React/Vue 项目可以把 SDK 接入到已有 `Viewer`，并按统一生命周期管理动效实例。
- AI 智能体可以读取结构化知识层，查询可用效果、参数 schema、示例代码和项目迁移说明。
- 维护者可以通过 CI、版本号、变更日志和发布流程稳定迭代，而不是依赖手工记忆。

本阶段不重写核心动效实现，不新增复杂官网，不引入大型文档框架。重点是把“已经能跑的效果库”整理成“别人能安装、能理解、能验证、能持续更新”的开源发布形态。

## 当前项目状态

当前仓库已经具备开源发布的核心骨架：

- `packages/core` 是框架无关的 Cesium 动效 SDK，包名为 `@ztgk/geo-effect-kit`，入口已经指向 `dist/index.js` 和 `dist/index.d.ts`。
- `apps/demo` 是 Vite + Cesium 示例应用，演示 SDK 的效果、参数控制和用法模板。
- `knowledge/effects` 与 `knowledge/docs` 提供效果 manifest 和 Markdown 说明。
- `mcp-server` 提供 `list_effects`、`get_effect_schema`、`get_usage_example`、`generate_integration_notes` 等智能体查询能力。
- GitHub 远程已经存在：`https://github.com/tzxzhaohao/cesiumDesign.git`。
- npm 上 `@ztgk/geo-effect-kit` 当前未发布，包名可作为公共包首次发布。

主要缺口是开源标准文件、npm 元数据、发布自动化、GitHub Pages demo、AI 智能体接入说明、发布前验收流程，以及工作区未提交改动的整理。

## 推荐路线

采用“GitHub 开源仓库 + npm 公共包 + 可部署 demo + 可安装 MCP server”的路线。

不推荐只发布 GitHub 源码，因为普通项目接入成本高，也不利于版本管理。不推荐一开始建设完整官网，因为当前最重要的是 SDK 可安装、文档可信、demo 可看、智能体可查。完整官网可以等 npm 首发稳定后再做。

## 包与仓库形态

仓库继续保持 monorepo：

- `packages/core`：发布到 npm 的主 SDK，包名 `@ztgk/geo-effect-kit`。
- `apps/demo`：公开在线 demo，用 GitHub Pages 部署。
- `knowledge`：随仓库开源的效果知识库，给文档、MCP 和 AI 智能体共用。
- `mcp-server`：建议发布为独立 npm 包 `@ztgk/geo-effect-kit-mcp`，让智能体可以通过 `npx` 启动。
- `docs`：承载开发者接入、AI 智能体接入、Cesium/Vite 配置、React/Vue 示例、发布流程。

`packages/core` 保持只依赖宿主项目传入的 Cesium `Viewer`。Cesium 本身继续作为 `peerDependency`，避免 SDK 和宿主项目各打包一份 Cesium。宿主项目负责 Cesium 静态资源、Viewer 初始化、业务数据和页面卸载时的 `destroy()`。

## npm 发布设计

`packages/core/package.json` 需要补齐公共发布元数据：

- `license`: 建议 MIT。
- `author`: 使用维护者名称或组织。
- `repository`: 指向 GitHub 仓库。
- `homepage`: 优先指向 GitHub Pages demo 或 README。
- `bugs`: 指向 GitHub Issues。
- `keywords`: `cesium`、`gis`、`webgis`、`visualization`、`effects`、`shader`、`typescript` 等。
- `publishConfig.access`: `public`，确保 scoped package 能公开发布。

首次发布流程：

```bash
pnpm test
pnpm typecheck
pnpm build
pnpm --filter @ztgk/geo-effect-kit pack
npm adduser
pnpm --filter @ztgk/geo-effect-kit publish --access public
```

发布前需要确认 `dist` 是由当前源码构建出来的，`pnpm pack` 产物只包含预期文件。首发版本建议保持 `0.1.0`，等 API 经真实项目接入验证后再进入 `1.0.0`。

## AI 智能体接入设计

AI 可用性分成两层：

第一层是仓库原生知识层。`knowledge/effects/*.effect.json` 继续作为机器可读 manifest，描述效果 ID、包名、导入名、参数、方法、示例、注意事项。`knowledge/docs/*.md` 提供人和智能体都能阅读的迁移说明。README 和 `docs/ai-agents.md` 要明确告诉智能体优先读取这些文件，而不是从 demo 代码里反推 API。

第二层是 MCP server。`mcp-server` 继续提供以下能力：

- `list_effects`：列出可用效果。
- `get_effect_schema`：返回某个效果的完整参数 schema。
- `get_usage_example`：返回指定效果的最小示例、React 示例、Vue 示例等。
- `generate_integration_notes`：按目标项目生成接入建议。

为了让外部智能体真正可用，`mcp-server` 应从 `private: true` 调整为可发布包，并增加 `bin`、README、npm 元数据和 MCP 客户端配置示例。目标用法：

```bash
npx @ztgk/geo-effect-kit-mcp
```

`docs/ai-agents.md` 需要给出 Cursor、Claude Desktop、Codex 或通用 MCP 客户端的配置片段，并说明 SDK 包和 MCP 包的关系：业务项目运行只需要 `@ztgk/geo-effect-kit`，AI 查询和自动生成集成代码才需要 MCP。

## 文档设计

文档以“能让陌生开发者 10 分钟接入”为标准。

根 README 负责快速判断：

- 项目是什么。
- 支持哪些效果。
- 安装命令。
- 最小 Cesium 示例。
- demo 运行方式。
- 在线 demo 链接。
- npm 包链接。
- AI/MCP 接入入口。
- license 和贡献方式。

建议增加以下文档：

- `README.zh-CN.md`：中文完整介绍，根 README 可以中英混合或英文优先。
- `docs/getting-started.md`：从安装到创建第一个效果。
- `docs/vite-cesium.md`：Cesium 静态资源、`CESIUM_BASE_URL`、widgets CSS、构建部署说明。
- `docs/react.md`：React 中创建、更新、销毁效果实例。
- `docs/vue.md`：Vue 中创建、更新、销毁效果实例。
- `docs/ai-agents.md`：AI 智能体读取知识层和 MCP server 的方式。
- `docs/release.md`：维护者发布流程。

知识层文档继续保留在 `knowledge/docs`，它更偏单个效果的参数、示例和迁移说明；`docs` 下的文档更偏项目级接入流程。

## GitHub 开源标准化

需要补齐以下文件：

- `LICENSE`：建议 MIT，降低外部使用门槛。
- `CONTRIBUTING.md`：说明开发、测试、提交 PR 的方式。
- `CHANGELOG.md`：记录版本变化。
- `.github/ISSUE_TEMPLATE`：Bug report 和 Feature request。
- `.github/PULL_REQUEST_TEMPLATE.md`：PR 自查清单。
- `.github/workflows/ci.yml`：对 PR 和 push 运行测试、类型检查和构建。
- `.github/workflows/pages.yml`：部署 `apps/demo` 到 GitHub Pages。
- `.github/workflows/release.yml`：后续可用 npm token 自动发布。

CI 初始阶段应保守：先验证 `pnpm install --frozen-lockfile`、`pnpm typecheck`、`pnpm test`、`pnpm build`。release 自动化可以等首次手工发布成功后再接入，减少首发排障成本。

## GitHub Pages demo

`apps/demo` 应部署为公开在线 demo。Pages 构建时要确保 Cesium 静态资源复制到最终产物，并正确设置 base path。如果仓库名保持 `cesiumDesign`，demo 访问路径可能是：

```text
https://tzxzhaohao.github.io/cesiumDesign/
```

demo 是项目推广和验收的重要入口，但不应该成为 SDK 的运行依赖。README 中要明确 demo 使用 workspace 依赖只是本仓库开发方式，外部项目应通过 npm 安装 SDK。

## 测试与验收

发布前验收分三层：

1. 仓库级验证：

```bash
pnpm typecheck
pnpm test
pnpm build
```

2. 打包验证：

```bash
pnpm --filter @ztgk/geo-effect-kit pack
```

检查 tarball 文件列表，确认只发布 `dist`、类型声明、必要元数据，不带 demo、测试或本地配置。

3. 外部项目验证：

创建一个临时 Vite + Cesium 项目，安装 pack 出来的 `.tgz`，调用至少一个基础效果和一个带资源/后处理特性的效果，确认类型、运行时和 Cesium 资源路径都正常。

如果时间允许，再增加 Playwright 冒烟测试：启动 demo，打开至少一个效果，检查 canvas 非空、页面无关键控制台错误。

## 风险与处理

包名风险：`@ztgk/geo-effect-kit` 当前 npm 未发布，但首次发布需要 npm 账号对 `@ztgk` scope 有权限。如果没有该 scope 权限，要改用个人 scope 或无 scope 包名。发布前以 `npm view` 和登录账号权限为准。

Cesium 资源风险：不同宿主项目处理 Cesium 静态资源的方式不同。通过 `docs/vite-cesium.md` 固化 Vite 方案，并在 README 中明确宿主项目必须配置 `CESIUM_BASE_URL` 和 widgets CSS。

API 稳定性风险：当前版本建议保持 `0.x`，文档注明 API 仍可能调整。每个效果实例统一提供 `update`、`show`、`hide`、`flyTo`、`destroy`，这是对外稳定边界。

AI 接入风险：如果 MCP 包和知识层不同步，智能体会给出过期建议。CI 中应增加 MCP/knowledge 测试，确保 manifest、docs、server 索引一致。

发布凭据风险：npm token 和 GitHub token 不写入仓库，只使用 GitHub Secrets。首次可手工发布，稳定后再启用自动发布。

## 实施顺序

建议按以下顺序实施：

1. 整理当前工作区改动，确认哪些属于本次发布准备，哪些属于已有功能变更。
2. 补齐开源标准文件和根 README 发布导向内容。
3. 补齐 `packages/core` npm 元数据与发布前 pack 验证。
4. 补齐开发者文档：getting started、Vite/Cesium、React、Vue。
5. 补齐 AI 文档，并将 MCP server 调整为可发布包。
6. 增加 GitHub Actions CI。
7. 增加 GitHub Pages demo 部署。
8. 做临时外部项目安装验证。
9. 手工首次发布 npm。
10. 首次发布成功后，再接入自动 release 工作流。

这个顺序能先保证 SDK 对外可用，再扩展 AI 和自动化发布能力，避免一开始把发布系统做复杂却没有验证真实安装路径。
