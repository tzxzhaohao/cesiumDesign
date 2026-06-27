import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export interface EffectSummary {
  id: string
  name: string
  packageName: string
  importName: string
  summary: string
  useCases: string[]
}

export interface EffectExample {
  language: string
  code: string
}

export interface EffectManifest extends EffectSummary {
  options: {
    properties: Record<string, unknown>
  }
  methods: string[]
  examples: Record<string, EffectExample>
  notes: string[]
}

const currentDir = path.dirname(fileURLToPath(import.meta.url))
const repositoryRoot = path.resolve(currentDir, '../..')
const effectsDir = path.join(repositoryRoot, 'knowledge/effects')
const docsDir = path.join(repositoryRoot, 'knowledge/docs')

const effectFiles: Record<string, string> = {
  'radar-scan': path.join(effectsDir, 'radar-scan.effect.json'),
  'ripple-spread': path.join(effectsDir, 'ripple-spread.effect.json'),
  'polyline-flow': path.join(effectsDir, 'polyline-flow.effect.json'),
  'fly-line': path.join(effectsDir, 'fly-line.effect.json'),
  'pipe-flow': path.join(effectsDir, 'pipe-flow.effect.json'),
  'light-wall': path.join(effectsDir, 'light-wall.effect.json'),
  'scan-cone': path.join(effectsDir, 'scan-cone.effect.json'),
  'shield-dome': path.join(effectsDir, 'shield-dome.effect.json'),
  'temperature-field': path.join(effectsDir, 'temperature-field.effect.json'),
  'fire-billboard': path.join(effectsDir, 'fire-billboard.effect.json'),
}

export async function listEffects(): Promise<EffectSummary[]> {
  const manifests = await Promise.all(Object.keys(effectFiles).map((id) => readEffectManifest(id)))

  return manifests.map(({ id, name, packageName, importName, summary, useCases }) => ({
    id,
    name,
    packageName,
    importName,
    summary,
    useCases,
  }))
}

export async function getEffectSchema(effectId: string): Promise<EffectManifest> {
  return readEffectManifest(effectId)
}

export async function getUsageExample(effectId: string, exampleName = 'minimal'): Promise<EffectExample> {
  const manifest = await readEffectManifest(effectId)
  const example = manifest.examples[exampleName]
  if (!example) {
    throw new Error(`Unknown example "${exampleName}" for effect "${effectId}"`)
  }

  return example
}

export async function generateIntegrationNotes(effectId: string, targetProject = 'generic Cesium project'): Promise<string> {
  const manifest = await readEffectManifest(effectId)
  const doc = await readFile(path.join(docsDir, `${effectId}.md`), 'utf8')
  const migrationSection = extractSection(doc, ['FireHotspot 迁移说明', 'FireHotspot Migration'])
  const notes = manifest.notes.map((note) => `- ${note}`).join('\n')

  if (/firehotspot/i.test(targetProject)) {
    if (effectId === 'fire-billboard') {
      return [
        `Use ${manifest.importName} from ${manifest.packageName} to render FireHotspot fire points from user-provided longitude, latitude, and gif fields.`,
        migrationSection,
        'Important lifecycle note: keep the returned instance and call destroy() when the fire layer, route page, or Cesium viewer is removed.',
        'Asset note: the SDK does not provide a default GIF; choose the GIF URL or data URL in your FireHotspot business code and pass it per point.',
      ].join('\n\n')
    }

    if (effectId === 'temperature-field') {
      return [
        `Use ${manifest.importName} from ${manifest.packageName} inside FirePredictionSurfaceLayer to replace ImageMaterialProperty canvas risk-surface rendering.`,
        migrationSection,
        'Important lifecycle note: keep one effect instance per prediction layer and call destroy() when the page effect or Cesium layer is removed.',
        'Data compatibility note: pass riskSurface.polygons, riskSurface.riskField.seed, riskSurface.riskField.opacity, and riskSurface.riskField.stops directly.',
      ].join('\n\n')
    }

    return [
      `Use ${manifest.importName} from ${manifest.packageName} to replace route-local radar primitive code.`,
      migrationSection,
      'Important lifecycle note: call destroy() when the page effect or Cesium layer is removed.',
      'Shader naming note: the reusable material is GeoRadarScanMaterial, replacing FirePredictionRadarScanMaterial in shared SDK code.',
    ].join('\n\n')
  }

  return [
    `Target project: ${targetProject}`,
    `Import ${manifest.importName} from ${manifest.packageName}.`,
    'Attach the effect to an existing Cesium Viewer and keep the returned instance for updates and cleanup.',
    notes,
  ].join('\n\n')
}

async function readEffectManifest(effectId: string): Promise<EffectManifest> {
  const file = effectFiles[effectId]
  if (!file) {
    throw new Error(`Unknown effect "${effectId}"`)
  }

  return JSON.parse(await readFile(file, 'utf8')) as EffectManifest
}

function extractSection(markdown: string, headings: string | string[]): string {
  const headingList = Array.isArray(headings) ? headings : [headings]
  const match = headingList
    .map((heading) => new RegExp(`^## ${escapeRegExp(heading)}\\s*$`, 'm').exec(markdown))
    .find((candidate): candidate is RegExpExecArray => candidate !== null)
  if (!match) return ''

  const start = match.index + match[0].length
  const rest = markdown.slice(start)
  const nextHeading = /^## /m.exec(rest)
  return rest.slice(0, nextHeading?.index ?? rest.length).trim()
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
