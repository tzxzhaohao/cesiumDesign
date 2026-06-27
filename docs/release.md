# 发布流程

## 首次手工发布

首次发布建议在本地完成，便于确认 npm scope 权限。

```bash
npm whoami
pnpm typecheck
pnpm test
pnpm build
pnpm pack:check
pnpm smoke:external
pnpm --filter @ztgkzhaohao/geo-effect-kit publish --access public
pnpm --filter @ztgkzhaohao/geo-effect-kit-mcp publish --access public
```

如果 `npm whoami` 提示未登录，先运行：

```bash
npm adduser
```

## GitHub Actions 发布

首次手工发布成功后，可以在 GitHub 仓库 Secrets 中配置：

```text
NPM_TOKEN
```

然后运行 `Release Packages` workflow。默认先用 `dry_run=true` 验证。

## 版本号

- patch：修复 bug 或文档修正。
- minor：新增效果、新增参数或新增集成方式。
- major：`1.0.0` 后才用于破坏性 API 变更。

当前 `0.x` 阶段仍可能调整 API，但破坏性变化必须写入 `CHANGELOG.md`。
