# AI 智能体与 MCP

`geo-effect-kit` 为 AI 智能体提供两种入口：

1. 仓库内的结构化知识文件。
2. 可选的 MCP server。

## 结构化知识文件

智能体生成集成代码时应优先读取：

- `knowledge/effects/*.effect.json`
- `knowledge/docs/*.md`

`knowledge/effects` 适合机器读取，包含效果 ID、包名、导入名、参数、方法、示例和注意事项。`knowledge/docs` 适合补充理解具体效果的适用场景和迁移说明。

## MCP server

安装或直接运行：

```bash
npx @ztgk/geo-effect-kit-mcp
```

MCP server 提供以下工具：

- `list_effects`
- `get_effect_schema`
- `get_usage_example`
- `generate_integration_notes`

## 通用 MCP 配置

```json
{
  "mcpServers": {
    "geo-effect-kit": {
      "command": "npx",
      "args": ["@ztgk/geo-effect-kit-mcp"]
    }
  }
}
```

## 智能体生成代码原则

- 导入运行时代码时使用 `@ztgk/geo-effect-kit`。
- 查询效果知识时使用 MCP 或 `knowledge` 文件。
- 不要从 demo UI 反推 API。
- 宿主项目必须自己创建 Cesium `Viewer`。
- 页面卸载或图层移除时必须调用效果实例的 `destroy()`。
- Cesium 静态资源配置属于宿主项目责任。
