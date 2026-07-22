import 'cesium/Build/Cesium/Widgets/widgets.css'
import './styles.css'

import {
  BoundingSphere,
  CallbackPositionProperty,
  CallbackProperty,
  Cartesian2,
  Cartesian3,
  Math as CesiumMath,
  CesiumTerrainProvider,
  Color,
  ConstantProperty,
  CustomDataSource,
  HeadingPitchRoll,
  HeadingPitchRange,
  HeightReference,
  ImageryLayer,
  Ion,
  PointGraphics,
  PolylineGlowMaterialProperty,
  Transforms,
  Viewer,
  WebMapTileServiceImageryProvider,
} from 'cesium'
import {
  createFlyLineEffect,
  createLightWallEffect,
  createMaterialPolylineEffect,
  createPipeFlowEffect,
  createPostProcessEffect,
  createPolylineFlowEffect,
  createRadarScanEffect,
  createRadarScanMaterialProperty,
  createRippleSpreadEffect,
  createScanConeEffect,
  createScanConeMaterialProperty,
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
  type MaterialPolylineEffectInstance,
  type MaterialPolylineOptions,
  type MaterialPolylineStyle,
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
  | 'material-polyline'
  | 'fly-line'
  | 'pipe-flow'
  | 'scene-weather'
  | 'post-process'
  | 'water-surface'
  | 'light-wall'
  | 'scan-cone'
  | 'route-scan'
  | 'shield-dome'
  | 'temperature-field'
  | 'fire-billboard'
const codeTemplates = ['typescript', 'react', 'vue'] as const
type CodeTemplate = (typeof codeTemplates)[number]
type ActiveEffect =
  | RadarScanEffectInstance
  | RippleSpreadEffectInstance
  | PolylineFlowEffectInstance
  | MaterialPolylineEffectInstance
  | FlyLineEffectInstance
  | PipeFlowEffectInstance
  | SceneWeatherEffectInstance
  | PostProcessEffectInstance
  | WaterSurfaceEffectInstance
  | LightWallEffectInstance
  | ScanConeEffectInstance
  | RouteScanEffectInstance
  | ShieldDomeEffectInstance
  | TemperatureFieldEffectInstance
  | FireBillboardEffectInstance
type TemperatureFieldSource = 'fallback' | 'tianditu'
type GeoPosition = { longitude: number; latitude: number; height?: number }
type MaterialPolylineCanvasTextureKind = 'prism-lane' | 'signal-braid'
type RouteScanMode = 'radar-scan' | 'scan-cone'
type RouteScanOptions = {
  scanMode: RouteScanMode
  color: string
  coneType: ScanConeType
  radiusMeters: number
  lengthMeters: number
  speed: number
  scanDurationMs: number
  opacity: number
  aperture: number
  heading: number
  rings: boolean
  showOrigin: boolean
  showRoute: boolean
}
type RouteScanEffectInstance = {
  update(options: Partial<RouteScanOptions>): void
  show(): void
  hide(): void
  flyTo(): void
  destroy(): void
  isVisible(): boolean
  isDestroyed(): boolean
}
type RouteScannerOptions = {
  center?: GeoPosition
  color?: string
  type?: ScanConeType
  radiusMeters?: number
  lengthMeters?: number
  speed?: number
  scanDurationMs?: number
  opacity?: number
  aperture?: number
  heading?: number
  rings?: boolean
  showOrigin?: boolean
}
type RouteScannerInstance = {
  update(options: RouteScannerOptions): void
  show(): void
  hide(): void
  destroy(): void
}
type YunzhouRiverWaterSegment = {
  name: string
  source: string
  height: number
  flowDirection: number
  polygon: GeoPosition[]
}
type ControlId =
  | 'colorField'
  | 'radarTypeField'
  | 'rippleTypeField'
  | 'flowTypeField'
  | 'materialPolylineCustomImageField'
  | 'materialPolylineShowcaseField'
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
const radarTypeOptions = `
                <option value="classic">classic</option>
                <option value="sector">sector</option>
                <option value="pulse">pulse</option>
                <option value="grid">grid</option>`
const routeScanModeOptions = `
                <option value="radar-scan">radar-scan</option>
                <option value="scan-cone">scan-cone</option>`
const center = { longitude: 116.391, latitude: 39.907 }
const routePositions: GeoPosition[] = [
  { longitude: 116.285, latitude: 39.87 },
  { longitude: 116.335, latitude: 39.92 },
  { longitude: 116.394, latitude: 39.91 },
  { longitude: 116.452, latitude: 39.95 },
  { longitude: 116.505, latitude: 39.9 },
]
type MaterialPolylineShowcaseRoute = {
  name: string
  style: MaterialPolylineStyle
  imageKind: 'mars3d' | 'local' | 'canvas'
  image?: string
  imageFactory?: () => HTMLCanvasElement
  canvasKind?: MaterialPolylineCanvasTextureKind
  color: string
  secondaryColor: string
  backgroundColor: string
  width: number
  repeat: { x: number; y: number }
  cornerRadius: number
  positions: GeoPosition[]
}
const mars3dMaterialPolylineTextures = {
  pulse: 'https://data.mars3d.cn/img/textures/line-pulse.png',
  gradual: 'https://data.mars3d.cn/img/textures/line-gradual.png',
  arrowBlue: 'https://data.mars3d.cn/img/textures/line-arrow-blue.png',
  colour: 'https://data.mars3d.cn/img/textures/line-colour.png',
  arrowHorizontal: 'https://data.mars3d.cn/img/textures/arrow-h.png',
  dovetail: 'https://data.mars3d.cn/img/textures/line-arrow-dovetail.png',
  yellow: 'https://data.mars3d.cn/img/textures/line-color-yellow.png',
  transparent: 'https://data.mars3d.cn/img/textures/line-tarans.png',
  interval: 'https://data.mars3d.cn/img/textures/line-interval.png',
  gradient: 'https://data.mars3d.cn/img/textures/line-gradient.png',
  smallArrow: 'https://data.mars3d.cn/img/textures/arrow-small.png',
} as const
const localMaterialPolylineTextures = {
  neonWeave: '/textures/material-polyline/neon-weave.png',
  auroraComet: '/textures/material-polyline/aurora-comet.png',
  emberSignal: '/textures/material-polyline/ember-signal.png',
} as const
const materialPolylineShowcaseRoutes: MaterialPolylineShowcaseRoute[] = [
  {
    name: 'line-pulse.png',
    style: 'flow',
    imageKind: 'mars3d',
    image: mars3dMaterialPolylineTextures.pulse,
    color: '#00ff00',
    secondaryColor: '#ffffff',
    backgroundColor: 'rgba(0, 0, 0, 0)',
    width: 5,
    repeat: { x: 4, y: 1 },
    cornerRadius: 0.12,
    positions: routePositions,
  },
  {
    name: 'line-gradual.png',
    style: 'flow',
    imageKind: 'mars3d',
    image: mars3dMaterialPolylineTextures.gradual,
    color: '#66bd63',
    secondaryColor: '#ffffff',
    backgroundColor: 'rgba(0, 0, 0, 0)',
    width: 8,
    repeat: { x: 2, y: 1 },
    cornerRadius: 0.12,
    positions: [
      { longitude: 116.266, latitude: 39.842 },
      { longitude: 116.336, latitude: 39.849 },
      { longitude: 116.401, latitude: 39.834 },
      { longitude: 116.488, latitude: 39.858 },
      { longitude: 116.542, latitude: 39.835 },
    ],
  },
  {
    name: 'line-arrow-blue.png',
    style: 'flow',
    imageKind: 'mars3d',
    image: mars3dMaterialPolylineTextures.arrowBlue,
    color: '#1a9850',
    secondaryColor: '#ffffff',
    backgroundColor: 'rgba(0, 0, 0, 0)',
    width: 10,
    repeat: { x: 5, y: 1 },
    cornerRadius: 0.1,
    positions: [
      { longitude: 116.298, latitude: 39.985 },
      { longitude: 116.365, latitude: 40.01 },
      { longitude: 116.446, latitude: 39.996 },
      { longitude: 116.526, latitude: 40.022 },
    ],
  },
  {
    name: 'line-colour.png',
    style: 'flow',
    imageKind: 'mars3d',
    image: mars3dMaterialPolylineTextures.colour,
    color: '#ffffff',
    secondaryColor: '#f5ff6b',
    backgroundColor: 'rgba(0, 0, 0, 0)',
    width: 10,
    repeat: { x: 1, y: 1 },
    cornerRadius: 0.14,
    positions: [
      { longitude: 116.28, latitude: 39.804 },
      { longitude: 116.354, latitude: 39.787 },
      { longitude: 116.432, latitude: 39.805 },
      { longitude: 116.514, latitude: 39.784 },
    ],
  },
  {
    name: 'arrow-h.png',
    style: 'flow',
    imageKind: 'mars3d',
    image: mars3dMaterialPolylineTextures.arrowHorizontal,
    color: '#00ffff',
    secondaryColor: '#ffffff',
    backgroundColor: 'rgba(0, 0, 0, 0)',
    width: 10,
    repeat: { x: 20, y: 1 },
    cornerRadius: 0.08,
    positions: [
      { longitude: 116.586, latitude: 39.99 },
      { longitude: 116.516, latitude: 39.966 },
      { longitude: 116.444, latitude: 39.984 },
      { longitude: 116.371, latitude: 39.958 },
    ],
  },
  {
    name: 'line-arrow-dovetail.png',
    style: 'flow',
    imageKind: 'mars3d',
    image: mars3dMaterialPolylineTextures.dovetail,
    color: '#a6d96a',
    secondaryColor: '#ffffff',
    backgroundColor: 'rgba(0, 0, 0, 0)',
    width: 18,
    repeat: { x: 4, y: 1 },
    cornerRadius: 0.1,
    positions: [
      { longitude: 116.564, latitude: 39.852 },
      { longitude: 116.496, latitude: 39.889 },
      { longitude: 116.428, latitude: 39.874 },
      { longitude: 116.362, latitude: 39.904 },
    ],
  },
  {
    name: 'line-color-yellow.png',
    style: 'flow',
    imageKind: 'mars3d',
    image: mars3dMaterialPolylineTextures.yellow,
    color: '#7fff00',
    secondaryColor: '#fffb96',
    backgroundColor: 'rgba(0, 0, 0, 0)',
    width: 5,
    repeat: { x: 1, y: 1 },
    cornerRadius: 0.18,
    positions: [
      { longitude: 116.244, latitude: 39.93 },
      { longitude: 116.315, latitude: 39.965 },
      { longitude: 116.393, latitude: 39.972 },
      { longitude: 116.478, latitude: 39.992 },
    ],
  },
  {
    name: 'line-tarans.png',
    style: 'flow',
    imageKind: 'mars3d',
    image: mars3dMaterialPolylineTextures.transparent,
    color: 'rgba(89, 249, 255, 0.8)',
    secondaryColor: '#ffffff',
    backgroundColor: 'rgba(0, 0, 0, 0)',
    width: 5,
    repeat: { x: 1, y: 1 },
    cornerRadius: 0.16,
    positions: [
      { longitude: 116.248, latitude: 39.875 },
      { longitude: 116.322, latitude: 39.853 },
      { longitude: 116.397, latitude: 39.872 },
      { longitude: 116.474, latitude: 39.846 },
    ],
  },
  {
    name: 'line-interval.png',
    style: 'flow',
    imageKind: 'mars3d',
    image: mars3dMaterialPolylineTextures.interval,
    color: '#ffffff',
    secondaryColor: '#35d7ff',
    backgroundColor: 'rgba(0, 0, 0, 0)',
    width: 7,
    repeat: { x: 10, y: 1 },
    cornerRadius: 0.1,
    positions: [
      { longitude: 116.596, latitude: 39.902 },
      { longitude: 116.528, latitude: 39.874 },
      { longitude: 116.459, latitude: 39.898 },
      { longitude: 116.389, latitude: 39.869 },
    ],
  },
  {
    name: 'line-gradient.png',
    style: 'flow',
    imageKind: 'mars3d',
    image: mars3dMaterialPolylineTextures.gradient,
    color: '#ffffff',
    secondaryColor: '#ffffff',
    backgroundColor: 'rgba(0, 0, 0, 0)',
    width: 3,
    repeat: { x: 1, y: 1 },
    cornerRadius: 0.12,
    positions: [
      { longitude: 116.226, latitude: 39.965 },
      { longitude: 116.302, latitude: 39.992 },
      { longitude: 116.381, latitude: 39.976 },
      { longitude: 116.46, latitude: 40.006 },
    ],
  },
  {
    name: 'arrow-small.png',
    style: 'flow',
    imageKind: 'mars3d',
    image: mars3dMaterialPolylineTextures.smallArrow,
    color: '#00ffff',
    secondaryColor: '#b6fff8',
    backgroundColor: '#0000ff',
    width: 10,
    repeat: { x: 40, y: 1 },
    cornerRadius: 0.08,
    positions: [
      { longitude: 116.572, latitude: 39.944 },
      { longitude: 116.496, latitude: 39.923 },
      { longitude: 116.421, latitude: 39.947 },
      { longitude: 116.346, latitude: 39.928 },
    ],
  },
  {
    name: 'local-neon-weave',
    style: 'flow',
    imageKind: 'local',
    image: localMaterialPolylineTextures.neonWeave,
    color: '#ffffff',
    secondaryColor: '#f6f7ff',
    backgroundColor: 'rgba(0, 0, 0, 0)',
    width: 12,
    repeat: { x: 3, y: 1 },
    cornerRadius: 0.22,
    positions: [
      { longitude: 116.238, latitude: 40.026 },
      { longitude: 116.306, latitude: 40.052 },
      { longitude: 116.386, latitude: 40.039 },
      { longitude: 116.474, latitude: 40.064 },
      { longitude: 116.552, latitude: 40.042 },
    ],
  },
  {
    name: 'local-aurora-comet',
    style: 'flow',
    imageKind: 'local',
    image: localMaterialPolylineTextures.auroraComet,
    color: '#ffffff',
    secondaryColor: '#e6fffb',
    backgroundColor: 'rgba(0, 0, 0, 0)',
    width: 14,
    repeat: { x: 2, y: 1 },
    cornerRadius: 0.26,
    positions: [
      { longitude: 116.214, latitude: 39.776 },
      { longitude: 116.292, latitude: 39.742 },
      { longitude: 116.377, latitude: 39.758 },
      { longitude: 116.463, latitude: 39.728 },
      { longitude: 116.548, latitude: 39.752 },
    ],
  },
  {
    name: 'local-ember-signal',
    style: 'flow',
    imageKind: 'local',
    image: localMaterialPolylineTextures.emberSignal,
    color: '#fff7ed',
    secondaryColor: '#ffffff',
    backgroundColor: 'rgba(0, 0, 0, 0)',
    width: 9,
    repeat: { x: 5, y: 1 },
    cornerRadius: 0.18,
    positions: [
      { longitude: 116.596, latitude: 39.812 },
      { longitude: 116.518, latitude: 39.792 },
      { longitude: 116.442, latitude: 39.814 },
      { longitude: 116.366, latitude: 39.786 },
      { longitude: 116.288, latitude: 39.808 },
    ],
  },
  {
    name: 'canvas-prism-lane',
    style: 'flow',
    imageKind: 'canvas',
    canvasKind: 'prism-lane',
    imageFactory: () => createMaterialPolylineCanvasTexture('prism-lane'),
    color: '#ffffff',
    secondaryColor: '#ffffff',
    backgroundColor: 'rgba(0, 0, 0, 0)',
    width: 16,
    repeat: { x: 3, y: 1 },
    cornerRadius: 0.2,
    positions: [
      { longitude: 116.206, latitude: 39.902 },
      { longitude: 116.282, latitude: 39.932 },
      { longitude: 116.36, latitude: 39.912 },
      { longitude: 116.442, latitude: 39.938 },
      { longitude: 116.526, latitude: 39.914 },
    ],
  },
  {
    name: 'canvas-signal-braid',
    style: 'flow',
    imageKind: 'canvas',
    canvasKind: 'signal-braid',
    imageFactory: () => createMaterialPolylineCanvasTexture('signal-braid'),
    color: '#ffffff',
    secondaryColor: '#ffffff',
    backgroundColor: 'rgba(0, 0, 0, 0)',
    width: 13,
    repeat: { x: 4, y: 1 },
    cornerRadius: 0.24,
    positions: [
      { longitude: 116.604, latitude: 40.026 },
      { longitude: 116.528, latitude: 40.006 },
      { longitude: 116.452, latitude: 40.03 },
      { longitude: 116.376, latitude: 40.01 },
      { longitude: 116.3, latitude: 40.034 },
    ],
  },
]
const materialPolylinePrimaryRoute = materialPolylineShowcaseRoutes[0] as MaterialPolylineShowcaseRoute
const routeScanPositions = [
  { longitude: 116.312, latitude: 39.896, height: 260 },
  { longitude: 116.356, latitude: 39.935, height: 300 },
  { longitude: 116.416, latitude: 39.926, height: 280 },
  { longitude: 116.476, latitude: 39.956, height: 340 },
  { longitude: 116.524, latitude: 39.914, height: 260 },
  { longitude: 116.458, latitude: 39.874, height: 240 },
  { longitude: 116.312, latitude: 39.896, height: 260 },
]
const routeScanSegments = getRouteScanSegments()
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
const yunzhouOnemapRiverWaterSegments = [
  {
    name: 'yunzhou-water-primitive-river',
    source: 'yunzhou-onemap src/common/water-surface.ts WaterPrimitive coordinates',
    height: 0,
    flowDirection: 186,
    polygon: [
      { longitude: 113.53286993642162, latitude: 40.09427040664276, height: 1100.5107316527904 },
      { longitude: 113.53289090505918, latitude: 40.094102733213965, height: 1100.115053866143 },
      { longitude: 113.53289442776061, latitude: 40.093927108718276, height: 1099.9788521571654 },
      { longitude: 113.53290343232129, latitude: 40.09371987681498, height: 1099.4888357831903 },
      { longitude: 113.53289718470559, latitude: 40.09346906247862, height: 1099.0926934576164 },
      { longitude: 113.5329058230199, latitude: 40.09307529633515, height: 1098.225148921251 },
      { longitude: 113.53290197997399, latitude: 40.09275271804777, height: 1097.511018038253 },
      { longitude: 113.53293113856343, latitude: 40.092292870277575, height: 1097.249771690926 },
      { longitude: 113.53293892801412, latitude: 40.09215363729866, height: 1097.0756889183785 },
      { longitude: 113.53306556733088, latitude: 40.09165507530884, height: 1095.0757328055556 },
      { longitude: 113.53326905643709, latitude: 40.091041173045674, height: 1092.5479454019662 },
      { longitude: 113.53328469336188, latitude: 40.0908325331976, height: 1090.9965397144672 },
      { longitude: 113.53336269179044, latitude: 40.09042310407048, height: 1090.8564774497386 },
      { longitude: 113.5334907701789, latitude: 40.08991729377534, height: 1091.5897710730426 },
      { longitude: 113.53354959568216, latitude: 40.08969721111766, height: 1091.3449021241397 },
      { longitude: 113.53354933013644, latitude: 40.08965632197489, height: 1091.3590030728467 },
      { longitude: 113.53353718468996, latitude: 40.0896156252889, height: 1091.4678620346785 },
      { longitude: 113.53353401447589, latitude: 40.08957312132648, height: 1091.0690587126505 },
      { longitude: 113.53354973536133, latitude: 40.089514865216714, height: 1091.3324171708732 },
      { longitude: 113.53356115404887, latitude: 40.089486283826815, height: 1091.5343440497181 },
      { longitude: 113.53357220948568, latitude: 40.08943738682835, height: 1090.5582779074684 },
      { longitude: 113.533608101941, latitude: 40.089359882120576, height: 1091.269552219659 },
      { longitude: 113.533644694624, latitude: 40.08926406719644, height: 1091.0063684606662 },
      { longitude: 113.53365942661185, latitude: 40.089243359690904, height: 1091.233579523951 },
      { longitude: 113.53370560619015, latitude: 40.08918498809615, height: 1091.201904180053 },
      { longitude: 113.5337542613172, latitude: 40.089069764704774, height: 1091.1997264419833 },
      { longitude: 113.53379613484663, latitude: 40.088963829706586, height: 1091.1605879882743 },
      { longitude: 113.53384142560147, latitude: 40.088862845360964, height: 1090.8227209588767 },
      { longitude: 113.53399097555766, latitude: 40.08859616148204, height: 1090.2552528011522 },
      { longitude: 113.53413770242926, latitude: 40.08834070898705, height: 1089.6915877390863 },
      { longitude: 113.5343186456868, latitude: 40.08808168861801, height: 1088.9124934711722 },
      { longitude: 113.53451123266466, latitude: 40.087856469685214, height: 1088.123740641736 },
      { longitude: 113.53480006364451, latitude: 40.08751671365609, height: 1087.4605890650387 },
      { longitude: 113.53497315118886, latitude: 40.08732769268672, height: 1086.7817413353691 },
      { longitude: 113.53522310683987, latitude: 40.08705612920683, height: 1085.9608304331769 },
      { longitude: 113.53533753564257, latitude: 40.086926089923026, height: 1085.7802548604723 },
      { longitude: 113.535518694159, latitude: 40.08670334588195, height: 1085.2871292630653 },
      { longitude: 113.53561461947392, latitude: 40.08658414127715, height: 1085.0359092397591 },
      { longitude: 113.5359144319117, latitude: 40.08674727960947, height: 1084.758001255787 },
      { longitude: 113.53545219304536, latitude: 40.08727379621074, height: 1085.8208014860718 },
      { longitude: 113.53506155988983, latitude: 40.08770171486153, height: 1086.9640326321119 },
      { longitude: 113.53491977759816, latitude: 40.08786163879205, height: 1087.2521572120645 },
      { longitude: 113.53481284166055, latitude: 40.08797799522049, height: 1087.844779298105 },
      { longitude: 113.5346189069537, latitude: 40.08822873687617, height: 1088.7695751450278 },
      { longitude: 113.53428049513252, latitude: 40.088767595829445, height: 1090.1804750989515 },
      { longitude: 113.53416112665695, latitude: 40.089003095642816, height: 1091.2850383555813 },
      { longitude: 113.5340535615597, latitude: 40.0892693556393, height: 1091.5573977694073 },
      { longitude: 113.53403587727935, latitude: 40.0893530559901, height: 1090.5622805403877 },
      { longitude: 113.53400731506338, latitude: 40.08942771674443, height: 1091.3620711466629 },
      { longitude: 113.53399594889753, latitude: 40.08945363979459, height: 1091.3567701271797 },
      { longitude: 113.53398888147882, latitude: 40.089472717897884, height: 1091.143531224933 },
      { longitude: 113.53397394827776, latitude: 40.0895096333215, height: 1091.062216609859 },
      { longitude: 113.53396009744773, latitude: 40.089536591024206, height: 1091.099926207659 },
      { longitude: 113.53394542705006, latitude: 40.08957197496921, height: 1091.372566728451 },
      { longitude: 113.53392539566966, latitude: 40.0896182321135, height: 1091.0793392315736 },
      { longitude: 113.53386702077289, latitude: 40.08974562250957, height: 1091.7155948126715 },
      { longitude: 113.5337983903262, latitude: 40.089902740104804, height: 1092.0086617548823 },
      { longitude: 113.53381107721322, latitude: 40.09000763661166, height: 1092.0830255671094 },
      { longitude: 113.53381999590891, latitude: 40.09007898399568, height: 1091.5508884063256 },
      { longitude: 113.53385679561201, latitude: 40.09016374282424, height: 1092.404291162033 },
      { longitude: 113.5339341629186, latitude: 40.09024705755017, height: 1093.308599905396 },
      { longitude: 113.5340198511995, latitude: 40.090341491692, height: 1093.0661579211119 },
      { longitude: 113.53418793481389, latitude: 40.09044554948529, height: 1094.4207285696546 },
      { longitude: 113.53433954446547, latitude: 40.090554008417755, height: 1093.9303926152097 },
      { longitude: 113.5344189625771, latitude: 40.09066112262796, height: 1093.1708393366428 },
      { longitude: 113.53438570594895, latitude: 40.09073848788335, height: 1093.5004843838385 },
      { longitude: 113.5342599825462, latitude: 40.09088647427918, height: 1094.2304664647436 },
      { longitude: 113.5340328844839, latitude: 40.09119352297274, height: 1094.7221329888803 },
      { longitude: 113.53392132179822, latitude: 40.09136165365167, height: 1095.798584193168 },
      { longitude: 113.533818996472, latitude: 40.09153689494577, height: 1097.555947213628 },
      { longitude: 113.53371236717429, latitude: 40.09173155000936, height: 1096.3379722989048 },
      { longitude: 113.5334767119673, latitude: 40.09194745233111, height: 1097.3683026605895 },
      { longitude: 113.53334051146557, latitude: 40.09214978919861, height: 1097.233658890729 },
      { longitude: 113.53325371890669, latitude: 40.09236654385485, height: 1097.8978185353646 },
      { longitude: 113.53321940072598, latitude: 40.09260607920882, height: 1096.8824888769275 },
      { longitude: 113.53322616716845, latitude: 40.092819288712874, height: 1097.3442371648655 },
      { longitude: 113.5332396208091, latitude: 40.0933308470054, height: 1099.4871578908342 },
      { longitude: 113.53320229759383, latitude: 40.09427348256092, height: 1103.1671287483625 },
      { longitude: 113.53286993642162, latitude: 40.09427040664276, height: 1100.5107316527904 },
    ],
  },
] satisfies YunzhouRiverWaterSegment[]
const waterSurfaceSegments = yunzhouOnemapRiverWaterSegments
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
let activeMaterialPolylineEffects: MaterialPolylineEffectInstance[] = []
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
  materialPolylineCustomImage: getInput('materialPolylineCustomImage'),
  materialPolylineShowcase: getInput('materialPolylineShowcase'),
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
  outlineLabel: getElement('outlineLabel'),
  radarTypeLabel: getElement('radarTypeLabel'),
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
  materialPolylineCustomImageField: getElement('materialPolylineCustomImageField'),
  materialPolylineShowcaseField: getElement('materialPolylineShowcaseField'),
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
  'material-polyline': {
    title: 'Material Polyline',
    description: 'Mars3D-style animated texture lines with custom URL, local texture, and canvas material examples.',
    notes: [
      'Use createMaterialPolylineEffect(viewer, options) when a route needs a texture-driven Cesium material line.',
      'Custom image URL replaces the primary route texture; width, speed, and corner radius tune the active route.',
      'Show style showcase displays the 11 Mars3D official image materials plus separate local PNG textures and canvas textures.',
      'Local examples use demo static image paths such as /textures/material-polyline/neon-weave.png; canvas examples pass HTMLCanvasElement directly as image.',
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
  'route-scan': {
    title: 'Route Scan',
    description: 'A moving scanner that runs either radar-scan or scan-cone along a preset route with optional route visibility.',
    notes: [
      'Use the Scan effect selector to choose radar-scan or scan-cone. Only the selected scanner is rendered at one time.',
      'Speed controls route movement. Sweep duration applies to radar-scan, while length, heading, aperture, and origin apply to scan-cone.',
      'Show top outline is reused as the route visibility toggle for this moving scanner.',
      'Switching scan effects destroys the old scanner and creates the newly selected one at the current route sample.',
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
  elements.materialPolylineCustomImage,
  elements.materialPolylineShowcase,
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
  else if (activeEffectId === 'material-polyline') flyToMaterialPolyline()
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
  destroyActiveMaterialPolylineEffects()
  if (temperatureSampleDataSource) viewer.dataSources.remove(temperatureSampleDataSource, true)
  viewer.destroy()
})

function switchEffect(effectId: EffectId): void {
  activeEffectId = effectId
  activeEffect?.destroy()
  activeEffect = null
  destroyActiveWaterSurfaceEffects()
  destroyActiveMaterialPolylineEffects()
  setDefaults(effectId)
  syncTemperatureSampleLayer(effectId === 'temperature-field')
  if (effectId === 'water-surface') {
    activeWaterSurfaceEffects = createWaterSurfaceEffects()
  } else if (effectId === 'material-polyline') {
    activeMaterialPolylineEffects = createMaterialPolylineEffects()
  } else {
    activeEffect = createEffect(effectId)
  }
  syncActiveTab(effectId)
  syncVisibleControls(effectId)
  syncEffect()
  if (effectId === 'water-surface') flyToWaterSurface()
  else if (effectId === 'material-polyline') flyToMaterialPolyline()
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

  if (effectId === 'route-scan') {
    return createRouteScanEffect()
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

function getMaterialPolylineRouteOptions(
  route: MaterialPolylineShowcaseRoute,
  index: number,
): Omit<MaterialPolylineOptions, 'positions' | 'image'> & { positions: GeoPosition[] } {
  return {
    positions: route.positions,
    style: route.style,
    color: route.color,
    secondaryColor: route.secondaryColor,
    backgroundColor: route.backgroundColor,
    width: index === 0 ? numberValue(elements.width) : route.width,
    outlineWidth: 2,
    speed: numberValue(elements.speed),
    repeat: route.repeat,
    cornerRadius: index === 0 ? numberValue(elements.cornerRadius) : route.cornerRadius,
    clampToGround: true,
  }
}

function createMaterialPolylineEffects(): MaterialPolylineEffectInstance[] {
  const routes = getVisibleMaterialPolylineRoutes()

  return routes.map((route, index) => {
    const routeImage = getMaterialPolylineRouteImage(route, index)
    const options = getMaterialPolylineRouteOptions(route, index)

    return createMaterialPolylineEffect(viewer, routeImage ? { ...options, image: routeImage } : options)
  })
}

function destroyActiveMaterialPolylineEffects(): void {
  activeMaterialPolylineEffects.forEach((effect) => effect.destroy())
  activeMaterialPolylineEffects = []
}

function flyToMaterialPolyline(): void {
  const positions = getVisibleMaterialPolylineRoutes().flatMap((route) => route.positions)
  const sphere = BoundingSphere.fromPoints(
    positions.map((position) => Cartesian3.fromDegrees(position.longitude, position.latitude, position.height ?? 0)),
  )
  viewer.camera.flyToBoundingSphere(sphere, {
    offset: new HeadingPitchRange(0.16, -0.62, Math.max(36000, sphere.radius * 2.7)),
    duration: 1,
  })
}

function getVisibleMaterialPolylineRoutes(): MaterialPolylineShowcaseRoute[] {
  return elements.materialPolylineShowcase.checked ? materialPolylineShowcaseRoutes : [materialPolylinePrimaryRoute]
}

function getMaterialPolylineRouteImage(
  route: MaterialPolylineShowcaseRoute,
  index: number,
): MaterialPolylineOptions['image'] | undefined {
  const customImage = materialPolylineCustomImageValue()
  if (index === 0 && customImage) return customImage
  if (route.imageFactory) return route.imageFactory()
  return route.image
}

function createRouteScanEffect(): RouteScanEffectInstance {
  const initialOptions: RouteScanOptions = {
    scanMode: getRouteScanMode(),
    color: elements.color.value,
    coneType: elements.coneType.value as ScanConeType,
    radiusMeters: numberValue(elements.radius),
    lengthMeters: numberValue(elements.length),
    speed: numberValue(elements.speed),
    scanDurationMs: numberValue(elements.scanDuration),
    opacity: numberValue(elements.opacity),
    aperture: numberValue(elements.aperture),
    heading: numberValue(elements.heading),
    rings: elements.rings.checked,
    showOrigin: elements.origin.checked,
    showRoute: elements.outline.checked,
  }
  const routeScanDataSource = new CustomDataSource('geo-effect-kit-route-scan-path')
  const routeCartesians = routeScanPositions.map((position) =>
    Cartesian3.fromDegrees(position.longitude, position.latitude, position.height ?? 0),
  )
  routeScanDataSource.entities.add({
    id: 'geo-effect-kit-route-scan-path-line',
    polyline: {
      positions: routeCartesians,
      width: 4,
      clampToGround: true,
      material: new PolylineGlowMaterialProperty({
        color: Color.fromCssColorString(initialOptions.color).withAlpha(0.72),
        glowPower: 0.18,
        taperPower: 0.82,
      }),
    },
  })
  routeScanDataSource.show = initialOptions.showRoute
  viewer.dataSources.add(routeScanDataSource)

  let options = initialOptions
  let visible = true
  let destroyed = false
  let animationFrame = 0
  let startedAt = performance.now()

  const createRouteRadarScanEffect = (sample: { position: GeoPosition; heading: number }): RouteScannerInstance => {
    let radarCenter = sample.position
    let scannerDestroyed = false
    const radarDataSource = new CustomDataSource('geo-effect-kit-route-radar-scan')
    const material = createRadarScanMaterialProperty({
      center: radarCenter,
      radiusMeters: options.radiusMeters,
      type: 'sector',
      color: options.color,
      scanDurationMs: options.scanDurationMs,
      opacity: options.opacity,
      rings: options.rings,
      showCenter: false,
    })
    const radarEntity = radarDataSource.entities.add({
      id: 'geo-effect-kit-route-radar-scan-ellipse',
      position: new CallbackPositionProperty(
        () => Cartesian3.fromDegrees(radarCenter.longitude, radarCenter.latitude, radarCenter.height ?? 0),
        false,
      ),
      ellipse: {
        semiMajorAxis: new ConstantProperty(options.radiusMeters),
        semiMinorAxis: new ConstantProperty(options.radiusMeters),
        material,
        heightReference: HeightReference.CLAMP_TO_GROUND,
        outline: false,
      },
    })

    const applyRadarStyle = () => {
      material.uniforms.color = Color.fromCssColorString(options.color).withAlpha(1)
      material.uniforms.opacity = options.opacity
      material.uniforms.ringsEnabled = options.rings ? 1 : 0
      material.uniforms.scanDurationMs = options.scanDurationMs
      if (radarEntity.ellipse) {
        radarEntity.ellipse.semiMajorAxis = new ConstantProperty(options.radiusMeters)
        radarEntity.ellipse.semiMinorAxis = new ConstantProperty(options.radiusMeters)
      }
    }

    radarDataSource.show = visible
    viewer.dataSources.add(radarDataSource)

    return {
      update(nextOptions: RouteScannerOptions) {
        if (scannerDestroyed) return
        if (nextOptions.center) radarCenter = nextOptions.center
        if (
          nextOptions.color !== undefined ||
          nextOptions.radiusMeters !== undefined ||
          nextOptions.scanDurationMs !== undefined ||
          nextOptions.opacity !== undefined ||
          nextOptions.rings !== undefined
        ) {
          applyRadarStyle()
        }
        radarDataSource.show = visible
        viewer.scene.requestRender()
      },
      show() {
        if (scannerDestroyed) return
        radarDataSource.show = true
        viewer.scene.requestRender()
      },
      hide() {
        if (scannerDestroyed) return
        radarDataSource.show = false
        viewer.scene.requestRender()
      },
      destroy() {
        if (scannerDestroyed) return
        scannerDestroyed = true
        viewer.dataSources.remove(radarDataSource, true)
        viewer.scene.requestRender()
      },
    }
  }

  const createRouteConeScanEffect = (sample: { position: GeoPosition; heading: number }): RouteScannerInstance => {
    let coneCenter = sample.position
    let coneRouteHeading = sample.heading
    let scannerDestroyed = false
    let scanRotationSpeed = Math.max(1, options.speed)
    let coneAnimationStartedAt = performance.now()
    const coneDataSource = new CustomDataSource('geo-effect-kit-route-scan-cone')
    const material = createScanConeMaterialProperty({
      center: coneCenter,
      type: options.coneType,
      color: options.color,
      radiusMeters: Math.max(1200, options.radiusMeters * 0.18),
      lengthMeters: options.lengthMeters,
      speed: scanRotationSpeed,
      opacity: options.opacity,
      aperture: options.aperture,
      showOrigin: options.showOrigin,
    })
    function updateConeAnimationTime(): void {
      material.uniforms.timeSeconds = (performance.now() - coneAnimationStartedAt) / 1000
    }
    const getConeOriginCartesian = () =>
      Cartesian3.fromDegrees(coneCenter.longitude, coneCenter.latitude, coneCenter.height ?? 0)
    const getConeCenterCartesian = () =>
      Cartesian3.fromDegrees(
        coneCenter.longitude,
        coneCenter.latitude,
        (coneCenter.height ?? 0) + options.lengthMeters / 2,
      )
    const getConeBottomRadius = () => {
      const apertureRadius = Math.tan(CesiumMath.toRadians(options.aperture) / 2) * options.lengthMeters
      return Math.max(Math.max(1200, options.radiusMeters * 0.18), apertureRadius)
    }
    const getConeOrientation = () => {
      const heading = coneRouteHeading + options.heading + ((performance.now() - coneAnimationStartedAt) / 1000) * scanRotationSpeed * 36
      return Transforms.headingPitchRollQuaternion(
        getConeCenterCartesian(),
        HeadingPitchRoll.fromDegrees(heading, 0, 0),
      )
    }
    const coneEntity = coneDataSource.entities.add({
      id: 'geo-effect-kit-route-scan-cone-volume',
      position: new CallbackPositionProperty(() => getConeCenterCartesian(), false),
      orientation: new CallbackProperty(() => getConeOrientation(), false),
      cylinder: {
        length: new ConstantProperty(options.lengthMeters),
        topRadius: new ConstantProperty(0),
        bottomRadius: new ConstantProperty(getConeBottomRadius()),
        slices: 128,
        numberOfVerticalLines: 24,
        material,
        outline: false,
      },
    })
    let originEntity = options.showOrigin
      ? coneDataSource.entities.add({
          id: 'geo-effect-kit-route-scan-cone-origin',
          position: new CallbackPositionProperty(() => getConeOriginCartesian(), false),
          point: new PointGraphics({
            pixelSize: 11,
            color: new ConstantProperty(Color.fromCssColorString(options.color)),
            outlineColor: new ConstantProperty(Color.WHITE.withAlpha(0.72)),
            outlineWidth: 2,
            heightReference: HeightReference.CLAMP_TO_GROUND,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
          }),
        })
      : undefined

    const applyConeStyle = () => {
      material.uniforms.color = Color.fromCssColorString(options.color).withAlpha(1)
      material.uniforms.opacity = options.opacity
      scanRotationSpeed = Math.max(1, options.speed)
      material.uniforms.speed = scanRotationSpeed
      material.uniforms.coneType = getRouteScanConeTypeUniform(options.coneType)
      material.uniforms.aperture = options.aperture
      updateConeAnimationTime()
      if (coneEntity.cylinder) {
        coneEntity.cylinder.length = new ConstantProperty(options.lengthMeters)
        coneEntity.cylinder.bottomRadius = new ConstantProperty(getConeBottomRadius())
      }
    }
    const syncConeOrigin = () => {
      if (!options.showOrigin) {
        if (originEntity) {
          coneDataSource.entities.remove(originEntity)
          originEntity = undefined
        }
        return
      }
      if (!originEntity) {
        originEntity = coneDataSource.entities.add({
          id: 'geo-effect-kit-route-scan-cone-origin',
          position: new CallbackPositionProperty(() => getConeOriginCartesian(), false),
          point: new PointGraphics({
            pixelSize: 11,
            color: new ConstantProperty(Color.fromCssColorString(options.color)),
            outlineColor: new ConstantProperty(Color.WHITE.withAlpha(0.72)),
            outlineWidth: 2,
            heightReference: HeightReference.CLAMP_TO_GROUND,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
          }),
        })
        return
      }
      if (originEntity.point) originEntity.point.color = new ConstantProperty(Color.fromCssColorString(options.color))
    }

    coneDataSource.show = visible
    viewer.dataSources.add(coneDataSource)

    return {
      update(nextOptions: RouteScannerOptions) {
        if (scannerDestroyed) return
        if (nextOptions.center) coneCenter = nextOptions.center
        if (nextOptions.heading !== undefined) coneRouteHeading = nextOptions.heading
        updateConeAnimationTime()
        if (
          nextOptions.color !== undefined ||
          nextOptions.type !== undefined ||
          nextOptions.radiusMeters !== undefined ||
          nextOptions.lengthMeters !== undefined ||
          nextOptions.speed !== undefined ||
          nextOptions.opacity !== undefined ||
          nextOptions.aperture !== undefined
        ) {
          applyConeStyle()
          syncConeOrigin()
        }
        if (nextOptions.showOrigin !== undefined) syncConeOrigin()
        coneDataSource.show = visible
        viewer.scene.requestRender()
      },
      show() {
        if (scannerDestroyed) return
        coneDataSource.show = true
        viewer.scene.requestRender()
      },
      hide() {
        if (scannerDestroyed) return
        coneDataSource.show = false
        viewer.scene.requestRender()
      },
      destroy() {
        if (scannerDestroyed) return
        scannerDestroyed = true
        viewer.dataSources.remove(coneDataSource, true)
        viewer.scene.requestRender()
      },
    }
  }

  const createRouteScanner = (sample: { position: GeoPosition; heading: number }): RouteScannerInstance => {
    if (options.scanMode === 'radar-scan') {
      return createRouteRadarScanEffect(sample)
    }

    return createRouteConeScanEffect(sample)
  }

  const firstPosition = sampleRouteScanPosition(0)
  let scanner: RouteScannerInstance = createRouteScanner(firstPosition)

  const syncRouteStyle = () => {
    routeScanDataSource.show = options.showRoute && visible
    const routeLine = routeScanDataSource.entities.getById('geo-effect-kit-route-scan-path-line')
    if (routeLine?.polyline) {
      routeLine.polyline.material = new PolylineGlowMaterialProperty({
        color: Color.fromCssColorString(options.color).withAlpha(0.72),
        glowPower: 0.18,
        taperPower: 0.82,
      })
    }
  }

  const recreateScanner = (sample: { position: GeoPosition; heading: number }) => {
    scanner.destroy()
    scanner = createRouteScanner(sample)
    if (!visible) scanner.hide()
  }

  const syncModeControls = () => {
    elements.coneType.disabled = options.scanMode !== 'scan-cone'
    elements.length.disabled = options.scanMode !== 'scan-cone'
    elements.heading.disabled = options.scanMode !== 'scan-cone'
    elements.aperture.disabled = options.scanMode !== 'scan-cone'
    elements.origin.disabled = options.scanMode !== 'scan-cone'
    elements.scanDuration.disabled = options.scanMode !== 'radar-scan'
    elements.rings.disabled = options.scanMode !== 'radar-scan'
  }

  const syncScanner = (sample: { position: GeoPosition; heading: number }, force = false) => {
    if (options.scanMode === 'radar-scan') {
      if (!force) {
        scanner.update({ center: sample.position })
        return
      }

      scanner.update({
        center: sample.position,
        color: options.color,
        radiusMeters: options.radiusMeters,
        scanDurationMs: options.scanDurationMs,
        opacity: options.opacity,
        rings: options.rings,
      })
      return
    }

    if (!force) {
      scanner.update({ center: sample.position, heading: sample.heading })
      return
    }

    scanner.update({
      center: sample.position,
      type: options.coneType,
      color: options.color,
      radiusMeters: Math.max(1200, options.radiusMeters * 0.18),
      lengthMeters: options.lengthMeters,
      speed: options.speed,
      opacity: options.opacity,
      aperture: options.aperture,
      heading: sample.heading,
      showOrigin: options.showOrigin,
    })
  }

  const tick = (now: number) => {
    if (destroyed || !visible) return
    const elapsedSeconds = (now - startedAt) / 1000
    const sample = sampleRouteScanPosition(elapsedSeconds * options.speed)
    syncScanner(sample)
    viewer.scene.requestRender()
    animationFrame = requestAnimationFrame(tick)
  }

  const start = () => {
    cancelAnimationFrame(animationFrame)
    startedAt = performance.now()
    animationFrame = requestAnimationFrame(tick)
  }

  syncModeControls()
  start()

  return {
    update(nextOptions: Partial<RouteScanOptions>) {
      if (destroyed) return
      const previousScanMode = options.scanMode
      options = { ...options, ...nextOptions }
      syncRouteStyle()
      const sample = sampleRouteScanPosition(((performance.now() - startedAt) / 1000) * options.speed)
      syncModeControls()
      if (previousScanMode !== options.scanMode) recreateScanner(sample)
      syncScanner(sample, true)
      viewer.scene.requestRender()
    },
    show() {
      if (destroyed) return
      visible = true
      scanner.show()
      syncRouteStyle()
      start()
    },
    hide() {
      if (destroyed) return
      visible = false
      cancelAnimationFrame(animationFrame)
      scanner.hide()
      routeScanDataSource.show = false
      viewer.scene.requestRender()
    },
    flyTo() {
      if (destroyed) return
      const sphere = BoundingSphere.fromPoints(routeCartesians)
      viewer.camera.flyToBoundingSphere(sphere, {
        offset: new HeadingPitchRange(0.16, -0.58, Math.max(36000, sphere.radius * 2.8)),
        duration: 1,
      })
    },
    destroy() {
      if (destroyed) return
      destroyed = true
      cancelAnimationFrame(animationFrame)
      scanner.destroy()
      viewer.dataSources.remove(routeScanDataSource, true)
      viewer.scene.requestRender()
    },
    isVisible() {
      return visible
    },
    isDestroyed() {
      return destroyed
    },
  }
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
  } else if (activeEffectId === 'material-polyline') {
    const routes = getVisibleMaterialPolylineRoutes()
    if (activeMaterialPolylineEffects.length !== routes.length) {
      destroyActiveMaterialPolylineEffects()
      activeMaterialPolylineEffects = createMaterialPolylineEffects()
    }
    activeMaterialPolylineEffects.forEach((effect, index) => {
      const route = routes[index]
      if (!route) return
      const routeImage = getMaterialPolylineRouteImage(route, index)
      const options = getMaterialPolylineRouteOptions(route, index)
      effect.update(routeImage ? { ...options, image: routeImage } : options)
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
  } else if (activeEffectId === 'route-scan') {
    activeEffect?.update({
      scanMode: getRouteScanMode(),
      color: elements.color.value,
      coneType: elements.coneType.value as ScanConeType,
      radiusMeters: numberValue(elements.radius),
      lengthMeters: numberValue(elements.length),
      speed: numberValue(elements.speed),
      scanDurationMs: numberValue(elements.scanDuration),
      opacity: numberValue(elements.opacity),
      aperture: numberValue(elements.aperture),
      heading: numberValue(elements.heading),
      rings: elements.rings.checked,
      showOrigin: elements.origin.checked,
      showRoute: elements.outline.checked,
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
  syncRadarTypeOptions(effectId)
  elements.center.checked = false
  elements.rings.checked = true
  elements.breathing.checked = true
  elements.outline.checked = true
  elements.origin.checked = true
  elements.domeRing.checked = true
  elements.heading.value = '0'
  elements.aperture.value = '34'
  elements.radius.value = elements.radius.min
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
    elements.scanDuration.value = '3600'
    elements.opacity.value = '1'
  } else if (effectId === 'ripple-spread') {
    elements.color.value = '#62e8ff'
    elements.rippleType.value = 'water'
    elements.ringCount.value = '5'
    elements.duration.value = '2400'
    elements.opacity.value = '1'
  } else if (effectId === 'polyline-flow') {
    elements.color.value = '#33f7ff'
    elements.flowType.value = 'dispatch'
    elements.width.value = '7'
    elements.trailLength.value = '0.34'
    elements.pulseCount.value = '4'
    elements.cornerRadius.value = '0.18'
  } else if (effectId === 'material-polyline') {
    elements.materialPolylineCustomImage.value = ''
    elements.materialPolylineShowcase.checked = false
    elements.width.value = '5'
    elements.speed.value = '1'
    elements.cornerRadius.value = '0.12'
  } else if (effectId === 'fly-line') {
    elements.color.value = '#5ee8ff'
    elements.flyMode.value = 'hub-spoke'
    elements.width.value = '5'
    elements.height.min = '20000'
    elements.height.max = '260000'
    elements.height.step = '5000'
    elements.height.value = '220000'
    elements.trailLength.value = '0.28'
    elements.pulseCount.value = '3'
  } else if (effectId === 'pipe-flow') {
    elements.color.value = '#45dfff'
    elements.width.value = '14'
    elements.opacity.value = '1'
    elements.pipeOpacity.value = '0.34'
    elements.cornerRadius.value = '0.22'
    elements.bubbleDensity.value = '8'
  } else if (effectId === 'scene-weather') {
    elements.color.value = '#d8f3ff'
    elements.weatherType.value = 'rain'
    elements.opacity.value = '1'
    elements.windDirection.value = '115'
  } else if (effectId === 'post-process') {
    elements.color.value = '#ffffff'
    elements.postProcessType.value = 'bloom'
    elements.opacity.value = '1'
    elements.trailLength.value = '0.34'
    elements.pulseStrength.value = '0.65'
  } else if (effectId === 'water-surface') {
    elements.color.value = '#00777f'
    elements.waterType.value = 'flow'
    elements.height.min = '0'
    elements.height.max = '40'
    elements.height.step = '1'
    elements.height.value = '0'
    elements.opacity.value = '1'
    elements.waveStrength.value = '0.32'
    elements.reflectionStrength.value = '0.3'
    elements.distortionScale.value = '3.7'
    elements.reflectivity.value = '0.3'
    elements.refractionStrength.value = '0.34'
    elements.fresnelPower.value = '3.2'
    elements.windDirection.value = '186'
    elements.outline.checked = false
  } else if (effectId === 'light-wall') {
    elements.color.value = '#27f5ff'
    elements.wallType.value = 'security'
    elements.height.value = '3600'
    elements.opacity.value = '1'
    elements.scanLineCount.value = '5'
  } else if (effectId === 'scan-cone') {
    elements.color.value = '#7cf7ff'
    elements.coneType.value = 'searchlight'
    elements.length.value = '6200'
    elements.opacity.value = '1'
    elements.aperture.value = '38'
  } else if (effectId === 'route-scan') {
    elements.color.value = '#7cf7ff'
    elements.radarType.value = 'radar-scan'
    elements.coneType.value = 'searchlight'
    elements.length.value = '6800'
    elements.scanDuration.value = '2600'
    elements.opacity.value = '1'
    elements.aperture.value = '36'
    elements.rings.checked = true
    elements.origin.checked = true
    elements.outline.checked = true
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
    elements.opacity.value = '1'
    elements.gridDensity.value = '14'
    elements.pulseStrength.value = '0.72'
  }
}

function syncVisibleControls(effectId: EffectId): void {
  elements.outlineLabel.textContent = effectId === 'route-scan' ? 'Show route path' : 'Show top outline'
  elements.radarTypeLabel.textContent = effectId === 'route-scan' ? 'Scan effect' : 'Radar type'
  elements.coneType.disabled = false
  elements.length.disabled = false
  elements.heading.disabled = false
  elements.aperture.disabled = false
  elements.origin.disabled = false
  elements.scanDuration.disabled = false
  elements.rings.disabled = false
  const visibleByEffect: Record<EffectId, ControlId[]> = {
    'radar-scan': ['colorField', 'radarTypeField', 'radiusField', 'scanDurationField', 'opacityField', 'ringsField', 'centerField'],
    'ripple-spread': ['colorField', 'rippleTypeField', 'radiusField', 'ringCountField', 'durationField', 'opacityField', 'centerField'],
    'polyline-flow': ['colorField', 'flowTypeField', 'widthField', 'speedField', 'trailLengthField', 'pulseCountField', 'cornerRadiusField'],
    'material-polyline': ['materialPolylineCustomImageField', 'widthField', 'speedField', 'cornerRadiusField', 'materialPolylineShowcaseField'],
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
    'route-scan': [
      'colorField',
      'radarTypeField',
      'coneTypeField',
      'radiusField',
      'lengthField',
      'speedField',
      'scanDurationField',
      'opacityField',
      'headingField',
      'apertureField',
      'ringsField',
      'originField',
      'outlineField',
    ],
    'shield-dome': ['colorField', 'domeTypeField', 'radiusField', 'speedField', 'opacityField', 'gridDensityField', 'pulseStrengthField', 'domeRingField'],
    'temperature-field': ['opacityField', 'pulseStrengthField', 'outlineField'],
    'fire-billboard': ['scaleField', 'frameIntervalField'],
  }
  const visible = new Set<ControlId>(visibleByEffect[effectId])

  Object.entries(controlFields).forEach(([id, field]) => {
    field.hidden = !visible.has(id as ControlId)
  })
}

function syncRadarTypeOptions(effectId: EffectId): void {
  if (effectId === 'route-scan') {
    elements.radarType.innerHTML = routeScanModeOptions
  } else {
    elements.radarType.innerHTML = radarTypeOptions
  }
}

function syncOutputs(): void {
  elements.radiusValue.textContent = `${numberValue(elements.radius).toLocaleString()} m`
  elements.widthValue.textContent = `${numberValue(elements.width).toLocaleString()} px`
  elements.heightValue.textContent = `${numberValue(elements.height).toLocaleString()} m`
  elements.lengthValue.textContent = `${numberValue(elements.length).toLocaleString()} m`
  elements.speedValue.textContent = `${formatSpeedValue(numberValue(elements.speed))}x`
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
  if (activeEffectId === 'material-polyline') return getMaterialPolylineCode()
  if (activeEffectId === 'fly-line') return getFlyLineCode()
  if (activeEffectId === 'pipe-flow') return getPipeFlowCode()
  if (activeEffectId === 'scene-weather') return getSceneWeatherCode()
  if (activeEffectId === 'post-process') return getPostProcessCode()
  if (activeEffectId === 'water-surface') return getWaterSurfaceCode()
  if (activeEffectId === 'light-wall') return getLightWallCode()
  if (activeEffectId === 'scan-cone') return getScanConeCode()
  if (activeEffectId === 'route-scan') return getRouteScanCode()
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

function getMaterialPolylineCode(): string {
  const routes = getVisibleMaterialPolylineRoutes()
  const optionsBlocks = routes.map((route, index) => {
    const routeImage = getMaterialPolylineRouteImage(route, index)
    return `  {\n${formatMaterialPolylineOptions(route, index, routeImage, 4)}\n  }`
  })

  if (routes.length > 1) {
    const canvasHelperCode = routes.some((route) => route.imageKind === 'canvas') ? `\n${getMaterialPolylineCanvasTextureCode()}` : ''

    return `import { createMaterialPolylineEffect } from '@ztgkzhaohao/geo-effect-kit'

const materialLineOptions = [
${optionsBlocks.join(',\n')}
]
${canvasHelperCode}

const materialLines = materialLineOptions.map((options) => createMaterialPolylineEffect(viewer, options))

materialLines[0]?.flyTo()
materialLines.forEach((line) => line.destroy())`
  }

  const route = routes[0] ?? materialPolylinePrimaryRoute
  const routeImage = getMaterialPolylineRouteImage(route, 0)

  return `import { createMaterialPolylineEffect } from '@ztgkzhaohao/geo-effect-kit'

const materialLine = createMaterialPolylineEffect(viewer, {
${formatMaterialPolylineOptions(route, 0, routeImage, 2)}
})

materialLine.flyTo()
materialLine.destroy()`
}

function formatMaterialPolylineOptions(
  route: MaterialPolylineShowcaseRoute,
  index: number,
  image: MaterialPolylineOptions['image'] | undefined,
  indent: number,
): string {
  const prefix = ' '.repeat(indent)
  const options = getMaterialPolylineRouteOptions(route, index)
  const imageLine = formatMaterialPolylineImageLine(route, image)
  const lines = [
    `positions: ${formatPositions(options.positions)},`,
    `width: ${options.width},`,
    `speed: ${(options.speed ?? 1).toFixed(2)},`,
    `repeat: { x: ${route.repeat.x}, y: ${route.repeat.y} },`,
    `cornerRadius: ${(options.cornerRadius ?? 0).toFixed(2)},`,
    ...(imageLine ? [imageLine] : []),
    'clampToGround: true,',
  ]

  return lines
    .map((line) => `${prefix}${line}`)
    .join('\n')
}

function formatMaterialPolylineImageLine(
  route: MaterialPolylineShowcaseRoute,
  image: MaterialPolylineOptions['image'] | undefined,
): string | undefined {
  if (!image) return undefined
  if (typeof image === 'string') return `image: '${image}',`
  if (route.canvasKind) return `image: createMaterialPolylineCanvasTexture('${route.canvasKind}'),`
  return undefined
}

function getMaterialPolylineCanvasTextureCode(): string {
  return `function createMaterialPolylineCanvasTexture(kind: 'prism-lane' | 'signal-braid'): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = 192
  canvas.height = 40
  const context = canvas.getContext('2d')
  if (!context) return canvas

  context.clearRect(0, 0, canvas.width, canvas.height)
  if (kind === 'prism-lane') {
    const gradient = context.createLinearGradient(0, 0, canvas.width, 0)
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0)')
    gradient.addColorStop(0.2, 'rgba(255, 64, 129, 0.95)')
    gradient.addColorStop(0.46, 'rgba(255, 255, 255, 1)')
    gradient.addColorStop(0.68, 'rgba(68, 215, 255, 0.95)')
    gradient.addColorStop(1, 'rgba(68, 215, 255, 0)')
    context.fillStyle = gradient
    context.fillRect(0, 13, canvas.width, 14)
    context.strokeStyle = 'rgba(255, 255, 255, 0.72)'
    context.lineWidth = 3
    for (let x = 0; x < canvas.width; x += 36) {
      context.beginPath()
      context.moveTo(x, 30)
      context.lineTo(x + 18, 8)
      context.lineTo(x + 36, 30)
      context.stroke()
    }
  } else {
    const top = context.createLinearGradient(0, 0, canvas.width, 0)
    top.addColorStop(0, 'rgba(93, 255, 202, 0)')
    top.addColorStop(0.34, 'rgba(93, 255, 202, 0.92)')
    top.addColorStop(0.68, 'rgba(255, 255, 255, 0.96)')
    top.addColorStop(1, 'rgba(93, 255, 202, 0)')
    context.strokeStyle = top
    context.lineWidth = 5
    context.beginPath()
    context.moveTo(0, 13)
    for (let x = 0; x <= canvas.width; x += 16) {
      context.lineTo(x, 13 + Math.sin(x / 16) * 7)
    }
    context.stroke()
    context.strokeStyle = 'rgba(144, 98, 255, 0.88)'
    context.beginPath()
    context.moveTo(0, 27)
    for (let x = 0; x <= canvas.width; x += 16) {
      context.lineTo(x, 27 - Math.sin(x / 16) * 7)
    }
    context.stroke()
    context.fillStyle = 'rgba(255, 255, 255, 0.9)'
    context.fillRect(92, 10, 16, 20)
  }

  return canvas
}`
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

function getRouteScanCode(): string {
  const scanMode = getRouteScanMode()
  const scannerImport = scanMode === 'radar-scan' ? 'createRadarScanMaterialProperty' : 'createScanConeMaterialProperty'
  const cesiumImport =
    scanMode === 'radar-scan'
      ? 'BoundingSphere, CallbackPositionProperty, Cartesian3, Color, CustomDataSource, HeadingPitchRange, HeightReference, PolylineGlowMaterialProperty'
      : 'BoundingSphere, CallbackPositionProperty, CallbackProperty, Cartesian3, Color, CustomDataSource, HeadingPitchRange, HeadingPitchRoll, Math as CesiumMath, PolylineGlowMaterialProperty, Transforms'
  const scannerCode =
    scanMode === 'radar-scan'
      ? `let scannerCenter = firstPosition
const scannerMaterial = createRadarScanMaterialProperty({
  center: firstPosition,
  radiusMeters: ${numberValue(elements.radius)},
  type: 'sector',
  color: '${elements.color.value}',
  scanDurationMs: ${numberValue(elements.scanDuration)},
  opacity: ${numberValue(elements.opacity).toFixed(2)},
  rings: ${elements.rings.checked},
})
const scannerEntity = routeScanDataSource.entities.add({
  position: new CallbackPositionProperty(
    () => Cartesian3.fromDegrees(scannerCenter.longitude, scannerCenter.latitude, scannerCenter.height ?? 0),
    false,
  ),
  ellipse: {
    semiMajorAxis: ${numberValue(elements.radius)},
    semiMinorAxis: ${numberValue(elements.radius)},
    material: scannerMaterial,
    heightReference: HeightReference.CLAMP_TO_GROUND,
    outline: false,
  },
})`
      : `let scannerCenter = firstPosition
let scannerHeading = 0
const scannerMaterial = createScanConeMaterialProperty({
  center: firstPosition,
  type: '${elements.coneType.value}',
  color: '${elements.color.value}',
  radiusMeters: ${Math.max(1200, numberValue(elements.radius) * 0.18).toFixed(0)},
  lengthMeters: ${numberValue(elements.length)},
  speed: ${numberValue(elements.speed).toFixed(2)},
  opacity: ${numberValue(elements.opacity).toFixed(2)},
  aperture: ${numberValue(elements.aperture)},
})
const scannerScanSpeed = Math.max(1, ${numberValue(elements.speed).toFixed(2)})
const scannerLength = ${numberValue(elements.length)}
const scannerRadius = ${Math.max(1200, numberValue(elements.radius) * 0.18).toFixed(0)}
const scannerAperture = ${numberValue(elements.aperture)}
const getScannerOrigin = () => Cartesian3.fromDegrees(scannerCenter.longitude, scannerCenter.latitude, scannerCenter.height ?? 0)
const getScannerCenter = () =>
  Cartesian3.fromDegrees(scannerCenter.longitude, scannerCenter.latitude, (scannerCenter.height ?? 0) + scannerLength / 2)
const getScannerBottomRadius = () =>
  Math.max(scannerRadius, Math.tan(CesiumMath.toRadians(scannerAperture) / 2) * scannerLength)
const scannerEntity = routeScanDataSource.entities.add({
  position: new CallbackPositionProperty(() => getScannerCenter(), false),
  orientation: new CallbackProperty(
    () =>
      Transforms.headingPitchRollQuaternion(
        getScannerCenter(),
        HeadingPitchRoll.fromDegrees(
          scannerHeading + ${numberValue(elements.heading)} + ((performance.now() - routeStart) / 1000) * scannerScanSpeed * 36,
          0,
          0,
        ),
      ),
    false,
  ),
  cylinder: {
    length: scannerLength,
    topRadius: 0,
    bottomRadius: getScannerBottomRadius(),
    slices: 128,
    numberOfVerticalLines: 24,
    material: scannerMaterial,
    outline: false,
  },
})
${elements.origin.checked
  ? `const scannerOriginEntity = routeScanDataSource.entities.add({
  position: new CallbackPositionProperty(() => getScannerOrigin(), false),
  point: {
    pixelSize: 11,
    color: Color.fromCssColorString('${elements.color.value}'),
    outlineColor: Color.WHITE.withAlpha(0.72),
    outlineWidth: 2,
    disableDepthTestDistance: Number.POSITIVE_INFINITY,
  },
})`
  : ''}`

  const moveScannerCode =
    scanMode === 'radar-scan'
      ? `scannerCenter = center`
      : `scannerCenter = center
  scannerHeading = getRouteHeading(center, routeScanPositions[(routeIndex + 1) % routeScanPositions.length] ?? center)`
  const animateScannerCode =
    scanMode === 'scan-cone'
      ? `scannerMaterial.uniforms.timeSeconds = (now - routeStart) / 1000`
      : ''
  const destroyScannerCode =
    scanMode === 'radar-scan'
      ? `routeScanDataSource.entities.remove(scannerEntity)`
      : `routeScanDataSource.entities.remove(scannerEntity)${elements.origin.checked ? '\nrouteScanDataSource.entities.remove(scannerOriginEntity)' : ''}`

  return `import { ${cesiumImport} } from 'cesium'
import { ${scannerImport} } from '@ztgkzhaohao/geo-effect-kit'

const routeScanPositions = ${formatPositions(routeScanPositions)}
const routeScanDataSource = new CustomDataSource('route-scan-path')
routeScanDataSource.entities.add({
  polyline: {
    positions: routeScanPositions.map((position) =>
      Cartesian3.fromDegrees(position.longitude, position.latitude, position.height ?? 0),
    ),
    width: 4,
    clampToGround: true,
    material: new PolylineGlowMaterialProperty({
      color: Color.fromCssColorString('${elements.color.value}').withAlpha(0.72),
      glowPower: 0.18,
      taperPower: 0.82,
    }),
  },
})
routeScanDataSource.show = ${elements.outline.checked}
viewer.dataSources.add(routeScanDataSource)

const firstPosition = routeScanPositions[0] ?? { longitude: 0, latitude: 0 }
${scannerCode}

let routeAnimationFrame = 0
let routeStart = performance.now()
const getRouteHeading = (start, end) => {
  const averageLatitude = ((start.latitude + end.latitude) / 2) * (Math.PI / 180)
  const deltaLongitude = (end.longitude - start.longitude) * Math.cos(averageLatitude)
  const deltaLatitude = end.latitude - start.latitude
  return ((Math.atan2(deltaLongitude, deltaLatitude) * 180) / Math.PI + 360) % 360
}
const moveAlongRoute = (now: number) => {
  const elapsedSeconds = (now - routeStart) / 1000
  const routeIndex = Math.floor(elapsedSeconds * ${numberValue(elements.speed).toFixed(2)}) % routeScanPositions.length
  const center = routeScanPositions[routeIndex] ?? firstPosition
  ${animateScannerCode}
  ${moveScannerCode}
  viewer.scene.requestRender()
  routeAnimationFrame = requestAnimationFrame(moveAlongRoute)
}
routeAnimationFrame = requestAnimationFrame(moveAlongRoute)

const sphere = BoundingSphere.fromPoints(
  routeScanPositions.map((position) => Cartesian3.fromDegrees(position.longitude, position.latitude, position.height ?? 0)),
)
viewer.camera.flyToBoundingSphere(sphere, {
  offset: new HeadingPitchRange(0.16, -0.58, Math.max(36000, sphere.radius * 2.8)),
  duration: 1,
})

cancelAnimationFrame(routeAnimationFrame)
${destroyScannerCode}
viewer.dataSources.remove(routeScanDataSource, true)`
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

function formatPositions(positions: GeoPosition[]): string {
  return `[${positions.map(formatPosition).join(', ')}]`
}

function formatPosition(position: GeoPosition): string {
  const height = position.height === undefined ? '' : `, height: ${position.height}`
  return `{ longitude: ${position.longitude}, latitude: ${position.latitude}${height} }`
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

function getRouteScanConeTypeUniform(type: ScanConeType): number {
  if (type === 'searchlight') return 1
  if (type === 'radar') return 2
  if (type === 'camera') return 3
  if (type === 'drone') return 4
  return 5
}

function sampleRouteScanPosition(elapsedSeconds: number): { position: GeoPosition; heading: number } {
  const totalDistance = routeScanSegments.reduce((sum, segment) => sum + segment.distance, 0)
  if (totalDistance <= 0) return { position: routeScanPositions[0] ?? center, heading: 0 }

  const distance = positiveModulo(elapsedSeconds * 8200, totalDistance)
  let traveled = 0
  for (const segment of routeScanSegments) {
    if (distance <= traveled + segment.distance) {
      const ratio = segment.distance <= 0 ? 0 : (distance - traveled) / segment.distance
      return {
        position: interpolateGeoPosition(segment.start, segment.end, ratio),
        heading: getRouteHeading(segment.start, segment.end),
      }
    }
    traveled += segment.distance
  }

  const last = routeScanSegments.at(-1)
  return last
    ? { position: last.end, heading: getRouteHeading(last.start, last.end) }
    : { position: routeScanPositions[0] ?? center, heading: 0 }
}

function getRouteScanSegments(): { start: GeoPosition; end: GeoPosition; distance: number }[] {
  const segments: { start: GeoPosition; end: GeoPosition; distance: number }[] = []
  for (let index = 0; index < routeScanPositions.length - 1; index += 1) {
    const start = routeScanPositions[index]
    const end = routeScanPositions[index + 1]
    if (!start || !end) continue
    const startCartesian = Cartesian3.fromDegrees(start.longitude, start.latitude, start.height ?? 0)
    const endCartesian = Cartesian3.fromDegrees(end.longitude, end.latitude, end.height ?? 0)
    segments.push({
      start,
      end,
      distance: Cartesian3.distance(startCartesian, endCartesian),
    })
  }
  return segments
}

function interpolateGeoPosition(start: GeoPosition, end: GeoPosition, ratio: number): GeoPosition {
  return {
    longitude: start.longitude + (end.longitude - start.longitude) * ratio,
    latitude: start.latitude + (end.latitude - start.latitude) * ratio,
    height: (start.height ?? 0) + ((end.height ?? 0) - (start.height ?? 0)) * ratio,
  }
}

function getRouteHeading(start: GeoPosition, end: GeoPosition): number {
  const averageLatitude = ((start.latitude + end.latitude) / 2) * (Math.PI / 180)
  const deltaLongitude = (end.longitude - start.longitude) * Math.cos(averageLatitude)
  const deltaLatitude = end.latitude - start.latitude
  return positiveModulo((Math.atan2(deltaLongitude, deltaLatitude) * 180) / Math.PI, 360)
}

function positiveModulo(value: number, divisor: number): number {
  return ((value % divisor) + divisor) % divisor
}

function numberValue(input: HTMLInputElement): number {
  return Number(input.value)
}

function formatSpeedValue(value: number): string {
  return Number.isInteger(value) ? value.toFixed(1) : value.toFixed(2)
}

function createMaterialPolylineCanvasTexture(kind: MaterialPolylineCanvasTextureKind): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = 192
  canvas.height = 40
  const context = canvas.getContext('2d')
  if (!context) return canvas

  context.clearRect(0, 0, canvas.width, canvas.height)
  if (kind === 'prism-lane') {
    const gradient = context.createLinearGradient(0, 0, canvas.width, 0)
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0)')
    gradient.addColorStop(0.2, 'rgba(255, 64, 129, 0.95)')
    gradient.addColorStop(0.46, 'rgba(255, 255, 255, 1)')
    gradient.addColorStop(0.68, 'rgba(68, 215, 255, 0.95)')
    gradient.addColorStop(1, 'rgba(68, 215, 255, 0)')
    context.fillStyle = gradient
    context.fillRect(0, 13, canvas.width, 14)
    context.strokeStyle = 'rgba(255, 255, 255, 0.72)'
    context.lineWidth = 3
    for (let x = 0; x < canvas.width; x += 36) {
      context.beginPath()
      context.moveTo(x, 30)
      context.lineTo(x + 18, 8)
      context.lineTo(x + 36, 30)
      context.stroke()
    }
  } else {
    const top = context.createLinearGradient(0, 0, canvas.width, 0)
    top.addColorStop(0, 'rgba(93, 255, 202, 0)')
    top.addColorStop(0.34, 'rgba(93, 255, 202, 0.92)')
    top.addColorStop(0.68, 'rgba(255, 255, 255, 0.96)')
    top.addColorStop(1, 'rgba(93, 255, 202, 0)')
    context.strokeStyle = top
    context.lineWidth = 5
    context.beginPath()
    context.moveTo(0, 13)
    for (let x = 0; x <= canvas.width; x += 16) {
      context.lineTo(x, 13 + Math.sin(x / 16) * 7)
    }
    context.stroke()
    context.strokeStyle = 'rgba(144, 98, 255, 0.88)'
    context.beginPath()
    context.moveTo(0, 27)
    for (let x = 0; x <= canvas.width; x += 16) {
      context.lineTo(x, 27 - Math.sin(x / 16) * 7)
    }
    context.stroke()
    context.fillStyle = 'rgba(255, 255, 255, 0.9)'
    context.fillRect(92, 10, 16, 20)
  }

  return canvas
}

function materialPolylineCustomImageValue(): string | undefined {
  const value = elements.materialPolylineCustomImage.value.trim()
  return value.length > 0 ? value : undefined
}

function getRouteScanMode(): RouteScanMode {
  return elements.radarType.value === 'scan-cone' ? 'scan-cone' : 'radar-scan'
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
