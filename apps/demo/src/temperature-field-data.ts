import type { TemperatureFieldPolygon, TemperatureFieldSample } from '@ztgk/geo-effect-kit'

export type TemperatureSampleType = 'low' | 'normal' | 'warm' | 'hot' | 'critical'

export type TemperatureFieldSampleConfig = {
  type: TemperatureSampleType
  value: number
  color: string
  count: number
}

export const fallbackBeijingTemperatureFieldPolygons: TemperatureFieldPolygon[] = [
  {
    outer: [
      [115.4231, 39.4427],
      [115.6973, 39.5582],
      [115.795, 39.8042],
      [115.782, 40.1598],
      [115.9244, 40.4385],
      [116.1691, 40.6528],
      [116.4551, 41.0608],
      [116.835, 40.983],
      [117.2108, 40.7406],
      [117.5146, 40.6604],
      [117.4292, 40.2675],
      [117.2461, 40.0636],
      [117.308, 39.8465],
      [116.9342, 39.6314],
      [116.7072, 39.536],
      [116.4236, 39.442],
      [116.0788, 39.4559],
    ],
    holes: [],
  },
]

export const temperatureFieldStops = [
  { value: 0, color: '#57c7ff', label: '低风险' },
  { value: 20, color: '#6ddb73', label: '较低' },
  { value: 40, color: '#ffd047', label: '中风险' },
  { value: 60, color: '#ff8a2d', label: '较高' },
  { value: 80, color: '#ff3e2f', label: '高风险' },
]

export const temperatureSampleConfigs: TemperatureFieldSampleConfig[] = [
  { type: 'low', value: 15, color: '#57c7ff', count: 3 },
  { type: 'normal', value: 32, color: '#6ddb73', count: 4 },
  { type: 'warm', value: 48, color: '#ffd047', count: 4 },
  { type: 'hot', value: 68, color: '#ff8a2d', count: 3 },
  { type: 'critical', value: 88, color: '#ff3e2f', count: 2 },
]

export function parseTiandituAdministrativePolygons(payload: unknown): TemperatureFieldPolygon[] {
  const records = getTiandituAdministrativeRecords(payload)
  return records
    .flatMap((record) => getTiandituRegionStrings(record))
    .flatMap(parseTiandituBoundaryString)
    .filter((polygon) => polygon.outer.length >= 3)
}

function getTiandituAdministrativeRecords(payload: unknown): unknown[] {
  if (!payload || typeof payload !== 'object') return []

  const data = getObjectValue(payload, 'data') ?? getObjectValue(payload, 'result')
  if (Array.isArray(data)) return data
  if (data && typeof data === 'object') return [data]
  return []
}

function getTiandituRegionStrings(record: unknown): string[] {
  const values: string[] = []
  collectTiandituRegionStrings(record, values)
  return values
}

function collectTiandituRegionStrings(value: unknown, values: string[]): void {
  if (typeof value === 'string') return
  if (!value || typeof value !== 'object') return

  if (Array.isArray(value)) {
    value.forEach((item) => collectTiandituRegionStrings(item, values))
    return
  }

  const record = value as Record<string, unknown>
  ;['boundary', 'region', 'polygon', 'pointsStr'].forEach((key) => {
    const field = record[key]
    if (typeof field === 'string' && looksLikeBoundaryString(field)) values.push(field)
  })
  ;['points', 'children', 'child', 'district', 'districts'].forEach((key) => collectTiandituRegionStrings(record[key], values))
}

function looksLikeBoundaryString(value: string): boolean {
  return /^\s*(?:MULTI)?POLYGON\s*\(/i.test(value) || /-?\d+(?:\.\d+)?[, ]+-?\d+(?:\.\d+)?/.test(value)
}

function parseTiandituBoundaryString(value: string): TemperatureFieldPolygon[] {
  if (/^\s*(?:MULTI)?POLYGON\s*\(/i.test(value)) return parseWktBoundaryPolygons(value)
  return parseTiandituRegionString(value).map((outer) => ({ outer, holes: [] }))
}

export function parseTiandituRegionString(region: string): [number, number][][] {
  return region
    .split(/\|+/)
    .map((ring) => parseCoordinateRing(ring))
    .filter((ring) => ring.length >= 3)
}

function parseCoordinateRing(ring: string): [number, number][] {
  const numbers = ring
    .split(/[,;\s]+/)
    .map((part) => Number(part))
    .filter(Number.isFinite)
  const coordinates: [number, number][] = []
  for (let index = 0; index < numbers.length - 1; index += 2) {
    const longitude = numbers[index]!
    const latitude = numbers[index + 1]!
    if (longitude >= -180 && longitude <= 180 && latitude >= -90 && latitude <= 90) {
      coordinates.push([longitude, latitude])
    }
  }
  return coordinates
}

function parseWktBoundaryPolygons(wkt: string): TemperatureFieldPolygon[] {
  const normalized = wkt.trim()
  if (!normalized) return []

  const startIndex = normalized.indexOf('(')
  if (startIndex < 0) return []

  const type = normalized.slice(0, startIndex).trim().toUpperCase()
  const body = normalized.slice(startIndex)

  if (type.startsWith('MULTIPOLYGON')) {
    return extractWktPolygonTexts(body).map(parseWktPolygonText).filter((polygon) => polygon.outer.length >= 3)
  }

  if (type.startsWith('POLYGON')) {
    const polygon = parseWktPolygonText(body)
    return polygon.outer.length >= 3 ? [polygon] : []
  }

  return []
}

function extractWktPolygonTexts(raw: string): string[] {
  const content = unwrapOuterParentheses(raw.trim())
  const polygons: string[] = []
  let depth = 0
  let start = -1

  for (let index = 0; index < content.length; index += 1) {
    const char = content[index]
    if (char === '(') {
      if (depth === 0) start = index
      depth += 1
    } else if (char === ')') {
      depth -= 1
      if (depth === 0 && start >= 0) {
        polygons.push(content.slice(start, index + 1))
        start = -1
      }
    }
  }

  return polygons
}

function parseWktPolygonText(raw: string): TemperatureFieldPolygon {
  const rings = extractWktRingTexts(raw)
    .map(parseWktRing)
    .filter((ring) => ring.length >= 3)

  return {
    outer: rings[0] ?? [],
    holes: rings.slice(1),
  }
}

function extractWktRingTexts(raw: string): string[] {
  const content = unwrapOuterParentheses(raw.trim())
  const rings: string[] = []
  let depth = 0
  let start = -1

  for (let index = 0; index < content.length; index += 1) {
    const char = content[index]
    if (char === '(') {
      if (depth === 0) start = index
      depth += 1
    } else if (char === ')') {
      depth -= 1
      if (depth === 0 && start >= 0) {
        rings.push(content.slice(start + 1, index))
        start = -1
      }
    }
  }

  return rings
}

function parseWktRing(raw: string): [number, number][] {
  return raw.split(',').flatMap((point) => {
    const [longitudeValue, latitudeValue] = point.trim().split(/\s+/)
    const longitude = Number(longitudeValue)
    const latitude = Number(latitudeValue)
    return isValidLngLat(longitude, latitude) ? ([[longitude, latitude]] as [number, number][]) : []
  })
}

function unwrapOuterParentheses(value: string): string {
  const result = value.trim()
  return result.startsWith('(') && result.endsWith(')') ? result.slice(1, -1).trim() : result
}

function isValidLngLat(longitude: number, latitude: number): boolean {
  return Number.isFinite(longitude) && Number.isFinite(latitude) && longitude >= -180 && longitude <= 180 && latitude >= -90 && latitude <= 90
}

export function createRandomTemperatureSamples(
  polygons: TemperatureFieldPolygon[],
  configs: TemperatureFieldSampleConfig[],
  seed: number,
): TemperatureFieldSample[] {
  const bounds = getTemperaturePolygonBounds(polygons)
  if (!bounds) return []

  const samples: TemperatureFieldSample[] = []
  let randomIndex = 0
  configs.forEach((config) => {
    for (let count = 0; count < config.count; count += 1) {
      const point = createRandomPointInPolygons(polygons, bounds, seed + randomIndex * 17)
      randomIndex += 1
      if (point) {
        samples.push({
          longitude: point[0],
          latitude: point[1],
          value: config.value,
          type: config.type,
        })
      }
    }
  })
  return samples
}

function createRandomPointInPolygons(
  polygons: TemperatureFieldPolygon[],
  bounds: { west: number; south: number; east: number; north: number },
  seed: number,
): [number, number] | null {
  for (let attempt = 0; attempt < 280; attempt += 1) {
    const longitude = bounds.west + seededRandom(seed, attempt * 2 + 1) * (bounds.east - bounds.west)
    const latitude = bounds.south + seededRandom(seed, attempt * 2 + 2) * (bounds.north - bounds.south)
    if (polygons.some((polygon) => isPointInPolygon([longitude, latitude], polygon.outer))) {
      return [longitude, latitude]
    }
  }
  return null
}

export function isPointInPolygon(point: [number, number], polygon: [number, number][]): boolean {
  let inside = false
  for (let index = 0, previousIndex = polygon.length - 1; index < polygon.length; previousIndex = index, index += 1) {
    const current = polygon[index]!
    const previous = polygon[previousIndex]!
    const intersects =
      current[1] > point[1] !== previous[1] > point[1] &&
      point[0] < ((previous[0] - current[0]) * (point[1] - current[1])) / (previous[1] - current[1]) + current[0]
    if (intersects) inside = !inside
  }
  return inside
}

export function getTemperaturePolygonBounds(
  polygons: TemperatureFieldPolygon[],
): { west: number; south: number; east: number; north: number } | null {
  const points = polygons.flatMap((polygon) => polygon.outer)
  if (points.length === 0) return null
  return points.reduce(
    (bounds, [longitude, latitude]) => ({
      west: Math.min(bounds.west, longitude),
      south: Math.min(bounds.south, latitude),
      east: Math.max(bounds.east, longitude),
      north: Math.max(bounds.north, latitude),
    }),
    {
      west: Number.POSITIVE_INFINITY,
      south: Number.POSITIVE_INFINITY,
      east: Number.NEGATIVE_INFINITY,
      north: Number.NEGATIVE_INFINITY,
    },
  )
}

function getObjectValue(value: unknown, key: string): unknown {
  if (!value || typeof value !== 'object') return undefined
  return (value as Record<string, unknown>)[key]
}

function seededRandom(seed: number, offset: number): number {
  const value = Math.sin((seed + 1) * (offset + 12.9898) * 78.233) * 43758.5453
  return value - Math.floor(value)
}
