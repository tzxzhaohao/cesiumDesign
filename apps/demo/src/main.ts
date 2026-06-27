import 'cesium/Build/Cesium/Widgets/widgets.css'
import './styles.css'

import {
  BoundingSphere,
  Cartesian2,
  Cartesian3,
  CesiumTerrainProvider,
  Color,
  CustomDataSource,
  HeadingPitchRange,
  ImageryLayer,
  Ion,
  PointGraphics,
  Viewer,
  WebMapTileServiceImageryProvider,
} from 'cesium'
import {
  createFlyLineEffect,
  createLightWallEffect,
  createPipeFlowEffect,
  createPostProcessEffect,
  createPolylineFlowEffect,
  createRadarScanEffect,
  createRippleSpreadEffect,
  createScanConeEffect,
  createSceneWeatherEffect,
  createShieldDomeEffect,
  createTemperatureFieldEffect,
  createFireBillboardEffect,
  createWaterSurfaceEffect,
  type FireBillboardEffectInstance,
  type FlyLineEffectInstance,
  type FlyLineMode,
  type LightWallEffectInstance,
  type LightWallType,
  type PipeFlowEffectInstance,
  type PostProcessEffectInstance,
  type PostProcessType,
  type PolylineFlowEffectInstance,
  type PolylineFlowType,
  type RadarScanEffectInstance,
  type RadarScanType,
  type RippleSpreadEffectInstance,
  type RippleSpreadType,
  type ScanConeEffectInstance,
  type ScanConeType,
  type SceneWeatherEffectInstance,
  type SceneWeatherType,
  type ShieldDomeEffectInstance,
  type ShieldDomeType,
  type TemperatureFieldEffectInstance,
  type TemperatureFieldPolygon,
  type TemperatureFieldSample,
  type WaterSurfaceEffectInstance,
  type WaterSurfaceType,
} from '@ztgkzhaohao/geo-effect-kit'
import {
  createRandomTemperatureSamples,
  fallbackBeijingTemperatureFieldPolygons,
  parseTiandituAdministrativePolygons,
  temperatureFieldStops,
  temperatureSampleConfigs,
} from './temperature-field-data'

type EffectId =
  | 'radar-scan'
  | 'ripple-spread'
  | 'polyline-flow'
  | 'fly-line'
  | 'pipe-flow'
  | 'scene-weather'
  | 'post-process'
  | 'water-surface'
  | 'light-wall'
  | 'scan-cone'
  | 'shield-dome'
  | 'temperature-field'
  | 'fire-billboard'
const codeTemplates = ['typescript', 'react', 'vue'] as const
type CodeTemplate = (typeof codeTemplates)[number]
type ActiveEffect =
  | RadarScanEffectInstance
  | RippleSpreadEffectInstance
  | PolylineFlowEffectInstance
  | FlyLineEffectInstance
  | PipeFlowEffectInstance
  | SceneWeatherEffectInstance
  | PostProcessEffectInstance
  | WaterSurfaceEffectInstance
  | LightWallEffectInstance
  | ScanConeEffectInstance
  | ShieldDomeEffectInstance
  | TemperatureFieldEffectInstance
  | FireBillboardEffectInstance
type TemperatureFieldSource = 'fallback' | 'tianditu'
type GeoPosition = { longitude: number; latitude: number }
type YongdingRiverWaterSegment = {
  name: string
  source: string
  centerline: GeoPosition[]
  channelWidthMeters: number
  height: number
  flowDirection: number
}
type ControlId =
  | 'colorField'
  | 'radarTypeField'
  | 'rippleTypeField'
  | 'flowTypeField'
  | 'flyModeField'
  | 'wallTypeField'
  | 'coneTypeField'
  | 'domeTypeField'
  | 'weatherTypeField'
  | 'postProcessTypeField'
  | 'waterTypeField'
  | 'radiusField'
  | 'widthField'
  | 'heightField'
  | 'lengthField'
  | 'speedField'
  | 'scaleField'
  | 'scanDurationField'
  | 'frameIntervalField'
  | 'ringCountField'
  | 'durationField'
  | 'trailLengthField'
  | 'pulseCountField'
  | 'cornerRadiusField'
  | 'pipeOpacityField'
  | 'bubbleDensityField'
  | 'scanLineCountField'
  | 'gridDensityField'
  | 'pulseStrengthField'
  | 'waveStrengthField'
  | 'reflectionStrengthField'
  | 'distortionScaleField'
  | 'reflectivityField'
  | 'refractionStrengthField'
  | 'fresnelPowerField'
  | 'headingField'
  | 'windDirectionField'
  | 'apertureField'
  | 'opacityField'
  | 'ringsField'
  | 'centerField'
  | 'breathingField'
  | 'outlineField'
  | 'originField'
  | 'domeRingField'

Ion.defaultAccessToken = ''

const tiandituToken = getTiandituToken()
const tiandituAdministrativeUrl = 'https://api.tianditu.gov.cn/v2/administrative'
const fireHotspotTerrainUrl = 'http://39.105.60.121/mapdata/terrain'
const beijingTiandituRegionCode = '156110000'
const center = { longitude: 116.391, latitude: 39.907 }
const routePositions = [
  { longitude: 116.285, latitude: 39.87 },
  { longitude: 116.335, latitude: 39.92 },
  { longitude: 116.394, latitude: 39.91 },
  { longitude: 116.452, latitude: 39.95 },
  { longitude: 116.505, latitude: 39.9 },
]
const beijingCapital = { longitude: 116.4074, latitude: 39.9042 }
const provinceCapitalFlyLineTargets = [
  { name: '天津', longitude: 117.2, latitude: 39.1333 },
  { name: '石家庄', longitude: 114.5149, latitude: 38.0428 },
  { name: '太原', longitude: 112.5492, latitude: 37.8706 },
  { name: '呼和浩特', longitude: 111.7492, latitude: 40.8426 },
  { name: '沈阳', longitude: 123.4315, latitude: 41.8057 },
  { name: '长春', longitude: 125.3235, latitude: 43.8171 },
  { name: '哈尔滨', longitude: 126.6425, latitude: 45.7567 },
  { name: '上海', longitude: 121.4737, latitude: 31.2304 },
  { name: '南京', longitude: 118.7969, latitude: 32.0603 },
  { name: '杭州', longitude: 120.1551, latitude: 30.2741 },
  { name: '合肥', longitude: 117.2272, latitude: 31.8206 },
  { name: '福州', longitude: 119.2965, latitude: 26.0745 },
  { name: '南昌', longitude: 115.8582, latitude: 28.6829 },
  { name: '济南', longitude: 117.1201, latitude: 36.6512 },
  { name: '郑州', longitude: 113.6254, latitude: 34.7466 },
  { name: '武汉', longitude: 114.3054, latitude: 30.5931 },
  { name: '长沙', longitude: 112.9388, latitude: 28.2282 },
  { name: '广州', longitude: 113.2644, latitude: 23.1291 },
  { name: '南宁', longitude: 108.3669, latitude: 22.817 },
  { name: '海口', longitude: 110.3312, latitude: 20.031 },
  { name: '重庆', longitude: 106.5516, latitude: 29.563 },
  { name: '成都', longitude: 104.0668, latitude: 30.5728 },
  { name: '贵阳', longitude: 106.6302, latitude: 26.647 },
  { name: '昆明', longitude: 102.8329, latitude: 24.8801 },
  { name: '拉萨', longitude: 91.1175, latitude: 29.647 },
  { name: '西安', longitude: 108.9398, latitude: 34.3416 },
  { name: '兰州', longitude: 103.8343, latitude: 36.0611 },
  { name: '西宁', longitude: 101.7782, latitude: 36.6171 },
  { name: '银川', longitude: 106.2309, latitude: 38.4872 },
  { name: '乌鲁木齐', longitude: 87.6168, latitude: 43.8256 },
  { name: '台北', longitude: 121.5654, latitude: 25.033 },
  { name: '香港', longitude: 114.1694, latitude: 22.3193 },
  { name: '澳门', longitude: 113.5439, latitude: 22.1987 },
]
const provinceCapitalFlyLineRoutes = provinceCapitalFlyLineTargets.map((capital) => ({
  from: beijingCapital,
  to: { longitude: capital.longitude, latitude: capital.latitude },
}))
const wallPositions = [
  { longitude: 116.337, latitude: 39.879 },
  { longitude: 116.448, latitude: 39.882 },
  { longitude: 116.468, latitude: 39.962 },
  { longitude: 116.36, latitude: 39.988 },
  { longitude: 116.307, latitude: 39.93 },
]
const yongdingRiverWaterSegments = [
  {
    name: 'guanting-outlet',
    source: 'OSM way 243770192 + imagery-traced river width',
    centerline: [
      { longitude: 115.5471, latitude: 40.3384 },
      { longitude: 115.5492, latitude: 40.3251 },
      { longitude: 115.5604, latitude: 40.3169 },
    ],
    channelWidthMeters: 190,
    height: 482,
    flowDirection: 192,
  },
  {
    name: 'sanbao-bend',
    source: 'OSM way 243770192 + imagery-traced river width',
    centerline: [
      { longitude: 115.5604, latitude: 40.3169 },
      { longitude: 115.5739, latitude: 40.3182 },
      { longitude: 115.5857, latitude: 40.3174 },
      { longitude: 115.5962, latitude: 40.3145 },
    ],
    channelWidthMeters: 220,
    height: 479,
    flowDirection: 118,
  },
  {
    name: 'downstream-channel',
    source: 'OSM way 243770192 + imagery-traced river width',
    centerline: [
      { longitude: 115.5962, latitude: 40.3145 },
      { longitude: 115.6127, latitude: 40.3034 },
      { longitude: 115.6254, latitude: 40.2994 },
      { longitude: 115.615, latitude: 40.2883 },
    ],
    channelWidthMeters: 210,
    height: 478,
    flowDirection: 162,
  },
  {
    name: 'kangzhuang-reach',
    source: 'OSM way 243770192 + imagery-traced river width',
    centerline: [
      { longitude: 115.615, latitude: 40.2883 },
      { longitude: 115.6059, latitude: 40.2728 },
    ],
    channelWidthMeters: 170,
    height: 475,
    flowDirection: 206,
  },
] satisfies YongdingRiverWaterSegment[]
const waterSurfaceSegments = yongdingRiverWaterSegments.map((segment) => ({
  ...segment,
  polygon: buildRiverChannelPolygon(segment.centerline, segment.channelWidthMeters),
}))
const fireBillboardGifs = {
  localRed: '/fire-red-billboard.gif',
  localOrange: '/fire-orange-billboard.gif',
  localGreen: '/fire-green-billboard.gif',
  localWhite: '/fire-white-billboard.gif',
  onlineTorch: 'https://upload.wikimedia.org/wikipedia/commons/c/c1/Torche.gif',
}
const fireBillboardPoints = [
  {
    id: 'demo-fire-1',
    longitude: 116.322,
    latitude: 39.968,
    gif: fireBillboardGifs.localRed,
    label: 'fire hotspot',
  },
  {
    id: 'demo-fire-2',
    longitude: 116.372,
    latitude: 39.932,
    gif: fireBillboardGifs.localOrange,
    label: 'orange fire',
  },
  {
    id: 'demo-fire-3',
    longitude: 116.431,
    latitude: 39.974,
    gif: fireBillboardGifs.onlineTorch,
    label: 'online torch',
  },
  {
    id: 'demo-fire-4',
    longitude: 116.486,
    latitude: 39.908,
    gif: fireBillboardGifs.localGreen,
    label: 'green fire',
  },
  {
    id: 'demo-fire-5',
    longitude: 116.535,
    latitude: 39.946,
    gif: fireBillboardGifs.localWhite,
    label: 'white fire',
  },
]
let beijingTemperatureFieldPolygons: TemperatureFieldPolygon[] = fallbackBeijingTemperatureFieldPolygons
let temperatureFieldSamples: TemperatureFieldSample[] = createRandomTemperatureSamples(
  beijingTemperatureFieldPolygons,
  temperatureSampleConfigs,
  9528,
)
let temperatureFieldSource: TemperatureFieldSource = 'fallback'

let activeEffectId: EffectId = 'polyline-flow'
let activeCodeTemplate: CodeTemplate = 'typescript'
let activeEffect: ActiveEffect | null = null
let activeWaterSurfaceEffects: WaterSurfaceEffectInstance[] = []
let temperatureSampleDataSource: CustomDataSource | null = null

const viewer = new Viewer('cesiumContainer', {
  animation: false,
  baseLayer: createTiandituLayer('img'),
  baseLayerPicker: false,
  fullscreenButton: false,
  geocoder: false,
  homeButton: false,
  infoBox: false,
  sceneModePicker: false,
  selectionIndicator: false,
  timeline: false,
  navigationHelpButton: false,
  requestRenderMode: true,
  useBrowserRecommendedResolution: false,
})

viewer.imageryLayers.add(createTiandituLayer('cia'))
void applyFireHotspotTerrain()
syncTemperatureSampleLayer(false)

const elements = {
  effectId: getElement('effectId'),
  effectTitle: getElement('effectTitle'),
  effectDescription: getElement('effectDescription'),
  color: getInput('color'),
  radarType: getSelect('radarType'),
  rippleType: getSelect('rippleType'),
  flowType: getSelect('flowType'),
  flyMode: getSelect('flyMode'),
  wallType: getSelect('wallType'),
  coneType: getSelect('coneType'),
  domeType: getSelect('domeType'),
  weatherType: getSelect('weatherType'),
  postProcessType: getSelect('postProcessType'),
  waterType: getSelect('waterType'),
  radius: getInput('radius'),
  width: getInput('width'),
  height: getInput('height'),
  length: getInput('length'),
  speed: getInput('speed'),
  scale: getInput('scale'),
  scanDuration: getInput('scanDuration'),
  frameInterval: getInput('frameInterval'),
  ringCount: getInput('ringCount'),
  duration: getInput('duration'),
  trailLength: getInput('trailLength'),
  pulseCount: getInput('pulseCount'),
  cornerRadius: getInput('cornerRadius'),
  pipeOpacity: getInput('pipeOpacity'),
  bubbleDensity: getInput('bubbleDensity'),
  scanLineCount: getInput('scanLineCount'),
  gridDensity: getInput('gridDensity'),
  pulseStrength: getInput('pulseStrength'),
  waveStrength: getInput('waveStrength'),
  reflectionStrength: getInput('reflectionStrength'),
  distortionScale: getInput('distortionScale'),
  reflectivity: getInput('reflectivity'),
  refractionStrength: getInput('refractionStrength'),
  fresnelPower: getInput('fresnelPower'),
  heading: getInput('heading'),
  windDirection: getInput('windDirection'),
  aperture: getInput('aperture'),
  opacity: getInput('opacity'),
  rings: getInput('rings'),
  center: getInput('center'),
  breathing: getInput('breathing'),
  outline: getInput('outline'),
  origin: getInput('origin'),
  domeRing: getInput('domeRing'),
  usageToolbar: getElement('usageToolbar'),
  copyCode: getButton('copyCode'),
  radiusValue: getElement('radiusValue'),
  widthValue: getElement('widthValue'),
  heightValue: getElement('heightValue'),
  lengthValue: getElement('lengthValue'),
  speedValue: getElement('speedValue'),
  scaleValue: getElement('scaleValue'),
  scanDurationValue: getElement('scanDurationValue'),
  frameIntervalValue: getElement('frameIntervalValue'),
  ringCountValue: getElement('ringCountValue'),
  durationValue: getElement('durationValue'),
  trailLengthValue: getElement('trailLengthValue'),
  pulseCountValue: getElement('pulseCountValue'),
  cornerRadiusValue: getElement('cornerRadiusValue'),
  pipeOpacityValue: getElement('pipeOpacityValue'),
  bubbleDensityValue: getElement('bubbleDensityValue'),
  scanLineCountValue: getElement('scanLineCountValue'),
  gridDensityValue: getElement('gridDensityValue'),
  pulseStrengthValue: getElement('pulseStrengthValue'),
  waveStrengthValue: getElement('waveStrengthValue'),
  reflectionStrengthValue: getElement('reflectionStrengthValue'),
  distortionScaleValue: getElement('distortionScaleValue'),
  reflectivityValue: getElement('reflectivityValue'),
  refractionStrengthValue: getElement('refractionStrengthValue'),
  fresnelPowerValue: getElement('fresnelPowerValue'),
  headingValue: getElement('headingValue'),
  windDirectionValue: getElement('windDirectionValue'),
  apertureValue: getElement('apertureValue'),
  opacityValue: getElement('opacityValue'),
  codeExample: getElement('codeExample'),
  notesPanel: getElement('notesPanel'),
}

const controlFields: Record<ControlId, HTMLElement> = {
  colorField: getElement('colorField'),
  radarTypeField: getElement('radarTypeField'),
  rippleTypeField: getElement('rippleTypeField'),
  flowTypeField: getElement('flowTypeField'),
  flyModeField: getElement('flyModeField'),
  wallTypeField: getElement('wallTypeField'),
  coneTypeField: getElement('coneTypeField'),
  domeTypeField: getElement('domeTypeField'),
  weatherTypeField: getElement('weatherTypeField'),
  postProcessTypeField: getElement('postProcessTypeField'),
  waterTypeField: getElement('waterTypeField'),
  radiusField: getElement('radiusField'),
  widthField: getElement('widthField'),
  heightField: getElement('heightField'),
  lengthField: getElement('lengthField'),
  speedField: getElement('speedField'),
  scaleField: getElement('scaleField'),
  scanDurationField: getElement('scanDurationField'),
  frameIntervalField: getElement('frameIntervalField'),
  ringCountField: getElement('ringCountField'),
  durationField: getElement('durationField'),
  trailLengthField: getElement('trailLengthField'),
  pulseCountField: getElement('pulseCountField'),
  cornerRadiusField: getElement('cornerRadiusField'),
  pipeOpacityField: getElement('pipeOpacityField'),
  bubbleDensityField: getElement('bubbleDensityField'),
  scanLineCountField: getElement('scanLineCountField'),
  gridDensityField: getElement('gridDensityField'),
  pulseStrengthField: getElement('pulseStrengthField'),
  waveStrengthField: getElement('waveStrengthField'),
  reflectionStrengthField: getElement('reflectionStrengthField'),
  distortionScaleField: getElement('distortionScaleField'),
  reflectivityField: getElement('reflectivityField'),
  refractionStrengthField: getElement('refractionStrengthField'),
  fresnelPowerField: getElement('fresnelPowerField'),
  headingField: getElement('headingField'),
  windDirectionField: getElement('windDirectionField'),
  apertureField: getElement('apertureField'),
  opacityField: getElement('opacityField'),
  ringsField: getElement('ringsField'),
  centerField: getElement('centerField'),
  breathingField: getElement('breathingField'),
  outlineField: getElement('outlineField'),
  originField: getElement('originField'),
  domeRingField: getElement('domeRingField'),
}

const effectCopy: Record<EffectId, { title: string; description: string; notes: string[] }> = {
  'radar-scan': {
    title: 'Radar Scan',
    description: 'Circular Cesium ground primitive with animated radar sweep and optional range rings.',
    notes: [
      'Use createRadarScanEffect(viewer, options) when you need a rotating sweep over a monitored area.',
      'type switches between classic, sector, pulse, and grid radar styles without rebuilding geometry.',
      'scanDurationMs controls one full sweep rotation. Lower values rotate faster.',
      'rings toggles static reference rings without changing primitive geometry.',
    ],
  },
  'ripple-spread': {
    title: 'Ripple Spread',
    description: 'Water-like expanding rings for incidents, signal diffusion, or point emphasis on a Cesium map.',
    notes: [
      'Use createRippleSpreadEffect(viewer, options) when the visual language should be outward diffusion rather than scanning.',
      'ringCount controls how many waves are visible at once. durationMs controls expansion speed.',
      'type switches between water, energy, and soft material styles without rebuilding geometry.',
    ],
  },
  'polyline-flow': {
    title: 'Polyline Flow',
    description: 'Route flow light for command dispatch, migration arcs, attack paths, and high-speed data routes.',
    notes: [
      'Use createPolylineFlowEffect(viewer, options) with WGS84 positions to render an animated route.',
      'type switches dispatch, migration, attack, comet, and electric flow personalities.',
      'speed, width, trailLength, and pulseCount tune how aggressive the moving light trail feels.',
      'cornerRadius optionally rounds route bends while keeping the default SDK behavior sharp for compatibility.',
      'The base line uses Cesium PolylineGlowMaterialProperty, with animated trail segments layered above it.',
    ],
  },
  'fly-line': {
    title: 'Fly Line',
    description: 'Raised Cesium arc animation for single flight paths, hub-spoke convergence, and bidirectional links.',
    notes: [
      'Use createFlyLineEffect(viewer, options) with WGS84 from/to route pairs.',
      'mode switches single-arc, hub-spoke, and bidirectional behaviors without changing the public API.',
      'arcHeight controls the visible peak height of each raised curve.',
      'speed, width, trailLength, and pulseCount tune the moving light head and tail.',
      'The effect is built from Cesium PolylineGlowMaterialProperty entities, so it stays easy to update and destroy.',
    ],
  },
  'pipe-flow': {
    title: 'Pipe Flow',
    description: 'Transparent water-pipe route with a glowing shell, internal flow, pressure waves, and bubbles.',
    notes: [
      'Use createPipeFlowEffect(viewer, options) when the route should feel like water moving inside a transparent pipe.',
      'pipeOpacity controls the outer shell, while opacity controls the internal water stream.',
      'bubbleDensity adds moving foam streaks inside the pipe. Set it to 0 for a cleaner pressure-flow look.',
      'cornerRadius rounds elbows so route bends read more like pipe joints than sharp polyline corners.',
      'The effect is layered from Cesium PolylineGlowMaterialProperty lines, so it stays framework-neutral and easy to destroy.',
    ],
  },
  'scene-weather': {
    title: 'Scene Weather',
    description: 'Full-scene rain, snow, fog, and lightning rendered as a Cesium post-process stage.',
    notes: [
      'Use createSceneWeatherEffect(viewer, options) when the entire map needs atmospheric motion.',
      'type switches rain, snow, fog, and lightning without replacing the post-process stage.',
      'intensity, speed, windDirection, and color update live and keep requestRenderMode scenes moving.',
    ],
  },
  'post-process': {
    title: 'Post Process',
    description: 'Screen-space color grading effects for bloom, night vision, black-white, brightness, mosaic, and depth-of-field looks.',
    notes: [
      'Use createPostProcessEffect(viewer, options) for Mars3D-style scene color effects.',
      'The effect uses one reusable Cesium PostProcessStage and updates uniforms in place.',
      'strength, brightness, contrast, and saturation let a business app tune the visual punch without changing scene data.',
    ],
  },
  'water-surface': {
    title: 'Water Surface',
    description: 'Three.js-style reflective and refractive polygon water for rivers, lakes, flood surfaces, and water-level scenes.',
    notes: [
      'Use createWaterSurfaceEffect(viewer, options) with a WGS84 polygon boundary.',
      'type switches river, lake, and flood material personalities.',
      'distortionScale, reflectivity, refractionStrength, fresnelPower, waveStrength, flowDirection, speed, height, and opacity update live.',
    ],
  },
  'light-wall': {
    title: 'Light Wall',
    description: 'Transparent vertical boundary wall with flowing texture, scan lines, and breathing highlights.',
    notes: [
      'Use createLightWallEffect(viewer, options) for parks, restricted zones, campuses, and security perimeters.',
      'type switches security, warning, data, fence, and pulse wall materials.',
      'height changes rebuild wall geometry; color, speed, scanLineCount, breathing, and outline update live.',
    ],
  },
  'scan-cone': {
    title: 'Scan Cone',
    description: 'Rotating volumetric cone for searchlights, radar beams, cameras, drones, and alarm ranges.',
    notes: [
      'Use createScanConeEffect(viewer, options) when a point needs a 3D coverage or detection volume.',
      'type switches searchlight, radar, camera, drone, and alarm cone materials.',
      'heading sets the starting direction while speed drives continuous rotation.',
    ],
  },
  'shield-dome': {
    title: 'Shield Dome',
    description: 'Grounded half-dome with grid lines, scan bands, energy pulses, and a glowing base ring.',
    notes: [
      'Use createShieldDomeEffect(viewer, options) for protected zones, GitHub demos, and high-impact map showcases.',
      'type switches hex, plasma, matrix, aegis, and storm dome materials.',
      'gridDensity and pulseStrength let the same geometry feel technical, defensive, or unstable.',
    ],
  },
  'temperature-field': {
    title: 'Temperature Field',
    description: 'Static shader-rendered temperature surface clipped by Beijing administrative polygons from Tianditu when available.',
    notes: [
      'The demo requests Beijing boundary polygons from the Tianditu administrative API and falls back to an offline Beijing polygon if the request is unavailable.',
      'Temperature sample points are randomly generated inside the Beijing polygon. Each point type maps to a temperature value and legend color.',
      'The material is shader-based and static. It expands the sample points into a continuous color field and does not use czm_frameNumber or a requestAnimationFrame render loop.',
      'stops can reuse FireHotspot risk legend colors directly: 0-20 blue, 20-40 green, 40-60 yellow, 60-80 orange, 80-100 red.',
    ],
  },
  'fire-billboard': {
    title: 'Fire Billboard',
    description: 'User-provided longitude, latitude, and GIF fire markers for FireHotspot-style point overlays.',
    notes: [
      'Use createFireBillboardEffect(viewer, options) when the fire symbol itself should come from a supplied GIF asset.',
      'Each point is plain WGS84 longitude and latitude with a gif URL or data URL.',
      'The billboard keeps each GIF source size; scale adjusts display size without stretching width and height parameters.',
      'frameIntervalMs controls playback after the SDK decodes the GIF into billboard frames.',
    ],
  },
}

document.querySelectorAll<HTMLButtonElement>('.effect-tab').forEach((button) => {
  button.addEventListener('click', () => switchEffect(button.dataset.effect as EffectId))
})

document.querySelectorAll<HTMLButtonElement>('.docs-tab').forEach((button) => {
  button.addEventListener('click', () => switchDocsTab(button.dataset.docTab ?? 'usage'))
})

document.querySelectorAll<HTMLButtonElement>('.template-tab').forEach((button) => {
  button.addEventListener('click', () => switchCodeTemplate(button.dataset.codeTemplate))
})

;[
  elements.color,
  elements.radarType,
  elements.rippleType,
  elements.flowType,
  elements.flyMode,
  elements.wallType,
  elements.coneType,
  elements.domeType,
  elements.weatherType,
  elements.postProcessType,
  elements.waterType,
  elements.radius,
  elements.width,
  elements.height,
  elements.length,
  elements.speed,
  elements.scale,
  elements.scanDuration,
  elements.frameInterval,
  elements.ringCount,
  elements.duration,
  elements.trailLength,
  elements.pulseCount,
  elements.cornerRadius,
  elements.pipeOpacity,
  elements.bubbleDensity,
  elements.scanLineCount,
  elements.gridDensity,
  elements.pulseStrength,
  elements.waveStrength,
  elements.reflectionStrength,
  elements.distortionScale,
  elements.reflectivity,
  elements.refractionStrength,
  elements.fresnelPower,
  elements.heading,
  elements.windDirection,
  elements.aperture,
  elements.opacity,
  elements.rings,
  elements.center,
  elements.breathing,
  elements.outline,
  elements.origin,
  elements.domeRing,
].forEach((input) => {
  input.addEventListener('input', syncEffect)
  input.addEventListener('change', syncEffect)
})

getElement('flyTo').addEventListener('click', () => {
  if (activeEffectId === 'water-surface') flyToWaterSurface()
  else activeEffect?.flyTo()
})

elements.copyCode.addEventListener('click', () => {
  void copyCurrentCodeExample()
})

switchEffect('polyline-flow')
loadBeijingBoundaryFromTianditu().catch(() => undefined)

window.addEventListener('beforeunload', () => {
  activeEffect?.destroy()
  destroyActiveWaterSurfaceEffects()
  if (temperatureSampleDataSource) viewer.dataSources.remove(temperatureSampleDataSource, true)
  viewer.destroy()
})

function switchEffect(effectId: EffectId): void {
  activeEffectId = effectId
  activeEffect?.destroy()
  activeEffect = null
  destroyActiveWaterSurfaceEffects()
  setDefaults(effectId)
  syncTemperatureSampleLayer(effectId === 'temperature-field')
  if (effectId === 'water-surface') {
    activeWaterSurfaceEffects = createWaterSurfaceEffects()
  } else {
    activeEffect = createEffect(effectId)
  }
  syncActiveTab(effectId)
  syncVisibleControls(effectId)
  syncEffect()
  if (effectId === 'water-surface') flyToWaterSurface()
  else activeEffect?.flyTo()
}

function createEffect(effectId: EffectId): ActiveEffect {
  if (effectId === 'radar-scan') {
    return createRadarScanEffect(viewer, {
      center,
      radiusMeters: numberValue(elements.radius),
      type: elements.radarType.value as RadarScanType,
      color: elements.color.value,
      scanDurationMs: numberValue(elements.scanDuration),
      opacity: numberValue(elements.opacity),
      rings: elements.rings.checked,
      showCenter: elements.center.checked,
    })
  }

  if (effectId === 'ripple-spread') {
    return createRippleSpreadEffect(viewer, {
      center,
      radiusMeters: numberValue(elements.radius),
      type: elements.rippleType.value as RippleSpreadType,
      color: elements.color.value,
      ringCount: numberValue(elements.ringCount),
      durationMs: numberValue(elements.duration),
      opacity: numberValue(elements.opacity),
      showCenter: elements.center.checked,
    })
  }

  if (effectId === 'polyline-flow') {
    return createPolylineFlowEffect(viewer, {
      positions: routePositions,
      type: elements.flowType.value as PolylineFlowType,
      color: elements.color.value,
      speed: numberValue(elements.speed),
      width: numberValue(elements.width),
      trailLength: numberValue(elements.trailLength),
      pulseCount: numberValue(elements.pulseCount),
      cornerRadius: numberValue(elements.cornerRadius),
    })
  }

  if (effectId === 'fly-line') {
    return createFlyLineEffect(viewer, {
      lines: provinceCapitalFlyLineRoutes,
      mode: elements.flyMode.value as FlyLineMode,
      color: elements.color.value,
      speed: numberValue(elements.speed),
      width: numberValue(elements.width),
      arcHeight: numberValue(elements.height),
      trailLength: numberValue(elements.trailLength),
      pulseCount: numberValue(elements.pulseCount),
    })
  }

  if (effectId === 'pipe-flow') {
    return createPipeFlowEffect(viewer, {
      positions: routePositions,
      color: elements.color.value,
      speed: numberValue(elements.speed),
      width: numberValue(elements.width),
      pipeOpacity: numberValue(elements.pipeOpacity),
      waterOpacity: numberValue(elements.opacity),
      cornerRadius: numberValue(elements.cornerRadius),
      bubbleDensity: numberValue(elements.bubbleDensity),
    })
  }

  if (effectId === 'scene-weather') {
    return createSceneWeatherEffect(viewer, {
      type: elements.weatherType.value as SceneWeatherType,
      intensity: numberValue(elements.opacity),
      speed: numberValue(elements.speed),
      windDirection: numberValue(elements.windDirection),
      color: elements.color.value,
    })
  }

  if (effectId === 'post-process') {
    return createPostProcessEffect(viewer, {
      type: elements.postProcessType.value as PostProcessType,
      strength: numberValue(elements.pulseStrength),
      brightness: numberValue(elements.opacity) * 2,
      contrast: numberValue(elements.speed),
      saturation: numberValue(elements.trailLength) * 3,
    })
  }

  if (effectId === 'light-wall') {
    return createLightWallEffect(viewer, {
      positions: wallPositions,
      type: elements.wallType.value as LightWallType,
      color: elements.color.value,
      height: numberValue(elements.height),
      speed: numberValue(elements.speed),
      opacity: numberValue(elements.opacity),
      scanLineCount: numberValue(elements.scanLineCount),
      breathing: elements.breathing.checked,
      outline: elements.outline.checked,
    })
  }

  if (effectId === 'scan-cone') {
    return createScanConeEffect(viewer, {
      center,
      type: elements.coneType.value as ScanConeType,
      color: elements.color.value,
      radiusMeters: numberValue(elements.radius),
      lengthMeters: numberValue(elements.length),
      speed: numberValue(elements.speed),
      opacity: numberValue(elements.opacity),
      aperture: numberValue(elements.aperture),
      heading: numberValue(elements.heading),
      showOrigin: elements.origin.checked,
    })
  }

  if (effectId === 'temperature-field') {
    return createTemperatureFieldEffect(viewer, {
      polygons: beijingTemperatureFieldPolygons,
      samples: temperatureFieldSamples,
      seed: 9528,
      opacity: numberValue(elements.opacity),
      stops: temperatureFieldStops,
      contourStrength: numberValue(elements.pulseStrength),
      outline: elements.outline.checked,
    })
  }

  if (effectId === 'fire-billboard') {
    return createFireBillboardEffect(viewer, {
      points: fireBillboardPoints,
      scale: numberValue(elements.scale),
      frameIntervalMs: numberValue(elements.frameInterval),
    })
  }

  return createShieldDomeEffect(viewer, {
    center,
    radiusMeters: numberValue(elements.radius),
    type: elements.domeType.value as ShieldDomeType,
    color: elements.color.value,
    speed: numberValue(elements.speed),
    opacity: numberValue(elements.opacity),
    gridDensity: numberValue(elements.gridDensity),
    pulseStrength: numberValue(elements.pulseStrength),
    ring: elements.domeRing.checked,
  })
}

function createWaterSurfaceEffects(): WaterSurfaceEffectInstance[] {
  return waterSurfaceSegments.map((segment) =>
    createWaterSurfaceEffect(viewer, {
      polygon: segment.polygon,
      type: elements.waterType.value as WaterSurfaceType,
      color: elements.color.value,
      height: segment.height,
      speed: numberValue(elements.speed),
      opacity: numberValue(elements.opacity),
      waveStrength: numberValue(elements.waveStrength),
      reflectionStrength: numberValue(elements.reflectionStrength),
      distortionScale: numberValue(elements.distortionScale),
      reflectivity: numberValue(elements.reflectivity),
      refractionStrength: numberValue(elements.refractionStrength),
      fresnelPower: numberValue(elements.fresnelPower),
      flowDirection: segment.flowDirection,
      outline: false,
    }),
  )
}

function destroyActiveWaterSurfaceEffects(): void {
  activeWaterSurfaceEffects.forEach((effect) => effect.destroy())
  activeWaterSurfaceEffects = []
}

function flyToWaterSurface(): void {
  const positions = waterSurfaceSegments.flatMap((segment) => segment.polygon)
  const sphere = BoundingSphere.fromPoints(positions.map((position) => Cartesian3.fromDegrees(position.longitude, position.latitude, 0)))
  viewer.camera.flyToBoundingSphere(sphere, {
    offset: new HeadingPitchRange(0.18, -0.78, Math.max(3600, sphere.radius * 3.2)),
    duration: 1,
  })
}

function syncEffect(): void {
  syncOutputs()

  if (activeEffectId === 'radar-scan') {
    activeEffect?.update({
      color: elements.color.value,
      type: elements.radarType.value as RadarScanType,
      radiusMeters: numberValue(elements.radius),
      scanDurationMs: numberValue(elements.scanDuration),
      opacity: numberValue(elements.opacity),
      rings: elements.rings.checked,
      showCenter: elements.center.checked,
    })
  } else if (activeEffectId === 'ripple-spread') {
    activeEffect?.update({
      type: elements.rippleType.value as RippleSpreadType,
      color: elements.color.value,
      radiusMeters: numberValue(elements.radius),
      ringCount: numberValue(elements.ringCount),
      durationMs: numberValue(elements.duration),
      opacity: numberValue(elements.opacity),
      showCenter: elements.center.checked,
    })
  } else if (activeEffectId === 'polyline-flow') {
    activeEffect?.update({
      type: elements.flowType.value as PolylineFlowType,
      color: elements.color.value,
      speed: numberValue(elements.speed),
      width: numberValue(elements.width),
      trailLength: numberValue(elements.trailLength),
      pulseCount: numberValue(elements.pulseCount),
      cornerRadius: numberValue(elements.cornerRadius),
    })
  } else if (activeEffectId === 'fly-line') {
    activeEffect?.update({
      mode: elements.flyMode.value as FlyLineMode,
      color: elements.color.value,
      speed: numberValue(elements.speed),
      width: numberValue(elements.width),
      arcHeight: numberValue(elements.height),
      trailLength: numberValue(elements.trailLength),
      pulseCount: numberValue(elements.pulseCount),
    })
  } else if (activeEffectId === 'pipe-flow') {
    activeEffect?.update({
      color: elements.color.value,
      speed: numberValue(elements.speed),
      width: numberValue(elements.width),
      pipeOpacity: numberValue(elements.pipeOpacity),
      waterOpacity: numberValue(elements.opacity),
      cornerRadius: numberValue(elements.cornerRadius),
      bubbleDensity: numberValue(elements.bubbleDensity),
    })
  } else if (activeEffectId === 'scene-weather') {
    activeEffect?.update({
      type: elements.weatherType.value as SceneWeatherType,
      intensity: numberValue(elements.opacity),
      speed: numberValue(elements.speed),
      windDirection: numberValue(elements.windDirection),
      color: elements.color.value,
    })
  } else if (activeEffectId === 'post-process') {
    activeEffect?.update({
      type: elements.postProcessType.value as PostProcessType,
      strength: numberValue(elements.pulseStrength),
      brightness: numberValue(elements.opacity) * 2,
      contrast: numberValue(elements.speed),
      saturation: numberValue(elements.trailLength) * 3,
    })
  } else if (activeEffectId === 'water-surface') {
    activeWaterSurfaceEffects.forEach((effect, index) => {
      const segment = waterSurfaceSegments[index]
      if (!segment) return
      effect.update({
        polygon: segment.polygon,
        type: elements.waterType.value as WaterSurfaceType,
        color: elements.color.value,
        height: segment.height,
        speed: numberValue(elements.speed),
        opacity: numberValue(elements.opacity),
        waveStrength: numberValue(elements.waveStrength),
        reflectionStrength: numberValue(elements.reflectionStrength),
        distortionScale: numberValue(elements.distortionScale),
        reflectivity: numberValue(elements.reflectivity),
        refractionStrength: numberValue(elements.refractionStrength),
        fresnelPower: numberValue(elements.fresnelPower),
        flowDirection: segment.flowDirection,
        outline: false,
      })
    })
  } else if (activeEffectId === 'light-wall') {
    activeEffect?.update({
      type: elements.wallType.value as LightWallType,
      color: elements.color.value,
      height: numberValue(elements.height),
      speed: numberValue(elements.speed),
      opacity: numberValue(elements.opacity),
      scanLineCount: numberValue(elements.scanLineCount),
      breathing: elements.breathing.checked,
      outline: elements.outline.checked,
    })
  } else if (activeEffectId === 'scan-cone') {
    activeEffect?.update({
      type: elements.coneType.value as ScanConeType,
      color: elements.color.value,
      radiusMeters: numberValue(elements.radius),
      lengthMeters: numberValue(elements.length),
      speed: numberValue(elements.speed),
      opacity: numberValue(elements.opacity),
      aperture: numberValue(elements.aperture),
      heading: numberValue(elements.heading),
      showOrigin: elements.origin.checked,
    })
  } else if (activeEffectId === 'temperature-field') {
    activeEffect?.update({
      polygons: beijingTemperatureFieldPolygons,
      samples: temperatureFieldSamples,
      opacity: numberValue(elements.opacity),
      contourStrength: numberValue(elements.pulseStrength),
      outline: elements.outline.checked,
    })
  } else if (activeEffectId === 'fire-billboard') {
    activeEffect?.update({
      points: fireBillboardPoints,
      scale: numberValue(elements.scale),
      frameIntervalMs: numberValue(elements.frameInterval),
    })
  } else {
    activeEffect?.update({
      type: elements.domeType.value as ShieldDomeType,
      color: elements.color.value,
      radiusMeters: numberValue(elements.radius),
      speed: numberValue(elements.speed),
      opacity: numberValue(elements.opacity),
      gridDensity: numberValue(elements.gridDensity),
      pulseStrength: numberValue(elements.pulseStrength),
      ring: elements.domeRing.checked,
    })
  }

  syncCopy()
}

function setDefaults(effectId: EffectId): void {
  elements.center.checked = false
  elements.rings.checked = true
  elements.breathing.checked = true
  elements.outline.checked = true
  elements.origin.checked = true
  elements.domeRing.checked = true
  elements.heading.value = '0'
  elements.aperture.value = '34'
  elements.speed.value = '1'
  elements.scale.value = '1'
  elements.trailLength.value = '0.32'
  elements.pulseCount.value = '3'
  elements.cornerRadius.value = '0'
  elements.pipeOpacity.value = '0.32'
  elements.bubbleDensity.value = '6'
  elements.scanLineCount.value = '4'
  elements.gridDensity.value = '14'
  elements.pulseStrength.value = '0.72'
  elements.waveStrength.value = '0.48'
  elements.reflectionStrength.value = '0.36'
  elements.distortionScale.value = '18'
  elements.reflectivity.value = '0.58'
  elements.refractionStrength.value = '0.42'
  elements.fresnelPower.value = '4'
  elements.frameInterval.value = '80'
  elements.height.min = '500'
  elements.height.max = '12000'
  elements.height.step = '100'

  if (effectId === 'radar-scan') {
    elements.color.value = '#36d6ff'
    elements.radarType.value = 'classic'
    elements.radius.value = '22000'
    elements.scanDuration.value = '3600'
    elements.opacity.value = '1'
  } else if (effectId === 'ripple-spread') {
    elements.color.value = '#62e8ff'
    elements.rippleType.value = 'water'
    elements.radius.value = '28000'
    elements.ringCount.value = '5'
    elements.duration.value = '2400'
    elements.opacity.value = '1'
  } else if (effectId === 'polyline-flow') {
    elements.color.value = '#33f7ff'
    elements.flowType.value = 'dispatch'
    elements.width.value = '7'
    elements.speed.value = '1.4'
    elements.trailLength.value = '0.34'
    elements.pulseCount.value = '4'
    elements.cornerRadius.value = '0.18'
  } else if (effectId === 'fly-line') {
    elements.color.value = '#5ee8ff'
    elements.flyMode.value = 'hub-spoke'
    elements.width.value = '5'
    elements.height.min = '20000'
    elements.height.max = '260000'
    elements.height.step = '5000'
    elements.height.value = '220000'
    elements.speed.value = '1.2'
    elements.trailLength.value = '0.28'
    elements.pulseCount.value = '3'
  } else if (effectId === 'pipe-flow') {
    elements.color.value = '#45dfff'
    elements.width.value = '14'
    elements.speed.value = '1.35'
    elements.opacity.value = '1'
    elements.pipeOpacity.value = '0.34'
    elements.cornerRadius.value = '0.22'
    elements.bubbleDensity.value = '8'
  } else if (effectId === 'scene-weather') {
    elements.color.value = '#d8f3ff'
    elements.weatherType.value = 'rain'
    elements.opacity.value = '1'
    elements.speed.value = '1'
    elements.windDirection.value = '115'
  } else if (effectId === 'post-process') {
    elements.color.value = '#ffffff'
    elements.postProcessType.value = 'bloom'
    elements.opacity.value = '1'
    elements.speed.value = '1'
    elements.trailLength.value = '0.34'
    elements.pulseStrength.value = '0.65'
  } else if (effectId === 'water-surface') {
    elements.color.value = '#207f91'
    elements.waterType.value = 'river'
    elements.height.min = '470'
    elements.height.max = '485'
    elements.height.step = '1'
    elements.height.value = '477'
    elements.speed.value = '0.85'
    elements.opacity.value = '1'
    elements.waveStrength.value = '0.24'
    elements.reflectionStrength.value = '0.24'
    elements.distortionScale.value = '8'
    elements.reflectivity.value = '0.36'
    elements.refractionStrength.value = '0.28'
    elements.fresnelPower.value = '5.6'
    elements.windDirection.value = '156'
    elements.outline.checked = false
  } else if (effectId === 'light-wall') {
    elements.color.value = '#27f5ff'
    elements.wallType.value = 'security'
    elements.height.value = '3600'
    elements.speed.value = '1.1'
    elements.opacity.value = '1'
    elements.scanLineCount.value = '5'
  } else if (effectId === 'scan-cone') {
    elements.color.value = '#7cf7ff'
    elements.coneType.value = 'searchlight'
    elements.radius.value = '2200'
    elements.length.value = '6200'
    elements.speed.value = '1.2'
    elements.opacity.value = '1'
    elements.aperture.value = '38'
  } else if (effectId === 'temperature-field') {
    elements.color.value = '#ff8a2d'
    elements.opacity.value = '1'
    elements.pulseStrength.value = '0.18'
  } else if (effectId === 'fire-billboard') {
    elements.color.value = '#ff4a2f'
    elements.scale.value = '1'
    elements.frameInterval.value = '72'
  } else {
    elements.color.value = '#57f7ff'
    elements.domeType.value = 'hex'
    elements.radius.value = '12000'
    elements.speed.value = '1'
    elements.opacity.value = '1'
    elements.gridDensity.value = '14'
    elements.pulseStrength.value = '0.72'
  }
}

function syncVisibleControls(effectId: EffectId): void {
  const visibleByEffect: Record<EffectId, ControlId[]> = {
    'radar-scan': ['colorField', 'radarTypeField', 'radiusField', 'scanDurationField', 'opacityField', 'ringsField', 'centerField'],
    'ripple-spread': ['colorField', 'rippleTypeField', 'radiusField', 'ringCountField', 'durationField', 'opacityField', 'centerField'],
    'polyline-flow': ['colorField', 'flowTypeField', 'widthField', 'speedField', 'trailLengthField', 'pulseCountField', 'cornerRadiusField'],
    'fly-line': ['colorField', 'flyModeField', 'widthField', 'heightField', 'speedField', 'trailLengthField', 'pulseCountField'],
    'pipe-flow': ['colorField', 'widthField', 'speedField', 'opacityField', 'pipeOpacityField', 'cornerRadiusField', 'bubbleDensityField'],
    'scene-weather': ['colorField', 'weatherTypeField', 'speedField', 'opacityField', 'windDirectionField'],
    'post-process': ['postProcessTypeField', 'pulseStrengthField', 'opacityField', 'speedField', 'trailLengthField'],
    'water-surface': [
      'colorField',
      'waterTypeField',
      'heightField',
      'speedField',
      'opacityField',
      'waveStrengthField',
      'reflectionStrengthField',
      'distortionScaleField',
      'reflectivityField',
      'refractionStrengthField',
      'fresnelPowerField',
      'windDirectionField',
      'outlineField',
    ],
    'light-wall': ['colorField', 'wallTypeField', 'heightField', 'speedField', 'opacityField', 'scanLineCountField', 'breathingField', 'outlineField'],
    'scan-cone': ['colorField', 'coneTypeField', 'radiusField', 'lengthField', 'speedField', 'opacityField', 'headingField', 'apertureField', 'originField'],
    'shield-dome': ['colorField', 'domeTypeField', 'radiusField', 'speedField', 'opacityField', 'gridDensityField', 'pulseStrengthField', 'domeRingField'],
    'temperature-field': ['opacityField', 'pulseStrengthField', 'outlineField'],
    'fire-billboard': ['scaleField', 'frameIntervalField'],
  }
  const visible = new Set<ControlId>(visibleByEffect[effectId])

  Object.entries(controlFields).forEach(([id, field]) => {
    field.hidden = !visible.has(id as ControlId)
  })
}

function syncOutputs(): void {
  elements.radiusValue.textContent = `${numberValue(elements.radius).toLocaleString()} m`
  elements.widthValue.textContent = `${numberValue(elements.width).toLocaleString()} px`
  elements.heightValue.textContent = `${numberValue(elements.height).toLocaleString()} m`
  elements.lengthValue.textContent = `${numberValue(elements.length).toLocaleString()} m`
  elements.speedValue.textContent = `${numberValue(elements.speed).toFixed(2)}x`
  elements.scaleValue.textContent = `${numberValue(elements.scale).toFixed(2)}x`
  elements.scanDurationValue.textContent = `${numberValue(elements.scanDuration).toLocaleString()} ms`
  elements.frameIntervalValue.textContent = `${numberValue(elements.frameInterval).toLocaleString()} ms`
  elements.ringCountValue.textContent = `${numberValue(elements.ringCount).toLocaleString()} rings`
  elements.durationValue.textContent = `${numberValue(elements.duration).toLocaleString()} ms`
  elements.trailLengthValue.textContent = numberValue(elements.trailLength).toFixed(2)
  elements.pulseCountValue.textContent = `${numberValue(elements.pulseCount).toLocaleString()} pulses`
  elements.cornerRadiusValue.textContent = numberValue(elements.cornerRadius).toFixed(2)
  elements.pipeOpacityValue.textContent = numberValue(elements.pipeOpacity).toFixed(2)
  elements.bubbleDensityValue.textContent = `${numberValue(elements.bubbleDensity).toLocaleString()} bubbles`
  elements.scanLineCountValue.textContent = `${numberValue(elements.scanLineCount).toLocaleString()} lines`
  elements.gridDensityValue.textContent = `${numberValue(elements.gridDensity).toLocaleString()} cells`
  elements.pulseStrengthValue.textContent = numberValue(elements.pulseStrength).toFixed(2)
  elements.waveStrengthValue.textContent = numberValue(elements.waveStrength).toFixed(2)
  elements.reflectionStrengthValue.textContent = numberValue(elements.reflectionStrength).toFixed(2)
  elements.distortionScaleValue.textContent = numberValue(elements.distortionScale).toFixed(0)
  elements.reflectivityValue.textContent = numberValue(elements.reflectivity).toFixed(2)
  elements.refractionStrengthValue.textContent = numberValue(elements.refractionStrength).toFixed(2)
  elements.fresnelPowerValue.textContent = numberValue(elements.fresnelPower).toFixed(1)
  elements.headingValue.textContent = `${numberValue(elements.heading).toLocaleString()} deg`
  elements.windDirectionValue.textContent = `${numberValue(elements.windDirection).toLocaleString()} deg`
  elements.apertureValue.textContent = `${numberValue(elements.aperture).toLocaleString()} deg`
  elements.opacityValue.textContent = numberValue(elements.opacity).toFixed(2)
}

function syncCopy(): void {
  const copy = effectCopy[activeEffectId]
  elements.effectId.textContent = activeEffectId
  elements.effectTitle.textContent = copy.title
  elements.effectDescription.textContent = copy.description
  elements.codeExample.textContent = getCodeExample()
  elements.notesPanel.innerHTML = copy.notes.map((note) => `<p>${note}</p>`).join('')
}

function getCodeExample(): string {
  const code = getTypeScriptCodeExample()
  if (activeCodeTemplate === 'react') return getReactCodeTemplate(code)
  if (activeCodeTemplate === 'vue') return getVueCodeTemplate(code)
  return code
}

function getTypeScriptCodeExample(): string {
  if (activeEffectId === 'radar-scan') return getRadarCode()
  if (activeEffectId === 'ripple-spread') return getRippleCode()
  if (activeEffectId === 'polyline-flow') return getPolylineCode()
  if (activeEffectId === 'fly-line') return getFlyLineCode()
  if (activeEffectId === 'pipe-flow') return getPipeFlowCode()
  if (activeEffectId === 'scene-weather') return getSceneWeatherCode()
  if (activeEffectId === 'post-process') return getPostProcessCode()
  if (activeEffectId === 'water-surface') return getWaterSurfaceCode()
  if (activeEffectId === 'light-wall') return getLightWallCode()
  if (activeEffectId === 'scan-cone') return getScanConeCode()
  if (activeEffectId === 'temperature-field') return getTemperatureFieldCode()
  if (activeEffectId === 'fire-billboard') return getFireBillboardCode()
  return getShieldDomeCode()
}

function getReactCodeTemplate(code: string): string {
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

function getVueCodeTemplate(code: string): string {
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
    .filter((line) => !line.startsWith('import ') && !line.includes('.destroy()'))
    .join('\n')
    .trim()
}

function extractDestroyLines(code: string): string {
  return code
    .split('\n')
    .filter((line) => line.includes('.destroy()'))
    .join('\n')
    .trim()
}

function indentCode(code: string, spaces: number): string {
  const prefix = ' '.repeat(spaces)
  return code
    .split('\n')
    .map((line) => (line.length > 0 ? `${prefix}${line}` : line))
    .join('\n')
}

function getRadarCode(): string {
  return `import { createRadarScanEffect } from '@ztgkzhaohao/geo-effect-kit'

const radar = createRadarScanEffect(viewer, {
  center: { longitude: ${center.longitude}, latitude: ${center.latitude} },
  radiusMeters: ${numberValue(elements.radius)},
  color: '${elements.color.value}',
  type: '${elements.radarType.value}',
  scanDurationMs: ${numberValue(elements.scanDuration)},
  opacity: ${numberValue(elements.opacity).toFixed(2)},
  rings: ${elements.rings.checked},
})

radar.flyTo()
radar.destroy()`
}

function getRippleCode(): string {
  return `import { createRippleSpreadEffect } from '@ztgkzhaohao/geo-effect-kit'

const ripple = createRippleSpreadEffect(viewer, {
  center: { longitude: ${center.longitude}, latitude: ${center.latitude} },
  radiusMeters: ${numberValue(elements.radius)},
  type: '${elements.rippleType.value}',
  color: '${elements.color.value}',
  ringCount: ${numberValue(elements.ringCount)},
  durationMs: ${numberValue(elements.duration)},
  opacity: ${numberValue(elements.opacity).toFixed(2)},
})

ripple.flyTo()
ripple.destroy()`
}

function getPolylineCode(): string {
  return `import { createPolylineFlowEffect } from '@ztgkzhaohao/geo-effect-kit'

const flow = createPolylineFlowEffect(viewer, {
  positions: ${formatPositions(routePositions)},
  type: '${elements.flowType.value}',
  color: '${elements.color.value}',
  speed: ${numberValue(elements.speed).toFixed(2)},
  width: ${numberValue(elements.width)},
  trailLength: ${numberValue(elements.trailLength).toFixed(2)},
  pulseCount: ${numberValue(elements.pulseCount)},
  cornerRadius: ${numberValue(elements.cornerRadius).toFixed(2)},
})

flow.flyTo()
flow.destroy()`
}

function getFlyLineCode(): string {
  return `import { createFlyLineEffect } from '@ztgkzhaohao/geo-effect-kit'

const flyLine = createFlyLineEffect(viewer, {
  lines: ${formatFlyLines(provinceCapitalFlyLineRoutes)},
  mode: '${elements.flyMode.value}',
  color: '${elements.color.value}',
  speed: ${numberValue(elements.speed).toFixed(2)},
  width: ${numberValue(elements.width)},
  arcHeight: ${numberValue(elements.height)},
  trailLength: ${numberValue(elements.trailLength).toFixed(2)},
  pulseCount: ${numberValue(elements.pulseCount)},
})

flyLine.flyTo()
flyLine.destroy()`
}

function getPipeFlowCode(): string {
  return `import { createPipeFlowEffect } from '@ztgkzhaohao/geo-effect-kit'

const pipe = createPipeFlowEffect(viewer, {
  positions: ${formatPositions(routePositions)},
  color: '${elements.color.value}',
  speed: ${numberValue(elements.speed).toFixed(2)},
  width: ${numberValue(elements.width)},
  pipeOpacity: ${numberValue(elements.pipeOpacity).toFixed(2)},
  waterOpacity: ${numberValue(elements.opacity).toFixed(2)},
  cornerRadius: ${numberValue(elements.cornerRadius).toFixed(2)},
  bubbleDensity: ${numberValue(elements.bubbleDensity)},
})

pipe.flyTo()
pipe.destroy()`
}

function getSceneWeatherCode(): string {
  return `import { createSceneWeatherEffect } from '@ztgkzhaohao/geo-effect-kit'

const weather = createSceneWeatherEffect(viewer, {
  type: '${elements.weatherType.value}',
  color: '${elements.color.value}',
  intensity: ${numberValue(elements.opacity).toFixed(2)},
  speed: ${numberValue(elements.speed).toFixed(2)},
  windDirection: ${numberValue(elements.windDirection)},
})

weather.destroy()`
}

function getPostProcessCode(): string {
  return `import { createPostProcessEffect } from '@ztgkzhaohao/geo-effect-kit'

const postProcess = createPostProcessEffect(viewer, {
  type: '${elements.postProcessType.value}',
  strength: ${numberValue(elements.pulseStrength).toFixed(2)},
  brightness: ${(numberValue(elements.opacity) * 2).toFixed(2)},
  contrast: ${numberValue(elements.speed).toFixed(2)},
  saturation: ${(numberValue(elements.trailLength) * 3).toFixed(2)},
})

postProcess.destroy()`
}

function getWaterSurfaceCode(): string {
  return `import { createWaterSurfaceEffect } from '@ztgkzhaohao/geo-effect-kit'

const waterSurfaceSegments = ${formatWaterSurfaceSegments(waterSurfaceSegments)}

const waterSurfaces = waterSurfaceSegments.map((segment) =>
  createWaterSurfaceEffect(viewer, {
    polygon: segment.polygon,
    type: '${elements.waterType.value}',
    color: '${elements.color.value}',
    height: segment.height,
    speed: ${numberValue(elements.speed).toFixed(2)},
    opacity: ${numberValue(elements.opacity).toFixed(2)},
    waveStrength: ${numberValue(elements.waveStrength).toFixed(2)},
    reflectionStrength: ${numberValue(elements.reflectionStrength).toFixed(2)},
    distortionScale: ${numberValue(elements.distortionScale).toFixed(0)},
    reflectivity: ${numberValue(elements.reflectivity).toFixed(2)},
    refractionStrength: ${numberValue(elements.refractionStrength).toFixed(2)},
    fresnelPower: ${numberValue(elements.fresnelPower).toFixed(1)},
    flowDirection: segment.flowDirection,
    outline: false,
  }),
)

waterSurfaces[0]?.flyTo()
waterSurfaces.forEach((water) => water.destroy())`
}

function getLightWallCode(): string {
  return `import { createLightWallEffect } from '@ztgkzhaohao/geo-effect-kit'

const wall = createLightWallEffect(viewer, {
  positions: ${formatPositions(wallPositions)},
  type: '${elements.wallType.value}',
  color: '${elements.color.value}',
  height: ${numberValue(elements.height)},
  speed: ${numberValue(elements.speed).toFixed(2)},
  opacity: ${numberValue(elements.opacity).toFixed(2)},
  scanLineCount: ${numberValue(elements.scanLineCount)},
  breathing: ${elements.breathing.checked},
  outline: ${elements.outline.checked},
})

wall.flyTo()
wall.destroy()`
}

function getScanConeCode(): string {
  return `import { createScanConeEffect } from '@ztgkzhaohao/geo-effect-kit'

const cone = createScanConeEffect(viewer, {
  center: { longitude: ${center.longitude}, latitude: ${center.latitude} },
  type: '${elements.coneType.value}',
  color: '${elements.color.value}',
  radiusMeters: ${numberValue(elements.radius)},
  lengthMeters: ${numberValue(elements.length)},
  speed: ${numberValue(elements.speed).toFixed(2)},
  aperture: ${numberValue(elements.aperture)},
  heading: ${numberValue(elements.heading)},
})

cone.flyTo()
cone.destroy()`
}

function getShieldDomeCode(): string {
  return `import { createShieldDomeEffect } from '@ztgkzhaohao/geo-effect-kit'

const dome = createShieldDomeEffect(viewer, {
  center: { longitude: ${center.longitude}, latitude: ${center.latitude} },
  radiusMeters: ${numberValue(elements.radius)},
  type: '${elements.domeType.value}',
  color: '${elements.color.value}',
  speed: ${numberValue(elements.speed).toFixed(2)},
  opacity: ${numberValue(elements.opacity).toFixed(2)},
  gridDensity: ${numberValue(elements.gridDensity)},
  pulseStrength: ${numberValue(elements.pulseStrength).toFixed(2)},
})

dome.flyTo()
dome.destroy()`
}

function getTemperatureFieldCode(): string {
  return `import { createTemperatureFieldEffect } from '@ztgkzhaohao/geo-effect-kit'

const field = createTemperatureFieldEffect(viewer, {
  polygons: riskSurface.polygons,
  samples: riskSurface.riskField.samples,
  seed: riskSurface.riskField.seed,
  opacity: riskSurface.riskField.opacity,
  stops: riskSurface.riskField.stops,
  contourStrength: ${numberValue(elements.pulseStrength).toFixed(2)},
  outline: ${elements.outline.checked},
})

field.flyTo()
field.destroy()`
}

function getFireBillboardCode(): string {
  return `import { createFireBillboardEffect } from '@ztgkzhaohao/geo-effect-kit'

const fireBillboard = createFireBillboardEffect(viewer, {
  points: ${formatFireBillboardPoints(fireBillboardPoints)},
  scale: ${numberValue(elements.scale).toFixed(2)},
  frameIntervalMs: ${numberValue(elements.frameInterval)},
})

fireBillboard.flyTo()
fireBillboard.destroy()`
}

async function loadBeijingBoundaryFromTianditu(): Promise<void> {
  if (!tiandituToken) return

  const params = new URLSearchParams({
    keyword: beijingTiandituRegionCode,
    childLevel: '0',
    extensions: 'true',
    tk: tiandituToken,
  })
  const url = `${tiandituAdministrativeUrl}?${params.toString()}`
  const response = await fetch(url)
  if (!response.ok) return

  const payload = (await response.json()) as unknown
  const polygons = parseTiandituAdministrativePolygons(payload)
  if (polygons.length === 0) return

  beijingTemperatureFieldPolygons = polygons
  temperatureFieldSource = 'tianditu'
  temperatureFieldSamples = createRandomTemperatureSamples(beijingTemperatureFieldPolygons, temperatureSampleConfigs, 9528)
  syncTemperatureSampleLayer(activeEffectId === 'temperature-field')

  if (activeEffectId === 'temperature-field') {
    activeEffect?.update({
      polygons: beijingTemperatureFieldPolygons,
      samples: temperatureFieldSamples,
    })
    activeEffect?.flyTo()
    syncCopy()
  }
}

function syncTemperatureSampleLayer(visible: boolean): void {
  if (temperatureSampleDataSource) {
    viewer.dataSources.remove(temperatureSampleDataSource, true)
    temperatureSampleDataSource = null
  }

  if (!visible) return

  temperatureSampleDataSource = new CustomDataSource('geo-effect-kit-temperature-samples')
  temperatureFieldSamples.forEach((sample, index) => {
    const config = temperatureSampleConfigs.find((item) => item.type === sample.type)
    const color = Color.fromCssColorString(config?.color ?? '#ffffff').withAlpha(0.92)
    temperatureSampleDataSource?.entities.add({
      id: `temperature-sample-${index}`,
      position: Cartesian3.fromDegrees(sample.longitude, sample.latitude, 24),
      point: new PointGraphics({
        pixelSize: sample.type === 'critical' ? 13 : 10,
        color,
        outlineColor: Color.BLACK.withAlpha(0.76),
        outlineWidth: 2,
        heightReference: 0,
      }),
      label: {
        text: `${sample.type} ${sample.value}C`,
        font: '12px sans-serif',
        fillColor: color,
        outlineColor: Color.BLACK,
        outlineWidth: 3,
        pixelOffset: new Cartesian2(0, -18),
        showBackground: false,
      },
    })
  })
  viewer.dataSources.add(temperatureSampleDataSource)
  viewer.scene.requestRender()
}

function syncActiveTab(effectId: EffectId): void {
  document.querySelectorAll<HTMLButtonElement>('.effect-tab').forEach((button) => {
    button.classList.toggle('active', button.dataset.effect === effectId)
  })
}

function switchDocsTab(tab: string): void {
  const usageVisible = tab === 'usage'
  elements.usageToolbar.hidden = !usageVisible
  elements.codeExample.hidden = !usageVisible
  elements.notesPanel.hidden = usageVisible
  document.querySelectorAll<HTMLButtonElement>('.docs-tab').forEach((button) => {
    button.classList.toggle('active', button.dataset.docTab === tab)
  })
}

function switchCodeTemplate(template: string | undefined): void {
  if (!isCodeTemplate(template)) return
  activeCodeTemplate = template
  syncCodeTemplateTabs()
  syncCopy()
}

function syncCodeTemplateTabs(): void {
  document.querySelectorAll<HTMLButtonElement>('.template-tab').forEach((button) => {
    const active = button.dataset.codeTemplate === activeCodeTemplate
    button.classList.toggle('active', active)
    button.setAttribute('aria-selected', String(active))
  })
}

function isCodeTemplate(value: string | undefined): value is CodeTemplate {
  return codeTemplates.includes(value as CodeTemplate)
}

async function copyCurrentCodeExample(): Promise<void> {
  const code = getCodeExample()
  try {
    await navigator.clipboard.writeText(code)
    showCopyStatus('Copied')
  } catch {
    const copied = fallbackCopyText(code)
    showCopyStatus(copied ? 'Copied' : 'Copy failed')
  }
}

function fallbackCopyText(text: string): boolean {
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.left = '-9999px'
  textarea.style.top = '0'
  document.body.append(textarea)
  textarea.select()
  const copied = document.execCommand('copy')
  textarea.remove()
  return copied
}

function showCopyStatus(label: string): void {
  elements.copyCode.textContent = label
  window.setTimeout(() => {
    elements.copyCode.textContent = 'Copy'
  }, 1200)
}

function formatPositions(positions: typeof routePositions): string {
  return `[${positions.map((position) => `{ longitude: ${position.longitude}, latitude: ${position.latitude} }`).join(', ')}]`
}

function formatFlyLines(lines: typeof provinceCapitalFlyLineRoutes): string {
  return `[${lines
    .map(
      (line) =>
        `{ from: { longitude: ${line.from.longitude}, latitude: ${line.from.latitude} }, to: { longitude: ${line.to.longitude}, latitude: ${line.to.latitude} } }`,
    )
    .join(', ')}]`
}

function formatWaterSurfaceSegments(segments: typeof waterSurfaceSegments): string {
  return `[${segments
    .map(
      (segment) =>
        `{ name: '${segment.name}', height: ${segment.height}, flowDirection: ${segment.flowDirection}, polygon: ${formatPositions(segment.polygon)} }`,
    )
    .join(', ')}]`
}

function formatFireBillboardPoints(points: typeof fireBillboardPoints): string {
  return `[${points
    .map(
      (point) =>
        `{ longitude: ${point.longitude}, latitude: ${point.latitude}, gif: '${point.gif}', label: '${point.label}' }`,
    )
    .join(', ')}]`
}

function buildRiverChannelPolygon(centerline: GeoPosition[], channelWidthMeters: number): GeoPosition[] {
  if (centerline.length < 2) return centerline

  const halfWidth = channelWidthMeters / 2
  const leftBank = centerline.map((_, index) => offsetRiverBankPosition(centerline, index, halfWidth))
  const rightBank = centerline.map((_, index) => offsetRiverBankPosition(centerline, index, -halfWidth)).reverse()
  return [...leftBank, ...rightBank]
}

function offsetRiverBankPosition(centerline: GeoPosition[], index: number, offsetMeters: number): GeoPosition {
  const position = centerline[index]
  if (!position) throw new Error('Missing river centerline position')
  const previous = centerline[Math.max(0, index - 1)] ?? position
  const next = centerline[Math.min(centerline.length - 1, index + 1)] ?? position

  const latitudeRadians = (position.latitude * Math.PI) / 180
  const metersPerDegreeLatitude = 111_320
  const metersPerDegreeLongitude = Math.max(1, Math.cos(latitudeRadians) * metersPerDegreeLatitude)
  const dxMeters = (next.longitude - previous.longitude) * metersPerDegreeLongitude
  const dyMeters = (next.latitude - previous.latitude) * metersPerDegreeLatitude
  const lengthMeters = Math.hypot(dxMeters, dyMeters) || 1
  const normalX = -dyMeters / lengthMeters
  const normalY = dxMeters / lengthMeters

  return {
    longitude: roundCoordinate(position.longitude + (normalX * offsetMeters) / metersPerDegreeLongitude),
    latitude: roundCoordinate(position.latitude + (normalY * offsetMeters) / metersPerDegreeLatitude),
  }
}

function roundCoordinate(value: number): number {
  return Math.round(value * 1_000_000) / 1_000_000
}

function numberValue(input: HTMLInputElement): number {
  return Number(input.value)
}

function getInput(id: string): HTMLInputElement {
  return getElement(id) as HTMLInputElement
}

function getSelect(id: string): HTMLSelectElement {
  return getElement(id) as HTMLSelectElement
}

function getButton(id: string): HTMLButtonElement {
  return getElement(id) as HTMLButtonElement
}

function getElement(id: string): HTMLElement {
  const element = document.getElementById(id)
  if (!element) throw new Error(`Missing element #${id}`)
  return element
}

function createTiandituLayer(layer: 'img' | 'cia'): ImageryLayer {
  return new ImageryLayer(
    new WebMapTileServiceImageryProvider({
      url: `https://t{s}.tianditu.gov.cn/${layer}_w/wmts?tk=${tiandituToken}`,
      layer,
      style: 'default',
      tileMatrixSetID: 'w',
      format: 'tiles',
      subdomains: ['0', '1', '2', '3', '4', '5', '6', '7'],
      maximumLevel: 18,
    }),
  )
}

async function applyFireHotspotTerrain(): Promise<void> {
  try {
    const terrainProvider = await CesiumTerrainProvider.fromUrl(fireHotspotTerrainUrl)
    viewer.terrainProvider = terrainProvider
    viewer.scene.requestRender()
  } catch (error) {
    console.warn('Failed to load FireHotspot terrain, falling back to default Cesium terrain.', error)
  }
}

function getTiandituToken(): string {
  return new URLSearchParams(window.location.search).get('tdt') ?? import.meta.env.VITE_TIANDITU_TOKEN ?? ''
}
