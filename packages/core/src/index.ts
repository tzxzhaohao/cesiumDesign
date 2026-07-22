import {
  BoundingSphere,
  BillboardGraphics,
  CallbackPositionProperty,
  CallbackProperty,
  Cartesian2,
  Cartesian3,
  Cartesian4,
  CircleGeometry,
  Color,
  ColorMaterialProperty,
  ConstantPositionProperty,
  ConstantProperty,
  CustomDataSource,
  CylinderGeometry,
  EllipsoidSurfaceAppearance,
  Event,
  GeometryInstance,
  GroundPrimitive,
  HeadingPitchRoll,
  HeadingPitchRange,
  HeightReference,
  HorizontalOrigin,
  Intersect,
  Material,
  MaterialAppearance,
  Math as CesiumMath,
  Matrix4,
  PointGraphics,
  PolylineArrowMaterialProperty,
  PolylineDashMaterialProperty,
  PolylineGlowMaterialProperty,
  PolylineOutlineMaterialProperty,
  PolygonGeometry,
  PolygonHierarchy,
  PostProcessStage,
  Primitive,
  Rectangle,
  Transforms,
  VerticalOrigin,
  type Entity,
  type JulianDate,
  type Property,
  type Viewer,
} from 'cesium'
import { decompressFrames, parseGIF, type ParsedFrame } from 'gifuct-js'
import { normalizeScanConeExpansionOptions, sampleScanConeExpansionFrame } from './scan-cone-expansion.js'
import type {
  NormalizedScanConeExpansionOptions,
  ScanConeExpansionOptions,
  ScanConeExpansionState,
} from './scan-cone-expansion.js'

export type {
  ScanConeExpansionFrame,
  ScanConeExpansionOptions,
  ScanConeExpansionState,
  ScanConeExpansionStatus,
} from './scan-cone-expansion.js'

export const GEO_RADAR_SCAN_MATERIAL_TYPE = 'GeoRadarScanMaterial'

export const GEO_RIPPLE_SPREAD_MATERIAL_TYPE = 'GeoRippleSpreadMaterial'

export const GEO_LIGHT_WALL_MATERIAL_TYPE = 'GeoLightWallMaterial'

export const GEO_SCAN_CONE_MATERIAL_TYPE = 'GeoScanConeMaterial'

export const GEO_SHIELD_DOME_MATERIAL_TYPE = 'GeoShieldDomeMaterial'

export const GEO_TEMPERATURE_FIELD_MATERIAL_TYPE = 'GeoTemperatureFieldMaterial'

export const GEO_WATER_SURFACE_MATERIAL_TYPE = 'GeoWaterSurfaceMaterial'

export const GEO_MATERIAL_POLYLINE_MATERIAL_TYPE = 'GeoMaterialPolylineMaterial'

export const RADAR_SCAN_TYPE_VALUES = ['classic', 'sector', 'pulse', 'grid'] as const

export const RIPPLE_SPREAD_TYPE_VALUES = ['water', 'energy', 'soft'] as const

export const SCENE_WEATHER_TYPE_VALUES = ['rain', 'snow', 'fog', 'lightning'] as const

export const POST_PROCESS_TYPE_VALUES = ['bloom', 'night-vision', 'black-white', 'brightness', 'mosaic', 'depth-of-field'] as const

export const POLYLINE_FLOW_TYPE_VALUES = ['dispatch', 'migration', 'attack', 'comet', 'electric'] as const

export const MATERIAL_POLYLINE_STYLE_VALUES = [
  'solid',
  'outline',
  'arrow',
  'dash',
  'dual-dash',
  'flow',
  'flow-color',
  'three-dash',
  'cross',
  'navigation',
] as const

export const MATERIAL_POLYLINE_IMAGE_PRESET_VALUES = [
  'pulse',
  'gradual',
  'arrow-blue',
  'rainbow',
  'arrow-repeat',
  'dovetail',
  'yellow-flow',
  'transparent-flow',
  'interval',
  'small-arrow',
  'gradient',
] as const

export const FLY_LINE_MODE_VALUES = ['single-arc', 'hub-spoke', 'bidirectional'] as const

export const LIGHT_WALL_TYPE_VALUES = ['security', 'warning', 'data', 'fence', 'pulse'] as const

export const SCAN_CONE_TYPE_VALUES = ['searchlight', 'radar', 'camera', 'drone', 'alarm'] as const

export const SHIELD_DOME_TYPE_VALUES = ['hex', 'plasma', 'matrix', 'aegis', 'storm'] as const

export const WATER_SURFACE_TYPE_VALUES = ['river', 'lake', 'flood', 'flow'] as const

export type RadarScanType = (typeof RADAR_SCAN_TYPE_VALUES)[number]

export type RippleSpreadType = (typeof RIPPLE_SPREAD_TYPE_VALUES)[number]

export type SceneWeatherType = (typeof SCENE_WEATHER_TYPE_VALUES)[number]

export type PostProcessType = (typeof POST_PROCESS_TYPE_VALUES)[number]

export type PolylineFlowType = (typeof POLYLINE_FLOW_TYPE_VALUES)[number]

export type MaterialPolylineStyle = (typeof MATERIAL_POLYLINE_STYLE_VALUES)[number]

export type MaterialPolylineImagePreset = (typeof MATERIAL_POLYLINE_IMAGE_PRESET_VALUES)[number]

export type FlyLineMode = (typeof FLY_LINE_MODE_VALUES)[number]

export type LightWallType = (typeof LIGHT_WALL_TYPE_VALUES)[number]

export type ScanConeType = (typeof SCAN_CONE_TYPE_VALUES)[number]

export type ShieldDomeType = (typeof SHIELD_DOME_TYPE_VALUES)[number]

export type WaterSurfaceType = (typeof WATER_SURFACE_TYPE_VALUES)[number]

export interface RadarScanCenter {
  longitude: number
  latitude: number
}

export interface GeoEffectPosition extends RadarScanCenter {
  height?: number
}

export interface RadarScanOptions {
  center: RadarScanCenter
  radiusMeters: number
  type?: RadarScanType | string
  color?: string
  scanDurationMs?: number
  opacity?: number
  rings?: boolean
  showCenter?: boolean
  visible?: boolean
}

export interface NormalizedRadarScanOptions {
  center: RadarScanCenter
  radiusMeters: number
  type: RadarScanType
  color: string
  scanDurationMs: number
  opacity: number
  rings: boolean
  showCenter: boolean
  visible: boolean
}

export interface RadarScanFlyToOptions {
  duration?: number
  pitch?: number
  rangeMultiplier?: number
}

export interface RadarScanEffectInstance {
  update(options: Partial<RadarScanOptions>): void
  show(): void
  hide(): void
  flyTo(options?: RadarScanFlyToOptions): void
  destroy(): void
  isVisible(): boolean
  isDestroyed(): boolean
  getOptions(): NormalizedRadarScanOptions
}

export interface RippleSpreadOptions {
  center: RadarScanCenter
  radiusMeters: number
  type?: RippleSpreadType | string
  color?: string
  ringCount?: number
  durationMs?: number
  opacity?: number
  showCenter?: boolean
  visible?: boolean
}

export interface NormalizedRippleSpreadOptions {
  center: RadarScanCenter
  radiusMeters: number
  type: RippleSpreadType
  color: string
  ringCount: number
  durationMs: number
  opacity: number
  showCenter: boolean
  visible: boolean
}

export interface RippleSpreadFlyToOptions {
  duration?: number
  pitch?: number
  rangeMultiplier?: number
}

export interface RippleSpreadEffectInstance {
  update(options: Partial<RippleSpreadOptions>): void
  show(): void
  hide(): void
  flyTo(options?: RippleSpreadFlyToOptions): void
  destroy(): void
  isVisible(): boolean
  isDestroyed(): boolean
  getOptions(): NormalizedRippleSpreadOptions
}

export interface SceneWeatherOptions {
  type?: SceneWeatherType | string
  intensity?: number
  speed?: number
  windDirection?: number
  color?: string
  visible?: boolean
}

export interface NormalizedSceneWeatherOptions {
  type: SceneWeatherType
  intensity: number
  speed: number
  windDirection: number
  color: string
  visible: boolean
}

export interface SceneWeatherEffectInstance {
  update(options: Partial<SceneWeatherOptions>): void
  show(): void
  hide(): void
  flyTo(): void
  destroy(): void
  isVisible(): boolean
  isDestroyed(): boolean
  getOptions(): NormalizedSceneWeatherOptions
}

export interface PostProcessOptions {
  type?: PostProcessType | string
  strength?: number
  brightness?: number
  contrast?: number
  saturation?: number
  visible?: boolean
}

export interface NormalizedPostProcessOptions {
  type: PostProcessType
  strength: number
  brightness: number
  contrast: number
  saturation: number
  visible: boolean
}

export interface PostProcessEffectInstance {
  update(options: Partial<PostProcessOptions>): void
  show(): void
  hide(): void
  flyTo(): void
  destroy(): void
  isVisible(): boolean
  isDestroyed(): boolean
  getOptions(): NormalizedPostProcessOptions
}

export interface PolylineFlowOptions {
  positions: GeoEffectPosition[]
  type?: PolylineFlowType | string
  color?: string
  speed?: number
  width?: number
  trailLength?: number
  pulseCount?: number
  cornerRadius?: number
  glowPower?: number
  taperPower?: number
  clampToGround?: boolean
  visible?: boolean
}

export interface NormalizedPolylineFlowOptions {
  positions: GeoEffectPosition[]
  type: PolylineFlowType
  color: string
  speed: number
  width: number
  trailLength: number
  pulseCount: number
  cornerRadius: number
  glowPower: number
  taperPower: number
  clampToGround: boolean
  visible: boolean
}

export interface PolylineFlowFlyToOptions {
  duration?: number
  pitch?: number
  rangeMultiplier?: number
}

export interface PolylineFlowEffectInstance {
  update(options: Partial<PolylineFlowOptions>): void
  show(): void
  hide(): void
  flyTo(options?: PolylineFlowFlyToOptions): void
  destroy(): void
  isVisible(): boolean
  isDestroyed(): boolean
  getOptions(): NormalizedPolylineFlowOptions
}

export type MaterialPolylineImageSource =
  | string
  | HTMLImageElement
  | HTMLCanvasElement
  | ImageBitmap
  | OffscreenCanvas

export interface MaterialPolylineRepeat {
  x?: number
  y?: number
}

export interface NormalizedMaterialPolylineRepeat {
  x: number
  y: number
}

export interface MaterialPolylineOptions {
  positions: GeoEffectPosition[]
  style?: MaterialPolylineStyle | string
  color?: string
  secondaryColor?: string
  backgroundColor?: string
  width?: number
  outlineWidth?: number
  speed?: number
  repeat?: MaterialPolylineRepeat
  imagePreset?: MaterialPolylineImagePreset | string
  image?: MaterialPolylineImageSource
  arcHeight?: number
  arcSamples?: number
  cornerRadius?: number
  clampToGround?: boolean
  visible?: boolean
}

export interface NormalizedMaterialPolylineOptions {
  positions: GeoEffectPosition[]
  style: MaterialPolylineStyle
  color: string
  secondaryColor: string
  backgroundColor: string
  width: number
  outlineWidth: number
  speed: number
  repeat: NormalizedMaterialPolylineRepeat
  imagePreset: MaterialPolylineImagePreset
  image: MaterialPolylineImageSource
  arcHeight: number
  arcSamples: number
  cornerRadius: number
  clampToGround: boolean
  visible: boolean
}

export interface MaterialPolylineFlyToOptions {
  duration?: number
  pitch?: number
  rangeMultiplier?: number
}

export interface MaterialPolylineEffectInstance {
  update(options: Partial<MaterialPolylineOptions>): void
  show(): void
  hide(): void
  flyTo(options?: MaterialPolylineFlyToOptions): void
  destroy(): void
  isVisible(): boolean
  isDestroyed(): boolean
  getOptions(): NormalizedMaterialPolylineOptions
}

export interface FlyLineRoute {
  from: GeoEffectPosition
  to: GeoEffectPosition
}

export interface FlyLineOptions {
  lines: FlyLineRoute[]
  mode?: FlyLineMode | string
  color?: string
  speed?: number
  width?: number
  arcHeight?: number
  trailLength?: number
  pulseCount?: number
  glowPower?: number
  taperPower?: number
  showEndpoints?: boolean
  visible?: boolean
}

export interface NormalizedFlyLineOptions {
  lines: FlyLineRoute[]
  mode: FlyLineMode
  color: string
  speed: number
  width: number
  arcHeight: number
  trailLength: number
  pulseCount: number
  glowPower: number
  taperPower: number
  showEndpoints: boolean
  visible: boolean
}

export interface FlyLineFlyToOptions {
  duration?: number
  pitch?: number
  rangeMultiplier?: number
}

export interface FlyLineEffectInstance {
  update(options: Partial<FlyLineOptions>): void
  show(): void
  hide(): void
  flyTo(options?: FlyLineFlyToOptions): void
  destroy(): void
  isVisible(): boolean
  isDestroyed(): boolean
  getOptions(): NormalizedFlyLineOptions
}

export interface PipeFlowOptions {
  positions: GeoEffectPosition[]
  color?: string
  speed?: number
  width?: number
  pipeOpacity?: number
  waterOpacity?: number
  cornerRadius?: number
  bubbleDensity?: number
  clampToGround?: boolean
  visible?: boolean
}

export interface NormalizedPipeFlowOptions {
  positions: GeoEffectPosition[]
  color: string
  speed: number
  width: number
  pipeOpacity: number
  waterOpacity: number
  cornerRadius: number
  bubbleDensity: number
  clampToGround: boolean
  visible: boolean
}

export interface PipeFlowFlyToOptions {
  duration?: number
  pitch?: number
  rangeMultiplier?: number
}

export interface PipeFlowEffectInstance {
  update(options: Partial<PipeFlowOptions>): void
  show(): void
  hide(): void
  flyTo(options?: PipeFlowFlyToOptions): void
  destroy(): void
  isVisible(): boolean
  isDestroyed(): boolean
  getOptions(): NormalizedPipeFlowOptions
}

export interface LightWallOptions {
  positions: GeoEffectPosition[]
  type?: LightWallType | string
  color?: string
  height?: number
  speed?: number
  opacity?: number
  scanLineCount?: number
  breathing?: boolean
  outline?: boolean
  visible?: boolean
}

export interface NormalizedLightWallOptions {
  positions: GeoEffectPosition[]
  type: LightWallType
  color: string
  height: number
  speed: number
  opacity: number
  scanLineCount: number
  breathing: boolean
  outline: boolean
  visible: boolean
}

export interface LightWallFlyToOptions {
  duration?: number
  pitch?: number
  rangeMultiplier?: number
}

export interface LightWallEffectInstance {
  update(options: Partial<LightWallOptions>): void
  show(): void
  hide(): void
  flyTo(options?: LightWallFlyToOptions): void
  destroy(): void
  isVisible(): boolean
  isDestroyed(): boolean
  getOptions(): NormalizedLightWallOptions
}

export interface ScanConeOptions {
  center: GeoEffectPosition
  type?: ScanConeType | string
  color?: string
  radiusMeters?: number
  lengthMeters?: number
  speed?: number
  opacity?: number
  aperture?: number
  heading?: number
  pitch?: number
  showOrigin?: boolean
  visible?: boolean
  expansion?: ScanConeExpansionOptions
}

export interface NormalizedScanConeOptions {
  center: GeoEffectPosition
  type: ScanConeType
  color: string
  radiusMeters: number
  lengthMeters: number
  speed: number
  opacity: number
  aperture: number
  heading: number
  pitch: number
  showOrigin: boolean
  visible: boolean
  expansion?: NormalizedScanConeExpansionOptions
}

export interface ScanConeFlyToOptions {
  duration?: number
  pitch?: number
  rangeMultiplier?: number
}

export interface ScanConeEffectInstance {
  update(options: Partial<ScanConeOptions>): void
  restartExpansion(): void
  cancelExpansion(): void
  isExpanding(): boolean
  getExpansionState(): ScanConeExpansionState
  show(): void
  hide(): void
  flyTo(options?: ScanConeFlyToOptions): void
  destroy(): void
  isVisible(): boolean
  isDestroyed(): boolean
  getOptions(): NormalizedScanConeOptions
}

export interface ShieldDomeOptions {
  center: GeoEffectPosition
  radiusMeters: number
  type?: ShieldDomeType | string
  color?: string
  speed?: number
  opacity?: number
  gridDensity?: number
  pulseStrength?: number
  ring?: boolean
  visible?: boolean
}

export interface NormalizedShieldDomeOptions {
  center: GeoEffectPosition
  radiusMeters: number
  type: ShieldDomeType
  color: string
  speed: number
  opacity: number
  gridDensity: number
  pulseStrength: number
  ring: boolean
  visible: boolean
}

export interface ShieldDomeFlyToOptions {
  duration?: number
  pitch?: number
  rangeMultiplier?: number
}

export interface ShieldDomeEffectInstance {
  update(options: Partial<ShieldDomeOptions>): void
  show(): void
  hide(): void
  flyTo(options?: ShieldDomeFlyToOptions): void
  destroy(): void
  isVisible(): boolean
  isDestroyed(): boolean
  getOptions(): NormalizedShieldDomeOptions
}

export type TemperatureFieldCoordinate = [number, number]

export interface TemperatureFieldPolygon {
  outer: TemperatureFieldCoordinate[]
  holes?: TemperatureFieldCoordinate[][]
}

export interface TemperatureFieldStop {
  value: number
  color: string
  label?: string
}

export interface TemperatureFieldSample {
  longitude: number
  latitude: number
  value: number
  type?: string
}

export interface TemperatureFieldBounds {
  west: number
  south: number
  east: number
  north: number
}

export interface TemperatureFieldOptions {
  polygons: TemperatureFieldPolygon[]
  stops?: TemperatureFieldStop[]
  samples?: TemperatureFieldSample[]
  seed?: number
  opacity?: number
  bounds?: TemperatureFieldBounds
  noiseStrength?: number
  contourLines?: boolean
  contourStrength?: number
  outline?: boolean
  outlineColor?: string
  outlineWidth?: number
  visible?: boolean
}

export interface NormalizedTemperatureFieldOptions {
  polygons: Required<TemperatureFieldPolygon>[]
  stops: Required<TemperatureFieldStop>[]
  samples: Required<TemperatureFieldSample>[]
  seed: number
  opacity: number
  bounds: TemperatureFieldBounds | null
  noiseStrength: number
  contourLines: boolean
  contourStrength: number
  outline: boolean
  outlineColor: string
  outlineWidth: number
  visible: boolean
}

export interface TemperatureFieldFlyToOptions {
  duration?: number
  pitch?: number
  rangeMultiplier?: number
}

export interface TemperatureFieldEffectInstance {
  update(options: Partial<TemperatureFieldOptions>): void
  show(): void
  hide(): void
  flyTo(options?: TemperatureFieldFlyToOptions): void
  destroy(): void
  isVisible(): boolean
  isDestroyed(): boolean
  getOptions(): NormalizedTemperatureFieldOptions
}

export interface FireBillboardPoint extends GeoEffectPosition {
  id?: string
  gif: string
  label?: string
}

export interface NormalizedFireBillboardPoint extends GeoEffectPosition {
  id?: string
  gif: string
  label?: string
}

export interface FireBillboardOptions {
  points: FireBillboardPoint[]
  scale?: number
  frameIntervalMs?: number
  clampToGround?: boolean
  disableDepthTestDistance?: number
  visible?: boolean
}

export interface NormalizedFireBillboardOptions {
  points: NormalizedFireBillboardPoint[]
  scale: number
  frameIntervalMs: number
  clampToGround: boolean
  disableDepthTestDistance: number
  visible: boolean
}

export interface FireBillboardFlyToOptions {
  duration?: number
  pitch?: number
  rangeMultiplier?: number
}

export interface FireBillboardEffectInstance {
  update(options: Partial<FireBillboardOptions>): void
  show(): void
  hide(): void
  flyTo(options?: FireBillboardFlyToOptions): void
  destroy(): void
  isVisible(): boolean
  isDestroyed(): boolean
  getOptions(): NormalizedFireBillboardOptions
}

export interface WaterSurfaceOptions {
  polygon: GeoEffectPosition[]
  type?: WaterSurfaceType | string
  color?: string
  height?: number
  speed?: number
  opacity?: number
  waveStrength?: number
  reflectionStrength?: number
  distortionScale?: number
  reflectivity?: number
  refractionStrength?: number
  fresnelPower?: number
  flowDirection?: number
  outline?: boolean
  visible?: boolean
}

export interface NormalizedWaterSurfaceOptions {
  polygon: GeoEffectPosition[]
  type: WaterSurfaceType
  color: string
  height: number
  speed: number
  opacity: number
  waveStrength: number
  reflectionStrength: number
  distortionScale: number
  reflectivity: number
  refractionStrength: number
  fresnelPower: number
  flowDirection: number
  outline: boolean
  visible: boolean
}

export interface WaterSurfaceFlyToOptions {
  duration?: number
  pitch?: number
  rangeMultiplier?: number
}

export interface WaterSurfaceEffectInstance {
  update(options: Partial<WaterSurfaceOptions>): void
  show(): void
  hide(): void
  flyTo(options?: WaterSurfaceFlyToOptions): void
  destroy(): void
  isVisible(): boolean
  isDestroyed(): boolean
  getOptions(): NormalizedWaterSurfaceOptions
}

export function createRadarScanEffect(viewer: Viewer, options: RadarScanOptions): RadarScanEffect {
  return new RadarScanEffect(viewer, options)
}

export function createRippleSpreadEffect(viewer: Viewer, options: RippleSpreadOptions): RippleSpreadEffect {
  return new RippleSpreadEffect(viewer, options)
}

export function createSceneWeatherEffect(viewer: Viewer, options: SceneWeatherOptions = {}): SceneWeatherEffect {
  return new SceneWeatherEffect(viewer, options)
}

export function createPostProcessEffect(viewer: Viewer, options: PostProcessOptions = {}): PostProcessEffect {
  return new PostProcessEffect(viewer, options)
}

export function createPolylineFlowEffect(viewer: Viewer, options: PolylineFlowOptions): PolylineFlowEffect {
  return new PolylineFlowEffect(viewer, options)
}

export function createMaterialPolylineEffect(viewer: Viewer, options: MaterialPolylineOptions): MaterialPolylineEffect {
  return new MaterialPolylineEffect(viewer, options)
}

export function createFlyLineEffect(viewer: Viewer, options: FlyLineOptions): FlyLineEffect {
  return new FlyLineEffect(viewer, options)
}

export function createPipeFlowEffect(viewer: Viewer, options: PipeFlowOptions): PipeFlowEffect {
  return new PipeFlowEffect(viewer, options)
}

export function createLightWallEffect(viewer: Viewer, options: LightWallOptions): LightWallEffect {
  return new LightWallEffect(viewer, options)
}

export function createScanConeEffect(viewer: Viewer, options: ScanConeOptions): ScanConeEffect {
  return new ScanConeEffect(viewer, options)
}

export function createShieldDomeEffect(viewer: Viewer, options: ShieldDomeOptions): ShieldDomeEffect {
  return new ShieldDomeEffect(viewer, options)
}

export function createTemperatureFieldEffect(viewer: Viewer, options: TemperatureFieldOptions): TemperatureFieldEffect {
  return new TemperatureFieldEffect(viewer, options)
}

export function createFireBillboardEffect(viewer: Viewer, options: FireBillboardOptions): FireBillboardEffect {
  return new FireBillboardEffect(viewer, options)
}

export function createWaterSurfaceEffect(viewer: Viewer, options: WaterSurfaceOptions): WaterSurfaceEffect {
  return new WaterSurfaceEffect(viewer, options)
}

export function normalizeRadarScanOptions(options: RadarScanOptions): NormalizedRadarScanOptions {
  return {
    center: {
      longitude: finiteOr(options.center.longitude, 0),
      latitude: finiteOr(options.center.latitude, 0),
    },
    radiusMeters: Math.max(1, finiteOr(options.radiusMeters, 1)),
    type: normalizeRadarScanType(options.type),
    color: options.color ?? '#36d6ff',
    scanDurationMs: Math.max(1, finiteOr(options.scanDurationMs ?? 3600, 3600)),
    opacity: clamp01(finiteOr(options.opacity ?? 0.85, 0.85)),
    rings: options.rings ?? true,
    showCenter: options.showCenter ?? false,
    visible: options.visible ?? true,
  }
}

export function normalizeRippleSpreadOptions(options: RippleSpreadOptions): NormalizedRippleSpreadOptions {
  return {
    center: {
      longitude: finiteOr(options.center.longitude, 0),
      latitude: finiteOr(options.center.latitude, 0),
    },
    radiusMeters: Math.max(1, finiteOr(options.radiusMeters, 1)),
    type: normalizeRippleSpreadType(options.type),
    color: options.color ?? '#62e8ff',
    ringCount: clampInteger(finiteOr(options.ringCount ?? 4, 4), 1, 12),
    durationMs: Math.max(1, finiteOr(options.durationMs ?? 3200, 3200)),
    opacity: clamp01(finiteOr(options.opacity ?? 0.82, 0.82)),
    showCenter: options.showCenter ?? false,
    visible: options.visible ?? true,
  }
}

export function normalizeSceneWeatherOptions(options: SceneWeatherOptions = {}): NormalizedSceneWeatherOptions {
  const color = options.color && options.color.trim().length > 0 ? options.color : '#d8f3ff'
  return {
    type: normalizeSceneWeatherType(options.type),
    intensity: clamp01(finiteOr(options.intensity ?? 0.55, 0.55)),
    speed: clamp(finiteOr(options.speed ?? 1, 1), 0.05, 8),
    windDirection: finiteOr(options.windDirection ?? 115, 115),
    color,
    visible: options.visible ?? true,
  }
}

export function normalizePostProcessOptions(options: PostProcessOptions = {}): NormalizedPostProcessOptions {
  return {
    type: normalizePostProcessType(options.type),
    strength: clamp01(finiteOr(options.strength ?? 0.65, 0.65)),
    brightness: clamp(finiteOr(options.brightness ?? 1, 1), 0, 3),
    contrast: clamp(finiteOr(options.contrast ?? 1, 1), 0, 3),
    saturation: clamp(finiteOr(options.saturation ?? 1, 1), 0, 3),
    visible: options.visible ?? true,
  }
}

export function normalizePolylineFlowOptions(options: PolylineFlowOptions): NormalizedPolylineFlowOptions {
  return {
    positions: normalizePositions(options.positions, false),
    type: normalizePolylineFlowType(options.type),
    color: options.color ?? '#33f7ff',
    speed: clamp(finiteOr(options.speed ?? 1, 1), 0.05, 8),
    width: Math.max(1, finiteOr(options.width ?? 6, 6)),
    trailLength: clamp(finiteOr(options.trailLength ?? 0.32, 0.32), 0.02, 0.95),
    pulseCount: clampInteger(finiteOr(options.pulseCount ?? 3, 3), 1, 12),
    cornerRadius: clamp(finiteOr(options.cornerRadius ?? 0, 0), 0, 0.45),
    glowPower: clamp(finiteOr(options.glowPower ?? 0.22, 0.22), 0, 1),
    taperPower: clamp(finiteOr(options.taperPower ?? 0.72, 0.72), 0, 1),
    clampToGround: options.clampToGround ?? true,
    visible: options.visible ?? true,
  }
}

export function normalizeMaterialPolylineOptions(options: MaterialPolylineOptions): NormalizedMaterialPolylineOptions {
  const imagePreset = normalizeMaterialPolylineImagePreset(options.imagePreset)
  return {
    positions: normalizePositions(options.positions, false),
    style: normalizeMaterialPolylineStyle(options.style),
    color: options.color ?? '#33f7ff',
    secondaryColor: options.secondaryColor ?? '#ffffff',
    backgroundColor: options.backgroundColor ?? 'rgba(0, 64, 255, 0.35)',
    width: Math.max(1, finiteOr(options.width ?? 8, 8)),
    outlineWidth: Math.max(0, finiteOr(options.outlineWidth ?? 2, 2)),
    speed: clamp(finiteOr(options.speed ?? 1, 1), 0.05, 8),
    repeat: normalizeMaterialPolylineRepeat(options.repeat),
    imagePreset,
    image: options.image ?? getMaterialPolylinePresetImage(imagePreset),
    arcHeight: Math.max(0, finiteOr(options.arcHeight ?? 0, 0)),
    arcSamples: clampInteger(finiteOr(options.arcSamples ?? 48, 48), 2, 128),
    cornerRadius: clamp(finiteOr(options.cornerRadius ?? 0, 0), 0, 0.45),
    clampToGround: options.clampToGround ?? true,
    visible: options.visible ?? true,
  }
}

export function normalizeFlyLineOptions(options: FlyLineOptions): NormalizedFlyLineOptions {
  return {
    lines: normalizeFlyLineRoutes(options.lines),
    mode: normalizeFlyLineMode(options.mode),
    color: options.color ?? '#5ee8ff',
    speed: clamp(finiteOr(options.speed ?? 1, 1), 0.05, 8),
    width: Math.max(1, finiteOr(options.width ?? 4, 4)),
    arcHeight: Math.max(0, finiteOr(options.arcHeight ?? 38000, 38000)),
    trailLength: clamp(finiteOr(options.trailLength ?? 0.28, 0.28), 0.02, 0.95),
    pulseCount: clampInteger(finiteOr(options.pulseCount ?? 3, 3), 1, 12),
    glowPower: clamp(finiteOr(options.glowPower ?? 0.26, 0.26), 0, 1),
    taperPower: clamp(finiteOr(options.taperPower ?? 0.62, 0.62), 0, 1),
    showEndpoints: options.showEndpoints ?? true,
    visible: options.visible ?? true,
  }
}

export function normalizePipeFlowOptions(options: PipeFlowOptions): NormalizedPipeFlowOptions {
  return {
    positions: normalizePositions(options.positions, false),
    color: options.color ?? '#45dfff',
    speed: clamp(finiteOr(options.speed ?? 1, 1), 0.05, 8),
    width: Math.max(1, finiteOr(options.width ?? 12, 12)),
    pipeOpacity: clamp01(finiteOr(options.pipeOpacity ?? 0.32, 0.32)),
    waterOpacity: clamp01(finiteOr(options.waterOpacity ?? 0.86, 0.86)),
    cornerRadius: clamp(finiteOr(options.cornerRadius ?? 0.18, 0.18), 0, 0.45),
    bubbleDensity: clampInteger(finiteOr(options.bubbleDensity ?? 6, 6), 0, 16),
    clampToGround: options.clampToGround ?? true,
    visible: options.visible ?? true,
  }
}

export function normalizeLightWallOptions(options: LightWallOptions): NormalizedLightWallOptions {
  return {
    positions: normalizePositions(options.positions, true),
    type: normalizeLightWallType(options.type),
    color: options.color ?? '#27f5ff',
    height: Math.max(1, finiteOr(options.height ?? 3200, 3200)),
    speed: clamp(finiteOr(options.speed ?? 1, 1), 0.05, 8),
    opacity: clamp01(finiteOr(options.opacity ?? 0.72, 0.72)),
    scanLineCount: clampInteger(finiteOr(options.scanLineCount ?? 4, 4), 1, 16),
    breathing: options.breathing ?? true,
    outline: options.outline ?? true,
    visible: options.visible ?? true,
  }
}

export function normalizeScanConeOptions(options: ScanConeOptions): NormalizedScanConeOptions {
  return {
    center: normalizePosition(options.center),
    type: normalizeScanConeType(options.type),
    color: options.color ?? '#7cf7ff',
    radiusMeters: Math.max(1, finiteOr(options.radiusMeters ?? 1800, 1800)),
    lengthMeters: Math.max(1, finiteOr(options.lengthMeters ?? 4800, 4800)),
    speed: clamp(finiteOr(options.speed ?? 1, 1), 0.05, 8),
    opacity: clamp01(finiteOr(options.opacity ?? 0.62, 0.62)),
    aperture: clamp(finiteOr(options.aperture ?? 34, 34), 8, 120),
    heading: finiteOr(options.heading ?? 0, 0),
    pitch: finiteOr(options.pitch ?? 0, 0),
    showOrigin: options.showOrigin ?? true,
    visible: options.visible ?? true,
    ...(options.expansion ? { expansion: normalizeScanConeExpansionOptions(options.expansion) } : {}),
  }
}

export function normalizeShieldDomeOptions(options: ShieldDomeOptions): NormalizedShieldDomeOptions {
  return {
    center: normalizePosition(options.center),
    radiusMeters: Math.max(1, finiteOr(options.radiusMeters, 1)),
    type: normalizeShieldDomeType(options.type),
    color: options.color ?? '#57f7ff',
    speed: clamp(finiteOr(options.speed ?? 1, 1), 0.05, 8),
    opacity: clamp01(finiteOr(options.opacity ?? 0.56, 0.56)),
    gridDensity: clampInteger(finiteOr(options.gridDensity ?? 14, 14), 2, 40),
    pulseStrength: clamp01(finiteOr(options.pulseStrength ?? 0.72, 0.72)),
    ring: options.ring ?? true,
    visible: options.visible ?? true,
  }
}

export function normalizeTemperatureFieldOptions(options: TemperatureFieldOptions): NormalizedTemperatureFieldOptions {
  const polygons = normalizeTemperatureFieldPolygons(options.polygons)
  const bounds = normalizeTemperatureFieldBounds(options.bounds) ?? getTemperatureFieldBounds(polygons)

  return {
    polygons,
    stops: normalizeTemperatureFieldStops(options.stops),
    samples: normalizeTemperatureFieldSamples(options.samples),
    seed: normalizeSeed(options.seed),
    opacity: clamp01(finiteOr(options.opacity ?? 0.76, 0.76)),
    bounds,
    noiseStrength: clamp01(finiteOr(options.noiseStrength ?? 0.42, 0.42)),
    contourLines: options.contourLines ?? true,
    contourStrength: clamp01(finiteOr(options.contourStrength ?? 0.18, 0.18)),
    outline: options.outline ?? true,
    outlineColor: options.outlineColor ?? '#dff8ff',
    outlineWidth: Math.max(1, finiteOr(options.outlineWidth ?? 5, 5)),
    visible: options.visible ?? true,
  }
}

export function normalizeFireBillboardOptions(options: FireBillboardOptions): NormalizedFireBillboardOptions {
  return {
    points: normalizeFireBillboardPoints(options.points),
    scale: clamp(finiteOr(options.scale ?? 1, 1), 0.1, 8),
    frameIntervalMs: clamp(finiteOr(options.frameIntervalMs ?? 80, 80), 16, 2000),
    clampToGround: options.clampToGround ?? true,
    disableDepthTestDistance: Math.max(0, finiteOr(options.disableDepthTestDistance ?? Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY)),
    visible: options.visible ?? true,
  }
}

export function normalizeWaterSurfaceOptions(options: WaterSurfaceOptions): NormalizedWaterSurfaceOptions {
  const color = options.color && options.color.trim().length > 0 ? options.color : '#3de7ff'
  return {
    polygon: normalizePositions(options.polygon, true),
    type: normalizeWaterSurfaceType(options.type),
    color,
    height: Math.max(0, finiteOr(options.height ?? 0, 0)),
    speed: clamp(finiteOr(options.speed ?? 1, 1), 0.05, 8),
    opacity: clamp01(finiteOr(options.opacity ?? 0.72, 0.72)),
    waveStrength: clamp01(finiteOr(options.waveStrength ?? 0.48, 0.48)),
    reflectionStrength: clamp01(finiteOr(options.reflectionStrength ?? 0.36, 0.36)),
    distortionScale: clamp(finiteOr(options.distortionScale ?? 18, 18), 0, 64),
    reflectivity: clamp01(finiteOr(options.reflectivity ?? 0.58, 0.58)),
    refractionStrength: clamp01(finiteOr(options.refractionStrength ?? 0.42, 0.42)),
    fresnelPower: clamp(finiteOr(options.fresnelPower ?? 4, 4), 1, 12),
    flowDirection: finiteOr(options.flowDirection ?? 90, 90),
    outline: options.outline ?? true,
    visible: options.visible ?? true,
  }
}

export function shouldRebuildRadarScan(
  previous: NormalizedRadarScanOptions,
  next: NormalizedRadarScanOptions,
): boolean {
  return (
    previous.radiusMeters !== next.radiusMeters ||
    previous.center.longitude !== next.center.longitude ||
    previous.center.latitude !== next.center.latitude
  )
}

export function shouldRebuildRippleSpread(
  previous: NormalizedRippleSpreadOptions,
  next: NormalizedRippleSpreadOptions,
): boolean {
  return (
    previous.radiusMeters !== next.radiusMeters ||
    previous.center.longitude !== next.center.longitude ||
    previous.center.latitude !== next.center.latitude
  )
}

export function shouldRebuildPolylineFlow(
  previous: NormalizedPolylineFlowOptions,
  next: NormalizedPolylineFlowOptions,
): boolean {
  return (
    previous.clampToGround !== next.clampToGround ||
    previous.cornerRadius !== next.cornerRadius ||
    previous.positions.length !== next.positions.length ||
    !positionsEqual(previous.positions, next.positions)
  )
}

export function shouldRebuildMaterialPolyline(
  previous: NormalizedMaterialPolylineOptions,
  next: NormalizedMaterialPolylineOptions,
): boolean {
  return (
    previous.clampToGround !== next.clampToGround ||
    previous.arcHeight !== next.arcHeight ||
    previous.arcSamples !== next.arcSamples ||
    previous.cornerRadius !== next.cornerRadius ||
    previous.positions.length !== next.positions.length ||
    !positionsEqual(previous.positions, next.positions)
  )
}

export function shouldRebuildFlyLine(previous: NormalizedFlyLineOptions, next: NormalizedFlyLineOptions): boolean {
  return (
    previous.mode !== next.mode ||
    previous.arcHeight !== next.arcHeight ||
    previous.lines.length !== next.lines.length ||
    !flyLineRoutesEqual(previous.lines, next.lines)
  )
}

export function shouldRebuildPipeFlow(
  previous: NormalizedPipeFlowOptions,
  next: NormalizedPipeFlowOptions,
): boolean {
  return (
    previous.clampToGround !== next.clampToGround ||
    previous.cornerRadius !== next.cornerRadius ||
    previous.bubbleDensity !== next.bubbleDensity ||
    previous.positions.length !== next.positions.length ||
    !positionsEqual(previous.positions, next.positions)
  )
}

export function shouldRebuildLightWall(previous: NormalizedLightWallOptions, next: NormalizedLightWallOptions): boolean {
  return (
    previous.height !== next.height ||
    previous.positions.length !== next.positions.length ||
    !positionsEqual(previous.positions, next.positions)
  )
}

export function shouldRebuildScanCone(previous: NormalizedScanConeOptions, next: NormalizedScanConeOptions): boolean {
  return (
    previous.radiusMeters !== next.radiusMeters ||
    previous.lengthMeters !== next.lengthMeters ||
    previous.aperture !== next.aperture
  )
}

export function shouldRebuildShieldDome(previous: NormalizedShieldDomeOptions, next: NormalizedShieldDomeOptions): boolean {
  return previous.radiusMeters !== next.radiusMeters || !positionsEqual([previous.center], [next.center])
}

export function shouldRebuildTemperatureField(
  previous: NormalizedTemperatureFieldOptions,
  next: NormalizedTemperatureFieldOptions,
): boolean {
  return !temperatureFieldPolygonsEqual(previous.polygons, next.polygons)
}

export function shouldRebuildFireBillboard(
  previous: NormalizedFireBillboardOptions,
  next: NormalizedFireBillboardOptions,
): boolean {
  return (
    previous.clampToGround !== next.clampToGround ||
    previous.points.length !== next.points.length ||
    !fireBillboardPointsEqual(previous.points, next.points)
  )
}

export function shouldRebuildWaterSurface(
  previous: NormalizedWaterSurfaceOptions,
  next: NormalizedWaterSurfaceOptions,
): boolean {
  return (
    previous.height !== next.height ||
    previous.outline !== next.outline ||
    previous.polygon.length !== next.polygon.length ||
    !positionsEqual(previous.polygon, next.polygon)
  )
}

export function buildPolylineFlowSegmentWeights(
  segmentCount: number,
  type: PolylineFlowType | string = 'dispatch',
  progress = 0,
): number[] {
  const count = clampInteger(finiteOr(segmentCount, 0), 0, 128)
  if (count <= 0) return []

  const normalizedType = normalizePolylineFlowType(type)
  const head = fract(finiteOr(progress, 0)) * Math.max(1, count - 1)
  const profile = getPolylineFlowProfile(normalizedType)

  return Array.from({ length: count }, (_, index) => {
    const distance = Math.abs(index - head)
    const wrappedDistance = Math.min(distance, count - distance)
    const weight = 1 - wrappedDistance / Math.max(1, profile.tail)
    return roundWeight(clamp01(weight) ** profile.power)
  })
}

export function buildRadarScanMaterialSource(_options: Pick<NormalizedRadarScanOptions, 'scanDurationMs'>): string {
  return `
    // ${GEO_RADAR_SCAN_MATERIAL_TYPE}
    czm_material czm_getMaterial(czm_materialInput materialInput)
    {
      czm_material material = czm_getDefaultMaterial(materialInput);
      vec2 st = materialInput.st;
      vec2 radarCenter = vec2(0.5);
      vec2 vectorToPixel = st - radarCenter;
      float d = distance(st, radarCenter);
      float inside = smoothstep(0.5, 0.495, d);
      float outerRing = ringsEnabled * smoothstep(0.018, 0.0, abs(d - 0.49));
      float middleRing = ringsEnabled * smoothstep(0.008, 0.0, abs(d - 0.33)) * 0.16;
      float innerRing = ringsEnabled * smoothstep(0.008, 0.0, abs(d - 0.18)) * 0.18;
      float scanAngle = fract((czm_frameNumber * 16.6667) / scanDurationMs) * 6.28318530718;
      vec2 scanDirection = vec2(cos(scanAngle), sin(scanAngle));
      vec2 pixelDirection = normalize(vectorToPixel + vec2(0.00001));
      float directionMatch = dot(pixelDirection, scanDirection);
      float radialFade = smoothstep(0.06, 0.18, d) * (1.0 - smoothstep(0.35, 0.5, d));
      float classicEnabled = 1.0 - step(1.5, radarType);
      float sectorEnabled = step(1.5, radarType) * (1.0 - step(2.5, radarType));
      float pulseEnabled = step(2.5, radarType) * (1.0 - step(3.5, radarType));
      float gridEnabled = step(3.5, radarType);
      float classicScan = smoothstep(0.36, 0.98, directionMatch) * radialFade * inside;
      float classicLine = smoothstep(0.955, 1.0, directionMatch) * radialFade * inside;
      float sectorScan = smoothstep(0.06, 0.92, directionMatch) * radialFade * inside;
      float sectorEdge = (smoothstep(0.84, 1.0, directionMatch) + smoothstep(0.08, 0.0, abs(directionMatch - 0.12))) * radialFade * inside;
      float pulseScan = pow(max(directionMatch, 0.0), 16.0) * radialFade * inside;
      float pulseHead = smoothstep(0.975, 1.0, directionMatch) * radialFade * inside;
      float pulseWake = smoothstep(0.28, 0.95, directionMatch) * radialFade * inside * (1.0 - smoothstep(0.42, 0.5, d));
      float gridLineX = smoothstep(0.0035, 0.0, abs(fract(st.x * 12.0) - 0.5));
      float gridLineY = smoothstep(0.0035, 0.0, abs(fract(st.y * 12.0) - 0.5));
      float gridMask = (gridLineX + gridLineY) * radialFade * inside * smoothstep(0.28, 0.98, directionMatch);
      float gridScan = max(gridMask * 0.42, classicLine * 0.85);
      float scanTail = classicScan * classicEnabled + sectorScan * sectorEnabled + pulseWake * pulseEnabled + gridScan * gridEnabled;
      float sweepLine = classicLine * classicEnabled + sectorEdge * sectorEnabled + pulseHead * pulseEnabled + classicLine * gridEnabled;
      float centerGlow = smoothstep(0.065, 0.0, d) * (1.0 + pulseEnabled * 0.45 + gridEnabled * 0.18);
      float crossLine = (smoothstep(0.003, 0.0, abs(st.x - 0.5)) + smoothstep(0.003, 0.0, abs(st.y - 0.5))) * (0.1 + gridEnabled * 0.2);
      vec3 sectorTint = mix(color.rgb, vec3(0.7, 1.0, 0.32), 0.26);
      vec3 pulseTint = mix(color.rgb, vec3(1.0, 0.26, 0.88), 0.36);
      vec3 gridTint = mix(color.rgb, vec3(0.42, 0.72, 1.0), 0.28);
      vec3 styleColor = color.rgb * classicEnabled + sectorTint * sectorEnabled + pulseTint * pulseEnabled + gridTint * gridEnabled;
      float bodyGlow = sectorEnabled * sectorScan * 0.1 + pulseEnabled * pulseScan * 0.18 + gridEnabled * gridMask * 0.08;
      material.diffuse = styleColor * (0.34 + scanTail * 0.42 + outerRing * 0.32 + bodyGlow);
      material.emission = styleColor * (scanTail * 0.55 + sweepLine * (0.72 + pulseEnabled * 0.45) + outerRing * 0.8 + centerGlow * 0.45 + bodyGlow * 1.6);
      material.alpha = opacity * (inside * 0.08 + scanTail * 0.28 + sweepLine * (0.18 + sectorEnabled * 0.14 + pulseEnabled * 0.2) + outerRing * 0.56 + middleRing + innerRing + centerGlow * 0.18 + crossLine + bodyGlow);
      return material;
    }
  `
}

export function buildRippleSpreadMaterialSource(): string {
  return `
    // ${GEO_RIPPLE_SPREAD_MATERIAL_TYPE}
    czm_material czm_getMaterial(czm_materialInput materialInput)
    {
      czm_material material = czm_getDefaultMaterial(materialInput);
      vec2 st = materialInput.st;
      vec2 center = vec2(0.5);
      float d = distance(st, center);
      float inside = smoothstep(0.5, 0.495, d);
      float time = fract((czm_frameNumber * 16.6667) / durationMs);
      float safeRingCount = max(ringCount, 1.0);
      float waterRipple = 0.0;
      float energyRipple = 0.0;
      float softRipple = 0.0;

      for (int i = 0; i < 12; i++) {
        float index = float(i);
        float enabled = step(index + 0.5, safeRingCount);
        float progress = fract(time - index / safeRingCount + 1.0);
        float rippleRadius = progress * 0.49;
        float edgeFade = smoothstep(0.025, 0.13, rippleRadius) * (1.0 - smoothstep(0.39, 0.5, rippleRadius));
        float waterLine = smoothstep(0.026, 0.0, abs(d - rippleRadius)) * edgeFade;
        float energyLine = smoothstep(0.011, 0.0, abs(d - rippleRadius)) * edgeFade;
        float softLine = smoothstep(0.045, 0.0, abs(d - rippleRadius)) * edgeFade;
        waterRipple += enabled * waterLine * (1.0 - progress * 0.34);
        energyRipple += enabled * energyLine * (1.24 - progress * 0.18);
        softRipple += enabled * softLine * (0.78 - progress * 0.22);
      }

      float energyEnabled = step(1.5, rippleType) * (1.0 - step(2.5, rippleType));
      float softEnabled = step(2.5, rippleType);
      float waterEnabled = 1.0 - energyEnabled - softEnabled;
      float rippleStrength = waterRipple * waterEnabled + energyRipple * energyEnabled + softRipple * softEnabled;
      float centerGlow = smoothstep(0.07, 0.0, d) * (0.42 + energyEnabled * 0.58);
      float outerGlow = smoothstep(0.5, 0.26, d) * inside * (0.04 + softEnabled * 0.05);
      float shimmer = sin((d * 82.0) - (time * 6.28318530718)) * 0.018 * waterEnabled * inside;
      vec3 energyTint = mix(color.rgb, vec3(1.0, 0.24, 0.86), 0.42);
      vec3 softTint = mix(color.rgb, vec3(0.72, 0.94, 1.0), 0.28);
      vec3 styleColor = color.rgb * waterEnabled + energyTint * energyEnabled + softTint * softEnabled;
      material.diffuse = styleColor * (0.24 + rippleStrength * 0.3 + outerGlow);
      material.emission = styleColor * (rippleStrength * (0.56 + energyEnabled * 0.42) + centerGlow * 0.48);
      material.alpha = opacity * (inside * (0.035 + softEnabled * 0.04) + shimmer + rippleStrength * (0.35 + energyEnabled * 0.24) + centerGlow * 0.18 + outerGlow);
      return material;
    }
  `
}

export function buildMaterialPolylineMaterialSource(): string {
  return `
    // ${GEO_MATERIAL_POLYLINE_MATERIAL_TYPE}
    czm_material czm_getMaterial(czm_materialInput materialInput)
    {
      czm_material material = czm_getDefaultMaterial(materialInput);
      vec2 st = materialInput.st;
      float time = fract(czm_frameNumber * 0.016667 * speed);
      vec2 uv = vec2(fract(st.s * repeatX - time), fract(st.t * repeatY));
      vec4 textureColor = texture(image, uv);
      float flowEnabled = step(5.5, styleType) * (1.0 - step(6.5, styleType));
      float flowColorEnabled = step(6.5, styleType) * (1.0 - step(7.5, styleType));
      float threeDashEnabled = step(7.5, styleType) * (1.0 - step(8.5, styleType));
      float crossEnabled = step(8.5, styleType) * (1.0 - step(9.5, styleType));
      float navigationEnabled = step(9.5, styleType);
      float dynamicEnabled = max(max(flowEnabled, flowColorEnabled), max(max(threeDashEnabled, crossEnabled), navigationEnabled));
      float centerDistance = abs(st.t - 0.5);
      float centerCore = smoothstep(0.18, 0.0, centerDistance);
      float sideCore = smoothstep(0.08, 0.0, abs(centerDistance - 0.32));
      float dash = smoothstep(0.68, 0.72, fract(st.s * repeatX - time));
      float cross = max(
        smoothstep(0.08, 0.0, centerDistance) * dash,
        smoothstep(0.022, 0.0, abs(fract(st.s * repeatX - time) - 0.5))
      );
      float navCycle = fract(st.s * repeatX - time);
      float navWhite = smoothstep(0.0, 0.08, navCycle) * (1.0 - smoothstep(0.22, 0.32, navCycle));
      float navGreen = smoothstep(0.24, 0.34, navCycle) * (1.0 - smoothstep(0.86, 0.96, navCycle));
      float textureAlpha = textureColor.a;
      vec3 imageColor = textureColor.rgb;
      float imageBrightness = max(max(imageColor.r, imageColor.g), imageColor.b);
      float tintWeight = (1.0 - imageBrightness) * 0.45;
      vec3 flowImageColor = mix(imageColor, imageColor * color.rgb, tintWeight);
      vec3 flowColor = flowImageColor * flowEnabled + mix(color.rgb, secondaryColor.rgb, smoothstep(0.0, 1.0, uv.s)) * flowColorEnabled;
      vec3 threeColor = (color.rgb * centerCore + secondaryColor.rgb * sideCore) * max(centerCore, sideCore) * threeDashEnabled;
      vec3 crossColor = color.rgb * cross * crossEnabled;
      vec3 navColor = (secondaryColor.rgb * navWhite + color.rgb * navGreen) * navigationEnabled;
      vec3 mixed = flowColor + threeColor + crossColor + navColor;
      float flowColorAlpha = smoothstep(0.02, 0.18, fract(uv.s)) * (1.0 - smoothstep(0.58, 0.98, fract(uv.s)));
      float patternAlpha = max(max(textureAlpha * flowEnabled + flowColorAlpha * flowColorEnabled, max(centerCore, sideCore) * threeDashEnabled), max(cross * crossEnabled, max(navWhite, navGreen) * navigationEnabled));
      float backgroundAlpha = backgroundColor.a * dynamicEnabled * (1.0 - patternAlpha) * 0.58;
      material.diffuse = mix(backgroundColor.rgb, mixed, clamp(patternAlpha + 0.1, 0.0, 1.0));
      material.emission = mixed * (0.32 + patternAlpha * 0.84);
      material.alpha = clamp(backgroundAlpha + patternAlpha * color.a, 0.0, 1.0);
      return material;
    }
  `
}

export function buildSceneWeatherPostProcessSource(): string {
  return `
    uniform sampler2D colorTexture;
    uniform float weatherType;
    uniform float intensity;
    uniform float speed;
    uniform float windDirection;
    uniform vec4 color;
    in vec2 v_textureCoordinates;

    float geoWeatherHash(vec2 p)
    {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }

    float geoWeatherNoise(vec2 p)
    {
      vec2 i = floor(p);
      vec2 f = fract(p);
      float a = geoWeatherHash(i);
      float b = geoWeatherHash(i + vec2(1.0, 0.0));
      float c = geoWeatherHash(i + vec2(0.0, 1.0));
      float d = geoWeatherHash(i + vec2(1.0, 1.0));
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
    }

    void main()
    {
      vec4 sceneColor = texture(colorTexture, v_textureCoordinates);
      vec2 st = v_textureCoordinates;
      float time = czm_frameNumber * 0.016667 * speed;
      float angle = radians(windDirection);
      vec2 wind = vec2(cos(angle), sin(angle));
      float rainEnabled = 1.0 - step(1.5, weatherType);
      float snowEnabled = step(1.5, weatherType) * (1.0 - step(2.5, weatherType));
      float fogEnabled = step(2.5, weatherType) * (1.0 - step(3.5, weatherType));
      float lightningEnabled = step(3.5, weatherType);

      vec2 rainUv = st * vec2(36.0, 1.8) + wind * time * 1.65;
      float rainLine = smoothstep(0.965, 1.0, fract(rainUv.x + rainUv.y * 0.24));
      rainLine *= smoothstep(0.14, 1.0, geoWeatherHash(vec2(floor(rainUv.x), floor(rainUv.y * 8.0))));

      vec2 snowUv = st * 18.0 + vec2(wind.x * 0.28, -1.0) * time * 0.32;
      float snowCell = geoWeatherNoise(snowUv);
      float snowFlake = smoothstep(0.82, 1.0, snowCell) * (0.55 + 0.45 * geoWeatherNoise(snowUv * 0.47));

      float fogNoise = geoWeatherNoise(st * 4.0 + vec2(time * 0.04, time * 0.02));
      float fogGradient = smoothstep(0.02, 0.98, st.y);
      float fog = (0.45 + fogNoise * 0.55) * fogGradient;

      float flash = pow(max(sin(time * 2.7), 0.0), 18.0) * geoWeatherNoise(vec2(floor(time * 0.7), 7.3));
      float bolt = smoothstep(0.018, 0.0, abs(st.x - (0.28 + geoWeatherNoise(vec2(floor(time), 2.0)) * 0.46 + sin(st.y * 34.0) * 0.025)));
      bolt *= smoothstep(0.95, 0.35, st.y) * flash;

      vec3 weatherColor = color.rgb;
      vec3 rainColor = mix(sceneColor.rgb, weatherColor, rainLine * intensity * 0.48);
      vec3 snowColor = mix(sceneColor.rgb, weatherColor, snowFlake * intensity * 0.58);
      vec3 fogColor = mix(sceneColor.rgb, weatherColor, fog * intensity * 0.72);
      vec3 lightningColor = sceneColor.rgb + weatherColor * (bolt * 1.8 + flash * 0.18) * intensity;
      vec3 mixed = sceneColor.rgb;
      mixed = mix(mixed, rainColor, rainEnabled);
      mixed = mix(mixed, snowColor, snowEnabled);
      mixed = mix(mixed, fogColor, fogEnabled);
      mixed = mix(mixed, lightningColor, lightningEnabled);
      out_FragColor = vec4(mixed, sceneColor.a);
    }
  `
}

export function buildPostProcessSource(): string {
  return `
    uniform sampler2D colorTexture;
    uniform float effectType;
    uniform float strength;
    uniform float brightness;
    uniform float contrast;
    uniform float saturation;
    in vec2 v_textureCoordinates;

    void main()
    {
      vec4 sceneColor = texture(colorTexture, v_textureCoordinates);
      vec2 st = v_textureCoordinates;
      vec3 colorValue = sceneColor.rgb;
      float bloomEnabled = 1.0 - step(1.5, effectType);
      float nightEnabled = step(1.5, effectType) * (1.0 - step(2.5, effectType));
      float blackWhiteEnabled = step(2.5, effectType) * (1.0 - step(3.5, effectType));
      float brightnessEnabled = step(3.5, effectType) * (1.0 - step(4.5, effectType));
      float mosaicEnabled = step(4.5, effectType) * (1.0 - step(5.5, effectType));
      float depthEnabled = step(5.5, effectType);

      float luminance = dot(colorValue, vec3(0.299, 0.587, 0.114));
      vec3 bloomColor = colorValue + max(colorValue - vec3(0.62), vec3(0.0)) * strength * 1.35;
      vec3 nightColor = vec3(luminance * 0.18, luminance * 1.22, luminance * 0.34) * (0.72 + strength);
      vec3 grayColor = vec3(luminance);
      vec3 brightColor = (colorValue - 0.5) * contrast + 0.5;
      brightColor = mix(vec3(dot(brightColor, vec3(0.299, 0.587, 0.114))), brightColor, saturation) * brightness;

      vec2 mosaicUv = (floor(st * mix(96.0, 24.0, strength)) + 0.5) / mix(96.0, 24.0, strength);
      vec3 mosaicColor = texture(colorTexture, mosaicUv).rgb;
      float distanceFromFocus = distance(st, vec2(0.5));
      vec3 depthColor = mix(colorValue, texture(colorTexture, mix(st, vec2(0.5), 0.018 + strength * 0.04)).rgb, smoothstep(0.2, 0.72, distanceFromFocus));

      vec3 result = colorValue;
      result = mix(result, bloomColor, bloomEnabled);
      result = mix(result, nightColor, nightEnabled);
      result = mix(result, grayColor, blackWhiteEnabled * strength);
      result = mix(result, brightColor, brightnessEnabled);
      result = mix(result, mosaicColor, mosaicEnabled);
      result = mix(result, depthColor, depthEnabled);
      out_FragColor = vec4(result, sceneColor.a);
    }
  `
}

export function buildTemperatureFieldMaterialSource(): string {
  return `
    // ${GEO_TEMPERATURE_FIELD_MATERIAL_TYPE}
    float temperatureHash(vec2 p)
    {
      p = fract(p * vec2(123.34, 456.21));
      p += dot(p, p + 45.32);
      return fract(p.x * p.y);
    }

    float temperatureNoise(vec2 p)
    {
      vec2 i = floor(p);
      vec2 f = fract(p);
      float a = temperatureHash(i);
      float b = temperatureHash(i + vec2(1.0, 0.0));
      float c = temperatureHash(i + vec2(0.0, 1.0));
      float d = temperatureHash(i + vec2(1.0, 1.0));
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
    }

    vec3 temperatureRamp(float value)
    {
      vec3 c0 = lowColor.rgb;
      vec3 c1 = lowerColor.rgb;
      vec3 c2 = mediumColor.rgb;
      vec3 c3 = higherColor.rgb;
      vec3 c4 = highColor.rgb;
      vec3 first = mix(c0, c1, smoothstep(0.0, 0.25, value));
      vec3 second = mix(c1, c2, smoothstep(0.18, 0.5, value));
      vec3 third = mix(c2, c3, smoothstep(0.42, 0.72, value));
      vec3 fourth = mix(c3, c4, smoothstep(0.64, 1.0, value));
      return mix(mix(first, second, smoothstep(0.18, 0.38, value)), mix(third, fourth, smoothstep(0.58, 0.82, value)), smoothstep(0.42, 0.64, value));
    }

    float randomBlob(vec2 st, vec2 center, float radius)
    {
      vec2 offset = st - center;
      float distanceSquared = dot(offset, offset);
      return exp(-distanceSquared / max(0.0001, radius));
    }

    float randomField(vec2 st)
    {
      vec2 randomCenter0 = vec2(0.18 + temperatureHash(seedVector.xy + vec2(0.11, 0.31)) * 0.64, 0.14 + temperatureHash(seedVector.zw + vec2(0.29, 0.07)) * 0.7);
      vec2 randomCenter1 = vec2(0.18 + temperatureHash(seedVector.yz + vec2(0.43, 0.17)) * 0.64, 0.14 + temperatureHash(seedVector.wx + vec2(0.19, 0.53)) * 0.7);
      vec2 randomCenter2 = vec2(0.18 + temperatureHash(seedVector.zx + vec2(0.73, 0.23)) * 0.64, 0.14 + temperatureHash(seedVector.yw + vec2(0.61, 0.37)) * 0.7);
      vec2 randomCenter3 = vec2(0.18 + temperatureHash(seedVector.xw + vec2(0.13, 0.79)) * 0.64, 0.14 + temperatureHash(seedVector.zy + vec2(0.47, 0.41)) * 0.7);
      vec2 randomCenter4 = vec2(0.18 + temperatureHash(seedVector.yy + vec2(0.89, 0.67)) * 0.64, 0.14 + temperatureHash(seedVector.xx + vec2(0.31, 0.83)) * 0.7);
      vec2 randomCenter5 = vec2(0.18 + temperatureHash(seedVector.ww + vec2(0.57, 0.97)) * 0.64, 0.14 + temperatureHash(seedVector.zz + vec2(0.71, 0.59)) * 0.7);
      float value = 0.0;
      value += randomBlob(st, randomCenter0, 0.11 + temperatureHash(randomCenter0) * 0.1) * (0.55 + temperatureHash(randomCenter0.yx) * 0.45);
      value += randomBlob(st, randomCenter1, 0.08 + temperatureHash(randomCenter1) * 0.09) * (0.42 + temperatureHash(randomCenter1.yx) * 0.45);
      value += randomBlob(st, randomCenter2, 0.1 + temperatureHash(randomCenter2) * 0.08) * (0.38 + temperatureHash(randomCenter2.yx) * 0.4);
      value -= randomBlob(st, randomCenter3, 0.12 + temperatureHash(randomCenter3) * 0.08) * (0.22 + temperatureHash(randomCenter3.yx) * 0.28);
      value -= randomBlob(st, randomCenter4, 0.08 + temperatureHash(randomCenter4) * 0.08) * (0.18 + temperatureHash(randomCenter4.yx) * 0.2);
      value += randomBlob(st, randomCenter5, 0.07 + temperatureHash(randomCenter5) * 0.06) * (0.18 + temperatureHash(randomCenter5.yx) * 0.22);
      return value;
    }

    float sampleInfluence(vec2 st, vec4 samplePoint)
    {
      vec2 offset = st - samplePoint.xy;
      float distanceSquared = dot(offset, offset);
      float radius = 0.006 + samplePoint.w * 0.038;
      return exp(-distanceSquared / radius);
    }

    float sampleContribution(vec2 st, vec4 samplePoint, float index, inout float weight)
    {
      float enabled = step(index + 0.5, sampleCount);
      float influence = sampleInfluence(st, samplePoint) * enabled;
      weight += influence;
      return samplePoint.z * influence;
    }

    float sampleField(vec2 st)
    {
      float weight = 0.0;
      float value = 0.0;
      value += sampleContribution(st, sample0, 0.0, weight);
      value += sampleContribution(st, sample1, 1.0, weight);
      value += sampleContribution(st, sample2, 2.0, weight);
      value += sampleContribution(st, sample3, 3.0, weight);
      value += sampleContribution(st, sample4, 4.0, weight);
      value += sampleContribution(st, sample5, 5.0, weight);
      value += sampleContribution(st, sample6, 6.0, weight);
      value += sampleContribution(st, sample7, 7.0, weight);
      value += sampleContribution(st, sample8, 8.0, weight);
      value += sampleContribution(st, sample9, 9.0, weight);
      value += sampleContribution(st, sample10, 10.0, weight);
      value += sampleContribution(st, sample11, 11.0, weight);
      value += sampleContribution(st, sample12, 12.0, weight);
      value += sampleContribution(st, sample13, 13.0, weight);
      value += sampleContribution(st, sample14, 14.0, weight);
      value += sampleContribution(st, sample15, 15.0, weight);
      float base = 0.26 + randomField(st) * 0.12;
      return mix(base, value / max(weight, 0.0001), smoothstep(0.01, 0.22, weight));
    }

    float riskField(vec2 st)
    {
      float broadNoise = temperatureNoise(st * 3.0 + seedVector.zw * 5.0);
      float detailNoise = temperatureNoise(st * 9.0 + seedVector.wx * 7.0);
      float hotSpot0 = exp(-dot(st - hotSpot0Center, st - hotSpot0Center) / max(0.0001, hotSpot0Radius));
      float hotSpot1 = exp(-dot(st - hotSpot1Center, st - hotSpot1Center) / max(0.0001, hotSpot1Radius));
      float coldSpot0 = exp(-dot(st - coldSpot0Center, st - coldSpot0Center) / max(0.0001, coldSpot0Radius));
      float randomTemperature = 0.28 + randomField(st) * 0.56 + (broadNoise - 0.5) * 0.34 * noiseStrength + (detailNoise - 0.5) * 0.14 * noiseStrength;
      randomTemperature += hotSpot0 * hotSpot0Strength + hotSpot1 * hotSpot1Strength;
      randomTemperature -= coldSpot0 * coldSpot0Strength;
      float sampleTexture = (broadNoise - 0.5) * 0.08 * noiseStrength + (detailNoise - 0.5) * 0.04 * noiseStrength;
      float sampleTemperature = sampleField(st) + sampleTexture;
      float hasSamples = step(0.5, sampleCount);
      float value = mix(randomTemperature, sampleTemperature, hasSamples);
      return clamp(value, 0.0, 1.0);
    }

    czm_material czm_getMaterial(czm_materialInput materialInput)
    {
      czm_material material = czm_getDefaultMaterial(materialInput);
      vec2 st = materialInput.st;
      float value = riskField(st);
      vec3 ramp = temperatureRamp(value);
      float contour = smoothstep(0.03, 0.0, abs(fract(value * 8.0) - 0.5)) * contourStrength * contourLines;
      float edgeFade = smoothstep(0.0, 0.035, st.x) * smoothstep(0.0, 0.035, st.y) * smoothstep(0.0, 0.035, 1.0 - st.x) * smoothstep(0.0, 0.035, 1.0 - st.y);
      vec3 veil = mix(ramp, vec3(1.0, 0.96, 0.72), 0.08);
      material.diffuse = veil * (0.82 + contour * 0.18);
      material.emission = ramp * (0.12 + value * 0.16) + vec3(1.0, 0.88, 0.45) * contour * 0.12;
      material.alpha = opacity * edgeFade * (0.52 + value * 0.24 + contour * 0.14);
      return material;
    }
  `
}

export function buildWaterSurfaceMaterialSource(): string {
  return `
    // ${GEO_WATER_SURFACE_MATERIAL_TYPE}
    float waterHash(vec2 p)
    {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }

    float waterNoise(vec2 p)
    {
      vec2 i = floor(p);
      vec2 f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      float a = waterHash(i);
      float b = waterHash(i + vec2(1.0, 0.0));
      float c = waterHash(i + vec2(0.0, 1.0));
      float d = waterHash(i + vec2(1.0, 1.0));
      return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
    }

    float waterHeight(vec2 uv, vec2 flow, float time)
    {
      vec2 crossFlow = vec2(-flow.y, flow.x);
      float layerA = sin(dot(uv + flow * time * 0.055, flow) * 62.0 + time * 1.7);
      float layerB = sin(dot(uv - crossFlow * time * 0.04, crossFlow) * 84.0 - time * 1.15);
      float layerC = waterNoise(uv * 18.0 + flow * time * 1.4) * 2.0 - 1.0;
      return layerA * 0.42 + layerB * 0.34 + layerC * 0.24;
    }

    vec3 getProceduralWaterNormal(vec2 uv, vec2 flow, float time, float strength)
    {
      float sampleStep = 0.006;
      float center = waterHeight(uv, flow, time);
      float dx = waterHeight(uv + vec2(sampleStep, 0.0), flow, time) - center;
      float dy = waterHeight(uv + vec2(0.0, sampleStep), flow, time) - center;
      return normalize(vec3(-dx * strength, -dy * strength, 1.0));
    }

    czm_material czm_getMaterial(czm_materialInput materialInput)
    {
      czm_material material = czm_getDefaultMaterial(materialInput);
      vec2 st = materialInput.st;
      float time = czm_frameNumber * 0.016667 * speed;
      float direction = radians(flowDirection);
      vec2 flow = vec2(cos(direction), sin(direction));
      vec2 crossFlow = vec2(-flow.y, flow.x);
      vec2 distortion = (flow * sin(dot(st, crossFlow) * 18.0 + time * 0.8) + crossFlow * sin(dot(st, flow) * 22.0 - time * 0.65)) * distortionScale * 0.00085;
      vec2 moving = st + flow * time * 0.06 + distortion;
      vec3 surfaceNormal = getProceduralWaterNormal(moving * (1.0 + waveStrength * 1.8), flow, time, mix(8.0, 28.0, waveStrength));
      float waveA = waterHeight(moving * 1.8, flow, time) * 0.5 + 0.5;
      float waveB = waterHeight(moving.yx * 2.2 + vec2(0.17, 0.31), crossFlow, time * 0.82) * 0.5 + 0.5;
      float smallWave = clamp(dot(surfaceNormal.xy, vec2(0.72, -0.48)) * 0.5 + 0.5, 0.0, 1.0);
      float riverEnabled = 1.0 - step(1.5, waterType);
      float lakeEnabled = step(1.5, waterType) * (1.0 - step(2.5, waterType));
      float floodEnabled = step(2.5, waterType);
      float riverFlow = smoothstep(0.38, 1.0, waterNoise(moving * 9.0 + flow * time * 0.55)) * waveA;
      float lakeShimmer = pow(waveA * waveB, 2.0);
      float floodPulse = smoothstep(0.08, 0.0, abs(fract(distance(st, vec2(0.5)) * 4.0 - time * 0.45) - 0.5));
      float riverWave = mix(waveA, max(riverFlow, waveB * 0.72), 0.45);
      float wave = mix(waveA, max(riverWave, lakeShimmer), waveStrength);
      wave = max(wave, floodPulse * floodEnabled);
      // flow mirrors the yunzhou-onemap WaterPrimitive water surface style without changing river/lake/flood.
      float flowEnabled = step(3.5, waterType);
      float yunzhouFlow = smoothstep(0.46, 1.0, waterNoise(moving * 18.0 + flow * time * 2.2)) * (0.52 + waveA * 0.48);
      float flowWash = smoothstep(0.42, 1.0, waterNoise(moving * 7.0 + crossFlow * time * 0.28));
      float flowHighlight = max(yunzhouFlow, flowWash * waveB * 0.74);
      float flowWave = mix(waveA, flowHighlight, 0.62);
      wave = mix(wave, flowWave, flowEnabled);
      vec3 viewDirection = normalize(materialInput.positionToEyeEC);
      float viewFacing = clamp(1.0 - abs(dot(normalize(materialInput.normalEC), -viewDirection)), 0.0, 1.0);
      float fresnel = pow(viewFacing, fresnelPower) * reflectivity;
      float reflection = (0.18 + smallWave * 0.82) * reflectionStrength;
      vec3 riverTint = mix(color.rgb, vec3(0.18, 0.72, 1.0), 0.24);
      vec3 lakeTint = mix(color.rgb, vec3(0.36, 0.92, 0.86), 0.22);
      vec3 floodTint = mix(color.rgb, vec3(0.42, 0.68, 1.0), 0.36);
      vec3 waterColor = riverTint * riverEnabled + lakeTint * lakeEnabled + floodTint * floodEnabled;
      vec3 flowTint = mix(color.rgb, vec3(0.0, 0.47, 0.50), 0.18);
      waterColor = mix(waterColor, flowTint, flowEnabled);
      vec3 deepColor = mix(waterColor, vec3(0.015, 0.11, 0.18), 0.46);
      deepColor = mix(deepColor, mix(flowTint, vec3(0.015, 0.11, 0.18), 0.54), flowEnabled);
      vec3 refractionColor = mix(deepColor, waterColor, 0.42 + wave * 0.34);
      refractionColor += vec3(0.02, 0.12, 0.16) * refractionStrength * (0.5 + waveB * 0.5);
      vec3 skyReflection = mix(vec3(0.58, 0.86, 1.0), vec3(1.0), pow(smallWave, 5.0));
      vec3 reflectionColor = skyReflection * (0.32 + reflection * 0.78);
      vec3 finalColor = mix(refractionColor, reflectionColor, clamp(fresnel + reflection * 0.24, 0.0, 1.0));
      float foam = smoothstep(0.68, 1.0, wave) * smoothstep(0.38, 1.0, waveStrength);
      finalColor = mix(finalColor, vec3(0.82, 0.98, 1.0), foam * 0.18);
      material.normal = surfaceNormal;
      material.diffuse = finalColor * (0.56 + wave * 0.18);
      material.emission = reflectionColor * (0.14 + fresnel * 0.42) + waterColor * ((riverFlow * 0.08 + waveB * 0.06) * riverEnabled + floodPulse * floodEnabled * 0.22);
      material.emission = mix(material.emission, reflectionColor * (0.14 + fresnel * 0.42) + waterColor * (flowHighlight * 0.11), flowEnabled);
      material.alpha = opacity * (0.62 + wave * 0.12 + fresnel * 0.2 + refractionStrength * 0.06);
      return material;
    }
  `
}

export function buildLightWallMaterialSource(): string {
  return `
    // ${GEO_LIGHT_WALL_MATERIAL_TYPE}
    czm_material czm_getMaterial(czm_materialInput materialInput)
    {
      czm_material material = czm_getDefaultMaterial(materialInput);
      vec2 st = materialInput.st;
      float time = fract((czm_frameNumber * 0.016667 * speed));
      float verticalFade = smoothstep(0.0, 0.12, st.t) * (1.0 - smoothstep(0.88, 1.0, st.t));
      float flowLine = smoothstep(0.035, 0.0, abs(fract(st.t * 3.0 - time) - 0.5));
      float scanLine = smoothstep(0.018, 0.0, abs(fract(st.t * scanLineCount - time * 1.8) - 0.5));
      float breath = mix(1.0, 0.58 + 0.42 * sin(time * 6.28318530718), breathing);
      float verticalStripe = smoothstep(0.012, 0.0, abs(fract(st.s * 18.0 + time * 0.6) - 0.5));
      float spark = smoothstep(0.02, 0.0, abs(fract((st.s + st.t) * 12.0 - time * 2.2) - 0.5));
      float securityEnabled = 1.0 - step(1.5, wallType);
      float warningEnabled = step(1.5, wallType) * (1.0 - step(2.5, wallType));
      float dataEnabled = step(2.5, wallType) * (1.0 - step(3.5, wallType));
      float fenceEnabled = step(3.5, wallType) * (1.0 - step(4.5, wallType));
      float pulseEnabled = step(4.5, wallType);
      float securityWall = flowLine * 0.72 + scanLine * 0.42;
      float warningWall = max(scanLine * 0.95, step(0.5, fract(st.s * 10.0 + st.t * 4.0 - time)) * 0.12);
      float dataWall = verticalStripe * 0.55 + spark * 0.75 + scanLine * 0.24;
      float fenceWall = max(verticalStripe, smoothstep(0.01, 0.0, abs(fract(st.t * 8.0) - 0.5))) * 0.54;
      float pulseWall = flowLine * 1.05 + smoothstep(0.2, 0.0, abs(st.t - time)) * 0.82;
      float style = securityWall * securityEnabled + warningWall * warningEnabled + dataWall * dataEnabled + fenceWall * fenceEnabled + pulseWall * pulseEnabled;
      vec3 warningTint = mix(color.rgb, vec3(1.0, 0.48, 0.1), 0.44);
      vec3 dataTint = mix(color.rgb, vec3(0.36, 0.74, 1.0), 0.38);
      vec3 fenceTint = mix(color.rgb, vec3(0.74, 1.0, 0.42), 0.3);
      vec3 pulseTint = mix(color.rgb, vec3(1.0, 0.18, 0.72), 0.42);
      vec3 styleColor = color.rgb * securityEnabled + warningTint * warningEnabled + dataTint * dataEnabled + fenceTint * fenceEnabled + pulseTint * pulseEnabled;
      float rim = smoothstep(0.025, 0.0, min(st.t, 1.0 - st.t));
      material.diffuse = styleColor * (0.16 + verticalFade * 0.18 + style * 0.24);
      material.emission = styleColor * (style * (0.9 + pulseEnabled * 0.45) + rim * 0.48) * breath;
      material.alpha = opacity * (0.12 * verticalFade + style * 0.62 + rim * 0.42) * breath;
      return material;
    }
  `
}

export function buildScanConeMaterialSource(): string {
  return `
    // ${GEO_SCAN_CONE_MATERIAL_TYPE}
    czm_material czm_getMaterial(czm_materialInput materialInput)
    {
      czm_material material = czm_getDefaultMaterial(materialInput);
      vec2 st = materialInput.st;
      vec2 centered = st - vec2(0.5);
      float radius = length(centered) * 2.0;
      float angle = atan(centered.y, centered.x) / 6.28318530718 + 0.5;
      float scanTimeSeconds = max(timeSeconds, czm_frameNumber * 0.016667);
      float time = fract(scanTimeSeconds * speed);
      float verticalFade = smoothstep(0.0, 0.12, st.t) * (1.0 - smoothstep(0.92, 1.0, st.t));
      float sweepBand = smoothstep(0.08, 0.0, abs(fract(angle - time) - 0.5));
      float radialGrid = smoothstep(0.012, 0.0, abs(fract(radius * 7.0 - time * 2.0) - 0.5));
      float verticalGrid = smoothstep(0.01, 0.0, abs(fract(st.t * 9.0 + time) - 0.5));
      float searchlightEnabled = 1.0 - step(1.5, coneType);
      float radarEnabled = step(1.5, coneType) * (1.0 - step(2.5, coneType));
      float cameraEnabled = step(2.5, coneType) * (1.0 - step(3.5, coneType));
      float droneEnabled = step(3.5, coneType) * (1.0 - step(4.5, coneType));
      float alarmEnabled = step(4.5, coneType);
      float searchlightCone = smoothstep(0.82, 0.0, radius) * (0.32 + sweepBand * 0.8);
      float radarCone = radialGrid * 0.55 + sweepBand * 0.82 + verticalGrid * 0.2;
      float cameraCone = smoothstep(0.025, 0.0, abs(centered.x)) * 0.42 + sweepBand * 0.62;
      float droneCone = (radialGrid + verticalGrid) * 0.35 + smoothstep(0.05, 0.0, abs(radius - 0.72)) * 0.7;
      float alarmCone = max(sweepBand, smoothstep(0.018, 0.0, abs(fract(angle * 12.0 + time * 4.0) - 0.5))) * 0.95;
      float style = searchlightCone * searchlightEnabled + radarCone * radarEnabled + cameraCone * cameraEnabled + droneCone * droneEnabled + alarmCone * alarmEnabled;
      vec3 radarTint = mix(color.rgb, vec3(0.35, 1.0, 0.46), 0.32);
      vec3 cameraTint = mix(color.rgb, vec3(0.42, 0.68, 1.0), 0.3);
      vec3 droneTint = mix(color.rgb, vec3(0.8, 0.55, 1.0), 0.36);
      vec3 alarmTint = mix(color.rgb, vec3(1.0, 0.12, 0.26), 0.46);
      vec3 styleColor = color.rgb * searchlightEnabled + radarTint * radarEnabled + cameraTint * cameraEnabled + droneTint * droneEnabled + alarmTint * alarmEnabled;
      float edge = smoothstep(0.05, 0.0, abs(radius - 1.0));
      material.diffuse = styleColor * (0.12 + style * 0.2);
      material.emission = styleColor * (style * 1.15 + edge * 0.54) * verticalFade;
      material.alpha = opacity * verticalFade * (0.08 + style * 0.62 + edge * 0.36);
      return material;
    }
  `
}

export function buildShieldDomeMaterialSource(): string {
  return `
    // ${GEO_SHIELD_DOME_MATERIAL_TYPE}
    czm_material czm_getMaterial(czm_materialInput materialInput)
    {
      czm_material material = czm_getDefaultMaterial(materialInput);
      vec2 st = materialInput.st;
      float time = fract((czm_frameNumber * 0.016667 * speed));
      float lat = st.t;
      float lon = st.s;
      float domeFade = smoothstep(0.02, 0.16, lat) * (1.0 - smoothstep(0.92, 1.0, lat));
      float gridLine = max(
        smoothstep(0.012, 0.0, abs(fract(lon * gridDensity + lat * 0.5) - 0.5)),
        smoothstep(0.012, 0.0, abs(fract(lat * gridDensity * 0.55) - 0.5))
      );
      float scanLine = smoothstep(0.035, 0.0, abs(fract(lat * 1.2 - time) - 0.5));
      float energyPulse = smoothstep(0.08, 0.0, abs(fract(distance(st, vec2(0.5, 0.0)) * 2.0 - time * 1.6) - 0.5)) * pulseStrength;
      float hexEnabled = 1.0 - step(1.5, domeType);
      float plasmaEnabled = step(1.5, domeType) * (1.0 - step(2.5, domeType));
      float matrixEnabled = step(2.5, domeType) * (1.0 - step(3.5, domeType));
      float aegisEnabled = step(3.5, domeType) * (1.0 - step(4.5, domeType));
      float stormEnabled = step(4.5, domeType);
      float hexDome = gridLine * 0.7 + scanLine * 0.48;
      float plasmaDome = energyPulse * 1.05 + sin((lon * 36.0 + lat * 18.0 + time * 8.0)) * 0.08;
      float matrixDome = gridLine * 0.42 + smoothstep(0.018, 0.0, abs(fract(lon * 28.0 - time * 3.0) - 0.5)) * 0.78;
      float aegisDome = max(gridLine * 0.52, scanLine * 0.72) + smoothstep(0.03, 0.0, abs(lat - 0.08)) * 0.54;
      float stormDome = energyPulse * 0.82 + smoothstep(0.02, 0.0, abs(fract((lon + lat) * 18.0 + time * 5.0) - 0.5)) * 0.82;
      float style = hexDome * hexEnabled + plasmaDome * plasmaEnabled + matrixDome * matrixEnabled + aegisDome * aegisEnabled + stormDome * stormEnabled;
      vec3 plasmaTint = mix(color.rgb, vec3(1.0, 0.28, 0.86), 0.4);
      vec3 matrixTint = mix(color.rgb, vec3(0.62, 1.0, 0.24), 0.42);
      vec3 aegisTint = mix(color.rgb, vec3(0.46, 0.78, 1.0), 0.28);
      vec3 stormTint = mix(color.rgb, vec3(0.82, 0.55, 1.0), 0.38);
      vec3 styleColor = color.rgb * hexEnabled + plasmaTint * plasmaEnabled + matrixTint * matrixEnabled + aegisTint * aegisEnabled + stormTint * stormEnabled;
      float rim = smoothstep(0.06, 0.0, lat) + smoothstep(0.035, 0.0, abs(lat - 0.96));
      material.diffuse = styleColor * (0.14 + style * 0.18);
      material.emission = styleColor * (style * 1.05 + rim * 0.62 + energyPulse * 0.48) * domeFade;
      material.alpha = opacity * domeFade * (0.09 + style * 0.55 + rim * 0.36 + energyPulse * 0.22);
      return material;
    }
  `
}

export class RadarScanEffect implements RadarScanEffectInstance {
  private readonly viewer: Viewer
  private readonly dataSource: CustomDataSource
  private options: NormalizedRadarScanOptions
  private primitive: GroundPrimitive | Primitive | null = null
  private centerEntity: Entity | null = null
  private renderFrame = 0
  private destroyed = false

  constructor(viewer: Viewer, options: RadarScanOptions) {
    this.viewer = viewer
    this.options = normalizeRadarScanOptions(options)
    this.dataSource = new CustomDataSource('geo-effect-kit-radar-scan')
    this.viewer.dataSources.add(this.dataSource)
    this.renderPrimitive()
    this.syncCenterEntity()
    this.startRenderLoop()
    this.viewer.scene.requestRender()
  }

  update(options: Partial<RadarScanOptions>): void {
    if (this.destroyed) return

    const next = normalizeRadarScanOptions({
      ...this.options,
      ...options,
      center: options.center ?? this.options.center,
      radiusMeters: options.radiusMeters ?? this.options.radiusMeters,
    })
    const rebuildPrimitive = shouldRebuildRadarScan(this.options, next)
    this.options = next

    if (rebuildPrimitive) {
      this.renderPrimitive()
    } else {
      this.applyPrimitiveOptions()
    }

    this.syncCenterEntity()
    if (this.options.visible) this.startRenderLoop()
    this.viewer.scene.requestRender()
  }

  show(): void {
    if (this.destroyed) return
    this.options = { ...this.options, visible: true }
    this.applyPrimitiveOptions()
    if (this.centerEntity) this.centerEntity.show = this.options.showCenter
    this.startRenderLoop()
    this.viewer.scene.requestRender()
  }

  hide(): void {
    if (this.destroyed) return
    this.options = { ...this.options, visible: false }
    this.applyPrimitiveOptions()
    if (this.centerEntity) this.centerEntity.show = false
    this.stopRenderLoop()
    this.viewer.scene.requestRender()
  }

  flyTo(options: RadarScanFlyToOptions = {}): void {
    if (this.destroyed) return

    const center = this.getCenterCartesian()
    const sphere = new BoundingSphere(center, this.options.radiusMeters)
    this.viewer.camera.flyToBoundingSphere(sphere, {
      duration: options.duration ?? 1,
      offset: new HeadingPitchRange(0, options.pitch ?? -0.72, this.options.radiusMeters * (options.rangeMultiplier ?? 2.25)),
    })
  }

  destroy(): void {
    if (this.destroyed) return

    this.destroyed = true
    this.stopRenderLoop()
    this.removePrimitive()
    if (this.centerEntity) {
      this.dataSource.entities.remove(this.centerEntity)
      this.centerEntity = null
    }
    this.dataSource.entities.removeAll()
    this.viewer.dataSources.remove(this.dataSource, true)
    this.viewer.scene.requestRender()
  }

  isVisible(): boolean {
    return this.options.visible
  }

  isDestroyed(): boolean {
    return this.destroyed
  }

  getOptions(): NormalizedRadarScanOptions {
    return {
      ...this.options,
      center: { ...this.options.center },
    }
  }

  private renderPrimitive(): void {
    this.removePrimitive()
    registerRadarScanMaterial(this.options)

    const instance = new GeometryInstance({
      geometry: new CircleGeometry({
        center: this.getCenterCartesian(),
        radius: this.options.radiusMeters,
        vertexFormat: EllipsoidSurfaceAppearance.VERTEX_FORMAT,
      }),
    })

    this.primitive = this.viewer.scene.primitives.add(
      new GroundPrimitive({
        geometryInstances: instance,
        appearance: new EllipsoidSurfaceAppearance({
          material: createRadarScanMaterial(this.options),
        }),
        show: this.options.visible,
      }),
    ) as GroundPrimitive
  }

  private removePrimitive(): void {
    if (!this.primitive) return

    this.viewer.scene.primitives.remove(this.primitive)
    this.primitive = null
  }

  private applyPrimitiveOptions(): void {
    if (this.primitive) {
      this.primitive.show = this.options.visible
      this.applyMaterialOptions()
    }
  }

  private applyMaterialOptions(): void {
    const material = this.primitive?.appearance?.material
    if (!material) return

    material.uniforms.color = Color.fromCssColorString(this.options.color).withAlpha(1)
    material.uniforms.opacity = this.options.opacity
    material.uniforms.ringsEnabled = this.options.rings ? 1 : 0
    material.uniforms.radarType = getRadarScanTypeUniform(this.options.type)
    material.uniforms.scanDurationMs = this.options.scanDurationMs
  }

  private syncCenterEntity(): void {
    if (!this.options.showCenter) {
      if (this.centerEntity) {
        this.dataSource.entities.remove(this.centerEntity)
        this.centerEntity = null
      }
      return
    }

    const position = this.getCenterCartesian()
    const color = Color.fromCssColorString(this.options.color)
    if (!this.centerEntity) {
      this.centerEntity = this.dataSource.entities.add({
        id: 'geo-effect-kit-radar-scan-center',
        position,
        show: this.options.visible,
        point: new PointGraphics({
          pixelSize: 12,
          color: new ConstantProperty(color),
          outlineColor: new ConstantProperty(Color.WHITE.withAlpha(0.72)),
          outlineWidth: 2,
          heightReference: HeightReference.CLAMP_TO_GROUND,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        }),
      })
      return
    }

    this.centerEntity.position = new ConstantPositionProperty(position)
    this.centerEntity.show = this.options.visible
    if (this.centerEntity.point) {
      this.centerEntity.point.color = new ConstantProperty(color)
    }
  }

  private startRenderLoop(): void {
    if (this.renderFrame || !this.options.visible || typeof window === 'undefined') return

    const tick = () => {
      if (this.destroyed || !this.primitive || !this.options.visible) {
        this.renderFrame = 0
        return
      }
      this.viewer.scene.requestRender()
      this.renderFrame = window.requestAnimationFrame(tick)
    }

    this.renderFrame = window.requestAnimationFrame(tick)
  }

  private stopRenderLoop(): void {
    if (!this.renderFrame || typeof window === 'undefined') {
      this.renderFrame = 0
      return
    }

    window.cancelAnimationFrame(this.renderFrame)
    this.renderFrame = 0
  }

  private getCenterCartesian(): Cartesian3 {
    return Cartesian3.fromDegrees(this.options.center.longitude, this.options.center.latitude)
  }
}

export class RippleSpreadEffect implements RippleSpreadEffectInstance {
  private readonly viewer: Viewer
  private readonly dataSource: CustomDataSource
  private options: NormalizedRippleSpreadOptions
  private primitive: GroundPrimitive | Primitive | null = null
  private centerEntity: Entity | null = null
  private renderFrame = 0
  private destroyed = false

  constructor(viewer: Viewer, options: RippleSpreadOptions) {
    this.viewer = viewer
    this.options = normalizeRippleSpreadOptions(options)
    this.dataSource = new CustomDataSource('geo-effect-kit-ripple-spread')
    this.viewer.dataSources.add(this.dataSource)
    this.renderPrimitive()
    this.syncCenterEntity()
    this.startRenderLoop()
    this.viewer.scene.requestRender()
  }

  update(options: Partial<RippleSpreadOptions>): void {
    if (this.destroyed) return

    const next = normalizeRippleSpreadOptions({
      ...this.options,
      ...options,
      center: options.center ?? this.options.center,
      radiusMeters: options.radiusMeters ?? this.options.radiusMeters,
    })
    const rebuildPrimitive = shouldRebuildRippleSpread(this.options, next)
    this.options = next

    if (rebuildPrimitive) {
      this.renderPrimitive()
    } else {
      this.applyPrimitiveOptions()
    }

    this.syncCenterEntity()
    if (this.options.visible) this.startRenderLoop()
    this.viewer.scene.requestRender()
  }

  show(): void {
    if (this.destroyed) return
    this.options = { ...this.options, visible: true }
    this.applyPrimitiveOptions()
    if (this.centerEntity) this.centerEntity.show = this.options.showCenter
    this.startRenderLoop()
    this.viewer.scene.requestRender()
  }

  hide(): void {
    if (this.destroyed) return
    this.options = { ...this.options, visible: false }
    this.applyPrimitiveOptions()
    if (this.centerEntity) this.centerEntity.show = false
    this.stopRenderLoop()
    this.viewer.scene.requestRender()
  }

  flyTo(options: RippleSpreadFlyToOptions = {}): void {
    if (this.destroyed) return

    const center = this.getCenterCartesian()
    const sphere = new BoundingSphere(center, this.options.radiusMeters)
    this.viewer.camera.flyToBoundingSphere(sphere, {
      duration: options.duration ?? 1,
      offset: new HeadingPitchRange(0, options.pitch ?? -0.72, this.options.radiusMeters * (options.rangeMultiplier ?? 2.25)),
    })
  }

  destroy(): void {
    if (this.destroyed) return

    this.destroyed = true
    this.stopRenderLoop()
    this.removePrimitive()
    if (this.centerEntity) {
      this.dataSource.entities.remove(this.centerEntity)
      this.centerEntity = null
    }
    this.dataSource.entities.removeAll()
    this.viewer.dataSources.remove(this.dataSource, true)
    this.viewer.scene.requestRender()
  }

  isVisible(): boolean {
    return this.options.visible
  }

  isDestroyed(): boolean {
    return this.destroyed
  }

  getOptions(): NormalizedRippleSpreadOptions {
    return {
      ...this.options,
      center: { ...this.options.center },
    }
  }

  private renderPrimitive(): void {
    this.removePrimitive()
    registerRippleSpreadMaterial(this.options)

    const instance = new GeometryInstance({
      geometry: new CircleGeometry({
        center: this.getCenterCartesian(),
        radius: this.options.radiusMeters,
        vertexFormat: EllipsoidSurfaceAppearance.VERTEX_FORMAT,
      }),
    })

    this.primitive = this.viewer.scene.primitives.add(
      new GroundPrimitive({
        geometryInstances: instance,
        appearance: new EllipsoidSurfaceAppearance({
          material: createRippleSpreadMaterial(this.options),
        }),
        show: this.options.visible,
      }),
    ) as GroundPrimitive
  }

  private removePrimitive(): void {
    if (!this.primitive) return

    this.viewer.scene.primitives.remove(this.primitive)
    this.primitive = null
  }

  private applyPrimitiveOptions(): void {
    if (this.primitive) {
      this.primitive.show = this.options.visible
      this.applyMaterialOptions()
    }
  }

  private applyMaterialOptions(): void {
    const material = this.primitive?.appearance?.material
    if (!material) return

    material.uniforms.color = Color.fromCssColorString(this.options.color).withAlpha(1)
    material.uniforms.opacity = this.options.opacity
    material.uniforms.rippleType = getRippleSpreadTypeUniform(this.options.type)
    material.uniforms.ringCount = this.options.ringCount
    material.uniforms.durationMs = this.options.durationMs
  }

  private syncCenterEntity(): void {
    if (!this.options.showCenter) {
      if (this.centerEntity) {
        this.dataSource.entities.remove(this.centerEntity)
        this.centerEntity = null
      }
      return
    }

    const position = this.getCenterCartesian()
    const color = Color.fromCssColorString(this.options.color)
    if (!this.centerEntity) {
      this.centerEntity = this.dataSource.entities.add({
        id: 'geo-effect-kit-ripple-spread-center',
        position,
        show: this.options.visible,
        point: new PointGraphics({
          pixelSize: 12,
          color: new ConstantProperty(color),
          outlineColor: new ConstantProperty(Color.WHITE.withAlpha(0.72)),
          outlineWidth: 2,
          heightReference: HeightReference.CLAMP_TO_GROUND,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        }),
      })
      return
    }

    this.centerEntity.position = new ConstantPositionProperty(position)
    this.centerEntity.show = this.options.visible
    if (this.centerEntity.point) {
      this.centerEntity.point.color = new ConstantProperty(color)
    }
  }

  private startRenderLoop(): void {
    if (this.renderFrame || !this.options.visible || typeof window === 'undefined') return

    const tick = () => {
      if (this.destroyed || !this.primitive || !this.options.visible) {
        this.renderFrame = 0
        return
      }
      this.viewer.scene.requestRender()
      this.renderFrame = window.requestAnimationFrame(tick)
    }

    this.renderFrame = window.requestAnimationFrame(tick)
  }

  private stopRenderLoop(): void {
    if (!this.renderFrame || typeof window === 'undefined') {
      this.renderFrame = 0
      return
    }

    window.cancelAnimationFrame(this.renderFrame)
    this.renderFrame = 0
  }

  private getCenterCartesian(): Cartesian3 {
    return Cartesian3.fromDegrees(this.options.center.longitude, this.options.center.latitude)
  }
}

export class SceneWeatherEffect implements SceneWeatherEffectInstance {
  private readonly viewer: Viewer
  private options: NormalizedSceneWeatherOptions
  private stage: PostProcessStage | null = null
  private renderFrame = 0
  private destroyed = false

  constructor(viewer: Viewer, options: SceneWeatherOptions = {}) {
    this.viewer = viewer
    this.options = normalizeSceneWeatherOptions(options)
    this.renderStage()
    this.startRenderLoop()
    this.viewer.scene.requestRender()
  }

  update(options: Partial<SceneWeatherOptions>): void {
    if (this.destroyed) return

    this.options = normalizeSceneWeatherOptions({
      ...this.options,
      ...options,
      visible: options.visible ?? this.options.visible,
    })
    this.applyStageOptions()
    if (this.options.visible) this.startRenderLoop()
    else this.stopRenderLoop()
    this.viewer.scene.requestRender()
  }

  show(): void {
    if (this.destroyed) return
    this.options = { ...this.options, visible: true }
    this.applyStageOptions()
    this.startRenderLoop()
    this.viewer.scene.requestRender()
  }

  hide(): void {
    if (this.destroyed) return
    this.options = { ...this.options, visible: false }
    this.applyStageOptions()
    this.stopRenderLoop()
    this.viewer.scene.requestRender()
  }

  flyTo(): void {
    if (this.destroyed) return
    this.viewer.scene.requestRender()
  }

  destroy(): void {
    if (this.destroyed) return

    this.destroyed = true
    this.stopRenderLoop()
    if (this.stage) {
      this.viewer.scene.postProcessStages.remove(this.stage)
      this.stage = null
    }
    this.viewer.scene.requestRender()
  }

  isVisible(): boolean {
    return this.options.visible
  }

  isDestroyed(): boolean {
    return this.destroyed
  }

  getOptions(): NormalizedSceneWeatherOptions {
    return { ...this.options }
  }

  private renderStage(): void {
    this.stage = this.viewer.scene.postProcessStages.add(
      new PostProcessStage({
        name: 'geo-effect-kit-scene-weather',
        fragmentShader: buildSceneWeatherPostProcessSource(),
        uniforms: createSceneWeatherUniforms(this.options),
      }),
    ) as PostProcessStage
    this.applyStageOptions()
  }

  private applyStageOptions(): void {
    if (!this.stage) return

    this.stage.enabled = this.options.visible
    Object.assign(this.stage.uniforms, createSceneWeatherUniforms(this.options))
  }

  private startRenderLoop(): void {
    if (this.renderFrame || !this.options.visible || typeof window === 'undefined') return

    const tick = () => {
      if (this.destroyed || !this.options.visible) {
        this.renderFrame = 0
        return
      }
      this.viewer.scene.requestRender()
      this.renderFrame = window.requestAnimationFrame(tick)
    }

    this.renderFrame = window.requestAnimationFrame(tick)
  }

  private stopRenderLoop(): void {
    if (!this.renderFrame || typeof window === 'undefined') {
      this.renderFrame = 0
      return
    }

    window.cancelAnimationFrame(this.renderFrame)
    this.renderFrame = 0
  }
}

export class PostProcessEffect implements PostProcessEffectInstance {
  private readonly viewer: Viewer
  private options: NormalizedPostProcessOptions
  private stage: PostProcessStage | null = null
  private destroyed = false

  constructor(viewer: Viewer, options: PostProcessOptions = {}) {
    this.viewer = viewer
    this.options = normalizePostProcessOptions(options)
    this.renderStage()
    this.viewer.scene.requestRender()
  }

  update(options: Partial<PostProcessOptions>): void {
    if (this.destroyed) return

    this.options = normalizePostProcessOptions({
      ...this.options,
      ...options,
      visible: options.visible ?? this.options.visible,
    })
    this.applyStageOptions()
    this.viewer.scene.requestRender()
  }

  show(): void {
    if (this.destroyed) return
    this.options = { ...this.options, visible: true }
    this.applyStageOptions()
    this.viewer.scene.requestRender()
  }

  hide(): void {
    if (this.destroyed) return
    this.options = { ...this.options, visible: false }
    this.applyStageOptions()
    this.viewer.scene.requestRender()
  }

  flyTo(): void {
    if (this.destroyed) return
    this.viewer.scene.requestRender()
  }

  destroy(): void {
    if (this.destroyed) return

    this.destroyed = true
    if (this.stage) {
      this.viewer.scene.postProcessStages.remove(this.stage)
      this.stage = null
    }
    this.viewer.scene.requestRender()
  }

  isVisible(): boolean {
    return this.options.visible
  }

  isDestroyed(): boolean {
    return this.destroyed
  }

  getOptions(): NormalizedPostProcessOptions {
    return { ...this.options }
  }

  private renderStage(): void {
    this.stage = this.viewer.scene.postProcessStages.add(
      new PostProcessStage({
        name: 'geo-effect-kit-post-process',
        fragmentShader: buildPostProcessSource(),
        uniforms: createPostProcessUniforms(this.options),
      }),
    ) as PostProcessStage
    this.applyStageOptions()
  }

  private applyStageOptions(): void {
    if (!this.stage) return

    this.stage.enabled = this.options.visible
    Object.assign(this.stage.uniforms, createPostProcessUniforms(this.options))
  }
}

export class TemperatureFieldEffect implements TemperatureFieldEffectInstance {
  private readonly viewer: Viewer
  private readonly dataSource: CustomDataSource
  private options: NormalizedTemperatureFieldOptions
  private primitive: GroundPrimitive | Primitive | null = null
  private destroyed = false

  constructor(viewer: Viewer, options: TemperatureFieldOptions) {
    this.viewer = viewer
    this.options = normalizeTemperatureFieldOptions(options)
    this.dataSource = new CustomDataSource('geo-effect-kit-temperature-field')
    this.viewer.dataSources.add(this.dataSource)
    this.renderPrimitive()
    this.syncOutlines()
    this.viewer.scene.requestRender()
  }

  update(options: Partial<TemperatureFieldOptions>): void {
    if (this.destroyed) return

    const nextOptions: TemperatureFieldOptions = {
      polygons: options.polygons ?? this.options.polygons,
      stops: options.stops ?? this.options.stops,
      samples: options.samples ?? this.options.samples,
      seed: options.seed ?? this.options.seed,
      opacity: options.opacity ?? this.options.opacity,
      noiseStrength: options.noiseStrength ?? this.options.noiseStrength,
      contourLines: options.contourLines ?? this.options.contourLines,
      contourStrength: options.contourStrength ?? this.options.contourStrength,
      outline: options.outline ?? this.options.outline,
      outlineColor: options.outlineColor ?? this.options.outlineColor,
      outlineWidth: options.outlineWidth ?? this.options.outlineWidth,
      visible: options.visible ?? this.options.visible,
    }
    const nextBounds = options.bounds ?? this.options.bounds
    if (nextBounds) nextOptions.bounds = nextBounds

    const next = normalizeTemperatureFieldOptions(nextOptions)
    const rebuildPrimitive = shouldRebuildTemperatureField(this.options, next)
    this.options = next

    if (rebuildPrimitive) {
      this.renderPrimitive()
      this.syncOutlines()
    } else {
      this.applyPrimitiveOptions()
      this.syncOutlineVisibility()
    }

    this.viewer.scene.requestRender()
  }

  show(): void {
    if (this.destroyed) return
    this.options = { ...this.options, visible: true }
    this.applyPrimitiveOptions()
    this.syncOutlineVisibility()
    this.viewer.scene.requestRender()
  }

  hide(): void {
    if (this.destroyed) return
    this.options = { ...this.options, visible: false }
    this.applyPrimitiveOptions()
    this.syncOutlineVisibility()
    this.viewer.scene.requestRender()
  }

  flyTo(options: TemperatureFieldFlyToOptions = {}): void {
    if (this.destroyed || !this.options.bounds) return

    this.viewer.camera.flyTo({
      destination: Rectangle.fromDegrees(
        this.options.bounds.west,
        this.options.bounds.south,
        this.options.bounds.east,
        this.options.bounds.north,
      ),
      duration: options.duration ?? 1,
    })
  }

  destroy(): void {
    if (this.destroyed) return

    this.destroyed = true
    this.removePrimitive()
    this.dataSource.entities.removeAll()
    this.viewer.dataSources.remove(this.dataSource, true)
    this.viewer.scene.requestRender()
  }

  isVisible(): boolean {
    return this.options.visible
  }

  isDestroyed(): boolean {
    return this.destroyed
  }

  getOptions(): NormalizedTemperatureFieldOptions {
    return cloneTemperatureFieldOptions(this.options)
  }

  private renderPrimitive(): void {
    this.removePrimitive()
    registerTemperatureFieldMaterial(this.options)
    if (this.options.polygons.length === 0) return

    const instances = this.options.polygons.map((polygon, index) => {
      const outerPositions = polygon.outer.map(([longitude, latitude]) => Cartesian3.fromDegrees(longitude, latitude))
      const holes = polygon.holes.map(
        (hole) => new PolygonHierarchy(hole.map(([longitude, latitude]) => Cartesian3.fromDegrees(longitude, latitude))),
      )

      return new GeometryInstance({
        id: `geo-temperature-field-${index}`,
        geometry: new PolygonGeometry({
          polygonHierarchy: new PolygonHierarchy(outerPositions, holes),
          vertexFormat: EllipsoidSurfaceAppearance.VERTEX_FORMAT,
        }),
      })
    })

    this.primitive = this.viewer.scene.primitives.add(
      new GroundPrimitive({
        geometryInstances: instances,
        appearance: new EllipsoidSurfaceAppearance({
          material: createTemperatureFieldMaterial(this.options),
        }),
        show: this.options.visible,
      }),
    ) as GroundPrimitive
  }

  private removePrimitive(): void {
    if (!this.primitive) return

    this.viewer.scene.primitives.remove(this.primitive)
    this.primitive = null
  }

  private applyPrimitiveOptions(): void {
    if (!this.primitive) return

    this.primitive.show = this.options.visible
    this.applyMaterialOptions()
  }

  private applyMaterialOptions(): void {
    const material = this.primitive?.appearance?.material
    if (!material) return

    Object.assign(material.uniforms, createTemperatureFieldUniforms(this.options))
  }

  private syncOutlines(): void {
    clearEntities(this.dataSource)
    if (!this.options.outline) return

    this.options.polygons.forEach((polygon, index) => {
      this.addOutline(`${index}-outer`, polygon.outer)
      polygon.holes.forEach((hole, holeIndex) => {
        this.addOutline(`${index}-hole-${holeIndex}`, hole)
      })
    })
  }

  private addOutline(id: string, ring: TemperatureFieldCoordinate[]): void {
    if (ring.length < 2) return

    const closedRing = isTemperatureRingClosed(ring) ? ring : [...ring, ring[0]!]
    this.dataSource.entities.add({
      id: `geo-temperature-field-outline-${id}`,
      show: this.options.visible && this.options.outline,
      polyline: {
        positions: closedRing.map(([longitude, latitude]) => Cartesian3.fromDegrees(longitude, latitude)),
        clampToGround: true,
        width: this.options.outlineWidth,
        material: new PolylineGlowMaterialProperty({
          glowPower: 0.18,
          color: Color.fromCssColorString(this.options.outlineColor).withAlpha(0.76),
        }),
      },
    })
  }

  private syncOutlineVisibility(): void {
    this.dataSource.entities.values.forEach((entity) => {
      entity.show = this.options.visible && this.options.outline
    })
  }
}

export class FireBillboardEffect implements FireBillboardEffectInstance {
  private readonly viewer: Viewer
  private readonly dataSource: CustomDataSource
  private options: NormalizedFireBillboardOptions
  private entities: Entity[] = []
  private frameSets: string[][] = []
  private frameTimer: ReturnType<typeof setInterval> | null = null
  private frameIndex = 0
  private loadToken = 0
  private destroyed = false

  constructor(viewer: Viewer, options: FireBillboardOptions) {
    this.viewer = viewer
    this.options = normalizeFireBillboardOptions(options)
    this.dataSource = new CustomDataSource('geo-effect-kit-fire-billboard')
    this.dataSource.show = this.options.visible
    this.viewer.dataSources.add(this.dataSource)
    this.renderEntities()
    this.loadFrames()
    this.viewer.scene.requestRender()
  }

  update(options: Partial<FireBillboardOptions>): void {
    if (this.destroyed) return

    const next = normalizeFireBillboardOptions({
      ...this.options,
      ...options,
      points: options.points ?? this.options.points,
      clampToGround: options.clampToGround ?? this.options.clampToGround,
      visible: options.visible ?? this.options.visible,
    })
    const rebuildEntities = shouldRebuildFireBillboard(this.options, next)
    const intervalChanged = this.options.frameIntervalMs !== next.frameIntervalMs
    this.options = next

    if (rebuildEntities) {
      this.stopFrameTimer()
      this.renderEntities()
      this.loadFrames()
    } else {
      this.applyBillboardOptions()
      if (intervalChanged) this.restartFrameTimer()
    }

    this.dataSource.show = this.options.visible
    if (!this.options.visible) this.stopFrameTimer()
    this.viewer.scene.requestRender()
  }

  show(): void {
    if (this.destroyed) return
    this.options = { ...this.options, visible: true }
    this.dataSource.show = true
    this.loadFrames()
    this.viewer.scene.requestRender()
  }

  hide(): void {
    if (this.destroyed) return
    this.options = { ...this.options, visible: false }
    this.dataSource.show = false
    this.stopFrameTimer()
    this.viewer.scene.requestRender()
  }

  flyTo(options: FireBillboardFlyToOptions = {}): void {
    if (this.destroyed || this.options.points.length === 0) return

    const { center, radius } = getPositionBounds(this.options.points, Math.max(1200, this.options.scale * 2400))
    this.viewer.camera.flyToBoundingSphere(new BoundingSphere(center, radius), {
      duration: options.duration ?? 1,
      offset: new HeadingPitchRange(0, options.pitch ?? -0.62, radius * (options.rangeMultiplier ?? 2.4)),
    })
  }

  destroy(): void {
    if (this.destroyed) return

    this.destroyed = true
    this.loadToken += 1
    this.stopFrameTimer()
    this.dataSource.entities.removeAll()
    this.entities = []
    this.viewer.dataSources.remove(this.dataSource, true)
    this.viewer.scene.requestRender()
  }

  isVisible(): boolean {
    return this.options.visible
  }

  isDestroyed(): boolean {
    return this.destroyed
  }

  getOptions(): NormalizedFireBillboardOptions {
    return {
      ...this.options,
      points: cloneFireBillboardPoints(this.options.points),
    }
  }

  private renderEntities(): void {
    clearEntities(this.dataSource)
    this.frameSets = this.options.points.map((point) => [point.gif])
    this.entities = this.options.points.map((point, index) => {
      const billboard = new BillboardGraphics({
        image: new ConstantProperty(point.gif),
        scale: new ConstantProperty(this.options.scale),
        horizontalOrigin: HorizontalOrigin.CENTER,
        verticalOrigin: VerticalOrigin.BOTTOM,
        heightReference: this.options.clampToGround ? HeightReference.CLAMP_TO_GROUND : HeightReference.NONE,
        disableDepthTestDistance: this.options.disableDepthTestDistance,
      })

      const entityOptions = {
        id: point.id ?? `geo-effect-kit-fire-billboard-${index}`,
        position: Cartesian3.fromDegrees(point.longitude, point.latitude, point.height ?? 0),
        billboard,
      }

      if (point.label) {
        Object.assign(entityOptions, {
          label: {
            text: point.label,
            font: '12px sans-serif',
            fillColor: Color.WHITE,
            outlineColor: Color.BLACK,
            outlineWidth: 3,
            pixelOffset: new Cartesian2(0, -Math.max(24, 48 * this.options.scale)),
            showBackground: false,
            disableDepthTestDistance: this.options.disableDepthTestDistance,
          },
        })
      }

      return this.dataSource.entities.add(entityOptions)
    })
  }

  private applyBillboardOptions(): void {
    this.entities.forEach((entity, index) => {
      const point = this.options.points[index]
      if (!point || !entity.billboard) return

      entity.position = new ConstantPositionProperty(Cartesian3.fromDegrees(point.longitude, point.latitude, point.height ?? 0))
      entity.billboard.scale = new ConstantProperty(this.options.scale)
      entity.billboard.heightReference = new ConstantProperty(
        this.options.clampToGround ? HeightReference.CLAMP_TO_GROUND : HeightReference.NONE,
      )
      entity.billboard.disableDepthTestDistance = new ConstantProperty(this.options.disableDepthTestDistance)
      if (entity.label) {
        entity.label.text = new ConstantProperty(point.label ?? '')
        entity.label.pixelOffset = new ConstantProperty(new Cartesian2(0, -Math.max(24, 48 * this.options.scale)))
        entity.label.disableDepthTestDistance = new ConstantProperty(this.options.disableDepthTestDistance)
      }
    })
  }

  private loadFrames(): void {
    if (!this.options.visible || this.options.points.length === 0) return

    const token = ++this.loadToken

    this.options.points.forEach((point, index) => {
      loadGifFrameImages(point.gif).then((frames) => {
        if (this.destroyed || token !== this.loadToken) return
        const currentPoint = this.options.points[index]
        if (!currentPoint || currentPoint.gif !== point.gif) return
        this.applyFrameSet(index, frames)
      }).catch(() => {
        if (this.destroyed || token !== this.loadToken) return
        const currentPoint = this.options.points[index]
        if (!currentPoint || currentPoint.gif !== point.gif) return
        this.applyFrameSet(index, [point.gif])
      })
    })
  }

  private applyFrameSet(index: number, frames: string[]): void {
    const entity = this.entities[index]
    const point = this.options.points[index]
    if (!entity?.billboard || !point) return

    this.frameSets[index] = frames.length > 0 ? frames : [point.gif]
    entity.billboard.image = new ConstantProperty(this.frameSets[index][0] ?? point.gif)
    this.restartFrameTimer()
    this.viewer.scene.requestRender()
  }

  private restartFrameTimer(frameSets?: string[][]): void {
    this.stopFrameTimer()
    if (!this.options.visible) return

    const sets = frameSets ?? this.frameSets
    if (!sets.some((frames) => frames.length > 1)) return

    this.frameTimer = setInterval(() => {
      if (this.destroyed || !this.options.visible) {
        this.stopFrameTimer()
        return
      }
      this.frameIndex += 1
      this.entities.forEach((entity, index) => {
        const frames = sets[index]
        if (!entity.billboard || !frames || frames.length === 0) return
        entity.billboard.image = new ConstantProperty(frames[this.frameIndex % frames.length] ?? frames[0])
      })
      this.viewer.scene.requestRender()
    }, this.options.frameIntervalMs)
  }

  private stopFrameTimer(): void {
    if (!this.frameTimer) return
    clearInterval(this.frameTimer)
    this.frameTimer = null
  }
}

export class WaterSurfaceEffect implements WaterSurfaceEffectInstance {
  private readonly viewer: Viewer
  private readonly dataSource: CustomDataSource
  private options: NormalizedWaterSurfaceOptions
  private waterEntity: Entity | null = null
  private outlineEntity: Entity | null = null
  private material: DynamicCesiumMaterialProperty | null = null
  private renderFrame = 0
  private destroyed = false

  constructor(viewer: Viewer, options: WaterSurfaceOptions) {
    this.viewer = viewer
    this.options = normalizeWaterSurfaceOptions(options)
    this.dataSource = new CustomDataSource('geo-effect-kit-water-surface')
    this.dataSource.show = this.options.visible
    this.viewer.dataSources.add(this.dataSource)
    this.renderEntities()
    this.startRenderLoop()
    this.viewer.scene.requestRender()
  }

  update(options: Partial<WaterSurfaceOptions>): void {
    if (this.destroyed) return

    const next = normalizeWaterSurfaceOptions({
      ...this.options,
      ...options,
      polygon: options.polygon ?? this.options.polygon,
      visible: options.visible ?? this.options.visible,
    })
    const rebuildEntities = shouldRebuildWaterSurface(this.options, next)
    this.options = next

    if (rebuildEntities) {
      this.renderEntities()
    } else {
      this.applyMaterialOptions()
    }

    this.dataSource.show = this.options.visible
    if (this.options.visible) this.startRenderLoop()
    else this.stopRenderLoop()
    this.viewer.scene.requestRender()
  }

  show(): void {
    if (this.destroyed) return
    this.options = { ...this.options, visible: true }
    this.dataSource.show = true
    this.startRenderLoop()
    this.viewer.scene.requestRender()
  }

  hide(): void {
    if (this.destroyed) return
    this.options = { ...this.options, visible: false }
    this.dataSource.show = false
    this.stopRenderLoop()
    this.viewer.scene.requestRender()
  }

  flyTo(options: WaterSurfaceFlyToOptions = {}): void {
    if (this.destroyed) return

    const bounds = getPositionBounds(this.options.polygon, 1200)
    this.viewer.camera.flyToBoundingSphere(new BoundingSphere(bounds.center, bounds.radius), {
      duration: options.duration ?? 1,
      offset: new HeadingPitchRange(0, options.pitch ?? -0.72, bounds.radius * (options.rangeMultiplier ?? 2.8)),
    })
  }

  destroy(): void {
    if (this.destroyed) return

    this.destroyed = true
    this.stopRenderLoop()
    this.dataSource.entities.removeAll()
    this.waterEntity = null
    this.outlineEntity = null
    this.material = null
    this.viewer.dataSources.remove(this.dataSource, true)
    this.viewer.scene.requestRender()
  }

  isVisible(): boolean {
    return this.options.visible
  }

  isDestroyed(): boolean {
    return this.destroyed
  }

  getOptions(): NormalizedWaterSurfaceOptions {
    return {
      ...this.options,
      polygon: clonePositions(this.options.polygon),
    }
  }

  private renderEntities(): void {
    clearEntities(this.dataSource)
    this.material = createWaterSurfaceMaterialProperty(this.options)

    this.waterEntity = this.dataSource.entities.add({
      id: 'geo-effect-kit-water-surface-polygon',
      polygon: {
        hierarchy: new PolygonHierarchy(positionsToCartesiansAtHeight(this.options.polygon, this.options.height)),
        material: this.material,
        perPositionHeight: this.options.height > 0,
        outline: false,
      },
    })

    this.syncOutlineEntity()
  }

  private applyMaterialOptions(): void {
    if (!this.material) return

    Object.assign(this.material.uniforms, createWaterSurfaceUniforms(this.options))
  }

  private syncOutlineEntity(): void {
    if (!this.options.outline) return

    this.outlineEntity = this.dataSource.entities.add({
      id: 'geo-effect-kit-water-surface-outline',
      polyline: {
        positions: positionsToCartesiansAtHeight(this.options.polygon, this.options.height + 1),
        clampToGround: this.options.height <= 0,
        width: 3,
        material: new PolylineGlowMaterialProperty({
          glowPower: 0.2,
          color: Color.fromCssColorString(this.options.color).withAlpha(0.72),
        }),
      },
    })
  }

  private startRenderLoop(): void {
    if (this.renderFrame || !this.options.visible || typeof window === 'undefined') return

    const tick = () => {
      if (this.destroyed || !this.options.visible) {
        this.renderFrame = 0
        return
      }
      this.viewer.scene.requestRender()
      this.renderFrame = window.requestAnimationFrame(tick)
    }

    this.renderFrame = window.requestAnimationFrame(tick)
  }

  private stopRenderLoop(): void {
    if (!this.renderFrame || typeof window === 'undefined') {
      this.renderFrame = 0
      return
    }

    window.cancelAnimationFrame(this.renderFrame)
    this.renderFrame = 0
  }
}

export class PolylineFlowEffect implements PolylineFlowEffectInstance {
  private readonly viewer: Viewer
  private readonly dataSource: CustomDataSource
  private options: NormalizedPolylineFlowOptions
  private routeEntity: Entity | null = null
  private trailEntities: Entity[] = []
  private renderFrame = 0
  private destroyed = false

  constructor(viewer: Viewer, options: PolylineFlowOptions) {
    this.viewer = viewer
    this.options = normalizePolylineFlowOptions(options)
    this.dataSource = new CustomDataSource('geo-effect-kit-polyline-flow')
    this.dataSource.show = this.options.visible
    this.viewer.dataSources.add(this.dataSource)
    this.renderEntities()
    this.startRenderLoop()
    this.viewer.scene.requestRender()
  }

  update(options: Partial<PolylineFlowOptions>): void {
    if (this.destroyed) return

    const next = normalizePolylineFlowOptions({
      ...this.options,
      ...options,
      positions: options.positions ?? this.options.positions,
      clampToGround: options.clampToGround ?? this.options.clampToGround,
      visible: options.visible ?? this.options.visible,
    })
    const rebuildEntities = shouldRebuildPolylineFlow(this.options, next)
    const pulseCountChanged = this.options.pulseCount !== next.pulseCount
    this.options = next

    if (rebuildEntities) {
      this.renderEntities()
    } else {
      this.applyRouteOptions()
      if (pulseCountChanged) this.syncTrailEntities()
      else this.applyTrailOptions()
    }

    this.dataSource.show = this.options.visible
    if (this.options.visible) this.startRenderLoop()
    else this.stopRenderLoop()
    this.viewer.scene.requestRender()
  }

  show(): void {
    if (this.destroyed) return
    this.options = { ...this.options, visible: true }
    this.dataSource.show = true
    this.startRenderLoop()
    this.viewer.scene.requestRender()
  }

  hide(): void {
    if (this.destroyed) return
    this.options = { ...this.options, visible: false }
    this.dataSource.show = false
    this.stopRenderLoop()
    this.viewer.scene.requestRender()
  }

  flyTo(options: PolylineFlowFlyToOptions = {}): void {
    if (this.destroyed) return

    const { center, radius } = getPositionBounds(this.getRenderPositions(), Math.max(2000, this.options.width * 1000))
    this.viewer.camera.flyToBoundingSphere(new BoundingSphere(center, radius), {
      duration: options.duration ?? 1,
      offset: new HeadingPitchRange(0, options.pitch ?? -0.62, radius * (options.rangeMultiplier ?? 2.4)),
    })
  }

  destroy(): void {
    if (this.destroyed) return

    this.destroyed = true
    this.stopRenderLoop()
    this.dataSource.entities.removeAll()
    this.routeEntity = null
    this.trailEntities = []
    this.viewer.dataSources.remove(this.dataSource, true)
    this.viewer.scene.requestRender()
  }

  isVisible(): boolean {
    return this.options.visible
  }

  isDestroyed(): boolean {
    return this.destroyed
  }

  getOptions(): NormalizedPolylineFlowOptions {
    return {
      ...this.options,
      positions: clonePositions(this.options.positions),
    }
  }

  private renderEntities(): void {
    clearEntities(this.dataSource)
    this.trailEntities = []

    this.routeEntity = this.dataSource.entities.add({
      id: 'geo-effect-kit-polyline-flow-route',
      polyline: {
        positions: positionsToCartesians(this.getRenderPositions()),
        width: this.options.width,
        clampToGround: this.options.clampToGround,
        material: this.createBaseMaterial(),
      },
    })

    this.syncTrailEntities()
  }

  private syncTrailEntities(): void {
    this.trailEntities.forEach((entity) => this.dataSource.entities.remove(entity))
    this.trailEntities = []

    for (let index = 0; index < this.options.pulseCount; index += 1) {
      const trailIndex = index
      const entity = this.dataSource.entities.add({
        id: `geo-effect-kit-polyline-flow-trail-${index}`,
        polyline: {
          positions: new CallbackProperty(() => this.getTrailCartesians(trailIndex), false),
          width: Math.max(1, this.options.width * (1.24 - index * 0.035)),
          clampToGround: this.options.clampToGround,
          material: this.createTrailMaterial(index),
        },
      })
      this.trailEntities.push(entity)
    }
  }

  private applyRouteOptions(): void {
    if (!this.routeEntity?.polyline) return

    this.routeEntity.polyline.width = new ConstantProperty(this.options.width)
    this.routeEntity.polyline.material = this.createBaseMaterial()
  }

  private applyTrailOptions(): void {
    this.trailEntities.forEach((entity, index) => {
      if (!entity.polyline) return
      entity.polyline.width = new ConstantProperty(Math.max(1, this.options.width * (1.24 - index * 0.035)))
      entity.polyline.material = this.createTrailMaterial(index)
    })
  }

  private createBaseMaterial(): PolylineGlowMaterialProperty {
    return new PolylineGlowMaterialProperty({
      color: Color.fromCssColorString(this.options.color).withAlpha(0.58),
      glowPower: this.options.glowPower,
      taperPower: this.options.taperPower,
    })
  }

  private createTrailMaterial(index: number): PolylineGlowMaterialProperty {
    const alpha = clamp(0.92 - index * 0.045, 0.35, 0.94)
    return new PolylineGlowMaterialProperty({
      color: getPolylineFlowColor(this.options.type, this.options.color).withAlpha(alpha),
      glowPower: clamp(this.options.glowPower + 0.18, 0, 1),
      taperPower: clamp(this.options.taperPower - 0.18, 0, 1),
    })
  }

  private getTrailCartesians(index: number): Cartesian3[] {
    const phase = fract(getAnimationSeconds() * this.options.speed * 0.22 + index / Math.max(1, this.options.pulseCount))
    const trail = samplePolylineTrail(this.getRenderPositions(), phase, this.options.trailLength, getTrailSampleCount(this.options.type))
    return positionsToCartesians(trail)
  }

  private getRenderPositions(): GeoEffectPosition[] {
    return roundPolylineCorners(this.options.positions, this.options.cornerRadius)
  }

  private startRenderLoop(): void {
    if (this.renderFrame || !this.options.visible || typeof window === 'undefined') return

    const tick = () => {
      if (this.destroyed || !this.options.visible) {
        this.renderFrame = 0
        return
      }
      this.viewer.scene.requestRender()
      this.renderFrame = window.requestAnimationFrame(tick)
    }

    this.renderFrame = window.requestAnimationFrame(tick)
  }

  private stopRenderLoop(): void {
    if (!this.renderFrame || typeof window === 'undefined') {
      this.renderFrame = 0
      return
    }

    window.cancelAnimationFrame(this.renderFrame)
    this.renderFrame = 0
  }
}

export class FlyLineEffect implements FlyLineEffectInstance {
  private readonly viewer: Viewer
  private readonly dataSource: CustomDataSource
  private options: NormalizedFlyLineOptions
  private baseEntities: Entity[] = []
  private trailEntities: Entity[] = []
  private endpointEntities: Entity[] = []
  private renderFrame = 0
  private destroyed = false

  constructor(viewer: Viewer, options: FlyLineOptions) {
    this.viewer = viewer
    this.options = normalizeFlyLineOptions(options)
    this.dataSource = new CustomDataSource('geo-effect-kit-fly-line')
    this.dataSource.show = this.options.visible
    this.viewer.dataSources.add(this.dataSource)
    this.renderEntities()
    this.startRenderLoop()
    this.viewer.scene.requestRender()
  }

  update(options: Partial<FlyLineOptions>): void {
    if (this.destroyed) return

    const next = normalizeFlyLineOptions({
      ...this.options,
      ...options,
      lines: options.lines ?? this.options.lines,
      showEndpoints: options.showEndpoints ?? this.options.showEndpoints,
      visible: options.visible ?? this.options.visible,
    })
    const rebuildEntities = shouldRebuildFlyLine(this.options, next)
    const pulseCountChanged = this.options.pulseCount !== next.pulseCount
    this.options = next

    if (rebuildEntities) {
      this.renderEntities()
    } else {
      this.applyBaseOptions()
      if (pulseCountChanged) this.syncTrailEntities()
      else this.applyTrailOptions()
      this.syncEndpointEntities()
    }

    this.dataSource.show = this.options.visible
    if (this.options.visible) this.startRenderLoop()
    else this.stopRenderLoop()
    this.viewer.scene.requestRender()
  }

  show(): void {
    if (this.destroyed) return
    this.options = { ...this.options, visible: true }
    this.dataSource.show = true
    this.startRenderLoop()
    this.viewer.scene.requestRender()
  }

  hide(): void {
    if (this.destroyed) return
    this.options = { ...this.options, visible: false }
    this.dataSource.show = false
    this.stopRenderLoop()
    this.viewer.scene.requestRender()
  }

  flyTo(options: FlyLineFlyToOptions = {}): void {
    if (this.destroyed) return

    const positions = expandFlyLineRoutes(this.options.lines, this.options.mode).flatMap((line) =>
      sampleFlyLineArc(line, this.options.arcHeight, 12),
    )
    const { center, radius } = getPositionBounds(positions, Math.max(5000, this.options.arcHeight))
    this.viewer.camera.flyToBoundingSphere(new BoundingSphere(center, radius), {
      duration: options.duration ?? 1,
      offset: new HeadingPitchRange(0, options.pitch ?? -0.64, radius * (options.rangeMultiplier ?? 2.45)),
    })
  }

  destroy(): void {
    if (this.destroyed) return

    this.destroyed = true
    this.stopRenderLoop()
    this.dataSource.entities.removeAll()
    this.baseEntities = []
    this.trailEntities = []
    this.endpointEntities = []
    this.viewer.dataSources.remove(this.dataSource, true)
    this.viewer.scene.requestRender()
  }

  isVisible(): boolean {
    return this.options.visible
  }

  isDestroyed(): boolean {
    return this.destroyed
  }

  getOptions(): NormalizedFlyLineOptions {
    return {
      ...this.options,
      lines: cloneFlyLineRoutes(this.options.lines),
    }
  }

  private renderEntities(): void {
    clearEntities(this.dataSource)
    this.baseEntities = []
    this.trailEntities = []
    this.endpointEntities = []

    const routes = expandFlyLineRoutes(this.options.lines, this.options.mode)
    routes.forEach((line, index) => {
      const routeIndex = index
      const entity = this.dataSource.entities.add({
        id: `geo-effect-kit-fly-line-base-${index}`,
        polyline: {
          positions: positionsToCartesians(sampleFlyLineArc(line, this.options.arcHeight, getFlyLineBaseSampleCount(this.options.mode))),
          width: this.options.width,
          material: this.createBaseMaterial(),
        },
      })
      this.baseEntities.push(entity)

      for (let pulseIndex = 0; pulseIndex < this.options.pulseCount; pulseIndex += 1) {
        this.addTrailEntity(routeIndex, pulseIndex)
      }
    })

    this.syncEndpointEntities()
  }

  private syncTrailEntities(): void {
    this.trailEntities.forEach((entity) => this.dataSource.entities.remove(entity))
    this.trailEntities = []
    expandFlyLineRoutes(this.options.lines, this.options.mode).forEach((_line, routeIndex) => {
      for (let pulseIndex = 0; pulseIndex < this.options.pulseCount; pulseIndex += 1) {
        this.addTrailEntity(routeIndex, pulseIndex)
      }
    })
  }

  private addTrailEntity(routeIndex: number, pulseIndex: number): void {
    const entity = this.dataSource.entities.add({
      id: `geo-effect-kit-fly-line-trail-${routeIndex}-${pulseIndex}`,
      polyline: {
        positions: new CallbackProperty(() => this.getTrailCartesians(routeIndex, pulseIndex), false),
        width: Math.max(1, this.options.width * (1.32 - pulseIndex * 0.04)),
        material: this.createTrailMaterial(pulseIndex),
      },
    })
    this.trailEntities.push(entity)
  }

  private syncEndpointEntities(): void {
    this.endpointEntities.forEach((entity) => this.dataSource.entities.remove(entity))
    this.endpointEntities = []
    if (!this.options.showEndpoints) return

    const endpoints = uniqueFlyLineEndpoints(this.options.lines)
    endpoints.forEach((position, index) => {
      const entity = this.dataSource.entities.add({
        id: `geo-effect-kit-fly-line-endpoint-${index}`,
        position: Cartesian3.fromDegrees(position.longitude, position.latitude, position.height ?? 0),
        point: new PointGraphics({
          pixelSize: 9,
          color: new ConstantProperty(Color.fromCssColorString(this.options.color).withAlpha(0.92)),
          outlineColor: new ConstantProperty(Color.WHITE.withAlpha(0.68)),
          outlineWidth: 2,
          heightReference: HeightReference.NONE,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        }),
      })
      this.endpointEntities.push(entity)
    })
  }

  private applyBaseOptions(): void {
    this.baseEntities.forEach((entity) => {
      if (!entity.polyline) return
      entity.polyline.width = new ConstantProperty(this.options.width)
      entity.polyline.material = this.createBaseMaterial()
    })
  }

  private applyTrailOptions(): void {
    this.trailEntities.forEach((entity, index) => {
      if (!entity.polyline) return
      const pulseIndex = index % Math.max(1, this.options.pulseCount)
      entity.polyline.width = new ConstantProperty(Math.max(1, this.options.width * (1.32 - pulseIndex * 0.04)))
      entity.polyline.material = this.createTrailMaterial(pulseIndex)
    })
  }

  private createBaseMaterial(): PolylineGlowMaterialProperty {
    return new PolylineGlowMaterialProperty({
      color: getFlyLineBaseColor(this.options.mode, this.options.color).withAlpha(0.4),
      glowPower: this.options.glowPower,
      taperPower: this.options.taperPower,
    })
  }

  private createTrailMaterial(pulseIndex: number): PolylineGlowMaterialProperty {
    return new PolylineGlowMaterialProperty({
      color: getFlyLineTrailColor(this.options.mode, this.options.color).withAlpha(clamp(0.94 - pulseIndex * 0.04, 0.42, 0.94)),
      glowPower: clamp(this.options.glowPower + 0.2, 0, 1),
      taperPower: clamp(this.options.taperPower - 0.22, 0, 1),
    })
  }

  private getTrailCartesians(routeIndex: number, pulseIndex: number): Cartesian3[] {
    const routes = expandFlyLineRoutes(this.options.lines, this.options.mode)
    const route = routes[routeIndex] ?? routes[0]
    if (!route) return []

    const phase = fract(
      getAnimationSeconds() * this.options.speed * getFlyLineSpeedScale(this.options.mode) +
        pulseIndex / Math.max(1, this.options.pulseCount),
    )
    const trail = sampleFlyLineTrail(route, this.options.arcHeight, phase, this.options.trailLength, getFlyLineTrailSampleCount(this.options.mode))
    return positionsToCartesians(trail)
  }

  private startRenderLoop(): void {
    if (this.renderFrame || !this.options.visible || typeof window === 'undefined') return

    const tick = () => {
      if (this.destroyed || !this.options.visible) {
        this.renderFrame = 0
        return
      }
      this.viewer.scene.requestRender()
      this.renderFrame = window.requestAnimationFrame(tick)
    }

    this.renderFrame = window.requestAnimationFrame(tick)
  }

  private stopRenderLoop(): void {
    if (!this.renderFrame || typeof window === 'undefined') {
      this.renderFrame = 0
      return
    }

    window.cancelAnimationFrame(this.renderFrame)
    this.renderFrame = 0
  }
}

export class MaterialPolylineEffect implements MaterialPolylineEffectInstance {
  private readonly viewer: Viewer
  private readonly dataSource: CustomDataSource
  private options: NormalizedMaterialPolylineOptions
  private routeEntity: Entity | null = null
  private material: DynamicCesiumMaterialProperty | null = null
  private renderFrame = 0
  private destroyed = false

  constructor(viewer: Viewer, options: MaterialPolylineOptions) {
    this.viewer = viewer
    this.options = normalizeMaterialPolylineOptions(options)
    this.dataSource = new CustomDataSource('geo-effect-kit-material-polyline')
    this.dataSource.show = this.options.visible
    this.viewer.dataSources.add(this.dataSource)
    this.renderEntity()
    this.startRenderLoop()
    this.viewer.scene.requestRender()
  }

  update(options: Partial<MaterialPolylineOptions>): void {
    if (this.destroyed) return

    const nextImage =
      options.image !== undefined
        ? options.image
        : options.imagePreset !== undefined
          ? normalizeMaterialPolylineOptions({ positions: this.options.positions, imagePreset: options.imagePreset }).image
          : this.options.image
    const next = normalizeMaterialPolylineOptions({
      ...this.options,
      ...options,
      positions: options.positions ?? this.options.positions,
      repeat: options.repeat ?? this.options.repeat,
      image: nextImage,
      clampToGround: options.clampToGround ?? this.options.clampToGround,
      visible: options.visible ?? this.options.visible,
    })
    const rebuildEntity = shouldRebuildMaterialPolyline(this.options, next)
    const materialClassChanged = isNativeMaterialPolylineStyle(this.options.style) !== isNativeMaterialPolylineStyle(next.style)
    this.options = next

    if (rebuildEntity || materialClassChanged) {
      this.renderEntity()
    } else {
      this.applyEntityOptions()
    }

    this.dataSource.show = this.options.visible
    if (this.options.visible) this.startRenderLoop()
    else this.stopRenderLoop()
    this.viewer.scene.requestRender()
  }

  show(): void {
    if (this.destroyed) return
    this.options = { ...this.options, visible: true }
    this.dataSource.show = true
    this.startRenderLoop()
    this.viewer.scene.requestRender()
  }

  hide(): void {
    if (this.destroyed) return
    this.options = { ...this.options, visible: false }
    this.dataSource.show = false
    this.stopRenderLoop()
    this.viewer.scene.requestRender()
  }

  flyTo(options: MaterialPolylineFlyToOptions = {}): void {
    if (this.destroyed) return

    const { center, radius } = getPositionBounds(this.getRenderPositions(), Math.max(2000, this.options.width * 900))
    this.viewer.camera.flyToBoundingSphere(new BoundingSphere(center, radius), {
      duration: options.duration ?? 1,
      offset: new HeadingPitchRange(0, options.pitch ?? -0.62, radius * (options.rangeMultiplier ?? 2.4)),
    })
  }

  destroy(): void {
    if (this.destroyed) return

    this.destroyed = true
    this.stopRenderLoop()
    this.dataSource.entities.removeAll()
    this.routeEntity = null
    this.material = null
    this.viewer.dataSources.remove(this.dataSource, true)
    this.viewer.scene.requestRender()
  }

  isVisible(): boolean {
    return this.options.visible
  }

  isDestroyed(): boolean {
    return this.destroyed
  }

  getOptions(): NormalizedMaterialPolylineOptions {
    return {
      ...this.options,
      positions: clonePositions(this.options.positions),
      repeat: { ...this.options.repeat },
    }
  }

  private renderEntity(): void {
    clearEntities(this.dataSource)
    this.material = null
    const positions = positionsToCartesians(this.getRenderPositions())
    const material = this.createMaterial()

    this.routeEntity = this.dataSource.entities.add({
      id: 'geo-effect-kit-material-polyline-route',
      polyline: {
        positions,
        width: this.options.width,
        clampToGround: this.options.clampToGround && this.options.arcHeight <= 0,
        material,
      },
    })
  }

  private applyEntityOptions(): void {
    if (!this.routeEntity?.polyline) return

    this.routeEntity.polyline.width = new ConstantProperty(this.options.width)
    if (this.material) {
      this.applyDynamicMaterialUniforms(this.material)
    } else {
      this.routeEntity.polyline.material = this.createMaterial()
    }
  }

  private createMaterial(): ColorMaterialProperty | PolylineOutlineMaterialProperty | PolylineArrowMaterialProperty | PolylineDashMaterialProperty | DynamicCesiumMaterialProperty {
    if (this.options.style === 'solid') {
      return new ColorMaterialProperty(Color.fromCssColorString(this.options.color))
    }

    if (this.options.style === 'outline') {
      return new PolylineOutlineMaterialProperty({
        color: Color.fromCssColorString(this.options.color),
        outlineColor: Color.fromCssColorString(this.options.secondaryColor),
        outlineWidth: this.options.outlineWidth,
      })
    }

    if (this.options.style === 'arrow') {
      return new PolylineArrowMaterialProperty(Color.fromCssColorString(this.options.color))
    }

    if (this.options.style === 'dash' || this.options.style === 'dual-dash') {
      return new PolylineDashMaterialProperty({
        color: Color.fromCssColorString(this.options.color),
        gapColor: Color.fromCssColorString(this.options.style === 'dual-dash' ? this.options.secondaryColor : 'rgba(0, 0, 0, 0)'),
        dashLength: Math.max(4, this.options.repeat.x * 4),
        dashPattern: this.options.style === 'dual-dash' ? 0b1111000000 : 255,
      })
    }

    registerMaterialPolylineMaterial()
    const material = new DynamicCesiumMaterialProperty(GEO_MATERIAL_POLYLINE_MATERIAL_TYPE, {})
    this.material = material
    this.applyDynamicMaterialUniforms(material)
    return material
  }

  private applyDynamicMaterialUniforms(material: DynamicCesiumMaterialProperty): void {
    material.uniforms.color = Color.fromCssColorString(this.options.color).withAlpha(1)
    material.uniforms.secondaryColor = Color.fromCssColorString(this.options.secondaryColor).withAlpha(1)
    material.uniforms.backgroundColor = Color.fromCssColorString(this.options.backgroundColor)
    material.uniforms.image = this.options.image
    material.uniforms.speed = this.options.speed
    material.uniforms.repeatX = this.options.repeat.x
    material.uniforms.repeatY = this.options.repeat.y
    material.uniforms.styleType = getMaterialPolylineStyleUniform(this.options.style)
  }

  private getRenderPositions(): GeoEffectPosition[] {
    const rounded = roundPolylineCorners(this.options.positions, this.options.cornerRadius)
    if (this.options.arcHeight <= 0) return rounded

    const result: GeoEffectPosition[] = []
    for (let index = 1; index < rounded.length; index += 1) {
      const from = rounded[index - 1]
      const to = rounded[index]
      if (!from || !to) continue
      const segment = sampleFlyLineArc({ from, to }, this.options.arcHeight, this.options.arcSamples)
      segment.forEach((position, segmentIndex) => {
        if (index > 1 && segmentIndex === 0) return
        result.push(position)
      })
    }
    return result.length >= 2 ? result : rounded
  }

  private startRenderLoop(): void {
    if (this.renderFrame || !this.options.visible || typeof window === 'undefined') return

    const tick = () => {
      if (this.destroyed || !this.options.visible) {
        this.renderFrame = 0
        return
      }
      this.viewer.scene.requestRender()
      this.renderFrame = window.requestAnimationFrame(tick)
    }

    this.renderFrame = window.requestAnimationFrame(tick)
  }

  private stopRenderLoop(): void {
    if (!this.renderFrame || typeof window === 'undefined') {
      this.renderFrame = 0
      return
    }

    window.cancelAnimationFrame(this.renderFrame)
    this.renderFrame = 0
  }
}

export class PipeFlowEffect implements PipeFlowEffectInstance {
  private readonly viewer: Viewer
  private readonly dataSource: CustomDataSource
  private options: NormalizedPipeFlowOptions
  private pipeShellEntity: Entity | null = null
  private pipeHighlightEntity: Entity | null = null
  private waterCoreEntity: Entity | null = null
  private waveEntities: Entity[] = []
  private bubbleEntities: Entity[] = []
  private renderFrame = 0
  private destroyed = false

  constructor(viewer: Viewer, options: PipeFlowOptions) {
    this.viewer = viewer
    this.options = normalizePipeFlowOptions(options)
    this.dataSource = new CustomDataSource('geo-effect-kit-pipe-flow')
    this.dataSource.show = this.options.visible
    this.viewer.dataSources.add(this.dataSource)
    this.renderEntities()
    this.startRenderLoop()
    this.viewer.scene.requestRender()
  }

  update(options: Partial<PipeFlowOptions>): void {
    if (this.destroyed) return

    const next = normalizePipeFlowOptions({
      ...this.options,
      ...options,
      positions: options.positions ?? this.options.positions,
      clampToGround: options.clampToGround ?? this.options.clampToGround,
      visible: options.visible ?? this.options.visible,
    })
    const rebuildEntities = shouldRebuildPipeFlow(this.options, next)
    this.options = next

    if (rebuildEntities) this.renderEntities()
    else this.applyOptions()

    this.dataSource.show = this.options.visible
    if (this.options.visible) this.startRenderLoop()
    else this.stopRenderLoop()
    this.viewer.scene.requestRender()
  }

  show(): void {
    if (this.destroyed) return
    this.options = { ...this.options, visible: true }
    this.dataSource.show = true
    this.startRenderLoop()
    this.viewer.scene.requestRender()
  }

  hide(): void {
    if (this.destroyed) return
    this.options = { ...this.options, visible: false }
    this.dataSource.show = false
    this.stopRenderLoop()
    this.viewer.scene.requestRender()
  }

  flyTo(options: PipeFlowFlyToOptions = {}): void {
    if (this.destroyed) return

    const { center, radius } = getPositionBounds(this.getRenderPositions(), Math.max(2400, this.options.width * 1000))
    this.viewer.camera.flyToBoundingSphere(new BoundingSphere(center, radius), {
      duration: options.duration ?? 1,
      offset: new HeadingPitchRange(0, options.pitch ?? -0.62, radius * (options.rangeMultiplier ?? 2.35)),
    })
  }

  destroy(): void {
    if (this.destroyed) return

    this.destroyed = true
    this.stopRenderLoop()
    this.dataSource.entities.removeAll()
    this.pipeShellEntity = null
    this.pipeHighlightEntity = null
    this.waterCoreEntity = null
    this.waveEntities = []
    this.bubbleEntities = []
    this.viewer.dataSources.remove(this.dataSource, true)
    this.viewer.scene.requestRender()
  }

  isVisible(): boolean {
    return this.options.visible
  }

  isDestroyed(): boolean {
    return this.destroyed
  }

  getOptions(): NormalizedPipeFlowOptions {
    return {
      ...this.options,
      positions: clonePositions(this.options.positions),
    }
  }

  private renderEntities(): void {
    clearEntities(this.dataSource)
    this.waveEntities = []
    this.bubbleEntities = []
    const positions = this.getRenderCartesians()

    this.pipeShellEntity = this.dataSource.entities.add({
      id: 'geo-effect-kit-pipe-flow-shell',
      polyline: {
        positions,
        width: getPipeLayerWidth(this.options.width, 2),
        clampToGround: this.options.clampToGround,
        material: this.createPipeShellMaterial(),
      },
    })

    this.pipeHighlightEntity = this.dataSource.entities.add({
      id: 'geo-effect-kit-pipe-flow-highlight',
      polyline: {
        positions,
        width: getPipeLayerWidth(this.options.width, 1.2),
        clampToGround: this.options.clampToGround,
        material: this.createPipeHighlightMaterial(),
      },
    })

    this.waterCoreEntity = this.dataSource.entities.add({
      id: 'geo-effect-kit-pipe-flow-water-core',
      polyline: {
        positions,
        width: getPipeLayerWidth(this.options.width, 0.8),
        clampToGround: this.options.clampToGround,
        material: this.createWaterCoreMaterial(),
      },
    })

    for (let index = 0; index < 2; index += 1) {
      const waveIndex = index
      const entity = this.dataSource.entities.add({
        id: `geo-effect-kit-pipe-flow-pressure-wave-${index}`,
        polyline: {
          positions: new CallbackProperty(() => this.getMovingSegmentCartesians(waveIndex, 0.18), false),
          width: getPipeLayerWidth(this.options.width, 0.92 - index * 0.12),
          clampToGround: this.options.clampToGround,
          material: this.createPressureWaveMaterial(index),
        },
      })
      this.waveEntities.push(entity)
    }

    for (let index = 0; index < this.options.bubbleDensity; index += 1) {
      const bubbleIndex = index
      const entity = this.dataSource.entities.add({
        id: `geo-effect-kit-pipe-flow-bubble-${index}`,
        polyline: {
          positions: new CallbackProperty(() => this.getMovingSegmentCartesians(bubbleIndex, 0.055), false),
          width: getPipeLayerWidth(this.options.width, 0.24),
          clampToGround: this.options.clampToGround,
          material: this.createBubbleMaterial(index),
        },
      })
      this.bubbleEntities.push(entity)
    }
  }

  private applyOptions(): void {
    if (this.pipeShellEntity?.polyline) {
      this.pipeShellEntity.polyline.width = new ConstantProperty(getPipeLayerWidth(this.options.width, 2))
      this.pipeShellEntity.polyline.material = this.createPipeShellMaterial()
    }
    if (this.pipeHighlightEntity?.polyline) {
      this.pipeHighlightEntity.polyline.width = new ConstantProperty(getPipeLayerWidth(this.options.width, 1.2))
      this.pipeHighlightEntity.polyline.material = this.createPipeHighlightMaterial()
    }
    if (this.waterCoreEntity?.polyline) {
      this.waterCoreEntity.polyline.width = new ConstantProperty(getPipeLayerWidth(this.options.width, 0.8))
      this.waterCoreEntity.polyline.material = this.createWaterCoreMaterial()
    }
    this.waveEntities.forEach((entity, index) => {
      if (!entity.polyline) return
      entity.polyline.width = new ConstantProperty(getPipeLayerWidth(this.options.width, 0.92 - index * 0.12))
      entity.polyline.material = this.createPressureWaveMaterial(index)
    })
    this.bubbleEntities.forEach((entity, index) => {
      if (!entity.polyline) return
      entity.polyline.width = new ConstantProperty(getPipeLayerWidth(this.options.width, 0.24))
      entity.polyline.material = this.createBubbleMaterial(index)
    })
  }

  private createPipeShellMaterial(): PolylineGlowMaterialProperty {
    return new PolylineGlowMaterialProperty({
      color: Color.fromCssColorString(this.options.color).withAlpha(this.options.pipeOpacity),
      glowPower: 0.18,
      taperPower: 0.82,
    })
  }

  private createPipeHighlightMaterial(): PolylineGlowMaterialProperty {
    return new PolylineGlowMaterialProperty({
      color: Color.WHITE.withAlpha(clamp(this.options.pipeOpacity * 0.55, 0.08, 0.38)),
      glowPower: 0.08,
      taperPower: 1,
    })
  }

  private createWaterCoreMaterial(): PolylineGlowMaterialProperty {
    return new PolylineGlowMaterialProperty({
      color: Color.fromCssColorString(this.options.color).withAlpha(this.options.waterOpacity),
      glowPower: 0.28,
      taperPower: 0.44,
    })
  }

  private createPressureWaveMaterial(index: number): PolylineGlowMaterialProperty {
    return new PolylineGlowMaterialProperty({
      color: Color.lerp(Color.fromCssColorString(this.options.color), Color.WHITE, 0.35, new Color()).withAlpha(
        clamp(this.options.waterOpacity - index * 0.18, 0.22, 0.9),
      ),
      glowPower: 0.36,
      taperPower: 0.2,
    })
  }

  private createBubbleMaterial(index: number): PolylineGlowMaterialProperty {
    return new PolylineGlowMaterialProperty({
      color: Color.lerp(Color.fromCssColorString(this.options.color), Color.WHITE, 0.72, new Color()).withAlpha(
        clamp(0.72 - (index % 4) * 0.08, 0.36, 0.72),
      ),
      glowPower: 0.18,
      taperPower: 0,
    })
  }

  private getMovingSegmentCartesians(index: number, length: number): Cartesian3[] {
    const density = Math.max(1, this.options.bubbleDensity)
    const phase = fract(getAnimationSeconds() * this.options.speed * 0.32 + index / density)
    const segment = samplePolylineTrail(this.getRenderPositions(), phase, length, 4)
    return positionsToCartesians(segment)
  }

  private getRenderCartesians(): Cartesian3[] {
    return positionsToCartesians(this.getRenderPositions())
  }

  private getRenderPositions(): GeoEffectPosition[] {
    return roundPolylineCorners(this.options.positions, this.options.cornerRadius)
  }

  private startRenderLoop(): void {
    if (this.renderFrame || !this.options.visible || typeof window === 'undefined') return

    const tick = () => {
      if (this.destroyed || !this.options.visible) {
        this.renderFrame = 0
        return
      }
      this.viewer.scene.requestRender()
      this.renderFrame = window.requestAnimationFrame(tick)
    }

    this.renderFrame = window.requestAnimationFrame(tick)
  }

  private stopRenderLoop(): void {
    if (!this.renderFrame || typeof window === 'undefined') {
      this.renderFrame = 0
      return
    }

    window.cancelAnimationFrame(this.renderFrame)
    this.renderFrame = 0
  }
}

export class LightWallEffect implements LightWallEffectInstance {
  private readonly viewer: Viewer
  private readonly dataSource: CustomDataSource
  private options: NormalizedLightWallOptions
  private wallEntity: Entity | null = null
  private outlineEntity: Entity | null = null
  private material: DynamicCesiumMaterialProperty | null = null
  private renderFrame = 0
  private destroyed = false

  constructor(viewer: Viewer, options: LightWallOptions) {
    this.viewer = viewer
    this.options = normalizeLightWallOptions(options)
    this.dataSource = new CustomDataSource('geo-effect-kit-light-wall')
    this.dataSource.show = this.options.visible
    this.viewer.dataSources.add(this.dataSource)
    this.renderEntities()
    this.startRenderLoop()
    this.viewer.scene.requestRender()
  }

  update(options: Partial<LightWallOptions>): void {
    if (this.destroyed) return

    const next = normalizeLightWallOptions({
      ...this.options,
      ...options,
      positions: options.positions ?? this.options.positions,
      breathing: options.breathing ?? this.options.breathing,
      outline: options.outline ?? this.options.outline,
      visible: options.visible ?? this.options.visible,
    })
    const rebuildEntities = shouldRebuildLightWall(this.options, next)
    this.options = next

    if (rebuildEntities) {
      this.renderEntities()
    } else {
      this.applyMaterialOptions()
      this.syncOutlineEntity()
    }

    this.dataSource.show = this.options.visible
    if (this.options.visible) this.startRenderLoop()
    else this.stopRenderLoop()
    this.viewer.scene.requestRender()
  }

  show(): void {
    if (this.destroyed) return
    this.options = { ...this.options, visible: true }
    this.dataSource.show = true
    this.startRenderLoop()
    this.viewer.scene.requestRender()
  }

  hide(): void {
    if (this.destroyed) return
    this.options = { ...this.options, visible: false }
    this.dataSource.show = false
    this.stopRenderLoop()
    this.viewer.scene.requestRender()
  }

  flyTo(options: LightWallFlyToOptions = {}): void {
    if (this.destroyed) return

    const { center, radius } = getPositionBounds(this.options.positions, this.options.height)
    this.viewer.camera.flyToBoundingSphere(new BoundingSphere(center, radius), {
      duration: options.duration ?? 1,
      offset: new HeadingPitchRange(0, options.pitch ?? -0.58, radius * (options.rangeMultiplier ?? 2.35)),
    })
  }

  destroy(): void {
    if (this.destroyed) return

    this.destroyed = true
    this.stopRenderLoop()
    this.dataSource.entities.removeAll()
    this.wallEntity = null
    this.outlineEntity = null
    this.material = null
    this.viewer.dataSources.remove(this.dataSource, true)
    this.viewer.scene.requestRender()
  }

  isVisible(): boolean {
    return this.options.visible
  }

  isDestroyed(): boolean {
    return this.destroyed
  }

  getOptions(): NormalizedLightWallOptions {
    return {
      ...this.options,
      positions: clonePositions(this.options.positions),
    }
  }

  private renderEntities(): void {
    clearEntities(this.dataSource)
    this.outlineEntity = null
    this.material = createLightWallMaterialProperty(this.options)

    this.wallEntity = this.dataSource.entities.add({
      id: 'geo-effect-kit-light-wall-surface',
      wall: {
        positions: positionsToCartesians(this.options.positions),
        minimumHeights: this.options.positions.map((position) => position.height ?? 0),
        maximumHeights: this.options.positions.map((position) => (position.height ?? 0) + this.options.height),
        material: this.material,
        outline: false,
      },
    })

    this.syncOutlineEntity()
  }

  private applyMaterialOptions(): void {
    if (!this.material) return

    this.material.uniforms.color = Color.fromCssColorString(this.options.color).withAlpha(1)
    this.material.uniforms.opacity = this.options.opacity
    this.material.uniforms.speed = this.options.speed
    this.material.uniforms.wallType = getLightWallTypeUniform(this.options.type)
    this.material.uniforms.scanLineCount = this.options.scanLineCount
    this.material.uniforms.breathing = this.options.breathing ? 1 : 0
  }

  private syncOutlineEntity(): void {
    if (!this.options.outline) {
      if (this.outlineEntity) {
        this.dataSource.entities.remove(this.outlineEntity)
        this.outlineEntity = null
      }
      return
    }

    if (this.outlineEntity) {
      if (this.outlineEntity.polyline) {
        this.outlineEntity.polyline.positions = new ConstantProperty(positionsToCartesiansAtHeight(this.options.positions, this.options.height))
        this.outlineEntity.polyline.material = new PolylineGlowMaterialProperty({
          color: Color.fromCssColorString(this.options.color).withAlpha(0.86),
          glowPower: 0.18,
          taperPower: 1,
        })
      }
      return
    }

    this.outlineEntity = this.dataSource.entities.add({
      id: 'geo-effect-kit-light-wall-outline',
      polyline: {
        positions: positionsToCartesiansAtHeight(this.options.positions, this.options.height),
        width: 2.5,
        material: new PolylineGlowMaterialProperty({
          color: Color.fromCssColorString(this.options.color).withAlpha(0.86),
          glowPower: 0.18,
          taperPower: 1,
        }),
      },
    })
  }

  private startRenderLoop(): void {
    if (this.renderFrame || !this.options.visible || typeof window === 'undefined') return

    const tick = () => {
      if (this.destroyed || !this.options.visible) {
        this.renderFrame = 0
        return
      }
      this.viewer.scene.requestRender()
      this.renderFrame = window.requestAnimationFrame(tick)
    }

    this.renderFrame = window.requestAnimationFrame(tick)
  }

  private stopRenderLoop(): void {
    if (!this.renderFrame || typeof window === 'undefined') {
      this.renderFrame = 0
      return
    }

    window.cancelAnimationFrame(this.renderFrame)
    this.renderFrame = 0
  }
}

export class ScanConeEffect implements ScanConeEffectInstance {
  private readonly viewer: Viewer
  private readonly dataSource: CustomDataSource
  private options: NormalizedScanConeOptions
  private coneEntity: Entity | null = null
  private conePrimitive: Primitive | null = null
  private originEntity: Entity | null = null
  private material: DynamicCesiumMaterialProperty | null = null
  private primitiveMaterial: Material | null = null
  private readonly primitiveOriginScratch = new Cartesian3()
  private readonly primitiveHeadingPitchRollScratch = new HeadingPitchRoll()
  private readonly primitiveModelMatrixScratch = new Matrix4()
  private readonly primitiveScaleScratch = new Cartesian3()
  private readonly primitiveTranslationScratch = new Cartesian3()
  private expansionState: ScanConeExpansionState = createInitialScanConeExpansionState('idle')
  private expansionPreviousTimestamp: number | null = null
  private pausedByVisibility = false
  private completionNotified = false
  private cameraFollowPlanned = false
  private cameraFollowCancelledByUser = false
  private cameraFollowListenersAttached = false
  private cameraFollowGeneration = 0
  private activeCameraFollowGeneration: number | null = null
  private internallyCancellingCameraFollowGeneration: number | null = null
  private renderFrame = 0
  private destroyed = false

  private readonly handleCameraFollowUserInput = (): void => {
    if (this.activeCameraFollowGeneration === null) return
    this.cameraFollowCancelledByUser = true
    this.stopExpansionCameraFollow(true)
  }

  constructor(viewer: Viewer, options: ScanConeOptions) {
    this.viewer = viewer
    this.options = normalizeScanConeOptions(options)
    this.dataSource = new CustomDataSource('geo-effect-kit-scan-cone')
    this.dataSource.show = this.options.visible
    this.viewer.dataSources.add(this.dataSource)
    this.resetExpansionState()
    this.renderCurrentPath()
    this.startExpansionCameraFollow(this.getExpansionRemainingDurationMs())
    this.startRenderLoop()
    this.viewer.scene.requestRender()
  }

  update(options: Partial<ScanConeOptions>): void {
    if (this.destroyed) return

    const next = normalizeScanConeOptions({
      ...this.options,
      ...options,
      center: options.center ?? this.options.center,
      showOrigin: options.showOrigin ?? this.options.showOrigin,
      visible: options.visible ?? this.options.visible,
    })
    const previous = this.options
    const modeChanged = Boolean(previous.expansion) !== Boolean(next.expansion)
    const restartExpansion = Boolean(previous.expansion && next.expansion) && (
      previous.lengthMeters !== next.lengthMeters ||
      previous.expansion?.maxRadiusMeters !== next.expansion?.maxRadiusMeters ||
      previous.expansion?.durationMs !== next.expansion?.durationMs
    )
    const cameraFollowChanged = previous.expansion?.cameraFollow !== next.expansion?.cameraFollow
    const cameraTargetChanged = Boolean(previous.expansion && next.expansion) && (
      !positionEqual(previous.center, next.center) ||
      previous.heading !== next.heading ||
      previous.pitch !== next.pitch ||
      previous.speed !== next.speed
    )
    const rebuildEntities = !next.expansion && shouldRebuildScanCone(previous, next)
    if (modeChanged) this.stopExpansionCameraFollow(true)
    this.options = next

    if (modeChanged) {
      this.cameraFollowPlanned = false
      this.cameraFollowCancelledByUser = false
      this.resetExpansionState()
      this.renderCurrentPath()
      this.startExpansionCameraFollow(this.getExpansionRemainingDurationMs())
    } else if (rebuildEntities) {
      this.renderEntities()
    } else {
      this.applyMaterialOptions()
      this.syncOriginEntity()
      if (restartExpansion) this.restartExpansion()
      else if (this.options.expansion) this.updatePrimitiveModelMatrix(getAnimationSeconds())
    }

    if (!modeChanged && !restartExpansion && cameraFollowChanged) {
      this.stopExpansionCameraFollow(true)
      this.cameraFollowPlanned = false
      this.startExpansionCameraFollow(this.getExpansionRemainingDurationMs())
    }

    if (
      !modeChanged &&
      !restartExpansion &&
      !cameraFollowChanged &&
      cameraTargetChanged &&
      !this.cameraFollowCancelledByUser
    ) {
      this.stopExpansionCameraFollow(true)
      this.cameraFollowPlanned = false
      this.startExpansionCameraFollow(this.getExpansionRemainingDurationMs())
    }

    this.dataSource.show = this.options.visible
    if (this.conePrimitive) this.conePrimitive.show = this.options.visible
    if (!modeChanged && !restartExpansion && previous.visible !== this.options.visible) {
      if (this.options.visible) this.resumeExpansionAfterVisibilityPause()
      else this.pauseExpansionForVisibility()
    }
    if (this.options.visible) this.startRenderLoop()
    else this.stopRenderLoop()
    this.viewer.scene.requestRender()
  }

  restartExpansion(): void {
    if (this.destroyed || !this.options.expansion) return

    this.stopExpansionCameraFollow(true)
    this.cameraFollowPlanned = false
    this.cameraFollowCancelledByUser = false
    this.expansionState = createInitialScanConeExpansionState(this.options.visible ? 'running' : 'paused')
    this.expansionPreviousTimestamp = null
    this.pausedByVisibility = !this.options.visible
    this.completionNotified = false
    this.updatePrimitiveModelMatrix(getAnimationSeconds())
    this.startExpansionCameraFollow(this.getExpansionRemainingDurationMs())
    if (this.options.visible) this.startRenderLoop()
    this.viewer.scene.requestRender()
  }

  cancelExpansion(): void {
    if (this.destroyed || !this.options.expansion) return
    if (this.expansionState.status === 'completed' || this.expansionState.status === 'cancelled') return

    this.expansionState = { ...this.expansionState, status: 'cancelled' }
    this.expansionPreviousTimestamp = null
    this.pausedByVisibility = false
    this.stopExpansionCameraFollow(true)
  }

  isExpanding(): boolean {
    return !this.destroyed && this.expansionState.status === 'running'
  }

  getExpansionState(): ScanConeExpansionState {
    return { ...this.expansionState }
  }

  show(): void {
    if (this.destroyed) return
    this.options = { ...this.options, visible: true }
    this.dataSource.show = true
    if (this.conePrimitive) this.conePrimitive.show = true
    this.resumeExpansionAfterVisibilityPause()
    this.startRenderLoop()
    this.viewer.scene.requestRender()
  }

  hide(): void {
    if (this.destroyed) return
    this.options = { ...this.options, visible: false }
    this.dataSource.show = false
    if (this.conePrimitive) this.conePrimitive.show = false
    this.pauseExpansionForVisibility()
    this.stopRenderLoop()
    this.viewer.scene.requestRender()
  }

  flyTo(options: ScanConeFlyToOptions = {}): void {
    if (this.destroyed) return

    if (this.activeCameraFollowGeneration !== null) {
      this.cameraFollowCancelledByUser = true
      this.stopExpansionCameraFollow(true)
    }
    const center = this.getOriginCartesian()
    const radius = Math.max(this.options.radiusMeters, this.options.lengthMeters)
    this.viewer.camera.flyToBoundingSphere(new BoundingSphere(center, radius), {
      duration: options.duration ?? 1,
      offset: new HeadingPitchRange(0, options.pitch ?? -0.46, radius * (options.rangeMultiplier ?? 2.8)),
    })
  }

  destroy(): void {
    if (this.destroyed) return

    this.stopExpansionCameraFollow(true)
    this.destroyed = true
    this.stopRenderLoop()
    this.removeConePrimitive()
    this.dataSource.entities.removeAll()
    this.coneEntity = null
    this.originEntity = null
    this.material = null
    this.primitiveMaterial = null
    this.viewer.dataSources.remove(this.dataSource, true)
    this.viewer.scene.requestRender()
  }

  isVisible(): boolean {
    return this.options.visible
  }

  isDestroyed(): boolean {
    return this.destroyed
  }

  getOptions(): NormalizedScanConeOptions {
    return {
      ...this.options,
      center: { ...this.options.center },
      ...(this.options.expansion ? { expansion: { ...this.options.expansion } } : {}),
    }
  }

  private renderEntities(): void {
    this.removeConePrimitive()
    clearEntities(this.dataSource)
    this.originEntity = null
    this.material = createScanConeMaterialProperty(this.options)

    this.coneEntity = this.dataSource.entities.add({
      id: 'geo-effect-kit-scan-cone-volume',
      position: new CallbackPositionProperty(() => this.getConeCenterCartesian(), false),
      orientation: new CallbackProperty(() => this.getConeOrientation(), false),
      cylinder: {
        length: this.options.lengthMeters,
        topRadius: 0,
        bottomRadius: getConeBottomRadius(this.options),
        slices: 128,
        numberOfVerticalLines: 24,
        material: this.material,
        outline: false,
      },
    })

    this.syncOriginEntity()
  }

  private renderCurrentPath(): void {
    if (this.options.expansion) this.renderPrimitive()
    else this.renderEntities()
  }

  private renderPrimitive(): void {
    clearEntities(this.dataSource)
    this.coneEntity = null
    this.originEntity = null
    this.material = null
    this.removeConePrimitive()
    registerScanConeMaterial()
    this.primitiveMaterial = Material.fromType(
      GEO_SCAN_CONE_MATERIAL_TYPE,
      createScanConeMaterialUniforms(this.options),
    )
    this.conePrimitive = this.viewer.scene.primitives.add(new Primitive({
      geometryInstances: new GeometryInstance({
        id: 'geo-effect-kit-scan-cone-volume',
        geometry: new CylinderGeometry({
          length: 1,
          topRadius: 0,
          bottomRadius: 1,
          slices: 128,
          vertexFormat: MaterialAppearance.MaterialSupport.TEXTURED.vertexFormat,
        }),
      }),
      appearance: new MaterialAppearance({
        material: this.primitiveMaterial,
        translucent: true,
        closed: false,
        faceForward: true,
      }),
      asynchronous: false,
      modelMatrix: this.createPrimitiveModelMatrix(getAnimationSeconds()),
      show: this.options.visible,
    }))
    this.syncOriginEntity()
  }

  private applyMaterialOptions(): void {
    if (this.material) applyScanConeMaterialUniforms(this.material.uniforms, this.options)
    if (this.primitiveMaterial) applyScanConeMaterialUniforms(this.primitiveMaterial.uniforms, this.options)
  }

  private syncOriginEntity(): void {
    if (!this.options.showOrigin) {
      if (this.originEntity) {
        this.dataSource.entities.remove(this.originEntity)
        this.originEntity = null
      }
      return
    }

    const color = Color.fromCssColorString(this.options.color)
    if (!this.originEntity) {
      this.originEntity = this.dataSource.entities.add({
        id: 'geo-effect-kit-scan-cone-origin',
        position: this.getOriginCartesian(),
        point: new PointGraphics({
          pixelSize: 11,
          color: new ConstantProperty(color),
          outlineColor: new ConstantProperty(Color.WHITE.withAlpha(0.72)),
          outlineWidth: 2,
          heightReference: HeightReference.CLAMP_TO_GROUND,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        }),
      })
      return
    }

    this.originEntity.position = new ConstantPositionProperty(this.getOriginCartesian())
    if (this.originEntity.point) this.originEntity.point.color = new ConstantProperty(color)
  }

  private getOriginCartesian(result?: Cartesian3): Cartesian3 {
    return Cartesian3.fromDegrees(
      this.options.center.longitude,
      this.options.center.latitude,
      this.options.center.height ?? 0,
      undefined,
      result,
    )
  }

  private getConeCenterCartesian(): Cartesian3 {
    return Cartesian3.fromDegrees(
      this.options.center.longitude,
      this.options.center.latitude,
      (this.options.center.height ?? 0) + this.options.lengthMeters / 2,
    )
  }

  private getConeOrientation() {
    const heading = this.options.heading + getAnimationSeconds() * this.options.speed * 36
    const hpr = HeadingPitchRoll.fromDegrees(heading, this.options.pitch, 0)
    return Transforms.headingPitchRollQuaternion(this.getConeCenterCartesian(), hpr)
  }

  private startRenderLoop(): void {
    if (this.renderFrame || !this.options.visible || typeof window === 'undefined') return

    const tick = (timestamp: number) => {
      this.renderFrame = 0
      if (this.destroyed || !this.options.visible) {
        return
      }
      try {
        const animationSeconds = Number.isFinite(timestamp) ? timestamp / 1000 : 0
        if (this.primitiveMaterial) this.primitiveMaterial.uniforms.timeSeconds = animationSeconds
        const modelMatrixUpdated = this.advanceExpansion(timestamp)
        if (this.destroyed || !this.options.visible) return
        if (this.conePrimitive && !modelMatrixUpdated) this.updatePrimitiveModelMatrix(animationSeconds)
      } finally {
        if (!this.destroyed && this.options.visible) {
          try {
            this.viewer.scene.requestRender()
          } finally {
            if (!this.renderFrame) this.renderFrame = window.requestAnimationFrame(tick)
          }
        }
      }
    }

    this.renderFrame = window.requestAnimationFrame(tick)
  }

  private stopRenderLoop(): void {
    if (!this.renderFrame || typeof window === 'undefined') {
      this.renderFrame = 0
      return
    }

    window.cancelAnimationFrame(this.renderFrame)
    this.renderFrame = 0
  }

  private resetExpansionState(): void {
    if (!this.options.expansion) {
      this.expansionState = createInitialScanConeExpansionState('idle')
      this.expansionPreviousTimestamp = null
      this.pausedByVisibility = false
      this.completionNotified = false
      return
    }

    const shouldRun = this.options.expansion.autoStart
    this.expansionState = createInitialScanConeExpansionState(
      shouldRun ? (this.options.visible ? 'running' : 'paused') : 'idle',
    )
    this.expansionPreviousTimestamp = null
    this.pausedByVisibility = shouldRun && !this.options.visible
    this.completionNotified = false
  }

  private advanceExpansion(timestamp: number): boolean {
    const expansion = this.options.expansion
    if (!expansion || this.expansionState.status !== 'running') return false

    const safeTimestamp = Number.isFinite(timestamp) ? timestamp : 0
    const previousTimestamp = this.expansionPreviousTimestamp
    const elapsedDelta = previousTimestamp === null ? 0 : Math.max(0, safeTimestamp - previousTimestamp)
    this.expansionPreviousTimestamp = previousTimestamp === null
      ? safeTimestamp
      : Math.max(previousTimestamp, safeTimestamp)
    const frame = sampleScanConeExpansionFrame(
      expansion,
      this.options.lengthMeters,
      this.expansionState.elapsedMs + elapsedDelta,
    )
    const completed = frame.elapsedMs >= expansion.durationMs
    this.expansionState = {
      ...frame,
      status: completed ? 'completed' : 'running',
    }
    this.updatePrimitiveModelMatrix(safeTimestamp / 1000)
    const callbackState = { ...this.expansionState }
    const notifyCompletion = completed && !this.completionNotified
    if (notifyCompletion) this.completionNotified = true
    if (completed) this.detachCameraFollowListeners()
    try {
      expansion.onFrame?.(callbackState)
    } finally {
      if (!this.destroyed && notifyCompletion) expansion.onComplete?.({ ...callbackState })
    }
    return true
  }

  private pauseExpansionForVisibility(): void {
    if (!this.options.expansion || this.expansionState.status !== 'running') return
    this.expansionState = { ...this.expansionState, status: 'paused' }
    this.expansionPreviousTimestamp = null
    this.pausedByVisibility = true
    this.stopExpansionCameraFollow(true)
    this.cameraFollowPlanned = false
  }

  private resumeExpansionAfterVisibilityPause(): void {
    if (!this.options.expansion || this.expansionState.status !== 'paused' || !this.pausedByVisibility) return
    this.expansionState = { ...this.expansionState, status: 'running' }
    this.expansionPreviousTimestamp = null
    this.pausedByVisibility = false
    this.startExpansionCameraFollow(this.getExpansionRemainingDurationMs())
  }

  private getExpansionRemainingDurationMs(): number {
    if (!this.options.expansion) return 0
    return Math.max(0, this.options.expansion.durationMs - this.expansionState.elapsedMs)
  }

  private startExpansionCameraFollow(durationMs: number): void {
    const expansion = this.options.expansion
    if (
      !expansion?.cameraFollow ||
      !this.options.visible ||
      this.expansionState.status !== 'running' ||
      this.cameraFollowPlanned ||
      this.cameraFollowCancelledByUser ||
      durationMs <= 0
    ) return

    this.cameraFollowPlanned = true
    const camera = this.viewer.camera
    let sphere: BoundingSphere
    let visibility: Intersect
    try {
      sphere = this.createFinalExpansionBoundingSphere(durationMs)
      const position = camera.positionWC ?? camera.position
      const direction = camera.directionWC ?? camera.direction
      const up = camera.upWC ?? camera.up
      visibility = camera.frustum
        .computeCullingVolume(position, direction, up)
        .computeVisibility(sphere)
    } catch {
      return
    }
    if (visibility === Intersect.INSIDE) return

    const heading = Number.isFinite(camera.heading) ? camera.heading : 0
    const pitch = Number.isFinite(camera.pitch)
      ? clamp(camera.pitch, -CesiumMath.PI_OVER_TWO + 0.01, CesiumMath.PI_OVER_TWO - 0.01)
      : -CesiumMath.PI_OVER_FOUR
    const framedSphere = new BoundingSphere(sphere.center, sphere.radius * 1.18)
    const generation = ++this.cameraFollowGeneration
    this.activeCameraFollowGeneration = generation
    this.attachCameraFollowListeners()
    try {
      camera.flyToBoundingSphere(framedSphere, {
        duration: durationMs / 1000,
        offset: new HeadingPitchRange(heading, pitch, 0),
        complete: () => this.releaseExpansionCameraFollow(generation),
        cancel: () => this.handleExpansionCameraFollowCancelled(generation),
      })
    } catch {
      this.releaseExpansionCameraFollow(generation)
    }
  }

  private createFinalExpansionBoundingSphere(durationMs: number): BoundingSphere {
    const expansion = this.options.expansion
    const radius = expansion?.maxRadiusMeters ?? this.options.radiusMeters
    const length = this.options.lengthMeters
    const finalHeading = this.options.heading +
      (getAnimationSeconds() + durationMs / 1000) * this.options.speed * 36
    const headingPitchRoll = HeadingPitchRoll.fromDegrees(finalHeading, this.options.pitch, 0)
    const transform = Transforms.headingPitchRollToFixedFrame(
      this.getOriginCartesian(),
      headingPitchRoll,
    )
    const localCenter = new Cartesian3(0, 0, length / 2)
    const center = Matrix4.multiplyByPoint(transform, localCenter, new Cartesian3())
    return new BoundingSphere(center, Math.hypot(radius, length / 2))
  }

  private attachCameraFollowListeners(): void {
    if (this.cameraFollowListenersAttached) return
    this.cameraFollowListenersAttached = true
    this.viewer.canvas.addEventListener('pointerdown', this.handleCameraFollowUserInput)
    this.viewer.canvas.addEventListener('wheel', this.handleCameraFollowUserInput)
    this.viewer.canvas.addEventListener('touchstart', this.handleCameraFollowUserInput)
  }

  private stopExpansionCameraFollow(cancelFlight: boolean): void {
    const generation = this.activeCameraFollowGeneration
    if (generation === null) {
      this.detachCameraFollowListeners()
      return
    }
    if (!cancelFlight) {
      this.releaseExpansionCameraFollow(generation)
      return
    }
    this.internallyCancellingCameraFollowGeneration = generation
    try {
      this.viewer.camera.cancelFlight()
    } catch {
      // Camera follow is optional; camera failures must not stop the effect lifecycle.
    } finally {
      this.releaseExpansionCameraFollow(generation)
      if (this.internallyCancellingCameraFollowGeneration === generation) {
        this.internallyCancellingCameraFollowGeneration = null
      }
    }
  }

  private handleExpansionCameraFollowCancelled(generation: number): void {
    if (this.activeCameraFollowGeneration !== generation) return
    if (this.internallyCancellingCameraFollowGeneration !== generation) {
      this.cameraFollowCancelledByUser = true
    }
    this.releaseExpansionCameraFollow(generation)
  }

  private releaseExpansionCameraFollow(generation: number): void {
    if (this.activeCameraFollowGeneration !== generation) return
    this.activeCameraFollowGeneration = null
    this.detachCameraFollowListeners()
  }

  private detachCameraFollowListeners(): void {
    if (!this.cameraFollowListenersAttached) return
    this.viewer.canvas.removeEventListener('pointerdown', this.handleCameraFollowUserInput)
    this.viewer.canvas.removeEventListener('wheel', this.handleCameraFollowUserInput)
    this.viewer.canvas.removeEventListener('touchstart', this.handleCameraFollowUserInput)
    this.cameraFollowListenersAttached = false
  }

  private createPrimitiveModelMatrix(
    animationSeconds: number,
    result: Matrix4 = this.primitiveModelMatrixScratch,
  ): Matrix4 {
    const heading = this.options.heading + animationSeconds * this.options.speed * 36
    HeadingPitchRoll.fromDegrees(heading, this.options.pitch, 0, this.primitiveHeadingPitchRollScratch)
    Transforms.headingPitchRollToFixedFrame(
      this.getOriginCartesian(this.primitiveOriginScratch),
      this.primitiveHeadingPitchRollScratch,
      undefined,
      undefined,
      result,
    )
    const radius = Math.max(0.000001, this.expansionState.radiusMeters)
    const length = Math.max(0.000001, this.expansionState.lengthMeters)
    Cartesian3.fromElements(0, 0, length / 2, this.primitiveTranslationScratch)
    Cartesian3.fromElements(radius, radius, length, this.primitiveScaleScratch)
    Matrix4.multiplyByTranslation(result, this.primitiveTranslationScratch, result)
    return Matrix4.multiplyByScale(result, this.primitiveScaleScratch, result)
  }

  private updatePrimitiveModelMatrix(animationSeconds: number): void {
    if (!this.conePrimitive) return
    this.createPrimitiveModelMatrix(animationSeconds, this.conePrimitive.modelMatrix)
  }

  private removeConePrimitive(): void {
    if (!this.conePrimitive) return
    this.viewer.scene.primitives.remove(this.conePrimitive)
    this.conePrimitive = null
    this.primitiveMaterial = null
  }
}

export class ShieldDomeEffect implements ShieldDomeEffectInstance {
  private readonly viewer: Viewer
  private readonly dataSource: CustomDataSource
  private options: NormalizedShieldDomeOptions
  private domeEntity: Entity | null = null
  private ringEntity: Entity | null = null
  private material: DynamicCesiumMaterialProperty | null = null
  private renderFrame = 0
  private destroyed = false

  constructor(viewer: Viewer, options: ShieldDomeOptions) {
    this.viewer = viewer
    this.options = normalizeShieldDomeOptions(options)
    this.dataSource = new CustomDataSource('geo-effect-kit-shield-dome')
    this.dataSource.show = this.options.visible
    this.viewer.dataSources.add(this.dataSource)
    this.renderEntities()
    this.startRenderLoop()
    this.viewer.scene.requestRender()
  }

  update(options: Partial<ShieldDomeOptions>): void {
    if (this.destroyed) return

    const next = normalizeShieldDomeOptions({
      ...this.options,
      ...options,
      center: options.center ?? this.options.center,
      radiusMeters: options.radiusMeters ?? this.options.radiusMeters,
      ring: options.ring ?? this.options.ring,
      visible: options.visible ?? this.options.visible,
    })
    const rebuildEntities = shouldRebuildShieldDome(this.options, next)
    this.options = next

    if (rebuildEntities) {
      this.renderEntities()
    } else {
      this.applyMaterialOptions()
      this.syncRingEntity()
    }

    this.dataSource.show = this.options.visible
    if (this.options.visible) this.startRenderLoop()
    else this.stopRenderLoop()
    this.viewer.scene.requestRender()
  }

  show(): void {
    if (this.destroyed) return
    this.options = { ...this.options, visible: true }
    this.dataSource.show = true
    this.startRenderLoop()
    this.viewer.scene.requestRender()
  }

  hide(): void {
    if (this.destroyed) return
    this.options = { ...this.options, visible: false }
    this.dataSource.show = false
    this.stopRenderLoop()
    this.viewer.scene.requestRender()
  }

  flyTo(options: ShieldDomeFlyToOptions = {}): void {
    if (this.destroyed) return

    const center = Cartesian3.fromDegrees(this.options.center.longitude, this.options.center.latitude, this.options.center.height ?? 0)
    this.viewer.camera.flyToBoundingSphere(new BoundingSphere(center, this.options.radiusMeters), {
      duration: options.duration ?? 1,
      offset: new HeadingPitchRange(0, options.pitch ?? -0.52, this.options.radiusMeters * (options.rangeMultiplier ?? 2.65)),
    })
  }

  destroy(): void {
    if (this.destroyed) return

    this.destroyed = true
    this.stopRenderLoop()
    this.dataSource.entities.removeAll()
    this.domeEntity = null
    this.ringEntity = null
    this.material = null
    this.viewer.dataSources.remove(this.dataSource, true)
    this.viewer.scene.requestRender()
  }

  isVisible(): boolean {
    return this.options.visible
  }

  isDestroyed(): boolean {
    return this.destroyed
  }

  getOptions(): NormalizedShieldDomeOptions {
    return {
      ...this.options,
      center: { ...this.options.center },
    }
  }

  private renderEntities(): void {
    clearEntities(this.dataSource)
    this.ringEntity = null
    this.material = createShieldDomeMaterialProperty(this.options)

    this.domeEntity = this.dataSource.entities.add({
      id: 'geo-effect-kit-shield-dome-shell',
      position: Cartesian3.fromDegrees(this.options.center.longitude, this.options.center.latitude, this.options.center.height ?? 0),
      ellipsoid: {
        radii: new Cartesian3(this.options.radiusMeters, this.options.radiusMeters, this.options.radiusMeters),
        maximumCone: CesiumMath.PI_OVER_TWO,
        stackPartitions: 64,
        slicePartitions: 96,
        material: this.material,
        outline: false,
      },
    })

    this.syncRingEntity()
  }

  private applyMaterialOptions(): void {
    if (!this.material) return

    this.material.uniforms.color = Color.fromCssColorString(this.options.color).withAlpha(1)
    this.material.uniforms.opacity = this.options.opacity
    this.material.uniforms.speed = this.options.speed
    this.material.uniforms.domeType = getShieldDomeTypeUniform(this.options.type)
    this.material.uniforms.gridDensity = this.options.gridDensity
    this.material.uniforms.pulseStrength = this.options.pulseStrength
  }

  private syncRingEntity(): void {
    if (!this.options.ring) {
      if (this.ringEntity) {
        this.dataSource.entities.remove(this.ringEntity)
        this.ringEntity = null
      }
      return
    }

    const ringMaterial = Color.fromCssColorString(this.options.color).withAlpha(0.11)
    if (this.ringEntity) {
      if (this.ringEntity.ellipse) {
        this.ringEntity.ellipse.semiMajorAxis = new ConstantProperty(this.options.radiusMeters)
        this.ringEntity.ellipse.semiMinorAxis = new ConstantProperty(this.options.radiusMeters)
        this.ringEntity.ellipse.material = new ColorMaterialProperty(ringMaterial)
        this.ringEntity.ellipse.outlineColor = new ConstantProperty(Color.fromCssColorString(this.options.color).withAlpha(0.82))
      }
      return
    }

    this.ringEntity = this.dataSource.entities.add({
      id: 'geo-effect-kit-shield-dome-ground-ring',
      position: Cartesian3.fromDegrees(this.options.center.longitude, this.options.center.latitude, this.options.center.height ?? 0),
      ellipse: {
        semiMajorAxis: this.options.radiusMeters,
        semiMinorAxis: this.options.radiusMeters,
        material: ringMaterial,
        outline: true,
        outlineColor: Color.fromCssColorString(this.options.color).withAlpha(0.82),
        outlineWidth: 2,
      },
    })
  }

  private startRenderLoop(): void {
    if (this.renderFrame || !this.options.visible || typeof window === 'undefined') return

    const tick = () => {
      if (this.destroyed || !this.options.visible) {
        this.renderFrame = 0
        return
      }
      this.viewer.scene.requestRender()
      this.renderFrame = window.requestAnimationFrame(tick)
    }

    this.renderFrame = window.requestAnimationFrame(tick)
  }

  private stopRenderLoop(): void {
    if (!this.renderFrame || typeof window === 'undefined') {
      this.renderFrame = 0
      return
    }

    window.cancelAnimationFrame(this.renderFrame)
    this.renderFrame = 0
  }
}

function registerRadarScanMaterial(options: NormalizedRadarScanOptions): void {
  type MaterialCache = {
    getMaterial: (type: string) => unknown
    addMaterial: (type: string, material: unknown) => void
  }

  const cache = (Material as unknown as { _materialCache?: MaterialCache })._materialCache
  if (!cache || cache.getMaterial(GEO_RADAR_SCAN_MATERIAL_TYPE)) return

  cache.addMaterial(GEO_RADAR_SCAN_MATERIAL_TYPE, {
    fabric: {
      type: GEO_RADAR_SCAN_MATERIAL_TYPE,
      uniforms: {
        color: Color.CYAN,
        opacity: options.opacity,
        ringsEnabled: options.rings ? 1 : 0,
        radarType: getRadarScanTypeUniform(options.type),
        scanDurationMs: options.scanDurationMs,
      },
      source: buildRadarScanMaterialSource(options),
    },
    translucent() {
      return true
    },
  })
}

function createRadarScanMaterial(options: NormalizedRadarScanOptions): Material {
  const material = Material.fromType(GEO_RADAR_SCAN_MATERIAL_TYPE, {
    color: Color.fromCssColorString(options.color).withAlpha(1),
    opacity: options.opacity,
    ringsEnabled: options.rings ? 1 : 0,
    radarType: getRadarScanTypeUniform(options.type),
    scanDurationMs: options.scanDurationMs,
  })

  return material
}

export function createRadarScanMaterialProperty(options: RadarScanOptions): DynamicCesiumMaterialProperty {
  const normalized = normalizeRadarScanOptions(options)
  registerRadarScanMaterial(normalized)
  return new DynamicCesiumMaterialProperty(GEO_RADAR_SCAN_MATERIAL_TYPE, {
    color: Color.fromCssColorString(normalized.color).withAlpha(1),
    opacity: normalized.opacity,
    ringsEnabled: normalized.rings ? 1 : 0,
    radarType: getRadarScanTypeUniform(normalized.type),
    scanDurationMs: normalized.scanDurationMs,
  })
}

function registerRippleSpreadMaterial(options: NormalizedRippleSpreadOptions): void {
  type MaterialCache = {
    getMaterial: (type: string) => unknown
    addMaterial: (type: string, material: unknown) => void
  }

  const cache = (Material as unknown as { _materialCache?: MaterialCache })._materialCache
  if (!cache || cache.getMaterial(GEO_RIPPLE_SPREAD_MATERIAL_TYPE)) return

  cache.addMaterial(GEO_RIPPLE_SPREAD_MATERIAL_TYPE, {
    fabric: {
      type: GEO_RIPPLE_SPREAD_MATERIAL_TYPE,
      uniforms: {
        color: Color.CYAN,
        opacity: options.opacity,
        rippleType: getRippleSpreadTypeUniform(options.type),
        ringCount: options.ringCount,
        durationMs: options.durationMs,
      },
      source: buildRippleSpreadMaterialSource(),
    },
    translucent() {
      return true
    },
  })
}

function createRippleSpreadMaterial(options: NormalizedRippleSpreadOptions): Material {
  const material = Material.fromType(GEO_RIPPLE_SPREAD_MATERIAL_TYPE, {
    color: Color.fromCssColorString(options.color).withAlpha(1),
    opacity: options.opacity,
    rippleType: getRippleSpreadTypeUniform(options.type),
    ringCount: options.ringCount,
    durationMs: options.durationMs,
  })

  return material
}

function registerTemperatureFieldMaterial(options: NormalizedTemperatureFieldOptions): void {
  registerMaterial(GEO_TEMPERATURE_FIELD_MATERIAL_TYPE, createTemperatureFieldUniforms(options), buildTemperatureFieldMaterialSource())
}

function createTemperatureFieldMaterial(options: NormalizedTemperatureFieldOptions): Material {
  return Material.fromType(GEO_TEMPERATURE_FIELD_MATERIAL_TYPE, createTemperatureFieldUniforms(options))
}

function createSceneWeatherUniforms(options: NormalizedSceneWeatherOptions): Record<string, unknown> {
  return {
    weatherType: getSceneWeatherTypeUniform(options.type),
    intensity: options.intensity,
    speed: options.speed,
    windDirection: options.windDirection,
    color: Color.fromCssColorString(options.color).withAlpha(1),
  }
}

function createPostProcessUniforms(options: NormalizedPostProcessOptions): Record<string, unknown> {
  return {
    effectType: getPostProcessTypeUniform(options.type),
    strength: options.strength,
    brightness: options.brightness,
    contrast: options.contrast,
    saturation: options.saturation,
  }
}

function createTemperatureFieldUniforms(options: NormalizedTemperatureFieldOptions): Record<string, unknown> {
  const stops = normalizeTemperatureFieldStops(options.stops)
  const seedVector = getTemperatureFieldSeedVector(options.seed)
  const hotSpot0 = getTemperatureFieldSpot(options.seed, 11, 0.14, 0.24)
  const hotSpot1 = getTemperatureFieldSpot(options.seed, 29, 0.1, 0.18)
  const coldSpot0 = getTemperatureFieldSpot(options.seed, 47, 0.18, 0.26)

  return {
    lowColor: Color.fromCssColorString(stops[0]?.color ?? '#57c7ff').withAlpha(1),
    lowerColor: Color.fromCssColorString(stops[1]?.color ?? '#6ddb73').withAlpha(1),
    mediumColor: Color.fromCssColorString(stops[2]?.color ?? '#ffd047').withAlpha(1),
    higherColor: Color.fromCssColorString(stops[3]?.color ?? '#ff8a2d').withAlpha(1),
    highColor: Color.fromCssColorString(stops[4]?.color ?? '#ff3e2f').withAlpha(1),
    opacity: options.opacity,
    noiseStrength: options.noiseStrength,
    contourLines: options.contourLines ? 1 : 0,
    contourStrength: options.contourStrength,
    seedVector,
    hotSpot0Center: hotSpot0.center,
    hotSpot0Radius: hotSpot0.radius,
    hotSpot0Strength: hotSpot0.strength,
    hotSpot1Center: hotSpot1.center,
    hotSpot1Radius: hotSpot1.radius,
    hotSpot1Strength: hotSpot1.strength,
    coldSpot0Center: coldSpot0.center,
    coldSpot0Radius: coldSpot0.radius,
    coldSpot0Strength: coldSpot0.strength,
    ...createTemperatureFieldSampleUniforms(options),
  }
}

export class DynamicCesiumMaterialProperty {
  readonly definitionChanged = new Event()
  readonly isConstant = false
  readonly uniforms: Record<string, unknown>
  private readonly type: string

  constructor(type: string, uniforms: Record<string, unknown>) {
    this.type = type
    this.uniforms = uniforms
  }

  getType(_time: JulianDate): string {
    return this.type
  }

  getValue(_time?: JulianDate, result: Record<string, unknown> = {}): Record<string, unknown> {
    return Object.assign(result, this.uniforms)
  }

  equals(other?: Property): boolean {
    return this === other
  }
}

function createLightWallMaterialProperty(options: NormalizedLightWallOptions): DynamicCesiumMaterialProperty {
  registerLightWallMaterial()
  return new DynamicCesiumMaterialProperty(GEO_LIGHT_WALL_MATERIAL_TYPE, {
    color: Color.fromCssColorString(options.color).withAlpha(1),
    opacity: options.opacity,
    speed: options.speed,
    wallType: getLightWallTypeUniform(options.type),
    scanLineCount: options.scanLineCount,
    breathing: options.breathing ? 1 : 0,
  })
}

export function createScanConeMaterialProperty(options: ScanConeOptions): DynamicCesiumMaterialProperty {
  const normalized = normalizeScanConeOptions(options)
  registerScanConeMaterial()
  return new DynamicCesiumMaterialProperty(GEO_SCAN_CONE_MATERIAL_TYPE, createScanConeMaterialUniforms(normalized))
}

function createScanConeMaterialUniforms(
  options: NormalizedScanConeOptions,
  timeSeconds = -1,
): Record<string, unknown> {
  return {
    color: Color.fromCssColorString(options.color).withAlpha(1),
    opacity: options.opacity,
    speed: options.speed,
    timeSeconds,
    coneType: getScanConeTypeUniform(options.type),
    aperture: options.aperture,
  }
}

function applyScanConeMaterialUniforms(
  uniforms: Record<string, unknown>,
  options: NormalizedScanConeOptions,
): void {
  const timeSeconds = typeof uniforms.timeSeconds === 'number' ? uniforms.timeSeconds : -1
  Object.assign(uniforms, createScanConeMaterialUniforms(options, timeSeconds))
}

function createShieldDomeMaterialProperty(options: NormalizedShieldDomeOptions): DynamicCesiumMaterialProperty {
  registerShieldDomeMaterial()
  return new DynamicCesiumMaterialProperty(GEO_SHIELD_DOME_MATERIAL_TYPE, {
    color: Color.fromCssColorString(options.color).withAlpha(1),
    opacity: options.opacity,
    speed: options.speed,
    domeType: getShieldDomeTypeUniform(options.type),
    gridDensity: options.gridDensity,
    pulseStrength: options.pulseStrength,
  })
}

function createWaterSurfaceMaterialProperty(options: NormalizedWaterSurfaceOptions): DynamicCesiumMaterialProperty {
  registerWaterSurfaceMaterial()
  return new DynamicCesiumMaterialProperty(GEO_WATER_SURFACE_MATERIAL_TYPE, createWaterSurfaceUniforms(options))
}

function createWaterSurfaceUniforms(options: NormalizedWaterSurfaceOptions): Record<string, unknown> {
  return {
    color: Color.fromCssColorString(options.color).withAlpha(1),
    opacity: options.opacity,
    speed: options.speed,
    waterType: getWaterSurfaceTypeUniform(options.type),
    waveStrength: options.waveStrength,
    reflectionStrength: options.reflectionStrength,
    distortionScale: options.distortionScale,
    reflectivity: options.reflectivity,
    refractionStrength: options.refractionStrength,
    fresnelPower: options.fresnelPower,
    flowDirection: options.flowDirection,
  }
}

function registerLightWallMaterial(): void {
  registerMaterial(GEO_LIGHT_WALL_MATERIAL_TYPE, {
    color: Color.CYAN,
    opacity: 0.72,
    speed: 1,
    wallType: 1,
    scanLineCount: 4,
    breathing: 1,
  }, buildLightWallMaterialSource())
}

function registerScanConeMaterial(): void {
  registerMaterial(GEO_SCAN_CONE_MATERIAL_TYPE, {
    color: Color.CYAN,
    opacity: 0.62,
    speed: 1,
    timeSeconds: -1,
    coneType: 1,
    aperture: 34,
  }, buildScanConeMaterialSource())
}

function registerShieldDomeMaterial(): void {
  registerMaterial(GEO_SHIELD_DOME_MATERIAL_TYPE, {
    color: Color.CYAN,
    opacity: 0.56,
    speed: 1,
    domeType: 1,
    gridDensity: 14,
    pulseStrength: 0.72,
  }, buildShieldDomeMaterialSource())
}

function registerWaterSurfaceMaterial(): void {
  registerMaterial(GEO_WATER_SURFACE_MATERIAL_TYPE, {
    color: Color.CYAN,
    opacity: 0.72,
    speed: 1,
    waterType: 1,
    waveStrength: 0.48,
    reflectionStrength: 0.36,
    distortionScale: 18,
    reflectivity: 0.58,
    refractionStrength: 0.42,
    fresnelPower: 4,
    flowDirection: 90,
  }, buildWaterSurfaceMaterialSource())
}

function registerMaterialPolylineMaterial(): void {
  registerMaterial(GEO_MATERIAL_POLYLINE_MATERIAL_TYPE, {
    color: Color.CYAN,
    secondaryColor: Color.WHITE,
    backgroundColor: Color.BLUE.withAlpha(0.35),
    image: getMaterialPolylinePresetImage('pulse'),
    speed: 1,
    repeatX: 4,
    repeatY: 1,
    styleType: 6,
  }, buildMaterialPolylineMaterialSource())
}

function registerMaterial(type: string, uniforms: Record<string, unknown>, source: string): void {
  type MaterialCache = {
    getMaterial: (materialType: string) => unknown
    addMaterial: (materialType: string, material: unknown) => void
  }

  const cache = (Material as unknown as { _materialCache?: MaterialCache })._materialCache
  if (!cache || cache.getMaterial(type)) return

  cache.addMaterial(type, {
    fabric: {
      type,
      uniforms,
      source,
    },
    translucent() {
      return true
    },
  })
}

function normalizeRadarScanType(type: RadarScanOptions['type']): RadarScanType {
  return RADAR_SCAN_TYPE_VALUES.includes(type as RadarScanType) ? (type as RadarScanType) : 'classic'
}

function normalizeRippleSpreadType(type: RippleSpreadOptions['type']): RippleSpreadType {
  return RIPPLE_SPREAD_TYPE_VALUES.includes(type as RippleSpreadType) ? (type as RippleSpreadType) : 'water'
}

function normalizeSceneWeatherType(type: SceneWeatherOptions['type']): SceneWeatherType {
  return SCENE_WEATHER_TYPE_VALUES.includes(type as SceneWeatherType) ? (type as SceneWeatherType) : 'rain'
}

function normalizePostProcessType(type: PostProcessOptions['type']): PostProcessType {
  return POST_PROCESS_TYPE_VALUES.includes(type as PostProcessType) ? (type as PostProcessType) : 'bloom'
}

function normalizePolylineFlowType(type: PolylineFlowOptions['type']): PolylineFlowType {
  return POLYLINE_FLOW_TYPE_VALUES.includes(type as PolylineFlowType) ? (type as PolylineFlowType) : 'dispatch'
}

function normalizeMaterialPolylineStyle(style: MaterialPolylineOptions['style']): MaterialPolylineStyle {
  return MATERIAL_POLYLINE_STYLE_VALUES.includes(style as MaterialPolylineStyle) ? (style as MaterialPolylineStyle) : 'flow'
}

function normalizeMaterialPolylineImagePreset(imagePreset: MaterialPolylineOptions['imagePreset']): MaterialPolylineImagePreset {
  return MATERIAL_POLYLINE_IMAGE_PRESET_VALUES.includes(imagePreset as MaterialPolylineImagePreset)
    ? (imagePreset as MaterialPolylineImagePreset)
    : 'pulse'
}

function normalizeMaterialPolylineRepeat(repeat: MaterialPolylineOptions['repeat']): NormalizedMaterialPolylineRepeat {
  return {
    x: clamp(finiteOr(repeat?.x ?? 4, 4), 1, 64),
    y: clamp(finiteOr(repeat?.y ?? 1, 1), 1, 16),
  }
}

function normalizeFlyLineMode(mode: FlyLineOptions['mode']): FlyLineMode {
  return FLY_LINE_MODE_VALUES.includes(mode as FlyLineMode) ? (mode as FlyLineMode) : 'single-arc'
}

function normalizeLightWallType(type: LightWallOptions['type']): LightWallType {
  return LIGHT_WALL_TYPE_VALUES.includes(type as LightWallType) ? (type as LightWallType) : 'security'
}

function normalizeScanConeType(type: ScanConeOptions['type']): ScanConeType {
  return SCAN_CONE_TYPE_VALUES.includes(type as ScanConeType) ? (type as ScanConeType) : 'searchlight'
}

function normalizeShieldDomeType(type: ShieldDomeOptions['type']): ShieldDomeType {
  return SHIELD_DOME_TYPE_VALUES.includes(type as ShieldDomeType) ? (type as ShieldDomeType) : 'hex'
}

function normalizeWaterSurfaceType(type: WaterSurfaceOptions['type']): WaterSurfaceType {
  return WATER_SURFACE_TYPE_VALUES.includes(type as WaterSurfaceType) ? (type as WaterSurfaceType) : 'river'
}

function getRadarScanTypeUniform(type: RadarScanType): number {
  if (type === 'classic') return 1
  if (type === 'sector') return 2
  if (type === 'pulse') return 3
  return 4
}

function getRippleSpreadTypeUniform(type: RippleSpreadType): number {
  if (type === 'water') return 1
  if (type === 'energy') return 2
  return 3
}

function getSceneWeatherTypeUniform(type: SceneWeatherType): number {
  if (type === 'rain') return 1
  if (type === 'snow') return 2
  if (type === 'fog') return 3
  return 4
}

function getPostProcessTypeUniform(type: PostProcessType): number {
  if (type === 'bloom') return 1
  if (type === 'night-vision') return 2
  if (type === 'black-white') return 3
  if (type === 'brightness') return 4
  if (type === 'mosaic') return 5
  return 6
}

function getMaterialPolylineStyleUniform(style: MaterialPolylineStyle): number {
  return MATERIAL_POLYLINE_STYLE_VALUES.indexOf(style) + 1
}

function getLightWallTypeUniform(type: LightWallType): number {
  if (type === 'security') return 1
  if (type === 'warning') return 2
  if (type === 'data') return 3
  if (type === 'fence') return 4
  return 5
}

function getScanConeTypeUniform(type: ScanConeType): number {
  if (type === 'searchlight') return 1
  if (type === 'radar') return 2
  if (type === 'camera') return 3
  if (type === 'drone') return 4
  return 5
}

function getShieldDomeTypeUniform(type: ShieldDomeType): number {
  if (type === 'hex') return 1
  if (type === 'plasma') return 2
  if (type === 'matrix') return 3
  if (type === 'aegis') return 4
  return 5
}

function getWaterSurfaceTypeUniform(type: WaterSurfaceType): number {
  if (type === 'river') return 1
  if (type === 'lake') return 2
  if (type === 'flood') return 3
  return 4
}

function isNativeMaterialPolylineStyle(style: MaterialPolylineStyle): boolean {
  return style === 'solid' || style === 'outline' || style === 'arrow' || style === 'dash' || style === 'dual-dash'
}

function getMaterialPolylinePresetImage(imagePreset: MaterialPolylineImagePreset): string {
  const presets: Record<MaterialPolylineImagePreset, string> = {
    pulse: createMaterialPolylineTextureDataUrl('pulse', '#ffffff', '#00ff66'),
    gradual: createMaterialPolylineTextureDataUrl('gradual', '#e8fff5', '#66bd63'),
    'arrow-blue': createMaterialPolylineTextureDataUrl('arrow-blue', '#ffffff', '#1f78ff'),
    rainbow: createMaterialPolylineTextureDataUrl('rainbow', '#ff4d4d', '#42e8ff'),
    'arrow-repeat': createMaterialPolylineTextureDataUrl('arrow-repeat', '#d9ffff', '#00d4ff'),
    dovetail: createMaterialPolylineTextureDataUrl('dovetail', '#e9ffd8', '#a6d96a'),
    'yellow-flow': createMaterialPolylineTextureDataUrl('yellow-flow', '#f2ff6a', '#95ff2f'),
    'transparent-flow': createMaterialPolylineTextureDataUrl('transparent-flow', '#59f9ff', '#0bfbff'),
    interval: createMaterialPolylineTextureDataUrl('interval', '#ffffff', '#59f9ff'),
    'small-arrow': createMaterialPolylineTextureDataUrl('small-arrow', '#ffffff', '#33f7ff'),
    gradient: createMaterialPolylineTextureDataUrl('gradient', '#ffffff', '#33f7ff'),
  }
  return presets[imagePreset]
}

function createMaterialPolylineTextureDataUrl(kind: MaterialPolylineImagePreset, first: string, second: string): string {
  const svg = getMaterialPolylineTextureSvg(kind, first, second)
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

function getMaterialPolylineTextureSvg(kind: MaterialPolylineImagePreset, first: string, second: string): string {
  if (kind === 'rainbow') {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="16" viewBox="0 0 128 16"><linearGradient id="g" x1="0" x2="1"><stop stop-color="#ff2347"/><stop offset=".25" stop-color="#ffec3d"/><stop offset=".5" stop-color="#4dff73"/><stop offset=".75" stop-color="#42e8ff"/><stop offset="1" stop-color="#b34dff"/></linearGradient><rect width="128" height="16" fill="none"/><path d="M0 8H128" stroke="url(#g)" stroke-width="11" stroke-linecap="round"/></svg>`
  }
  if (kind === 'arrow-blue' || kind === 'arrow-repeat' || kind === 'small-arrow') {
    const repeat = kind === 'small-arrow' ? 'M16 3l10 5-10 5V9H0V7h16z M48 3l10 5-10 5V9H32V7h16z M80 3l10 5-10 5V9H64V7h16z' : 'M42 2l22 6-22 6V9H0V7h42z M106 2l22 6-22 6V9H64V7h42z'
    return `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="16" viewBox="0 0 128 16"><rect width="128" height="16" fill="none"/><path d="${repeat}" fill="${second}" opacity=".95"/><path d="M0 8H128" stroke="${first}" stroke-width="2" opacity=".55"/></svg>`
  }
  if (kind === 'dovetail') {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="16" viewBox="0 0 128 16"><rect width="128" height="16" fill="none"/><path d="M0 2h38l10 6-10 6H0l10-6z M64 2h38l10 6-10 6H64l10-6z" fill="${second}" opacity=".88"/><path d="M0 8H128" stroke="${first}" stroke-width="2" opacity=".45"/></svg>`
  }
  if (kind === 'interval') {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="16" viewBox="0 0 128 16"><rect width="128" height="16" fill="none"/><path d="M0 8H18M32 8H50M64 8H82M96 8H114" stroke="${first}" stroke-width="8" stroke-linecap="round"/><path d="M18 8H32M50 8H64M82 8H96M114 8H128" stroke="${second}" stroke-width="4" stroke-linecap="round" opacity=".82"/></svg>`
  }
  if (kind === 'gradient') {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="16" viewBox="0 0 128 16"><linearGradient id="g" x1="0" x2="1"><stop stop-color="${second}" stop-opacity="0"/><stop offset=".55" stop-color="${second}" stop-opacity=".86"/><stop offset="1" stop-color="${first}"/></linearGradient><rect width="128" height="16" fill="none"/><path d="M0 8H128" stroke="url(#g)" stroke-width="10" stroke-linecap="round"/></svg>`
  }
  if (kind === 'transparent-flow') {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="16" viewBox="0 0 128 16"><linearGradient id="g" x1="0" x2="1"><stop stop-color="${second}" stop-opacity="0"/><stop offset=".45" stop-color="${second}" stop-opacity=".35"/><stop offset="1" stop-color="${first}" stop-opacity=".95"/></linearGradient><rect width="128" height="16" fill="none"/><path d="M0 8H128" stroke="url(#g)" stroke-width="9" stroke-linecap="round"/></svg>`
  }
  if (kind === 'yellow-flow') {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="16" viewBox="0 0 128 16"><rect width="128" height="16" fill="none"/><path d="M0 8H128" stroke="${second}" stroke-width="9" stroke-linecap="round" opacity=".72"/><path d="M64 8H128" stroke="${first}" stroke-width="5" stroke-linecap="round"/></svg>`
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="16" viewBox="0 0 128 16"><linearGradient id="g" x1="0" x2="1"><stop stop-color="${second}" stop-opacity="0"/><stop offset=".62" stop-color="${second}" stop-opacity=".78"/><stop offset="1" stop-color="${first}"/></linearGradient><rect width="128" height="16" fill="none"/><path d="M0 8H128" stroke="url(#g)" stroke-width="10" stroke-linecap="round"/><circle cx="108" cy="8" r="5" fill="${first}"/></svg>`
}

function getPolylineFlowColor(type: PolylineFlowType, color: string): Color {
  const base = Color.fromCssColorString(color)
  if (type === 'migration') return Color.lerp(base, Color.fromCssColorString('#b8ff58'), 0.28, new Color())
  if (type === 'attack') return Color.lerp(base, Color.fromCssColorString('#ff315a'), 0.42, new Color())
  if (type === 'comet') return Color.lerp(base, Color.fromCssColorString('#ffffff'), 0.32, new Color())
  if (type === 'electric') return Color.lerp(base, Color.fromCssColorString('#9b6dff'), 0.38, new Color())
  return base
}

function getPolylineFlowProfile(type: PolylineFlowType): { tail: number; power: number } {
  if (type === 'migration') return { tail: 2, power: 1 }
  if (type === 'attack') return { tail: 1.6, power: 1.35 }
  if (type === 'comet') return { tail: 1.72, power: 1 }
  if (type === 'electric') return { tail: 1.35, power: 0.72 }
  return { tail: 1.72, power: 1 }
}

function getTrailSampleCount(type: PolylineFlowType): number {
  if (type === 'attack') return 5
  if (type === 'electric') return 9
  if (type === 'migration') return 8
  return 7
}

function getFlyLineBaseSampleCount(mode: FlyLineMode): number {
  if (mode === 'hub-spoke') return 28
  if (mode === 'bidirectional') return 30
  return 26
}

function getFlyLineTrailSampleCount(mode: FlyLineMode): number {
  if (mode === 'hub-spoke') return 8
  if (mode === 'bidirectional') return 7
  return 6
}

function getFlyLineSpeedScale(mode: FlyLineMode): number {
  if (mode === 'hub-spoke') return 0.24
  if (mode === 'bidirectional') return 0.28
  return 0.22
}

function getFlyLineBaseColor(mode: FlyLineMode, color: string): Color {
  const base = Color.fromCssColorString(color)
  if (mode === 'hub-spoke') return Color.lerp(base, Color.fromCssColorString('#ff58c8'), 0.18, new Color())
  if (mode === 'bidirectional') return Color.lerp(base, Color.WHITE, 0.16, new Color())
  return base
}

function getFlyLineTrailColor(mode: FlyLineMode, color: string): Color {
  const base = Color.fromCssColorString(color)
  if (mode === 'hub-spoke') return Color.lerp(base, Color.fromCssColorString('#ff58c8'), 0.34, new Color())
  if (mode === 'bidirectional') return Color.lerp(base, Color.fromCssColorString('#e8ff72'), 0.3, new Color())
  return Color.lerp(base, Color.WHITE, 0.18, new Color())
}

function getPipeLayerWidth(width: number, multiplier: number): number {
  return Math.max(1, Math.round(width * multiplier * 1000) / 1000)
}

function getConeBottomRadius(options: NormalizedScanConeOptions): number {
  const apertureRadius = Math.tan(CesiumMath.toRadians(options.aperture) / 2) * options.lengthMeters
  return Math.max(options.radiusMeters, apertureRadius)
}

function createInitialScanConeExpansionState(
  status: ScanConeExpansionState['status'],
): ScanConeExpansionState {
  return {
    status,
    progress: 0,
    radiusMeters: 0,
    lengthMeters: 0,
    elapsedMs: 0,
  }
}

function normalizePositions(positions: GeoEffectPosition[], close: boolean): GeoEffectPosition[] {
  const normalized = (positions.length ? positions : [{ longitude: 0, latitude: 0 }]).map(normalizePosition)
  const onlyPosition = normalized[0]
  if (normalized.length === 1 && onlyPosition) normalized.push({ ...onlyPosition })

  if (close && normalized.length > 2) {
    const first = normalized[0]
    const last = normalized[normalized.length - 1]
    if (first && last && !positionEqual(first, last)) normalized.push({ ...first })
  }

  return normalized
}

function normalizeFlyLineRoutes(lines: FlyLineRoute[]): FlyLineRoute[] {
  const fallback = {
    from: { longitude: 0, latitude: 0 },
    to: { longitude: 0, latitude: 0 },
  }
  return (lines.length ? lines : [fallback]).map((line) => ({
    from: normalizePosition(line.from),
    to: normalizePosition(line.to),
  }))
}

function normalizePosition(position: GeoEffectPosition): GeoEffectPosition {
  const normalized: GeoEffectPosition = {
    longitude: finiteOr(position.longitude, 0),
    latitude: finiteOr(position.latitude, 0),
  }
  if (position.height !== undefined) normalized.height = finiteOr(position.height, 0)
  return normalized
}

function normalizeFireBillboardPoints(points: FireBillboardPoint[]): NormalizedFireBillboardPoint[] {
  return points
    .filter((point) => typeof point.gif === 'string' && point.gif.trim().length > 0)
    .map((point) => {
      const normalized: NormalizedFireBillboardPoint = {
        longitude: finiteOr(point.longitude, 0),
        latitude: finiteOr(point.latitude, 0),
        height: finiteOr(point.height ?? 0, 0),
        gif: point.gif.trim(),
      }
      if (point.id) normalized.id = point.id
      if (point.label) normalized.label = point.label
      return normalized
    })
}

function cloneFireBillboardPoints(points: NormalizedFireBillboardPoint[]): NormalizedFireBillboardPoint[] {
  return points.map((point) => ({ ...point }))
}

function fireBillboardPointsEqual(left: NormalizedFireBillboardPoint[], right: NormalizedFireBillboardPoint[]): boolean {
  if (left.length !== right.length) return false
  return left.every((point, index) => {
    const other = right[index]
    return (
      other !== undefined &&
      point.longitude === other.longitude &&
      point.latitude === other.latitude &&
      (point.height ?? 0) === (other.height ?? 0) &&
      point.gif === other.gif &&
      point.id === other.id &&
      point.label === other.label
    )
  })
}

function normalizeTemperatureFieldPolygons(polygons: TemperatureFieldPolygon[]): Required<TemperatureFieldPolygon>[] {
  return polygons
    .map((polygon) => ({
      outer: normalizeTemperatureRing(polygon.outer),
      holes: (polygon.holes ?? []).map(normalizeTemperatureRing).filter((hole) => hole.length >= 3),
    }))
    .filter((polygon) => polygon.outer.length >= 3)
}

function normalizeTemperatureRing(ring: TemperatureFieldCoordinate[]): TemperatureFieldCoordinate[] {
  return ring.map(([longitude, latitude]) => [finiteOr(longitude, 0), finiteOr(latitude, 0)])
}

function normalizeTemperatureFieldStops(stops: TemperatureFieldStop[] = getDefaultTemperatureFieldStops()): Required<TemperatureFieldStop>[] {
  const sortedStops = [...(stops.length ? stops : getDefaultTemperatureFieldStops())]
    .map((stop) => ({
      value: clamp(finiteOr(stop.value, 0), 0, 100),
      color: stop.color || '#57c7ff',
      label: stop.label ?? '',
    }))
    .sort((a, b) => a.value - b.value)

  if (sortedStops.length >= 5) {
    return sortedStops.slice(0, 5) as Required<TemperatureFieldStop>[]
  }

  const defaults = getDefaultTemperatureFieldStops()
  return defaults.map((fallback, index) => sortedStops[index] ?? fallback)
}

function getDefaultTemperatureFieldStops(): Required<TemperatureFieldStop>[] {
  return [
    { value: 0, color: '#57c7ff', label: 'low' },
    { value: 20, color: '#6ddb73', label: 'lower' },
    { value: 40, color: '#ffd047', label: 'medium' },
    { value: 60, color: '#ff8a2d', label: 'higher' },
    { value: 100, color: '#ff3e2f', label: 'high' },
  ]
}

function normalizeTemperatureFieldSamples(samples: TemperatureFieldSample[] = []): Required<TemperatureFieldSample>[] {
  return samples
    .map((sample) => ({
      longitude: finiteOr(sample.longitude, 0),
      latitude: finiteOr(sample.latitude, 0),
      value: clamp(finiteOr(sample.value, 0), 0, 100),
      type: sample.type ?? '',
    }))
    .filter((sample) => sample.longitude >= -180 && sample.longitude <= 180 && sample.latitude >= -90 && sample.latitude <= 90)
    .slice(0, 16)
}

function normalizeTemperatureFieldBounds(bounds?: TemperatureFieldBounds): TemperatureFieldBounds | null {
  if (!bounds) return null
  return {
    west: finiteOr(bounds.west, 0),
    south: finiteOr(bounds.south, 0),
    east: finiteOr(bounds.east, 0),
    north: finiteOr(bounds.north, 0),
  }
}

function getTemperatureFieldBounds(polygons: Required<TemperatureFieldPolygon>[]): TemperatureFieldBounds | null {
  const points = polygons.flatMap((polygon) => [polygon.outer, ...polygon.holes]).flat()
  if (points.length === 0) return null

  return points.reduce<TemperatureFieldBounds>(
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

function normalizeSeed(seed?: number): number {
  const value = finiteOr(seed ?? 0, 0)
  return Math.max(0, Math.floor(value))
}

function temperatureFieldPolygonsEqual(
  left: Required<TemperatureFieldPolygon>[],
  right: Required<TemperatureFieldPolygon>[],
): boolean {
  if (left.length !== right.length) return false
  return left.every((polygon, index) => {
    const other = right[index]
    if (!other) return false
    if (!temperatureRingsEqual(polygon.outer, other.outer)) return false
    if (polygon.holes.length !== other.holes.length) return false
    return polygon.holes.every((hole, holeIndex) => temperatureRingsEqual(hole, other.holes[holeIndex] ?? []))
  })
}

function temperatureRingsEqual(left: TemperatureFieldCoordinate[], right: TemperatureFieldCoordinate[]): boolean {
  if (left.length !== right.length) return false
  return left.every((point, index) => {
    const other = right[index]
    return other !== undefined && point[0] === other[0] && point[1] === other[1]
  })
}

function cloneTemperatureFieldOptions(options: NormalizedTemperatureFieldOptions): NormalizedTemperatureFieldOptions {
  return {
    ...options,
    bounds: options.bounds ? { ...options.bounds } : null,
    polygons: options.polygons.map((polygon) => ({
      outer: polygon.outer.map(([longitude, latitude]) => [longitude, latitude]),
      holes: polygon.holes.map((hole) => hole.map(([longitude, latitude]) => [longitude, latitude])),
    })),
    stops: options.stops.map((stop) => ({ ...stop })),
    samples: options.samples.map((sample) => ({ ...sample })),
  }
}

function isTemperatureRingClosed(ring: TemperatureFieldCoordinate[]): boolean {
  const first = ring[0]
  const last = ring[ring.length - 1]
  return Boolean(first && last && first[0] === last[0] && first[1] === last[1])
}

function getTemperatureFieldSeedVector(seed: number): Cartesian4 {
  const angle = seededUnit(seed, 3) * Math.PI * 2
  return new Cartesian4(
    Math.cos(angle),
    Math.sin(angle),
    seededUnit(seed, 7),
    seededUnit(seed, 13),
  )
}

function getTemperatureFieldSpot(
  seed: number,
  offset: number,
  minRadius: number,
  maxRadius: number,
): { center: Cartesian2; radius: number; strength: number } {
  return {
    center: new Cartesian2(0.18 + seededUnit(seed, offset) * 0.64, 0.16 + seededUnit(seed, offset + 5) * 0.68),
    radius: minRadius + seededUnit(seed, offset + 11) * (maxRadius - minRadius),
    strength: 0.12 + seededUnit(seed, offset + 17) * 0.24,
  }
}

function createTemperatureFieldSampleUniforms(options: NormalizedTemperatureFieldOptions): Record<string, unknown> {
  const uniforms: Record<string, unknown> = {
    sampleCount: options.bounds ? options.samples.length : 0,
  }
  for (let index = 0; index < 16; index += 1) {
    const sample = options.samples[index]
    uniforms[`sample${index}`] =
      sample && options.bounds ? getTemperatureFieldSampleVector(sample, options.bounds, index) : new Cartesian4(0, 0, 0, 0)
  }
  return uniforms
}

function getTemperatureFieldSampleVector(
  sample: Required<TemperatureFieldSample>,
  bounds: TemperatureFieldBounds,
  index: number,
): Cartesian4 {
  const width = Math.max(0.000001, bounds.east - bounds.west)
  const height = Math.max(0.000001, bounds.north - bounds.south)
  return new Cartesian4(
    clamp01((sample.longitude - bounds.west) / width),
    clamp01((sample.latitude - bounds.south) / height),
    sample.value / 100,
    0.4 + seededUnit(Math.round(sample.value * 10), index + 101) * 0.6,
  )
}

function seededUnit(seed: number, offset: number): number {
  const value = Math.sin((seed + 1) * (offset + 12.9898) * 78.233) * 43_758.5453
  return fract(value)
}

function clonePositions(positions: GeoEffectPosition[]): GeoEffectPosition[] {
  return positions.map((position) => ({ ...position }))
}

function cloneFlyLineRoutes(lines: FlyLineRoute[]): FlyLineRoute[] {
  return lines.map((line) => ({
    from: { ...line.from },
    to: { ...line.to },
  }))
}

function positionsEqual(left: GeoEffectPosition[], right: GeoEffectPosition[]): boolean {
  if (left.length !== right.length) return false
  return left.every((position, index) => {
    const other = right[index]
    return other !== undefined && positionEqual(position, other)
  })
}

function flyLineRoutesEqual(left: FlyLineRoute[], right: FlyLineRoute[]): boolean {
  if (left.length !== right.length) return false
  return left.every((line, index) => {
    const other = right[index]
    return other !== undefined && positionEqual(line.from, other.from) && positionEqual(line.to, other.to)
  })
}

function uniqueFlyLineEndpoints(lines: FlyLineRoute[]): GeoEffectPosition[] {
  const endpoints: GeoEffectPosition[] = []
  normalizeFlyLineRoutes(lines).forEach((line) => {
    pushDistinctEndpoint(endpoints, line.from)
    pushDistinctEndpoint(endpoints, line.to)
  })
  return endpoints
}

function pushDistinctEndpoint(endpoints: GeoEffectPosition[], position: GeoEffectPosition): void {
  if (!endpoints.some((endpoint) => positionEqual(endpoint, position))) endpoints.push({ ...position })
}

function positionEqual(left: GeoEffectPosition, right: GeoEffectPosition): boolean {
  return (
    left.longitude === right.longitude &&
    left.latitude === right.latitude &&
    (left.height ?? 0) === (right.height ?? 0)
  )
}

function positionsToCartesians(positions: GeoEffectPosition[]): Cartesian3[] {
  return positions.map((position) => Cartesian3.fromDegrees(position.longitude, position.latitude, position.height ?? 0))
}

function positionsToCartesiansAtHeight(positions: GeoEffectPosition[], heightOffset: number): Cartesian3[] {
  return positions.map((position) => Cartesian3.fromDegrees(position.longitude, position.latitude, (position.height ?? 0) + heightOffset))
}

function roundPolylineCorners(positions: GeoEffectPosition[], radius: number): GeoEffectPosition[] {
  if (radius <= 0 || positions.length < 3) return positions

  const rounded: GeoEffectPosition[] = [{ ...(positions[0] ?? { longitude: 0, latitude: 0 }) }]
  for (let index = 1; index < positions.length - 1; index += 1) {
    const previous = positions[index - 1]
    const corner = positions[index]
    const next = positions[index + 1]
    if (!previous || !corner || !next || positionEqual(previous, corner) || positionEqual(corner, next)) {
      if (corner) rounded.push({ ...corner })
      continue
    }

    const before = lerpPosition(corner, previous, radius)
    const after = lerpPosition(corner, next, radius)
    pushDistinctPosition(rounded, before)
    for (let step = 1; step < 6; step += 1) {
      const amount = step / 6
      pushDistinctPosition(rounded, quadraticBezierPosition(before, corner, after, amount))
    }
    pushDistinctPosition(rounded, after)
  }
  pushDistinctPosition(rounded, { ...(positions[positions.length - 1] ?? positions[0] ?? { longitude: 0, latitude: 0 }) })
  return rounded
}

function lerpPosition(start: GeoEffectPosition, end: GeoEffectPosition, amount: number): GeoEffectPosition {
  const t = clamp01(amount)
  return {
    longitude: lerp(start.longitude, end.longitude, t),
    latitude: lerp(start.latitude, end.latitude, t),
    height: lerp(start.height ?? 0, end.height ?? 0, t),
  }
}

function quadraticBezierPosition(
  start: GeoEffectPosition,
  control: GeoEffectPosition,
  end: GeoEffectPosition,
  amount: number,
): GeoEffectPosition {
  const t = clamp01(amount)
  const inverse = 1 - t
  return {
    longitude: inverse * inverse * start.longitude + 2 * inverse * t * control.longitude + t * t * end.longitude,
    latitude: inverse * inverse * start.latitude + 2 * inverse * t * control.latitude + t * t * end.latitude,
    height: inverse * inverse * (start.height ?? 0) + 2 * inverse * t * (control.height ?? 0) + t * t * (end.height ?? 0),
  }
}

function pushDistinctPosition(positions: GeoEffectPosition[], position: GeoEffectPosition): void {
  const previous = positions[positions.length - 1]
  if (!previous || !positionEqual(previous, position)) positions.push(position)
}

function clearEntities(dataSource: CustomDataSource): void {
  if (dataSource.entities.values.length > 0) dataSource.entities.removeAll()
}

const gifFrameImageCache = new Map<string, Promise<string[]>>()
const GIF_FETCH_TIMEOUT_MS = 5000

function loadGifFrameImages(gif: string): Promise<string[]> {
  const cached = gifFrameImageCache.get(gif)
  if (cached) return cached

  const promise = decodeGifFrameImages(gif).catch(() => {
    gifFrameImageCache.delete(gif)
    return [gif]
  })
  gifFrameImageCache.set(gif, promise)
  return promise
}

async function decodeGifFrameImages(gif: string): Promise<string[]> {
  if (typeof fetch !== 'function' || typeof document === 'undefined') return [gif]

  const response = await fetchWithTimeout(gif, GIF_FETCH_TIMEOUT_MS)
  if (!response.ok) throw new Error(`Failed to load GIF: ${response.status}`)

  const buffer = await response.arrayBuffer()
  const parsed = parseGIF(buffer)
  const frames = decompressFrames(parsed, true)
  if (frames.length <= 1) return [gif]

  return renderGifFramesToDataUrls(frames, parsed.lsd.width, parsed.lsd.height, gif)
}

function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
  if (typeof AbortController !== 'function') return fetch(url)

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  return fetch(url, { signal: controller.signal }).finally(() => {
    clearTimeout(timer)
  })
}

function renderGifFramesToDataUrls(frames: ParsedFrame[], width: number, height: number, fallback: string): string[] {
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, finiteOr(width, 1))
  canvas.height = Math.max(1, finiteOr(height, 1))
  const context = canvas.getContext('2d')
  if (!context) return [fallback]

  const previousCanvas = document.createElement('canvas')
  previousCanvas.width = canvas.width
  previousCanvas.height = canvas.height
  const previousContext = previousCanvas.getContext('2d')
  const imageUrls: string[] = []

  frames.forEach((frame) => {
    const previousImage = frame.disposalType === 3 && previousContext ? context.getImageData(0, 0, canvas.width, canvas.height) : null
    const imageData = context.createImageData(frame.dims.width, frame.dims.height)
    imageData.data.set(frame.patch)
    context.putImageData(imageData, frame.dims.left, frame.dims.top)
    imageUrls.push(canvas.toDataURL('image/png'))

    if (frame.disposalType === 2) {
      context.clearRect(frame.dims.left, frame.dims.top, frame.dims.width, frame.dims.height)
    } else if (frame.disposalType === 3 && previousImage && previousContext) {
      previousContext.putImageData(previousImage, 0, 0)
      context.clearRect(0, 0, canvas.width, canvas.height)
      context.drawImage(previousCanvas, 0, 0)
    }
  })

  return imageUrls.length > 0 ? imageUrls : [fallback]
}

function getPositionBounds(positions: GeoEffectPosition[], fallbackRadius: number): { center: Cartesian3; radius: number } {
  const cartesians = positionsToCartesians(positions)
  const sphere = BoundingSphere.fromPoints(cartesians)
  return {
    center: sphere.center,
    radius: Math.max(fallbackRadius, sphere.radius),
  }
}

export function expandFlyLineRoutes(lines: FlyLineRoute[], mode: FlyLineMode | string = 'single-arc'): FlyLineRoute[] {
  const routes = normalizeFlyLineRoutes(lines)
  if (normalizeFlyLineMode(mode) !== 'bidirectional') return cloneFlyLineRoutes(routes)

  return routes.flatMap((line) => [
    { from: { ...line.from }, to: { ...line.to } },
    { from: { ...line.to }, to: { ...line.from } },
  ])
}

export function sampleFlyLineArc(line: FlyLineRoute, arcHeight = 38000, sampleCount = 28): GeoEffectPosition[] {
  const route = normalizeFlyLineRoutes([line])[0]
  if (!route) return []

  const samples = clampInteger(finiteOr(sampleCount, 28), 2, 96)
  const height = Math.max(0, finiteOr(arcHeight, 0))
  const fromHeight = route.from.height ?? 0
  const toHeight = route.to.height ?? 0
  const control: GeoEffectPosition = {
    longitude: (route.from.longitude + route.to.longitude) / 2,
    latitude: (route.from.latitude + route.to.latitude) / 2,
    height: Math.max(fromHeight, toHeight) + height * 2,
  }

  return Array.from({ length: samples }, (_, index) => {
    if (index === 0) return { ...route.from }
    if (index === samples - 1) return { ...route.to }
    const amount = index / Math.max(1, samples - 1)
    return quadraticBezierPosition(route.from, control, route.to, amount)
  })
}

export function sampleFlyLineTrail(
  line: FlyLineRoute,
  arcHeight: number,
  progress: number,
  trailLength: number,
  sampleCount: number,
): GeoEffectPosition[] {
  const arc = sampleFlyLineArc(line, arcHeight, Math.max(24, sampleCount * 4))
  return samplePolylineTrail(arc, progress, trailLength, sampleCount)
}

function samplePolylineTrail(
  positions: GeoEffectPosition[],
  progress: number,
  trailLength: number,
  sampleCount: number,
): GeoEffectPosition[] {
  const safePositions = normalizePositions(positions, false)
  const samples = clampInteger(sampleCount, 2, 16)
  const distances = getPolylineCumulativeDistances(safePositions)
  const totalDistance = distances[distances.length - 1] ?? 0
  if (totalDistance <= 0) return safePositions

  const head = fract(progress) * totalDistance
  const length = clamp01(trailLength) * totalDistance
  const start = Math.max(0, head - length)
  const sampledDistances = Array.from({ length: samples }, (_, index) => {
    const amount = index / Math.max(1, samples - 1)
    return lerp(start, head, amount)
  })
  const vertexDistances = distances.filter((distance) => distance > start && distance < head)
  const targetDistances = uniqueSortedDistances([...sampledDistances, ...vertexDistances])
  return targetDistances.map((distance) => interpolatePolylinePosition(safePositions, distances, distance))
}

function getPolylineCumulativeDistances(positions: GeoEffectPosition[]): number[] {
  const distances = [0]
  for (let index = 1; index < positions.length; index += 1) {
    const previous = positions[index - 1]
    const current = positions[index]
    if (!previous || !current) continue
    const previousCartesian = Cartesian3.fromDegrees(previous.longitude, previous.latitude, previous.height ?? 0)
    const currentCartesian = Cartesian3.fromDegrees(current.longitude, current.latitude, current.height ?? 0)
    distances.push((distances[distances.length - 1] ?? 0) + Cartesian3.distance(previousCartesian, currentCartesian))
  }
  return distances
}

function interpolatePolylinePosition(
  positions: GeoEffectPosition[],
  distances: number[],
  targetDistance: number,
): GeoEffectPosition {
  if (targetDistance <= 0) return { ...(positions[0] ?? { longitude: 0, latitude: 0 }) }

  for (let index = 1; index < distances.length; index += 1) {
    const previousDistance = distances[index - 1] ?? 0
    const currentDistance = distances[index] ?? previousDistance
    if (targetDistance > currentDistance) continue

    const previous = positions[index - 1] ?? positions[0]
    const current = positions[index] ?? previous
    if (!previous || !current) return { longitude: 0, latitude: 0 }
    const span = Math.max(1, currentDistance - previousDistance)
    const t = clamp01((targetDistance - previousDistance) / span)
    return {
      longitude: lerp(previous.longitude, current.longitude, t),
      latitude: lerp(previous.latitude, current.latitude, t),
      height: lerp(previous.height ?? 0, current.height ?? 0, t),
    }
  }

  return { ...(positions[positions.length - 1] ?? positions[0] ?? { longitude: 0, latitude: 0 }) }
}

function uniqueSortedDistances(distances: number[]): number[] {
  const epsilon = 1e-6
  return [...distances].sort((first, second) => first - second).filter((distance, index, sorted) => {
    const previous = sorted[index - 1]
    return previous === undefined || Math.abs(distance - previous) > epsilon
  })
}

function getAnimationSeconds(): number {
  if (typeof performance !== 'undefined') return performance.now() / 1000
  return Date.now() / 1000
}

function fract(value: number): number {
  return value - Math.floor(value)
}

function lerp(start: number, end: number, amount: number): number {
  return start + (end - start) * amount
}

function roundWeight(value: number): number {
  return Math.round(value * 100) / 100
}

function finiteOr(value: number, fallback: number): number {
  return Number.isFinite(value) ? value : fallback
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function clampInteger(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.round(value)))
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value))
}
