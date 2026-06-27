# @ztgkzhaohao/geo-effect-kit-mcp

MCP server for querying `geo-effect-kit` Cesium effect manifests, schemas, usage examples, and integration notes.

## Usage

```bash
npx @ztgkzhaohao/geo-effect-kit-mcp
```

## Tools

- `list_effects`: list all available effects.
- `get_effect_schema`: return the manifest and option schema for one effect.
- `get_usage_example`: return a named usage example.
- `generate_integration_notes`: generate target-project integration notes.

## MCP client configuration

```json
{
  "mcpServers": {
    "geo-effect-kit": {
      "command": "npx",
      "args": ["@ztgkzhaohao/geo-effect-kit-mcp"]
    }
  }
}
```

## Relationship to the SDK

Runtime projects install `@ztgkzhaohao/geo-effect-kit`. AI agents and MCP clients use `@ztgkzhaohao/geo-effect-kit-mcp` to discover effects and generate integration code.
