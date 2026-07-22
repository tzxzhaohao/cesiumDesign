export interface ScanConeExpansionFrame {
  progress: number
  radiusMeters: number
  lengthMeters: number
  elapsedMs: number
}

export type ScanConeExpansionStatus = 'idle' | 'running' | 'paused' | 'completed' | 'cancelled'

export interface ScanConeExpansionState extends ScanConeExpansionFrame {
  status: ScanConeExpansionStatus
}

export interface ScanConeExpansionOptions {
  maxRadiusMeters: number
  durationMs?: number
  cameraFollow?: boolean
  autoStart?: boolean
  onFrame?: (state: ScanConeExpansionState) => void
  onComplete?: (state: ScanConeExpansionState) => void
}

export interface NormalizedScanConeExpansionOptions {
  maxRadiusMeters: number
  durationMs: number
  cameraFollow: boolean
  autoStart: boolean
  onFrame?: (state: ScanConeExpansionState) => void
  onComplete?: (state: ScanConeExpansionState) => void
}

export function normalizeScanConeExpansionOptions(
  options: ScanConeExpansionOptions,
): NormalizedScanConeExpansionOptions {
  const maxRadiusMeters = Number.isFinite(options.maxRadiusMeters) && options.maxRadiusMeters > 0
    ? options.maxRadiusMeters
    : 1
  const requestedDurationMs = options.durationMs
  const durationMs = requestedDurationMs !== undefined && Number.isFinite(requestedDurationMs)
    ? clamp(requestedDurationMs, 100, 120000)
    : 4500

  return {
    maxRadiusMeters,
    durationMs,
    cameraFollow: options.cameraFollow ?? false,
    autoStart: options.autoStart ?? true,
    ...(options.onFrame ? { onFrame: options.onFrame } : {}),
    ...(options.onComplete ? { onComplete: options.onComplete } : {}),
  }
}

export function sampleScanConeExpansionFrame(
  options: NormalizedScanConeExpansionOptions,
  finalLengthMeters: number,
  elapsedMs: number,
): ScanConeExpansionFrame {
  const safeElapsedMs = clampElapsedMs(elapsedMs, options.durationMs)
  const linearProgress = safeElapsedMs / options.durationMs
  const progress = easeInOutCubic(linearProgress)
  const safeLengthMeters = Number.isFinite(finalLengthMeters) && finalLengthMeters > 0 ? finalLengthMeters : 0

  return {
    progress,
    radiusMeters: options.maxRadiusMeters * progress,
    lengthMeters: safeLengthMeters * progress,
    elapsedMs: safeElapsedMs,
  }
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value))
}

function clampElapsedMs(elapsedMs: number, durationMs: number): number {
  if (Number.isNaN(elapsedMs) || elapsedMs === Number.NEGATIVE_INFINITY) return 0
  if (elapsedMs === Number.POSITIVE_INFINITY) return durationMs
  return clamp(elapsedMs, 0, durationMs)
}

function easeInOutCubic(progress: number): number {
  return progress < 0.5
    ? 4 * progress * progress * progress
    : 1 - ((-2 * progress + 2) ** 3) / 2
}
