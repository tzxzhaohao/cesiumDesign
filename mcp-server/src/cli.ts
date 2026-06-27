#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'
import {
  generateIntegrationNotes,
  getEffectSchema,
  getUsageExample,
  listEffects,
} from './index.js'

const server = new McpServer({
  name: 'geo-effect-kit',
  version: '0.1.0',
})

server.registerTool(
  'list_effects',
  {
    title: 'List Effects',
    description: 'List available geo-effect-kit effects.',
    inputSchema: {},
  },
  async () => ({
    content: [{ type: 'text', text: JSON.stringify(await listEffects(), null, 2) }],
  }),
)

server.registerTool(
  'get_effect_schema',
  {
    title: 'Get Effect Schema',
    description: 'Return the full manifest and option schema for an effect.',
    inputSchema: {
      effectId: z.string(),
    },
  },
  async ({ effectId }) => ({
    content: [{ type: 'text', text: JSON.stringify(await getEffectSchema(effectId), null, 2) }],
  }),
)

server.registerTool(
  'get_usage_example',
  {
    title: 'Get Usage Example',
    description: 'Return a named usage example for an effect.',
    inputSchema: {
      effectId: z.string(),
      exampleName: z.string().optional(),
    },
  },
  async ({ effectId, exampleName }) => ({
    content: [{ type: 'text', text: JSON.stringify(await getUsageExample(effectId, exampleName), null, 2) }],
  }),
)

server.registerTool(
  'generate_integration_notes',
  {
    title: 'Generate Integration Notes',
    description: 'Generate project-specific integration guidance for an effect.',
    inputSchema: {
      effectId: z.string(),
      targetProject: z.string().optional(),
    },
  },
  async ({ effectId, targetProject }) => ({
    content: [{ type: 'text', text: await generateIntegrationNotes(effectId, targetProject) }],
  }),
)

await server.connect(new StdioServerTransport())
