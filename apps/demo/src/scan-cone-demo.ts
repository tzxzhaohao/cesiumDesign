export type ConeExpansionStatus = 'idle' | 'running' | 'paused' | 'completed' | 'cancelled' | 'static'

export interface ConeExpansionFrame {
  progress: number
  radiusMeters: number
  lengthMeters: number
  elapsedMs: number
}

export interface ConeExpansionState extends ConeExpansionFrame {
  status: ConeExpansionStatus
}

export interface ConeExpansionEffectLike {
  restartExpansion(): void
  cancelExpansion(): void
  getExpansionState(): ConeExpansionState
}

export interface ConeExpansionControlState {
  radiusDisabled: boolean
  expansionSettingsDisabled: boolean
  restartDisabled: boolean
  cancelDisabled: boolean
}

export interface ConeExpansionAnnouncementState {
  status: ConeExpansionStatus | null
  milestone: number
}

export interface ScanConeCodeOptions {
  center: { longitude: number; latitude: number }
  type: string
  color: string
  radiusMeters: number
  lengthMeters: number
  speed: number
  aperture: number
  heading: number
  expansion?: {
    maxRadiusMeters: number
    durationMs: number
    cameraFollow: boolean
  }
}

export function replaceScanConeEffect<T extends { destroy(): void }>(current: { destroy(): void } | null, create: () => T): T {
  current?.destroy()
  return create()
}

export function performConeExpansionAction(
  effect: ConeExpansionEffectLike,
  action: 'restart' | 'cancel',
): ConeExpansionState {
  const current = effect.getExpansionState()
  if (action === 'cancel' && current.status !== 'running') return current

  if (action === 'restart') effect.restartExpansion()
  else effect.cancelExpansion()
  return effect.getExpansionState()
}

export function getConeExpansionControlState(options: {
  active: boolean
  enabled: boolean
  status: ConeExpansionStatus
}): ConeExpansionControlState {
  if (!options.active) {
    return {
      radiusDisabled: false,
      expansionSettingsDisabled: true,
      restartDisabled: true,
      cancelDisabled: true,
    }
  }

  return {
    radiusDisabled: options.enabled,
    expansionSettingsDisabled: !options.enabled,
    restartDisabled: !options.enabled,
    cancelDisabled: !options.enabled || options.status !== 'running',
  }
}

export function createConeExpansionAnnouncementState(): ConeExpansionAnnouncementState {
  return { status: null, milestone: -1 }
}

export function updateConeExpansionAnnouncement(
  previous: ConeExpansionAnnouncementState,
  update: { status: ConeExpansionStatus; frame: ConeExpansionFrame },
): { state: ConeExpansionAnnouncementState; announcement: string | null } {
  const presentation = formatConeExpansionProgress(update.frame, update.status)
  const milestone = Math.floor(presentation.progressPercent / 25) * 25
  const announce = previous.status !== update.status || milestone > previous.milestone

  return {
    state: { status: update.status, milestone },
    announcement: announce ? presentation.text : null,
  }
}

export function formatConeExpansionProgress(
  frame: ConeExpansionFrame,
  status: ConeExpansionStatus,
): { progressPercent: number; text: string } {
  const progressPercent = Math.round(clamp(frame.progress, 0, 1) * 100)
  const radius = Math.round(frame.radiusMeters).toLocaleString()
  const height = Math.round(frame.lengthMeters).toLocaleString()
  return {
    progressPercent,
    text: `status ${status} · radius ${radius} m · height ${height} m · ${progressPercent}%`,
  }
}

export function buildScanConeCode(options: ScanConeCodeOptions): string {
  const expansionCode = options.expansion
    ? `  expansion: {
    maxRadiusMeters: ${options.expansion.maxRadiusMeters},
    durationMs: ${options.expansion.durationMs},
    cameraFollow: ${options.expansion.cameraFollow},
    autoStart: true,
    onFrame: (frame) => {
      console.log('scan radius (m)', frame.radiusMeters.toFixed(0))
    },
    onComplete: (frame) => {
      console.log('expansion complete (m)', frame.radiusMeters.toFixed(0))
    },
  },
`
    : ''
  const flyToCode = !options.expansion || !options.expansion.cameraFollow ? '\ncone.flyTo()\n' : '\n'
  const restartCode = options.expansion
    ? `
// Restart from a UI event when needed:
// cone.restartExpansion()
`
    : ''

  return `import { createScanConeEffect } from '@ztgkzhaohao/geo-effect-kit'

const cone = createScanConeEffect(viewer, {
  center: { longitude: ${options.center.longitude}, latitude: ${options.center.latitude} },
  type: '${options.type}',
  color: '${options.color}',
  radiusMeters: ${options.radiusMeters},
  lengthMeters: ${options.lengthMeters},
  speed: ${options.speed.toFixed(2)},
  aperture: ${options.aperture},
  heading: ${options.heading},
${expansionCode}})
${flyToCode}${restartCode}
cone.destroy()`
}

export function getReactCodeTemplate(code: string): string {
  const imports = extractImportLines(code)
  const body = stripImportAndDestroyLines(code)
  const cleanup = extractDestroyLines(code)

  return `import { useEffect } from 'react'
import type { Viewer } from 'cesium'
${imports}

type GeoEffectProps = {
  viewer: Viewer | null
}

export function GeoEffectUsage({ viewer }: GeoEffectProps) {
  useEffect(() => {
    if (!viewer) return

${indentCode(body, 4)}

    return () => {
${indentCode(cleanup, 6)}
    }
  }, [viewer])

  return null
}`
}

export function getVueCodeTemplate(code: string): string {
  const imports = extractImportLines(code)
  const body = stripImportAndDestroyLines(code)
  const cleanup = extractDestroyLines(code)

  return `<script setup lang="ts">
import { onBeforeUnmount, watch } from 'vue'
import type { Viewer } from 'cesium'
${imports}

const props = defineProps<{
  viewer: Viewer | null
}>()

let cleanupEffect: (() => void) | undefined

watch(
  () => props.viewer,
  (viewer) => {
    cleanupEffect?.()
    cleanupEffect = undefined
    if (!viewer) return

${indentCode(body, 4)}

    cleanupEffect = () => {
${indentCode(cleanup, 6)}
    }
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  cleanupEffect?.()
})
</script>

<template>
  <slot />
</template>`
}

function extractImportLines(code: string): string {
  return code
    .split('\n')
    .filter((line) => line.startsWith('import '))
    .join('\n')
}

function stripImportAndDestroyLines(code: string): string {
  return code
    .split('\n')
    .filter((line) => !line.startsWith('import ') && !isCleanupLine(line))
    .join('\n')
    .trim()
}

function extractDestroyLines(code: string): string {
  return code
    .split('\n')
    .filter(isCleanupLine)
    .join('\n')
    .trim()
}

function isCleanupLine(line: string): boolean {
  return (
    line.includes('.destroy()') ||
    line.includes('cancelAnimationFrame(') ||
    line.includes('dataSources.remove(') ||
    line.includes('entities.remove(')
  )
}

function indentCode(code: string, spaces: number): string {
  const prefix = ' '.repeat(spaces)
  return code
    .split('\n')
    .map((line) => (line.length > 0 ? `${prefix}${line}` : line))
    .join('\n')
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value))
}
