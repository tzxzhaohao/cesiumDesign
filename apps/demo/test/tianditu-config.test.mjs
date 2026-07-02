import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { parseTiandituAdministrativePolygons } from '../src/temperature-field-data.ts'

test('demo configures Tianditu imagery from an ignored local env token', () => {
  const source = readFileSync(new URL('../src/main.ts', import.meta.url), 'utf8')
  const gitignore = readFileSync(new URL('../../../.gitignore', import.meta.url), 'utf8')

  assert.match(source, /VITE_TIANDITU_TOKEN/)
  assert.match(source, /WebMapTileServiceImageryProvider/)
  assert.match(source, /createTiandituLayer\('img'\)/)
  assert.match(source, /createTiandituLayer\('cia'\)/)
  assert.match(source, /\$\{layer\}_w\/wmts/)
  assert.match(gitignore, /^\.env\.local$/m)
  assert.doesNotMatch(source, /tk=[0-9a-f]{32}/i)
})

test('demo renders Cesium canvas using device pixels on high-DPI screens', () => {
  const source = readFileSync(new URL('../src/main.ts', import.meta.url), 'utf8')

  assert.match(source, /useBrowserRecommendedResolution:\s*false/)
})

test('demo defaults every animation opacity control to the maximum value', () => {
  const source = readFileSync(new URL('../src/main.ts', import.meta.url), 'utf8')
  const opacityDefaults = [...source.matchAll(/elements\.opacity\.value = '([^']+)'/g)].map((match) => match[1])

  assert.ok(opacityDefaults.length > 0, 'expected effect opacity defaults in setDefaults')
  assert.deepEqual([...new Set(opacityDefaults)], ['1'])
})

test('demo defaults Radius to its minimum and Speed to 1x', () => {
  const source = readFileSync(new URL('../src/main.ts', import.meta.url), 'utf8')
  const setDefaultsBody = source.match(/function setDefaults\(effectId: EffectId\): void \{[\s\S]*?\n\}\n\nfunction syncVisibleControls/)?.[0] ?? ''

  assert.match(setDefaultsBody, /elements\.radius\.value = elements\.radius\.min/)
  assert.match(setDefaultsBody, /elements\.speed\.value = '1'/)
  assert.doesNotMatch(setDefaultsBody, /elements\.radius\.value = '\d/)
  assert.doesNotMatch(setDefaultsBody, /elements\.speed\.value = elements\.speed\.min/)
  assert.match(source, /function formatSpeedValue\(value: number\): string/)
  assert.match(source, /elements\.speedValue\.textContent = `\$\{formatSpeedValue\(numberValue\(elements\.speed\)\)\}x`/)
})

test('demo uses FireHotspot terrain and places water-surface on the yunzhou-onemap river polygon', () => {
  const source = readFileSync(new URL('../src/main.ts', import.meta.url), 'utf8')

  assert.match(source, /fireHotspotTerrainUrl = 'http:\/\/39\.105\.60\.121\/mapdata\/terrain'/)
  assert.match(source, /CesiumTerrainProvider\.fromUrl\(fireHotspotTerrainUrl\)/)
  assert.match(source, /viewer\.terrainProvider = terrainProvider/)
  assert.match(source, /void applyFireHotspotTerrain\(\)/)
  assert.match(source, /type YunzhouRiverWaterSegment = \{/)
  assert.match(source, /const yunzhouOnemapRiverWaterSegments = \[/)
  assert.match(source, /source: 'yunzhou-onemap src\/common\/water-surface\.ts WaterPrimitive coordinates'/)
  assert.match(source, /polygon: \[/)
  assert.match(source, /longitude: 113\.53286993642162/)
  assert.match(source, /latitude: 40\.09427040664276/)
  assert.match(source, /height: 1100\.5107316527904/)
  assert.match(source, /longitude: 113\.5359144319117/)
  assert.match(source, /latitude: 40\.08674727960947/)
  assert.match(source, /const waterSurfaceSegments = yunzhouOnemapRiverWaterSegments/)
  assert.match(source, /let activeWaterSurfaceEffects: WaterSurfaceEffectInstance\[\] = \[\]/)
  assert.match(source, /destroyActiveWaterSurfaceEffects\(\)/)
  assert.match(source, /activeWaterSurfaceEffects = createWaterSurfaceEffects\(\)/)
  assert.match(source, /function flyToWaterSurface/)
  assert.match(source, /BoundingSphere\.fromPoints/)
  assert.match(source, /flyToBoundingSphere\(sphere/)
  assert.match(source, /return waterSurfaceSegments\.map/)
  assert.match(source, /type: elements\.waterType\.value as WaterSurfaceType/)
  assert.match(source, /flowDirection: segment\.flowDirection/)
  assert.match(source, /height: segment\.height/)
  assert.match(source, /outline: false/)
  assert.match(source, /elements\.outline\.checked = false/)
  assert.match(source, /elements\.waterType\.value = 'flow'/)
  assert.match(source, /elements\.color\.value = '#00777f'/)
  assert.match(source, /elements\.distortionScale\.value = '3\.7'/)
  assert.match(source, /elements\.reflectivity\.value = '0\.3'/)
  assert.match(source, /activeEffect\?\.flyTo\(\)/)
  assert.match(source, /waterSurfaces\[0\]\?\.flyTo\(\)/)
})

test('demo exposes pipe-flow with water-pipe controls and generated code', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8')
  const source = readFileSync(new URL('../src/main.ts', import.meta.url), 'utf8')

  assert.match(html, /data-effect="pipe-flow"/)
  assert.match(html, /id="pipeOpacity"/)
  assert.match(html, /id="bubbleDensity"/)
  assert.match(source, /createPipeFlowEffect/)
  assert.match(source, /pipeOpacity:/)
  assert.match(source, /bubbleDensity:/)
})

test('demo exposes fly-line with all three flight modes and generated code', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8')
  const source = readFileSync(new URL('../src/main.ts', import.meta.url), 'utf8')

  assert.match(html, /data-effect="fly-line"/)
  assert.match(html, /id="flyMode"/)
  assert.match(html, /single-arc/)
  assert.match(html, /hub-spoke/)
  assert.match(html, /bidirectional/)
  assert.match(source, /createFlyLineEffect/)
  assert.match(source, /provinceCapitalFlyLineRoutes/)
  assert.match(source, /mode: elements\.flyMode\.value/)
  assert.match(source, /getFlyLineCode/)
})

test('demo exposes material-polyline with custom image controls and generated code', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8')
  const source = readFileSync(new URL('../src/main.ts', import.meta.url), 'utf8')
  const materialPolylineCopyBlock = source.slice(
    source.indexOf("'material-polyline': {"),
    source.indexOf("  'fly-line': {"),
  )
  const materialPolylineUsageBlock = source.slice(
    source.indexOf('function getMaterialPolylineCode'),
    source.indexOf('function getFlyLineCode'),
  )

  assert.match(html, /data-effect="material-polyline"/)
  assert.match(html, /id="materialPolylineCustomImage"/)
  assert.match(html, /Custom image URL/)
  assert.doesNotMatch(html, /id="materialPolylineStyle"/)
  assert.doesNotMatch(html, /id="materialPolylineImagePreset"/)
  assert.doesNotMatch(html, /id="materialPolylineShowcase"/)
  assert.doesNotMatch(html, /Material style/)
  assert.doesNotMatch(html, /Image preset/)
  assert.doesNotMatch(html, /Show style showcase/)
  assert.match(source, /createMaterialPolylineEffect/)
  assert.match(source, /materialPolylineCustomImage/)
  assert.match(source, /getVisibleMaterialPolylineRoutes/)
  assert.match(source, /const materialPolylinePrimaryRoute = materialPolylineShowcaseRoutes\[0\]/)
  assert.match(source, /return \[materialPolylinePrimaryRoute\]/)
  assert.doesNotMatch(source, /materialPolylineStyle:/)
  assert.doesNotMatch(source, /materialPolylineImagePreset:/)
  assert.doesNotMatch(source, /materialPolylineStyleField/)
  assert.doesNotMatch(source, /materialPolylineImagePresetField/)
  assert.doesNotMatch(source, /materialPolylineShowcase:/)
  assert.doesNotMatch(source, /materialPolylineShowcaseField/)
  assert.match(materialPolylineCopyBlock, /single editable custom image URL/)
  assert.match(materialPolylineCopyBlock, /only editable field is the custom image URL/)
  assert.doesNotMatch(materialPolylineCopyBlock, /Show style showcase/)
  assert.doesNotMatch(materialPolylineCopyBlock, /Material style/)
  assert.doesNotMatch(materialPolylineCopyBlock, /Image preset/)
  for (const texture of [
    'line-pulse.png',
    'line-gradual.png',
    'line-arrow-blue.png',
    'line-colour.png',
    'arrow-h.png',
    'line-arrow-dovetail.png',
    'line-color-yellow.png',
    'line-tarans.png',
    'line-interval.png',
    'line-gradient.png',
    'arrow-small.png',
  ]) {
    assert.equal(source.includes(`https://data.mars3d.cn/img/textures/${texture}`), true)
  }
  assert.match(source, /getMaterialPolylineRouteImage/)
  assert.match(source, /return index === 0 \? customImage \?\? route\.image : route\.image/)
  assert.match(source, /function getMaterialPolylineRouteOptions/)
  assert.match(source, /style: route\.style/)
  assert.match(source, /color: route\.color/)
  assert.doesNotMatch(source, /imagePreset: route\.imagePreset/)
  assert.doesNotMatch(source, /function getMaterialPolylineShowcaseCode/)
  assert.doesNotMatch(source, /const materialLineOptions = \[/)
  assert.match(source, /getMaterialPolylineCode/)
  assert.match(source, /'material-polyline': \['materialPolylineCustomImageField'\]/)
  assert.match(source, /formatMaterialPolylineOptions\(route, 0, routeImage, 2\)/)
  assert.doesNotMatch(source, /formatMaterialPolylineOptions\(route, 0, routeImage, 2, \{ compact: true \}\)/)
  assert.match(materialPolylineUsageBlock, /image: '\$\{image\}'/)
  assert.doesNotMatch(materialPolylineUsageBlock, /style:/)
  assert.doesNotMatch(materialPolylineUsageBlock, /color:/)
  assert.doesNotMatch(materialPolylineUsageBlock, /secondaryColor:/)
  assert.doesNotMatch(materialPolylineUsageBlock, /backgroundColor:/)
  assert.doesNotMatch(materialPolylineUsageBlock, /outlineWidth:/)
  assert.doesNotMatch(materialPolylineUsageBlock, /imagePreset:/)
})

test('material-polyline Mars3D image routes stay fixed behind the single URL control', () => {
  const source = readFileSync(new URL('../src/main.ts', import.meta.url), 'utf8')
  const routeBlock = source.slice(
    source.indexOf('const materialPolylineShowcaseRoutes'),
    source.indexOf('const materialPolylinePrimaryRoute'),
  )

  assert.equal((routeBlock.match(/image: mars3dMaterialPolylineTextures\./g) ?? []).length, 11)
  assert.equal((routeBlock.match(/style: 'flow'/g) ?? []).length, 11)
  assert.doesNotMatch(routeBlock, /style: 'navigation'/)
  assert.doesNotMatch(routeBlock, /style: 'cross'/)
  assert.doesNotMatch(routeBlock, /style: 'three-dash'/)

  const optionsBlock = source.slice(
    source.indexOf('function getMaterialPolylineRouteOptions'),
    source.indexOf('function createMaterialPolylineEffects'),
  )
  assert.doesNotMatch(optionsBlock, /isMaterialPolylineRouteEditable/)
  assert.doesNotMatch(optionsBlock, /elements\.materialPolylineStyle/)
  assert.doesNotMatch(optionsBlock, /elements\.materialPolylineImagePreset/)
  assert.doesNotMatch(optionsBlock, /elements\.color/)
  assert.doesNotMatch(optionsBlock, /numberValue\(elements\.width\)/)
  assert.doesNotMatch(optionsBlock, /numberValue\(elements\.speed\)/)
  assert.doesNotMatch(optionsBlock, /numberValue\(elements\.cornerRadius\)/)
  assert.doesNotMatch(optionsBlock, /materialPolylineShowcase/)
  assert.match(optionsBlock, /style: route\.style/)
  assert.match(optionsBlock, /color: route\.color/)
  assert.match(optionsBlock, /width: route\.width/)
  assert.match(optionsBlock, /speed: 1/)
  assert.doesNotMatch(optionsBlock, /imagePreset/)
  assert.match(optionsBlock, /cornerRadius: 0\.12/)
})

test('demo HUD controls avoid horizontal overflow', () => {
  const styles = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8')

  assert.match(styles, /\.hud\s*\{[\s\S]*overflow-x:\s*hidden;/)
  assert.match(styles, /\.hud\s*\{[\s\S]*overflow-y:\s*auto;/)
  assert.match(styles, /\.control-grid input\[type="color"\],[\s\S]*\.control-grid input\[type="url"\],[\s\S]*\.control-grid select\s*\{[\s\S]*box-sizing:\s*border-box;/)
})

test('demo Usage panel exposes TypeScript React Vue templates and clipboard copy', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8')
  const source = readFileSync(new URL('../src/main.ts', import.meta.url), 'utf8')

  assert.match(html, /id="usageToolbar"/)
  assert.match(html, /data-code-template="typescript"/)
  assert.match(html, /data-code-template="react"/)
  assert.match(html, /data-code-template="vue"/)
  assert.match(html, /id="copyCode"/)
  assert.match(source, /type CodeTemplate =/)
  assert.match(source, /activeCodeTemplate/)
  assert.match(source, /function getReactCodeTemplate/)
  assert.match(source, /function getVueCodeTemplate/)
  assert.match(source, /navigator\.clipboard\.writeText/)
  assert.match(source, /function fallbackCopyText/)
  assert.match(source, /const copied = document\.execCommand\('copy'\)/)
  assert.match(source, /showCopyStatus\(copied \? 'Copied' : 'Copy failed'\)/)
  assert.match(source, /line\.includes\('entities\.remove\('\)/)
})

test('demo Usage panel constrains code area so long templates scroll', () => {
  const styles = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8')

  assert.match(styles, /\.docs-panel\s*\{[\s\S]*grid-template-rows:\s*auto auto minmax\(0,\s*1fr\);/)
  assert.match(styles, /\.code-block\s*\{[\s\S]*overflow:\s*auto;/)
  assert.match(styles, /\.notes\s*\{[\s\S]*overflow:\s*auto;/)
})

test('demo scroll containers use a compact dark scrollbar style', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8')
  const styles = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8')

  assert.match(html, /class="template-tabs scroll-panel"/)
  assert.match(html, /class="code-block scroll-panel"/)
  assert.match(html, /class="notes scroll-panel"/)
  assert.match(styles, /\.scroll-panel\s*\{[\s\S]*scrollbar-width:\s*thin;/)
  assert.match(styles, /\.scroll-panel\s*\{[\s\S]*scrollbar-color:\s*rgb\(94 232 255 \/ 42%\) transparent;/)
  assert.match(styles, /\.scroll-panel::-webkit-scrollbar\s*\{[\s\S]*width:\s*8px;/)
  assert.match(styles, /\.scroll-panel::-webkit-scrollbar-thumb\s*\{[\s\S]*background:\s*linear-gradient/)
  assert.match(styles, /\.scroll-panel::-webkit-scrollbar-thumb:hover\s*\{[\s\S]*background:\s*linear-gradient/)
})

test('demo fly-line routes travel from Beijing to province capitals', () => {
  const source = readFileSync(new URL('../src/main.ts', import.meta.url), 'utf8')

  assert.match(source, /const beijingCapital = \{ longitude: 116\.4074, latitude: 39\.9042 \}/)
  assert.match(source, /const provinceCapitalFlyLineTargets = \[/)
  assert.match(source, /const provinceCapitalFlyLineRoutes = provinceCapitalFlyLineTargets\.map/)
  assert.match(source, /from: beijingCapital/)
  assert.match(source, /lines: provinceCapitalFlyLineRoutes/)
  assert.match(source, /formatFlyLines\(provinceCapitalFlyLineRoutes\)/)
  assert.match(source, /name: '上海'[\s\S]*longitude: 121\.4737[\s\S]*latitude: 31\.2304/)
  assert.match(source, /name: '广州'[\s\S]*longitude: 113\.2644[\s\S]*latitude: 23\.1291/)
  assert.match(source, /name: '成都'[\s\S]*longitude: 104\.0668[\s\S]*latitude: 30\.5728/)
  assert.match(source, /name: '拉萨'[\s\S]*longitude: 91\.1175[\s\S]*latitude: 29\.647/)
  assert.match(source, /name: '乌鲁木齐'[\s\S]*longitude: 87\.6168[\s\S]*latitude: 43\.8256/)
  assert.match(source, /elements\.height\.min = '20000'/)
  assert.match(source, /elements\.height\.max = '260000'/)
  assert.match(source, /elements\.height\.step = '5000'/)
  assert.match(source, /elements\.height\.value = '220000'/)
})

test('demo exposes route-scan as a moving scanner with one selectable scan effect at a time', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8')
  const source = readFileSync(new URL('../src/main.ts', import.meta.url), 'utf8')
  const routeScanBody = source.match(/function createRouteScanEffect\(\): RouteScanEffectInstance \{[\s\S]*?\n\}\n\nfunction destroyActiveWaterSurfaceEffects/)?.[0] ?? ''
  const generatedExample = source.match(/function getRouteScanCode\(\): string \{[\s\S]*?viewer\.dataSources\.remove\(routeScanDataSource, true\)`\n\}/)?.[0] ?? ''

  assert.match(html, /data-effect="route-scan"/)
  assert.match(source, /type RouteScanEffectInstance = /)
  assert.match(source, /type RouteScanMode = 'radar-scan' \| 'scan-cone'/)
  assert.match(source, /const routeScanPositions = \[/)
  assert.match(source, /const routeScanSegments = getRouteScanSegments\(\)/)
  assert.match(source, /function createRouteScanEffect\(\): RouteScanEffectInstance/)
  assert.match(source, /createRadarScanEffect\(viewer/)
  assert.match(source, /createScanConeEffect\(viewer/)
  assert.match(source, /createRadarScanMaterialProperty/)
  assert.match(source, /createScanConeMaterialProperty/)
  assert.match(source, /scannerCenter = center/)
  assert.match(routeScanBody, /createRouteRadarScanEffect/)
  assert.match(routeScanBody, /createRouteConeScanEffect/)
  assert.match(routeScanBody, /position: new CallbackPositionProperty/)
  assert.match(routeScanBody, /orientation: new CallbackProperty/)
  assert.match(routeScanBody, /let scanRotationSpeed = Math\.max\(1, options\.speed\)/)
  assert.match(routeScanBody, /function updateConeAnimationTime\(\): void/)
  assert.match(routeScanBody, /material\.uniforms\.timeSeconds = \(performance\.now\(\) - coneAnimationStartedAt\) \/ 1000/)
  assert.match(routeScanBody, /updateConeAnimationTime\(\)[\s\S]*viewer\.scene\.requestRender\(\)[\s\S]*animationFrame = requestAnimationFrame\(tick\)/)
  assert.match(routeScanBody, /ellipse: \{/)
  assert.match(source, /scanMode: getRouteScanMode\(\)/)
  assert.match(source, /elements\.radarType\.value = 'radar-scan'/)
  assert.match(source, /elements\.radarType\.innerHTML = routeScanModeOptions/)
  assert.match(source, /elements\.coneType\.disabled = options\.scanMode !== 'scan-cone'/)
  assert.match(source, /requestAnimationFrame\(tick\)/)
  assert.match(source, /routeScanDataSource/)
  assert.match(source, /PolylineGlowMaterialProperty/)
  assert.match(source, /routeScanDataSource\.show = options\.showRoute/)
  assert.match(source, /speed: numberValue\(elements\.speed\)/)
  assert.match(source, /if \(activeEffectId === 'route-scan'\) return getRouteScanCode\(\)/)
  assert.match(source, /'route-scan': \[/)
  assert.match(source, /showRoute: elements\.outline\.checked/)
  assert.match(routeScanBody, /if \(options\.scanMode === 'radar-scan'\)/)
  assert.match(routeScanBody, /scanner\.update\(\{ center: sample\.position \}\)/)
  assert.doesNotMatch(routeScanBody, /const radar = createRadarScanEffect/)
  assert.doesNotMatch(routeScanBody, /const cone = createScanConeEffect\(viewer/)
  assert.doesNotMatch(routeScanBody, /heading: sample\.heading \+ options\.heading/)
  assert.doesNotMatch(generatedExample, /createRadarScanEffect\(viewer[\s\S]*scanner\.update\(\{ center \}\)/)
  assert.doesNotMatch(generatedExample, /createScanConeEffect\(viewer[\s\S]*scanner\.update\(\{ center \}\)/)
  assert.match(generatedExample, /scannerMaterial\.uniforms\.timeSeconds = \(now - routeStart\) \/ 1000/)
  assert.doesNotMatch(generatedExample, /const radar = createRadarScanEffect[\s\S]*const cone = createScanConeEffect/)
})

test('demo exposes temperature-field with FireHotspot-compatible generated code', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8')
  const source = readFileSync(new URL('../src/main.ts', import.meta.url), 'utf8')
  const temperatureDataSource = readFileSync(new URL('../src/temperature-field-data.ts', import.meta.url), 'utf8')

  assert.match(html, /data-effect="temperature-field"/)
  assert.match(source, /beijingTemperatureFieldPolygons/)
  assert.match(source, /loadBeijingBoundaryFromTianditu/)
  assert.match(source, /api\.tianditu\.gov\.cn\/v2\/administrative/)
  assert.match(source, /const beijingTiandituRegionCode = '156110000'/)
  assert.match(source, /keyword:\s*beijingTiandituRegionCode/)
  assert.doesNotMatch(source, /keyword:\s*'110000'/)
  assert.match(source, /childLevel:\s*'0'/)
  assert.match(source, /extensions:\s*'true'/)
  assert.match(source, /parseTiandituAdministrativePolygons/)
  assert.match(source, /fallbackBeijingTemperatureFieldPolygons/)
  assert.match(source, /createRandomTemperatureSamples/)
  assert.match(temperatureDataSource, /isPointInPolygon/)
  assert.match(source, /temperatureFieldSamples/)
  assert.match(temperatureDataSource, /type:\s*'critical'/)
  assert.match(source, /createTemperatureFieldEffect/)
  assert.match(source, /samples:\s*temperatureFieldSamples/)
  assert.match(source, /riskSurface\.polygons/)
  assert.match(source, /riskSurface\.riskField\.samples/)
  assert.match(source, /riskSurface\.riskField\.stops/)
})

test('demo parses Tianditu v2 administrative WKT boundaries like FireHotspot', () => {
  const polygons = parseTiandituAdministrativePolygons({
    status: 200,
    data: {
      district: [
        {
          boundary:
            'MULTIPOLYGON(((116.0 39.0,116.6 39.0,116.6 39.6,116.0 39.6,116.0 39.0)),((116.8 39.8,117.0 39.8,117.0 40.0,116.8 40.0,116.8 39.8)))',
        },
      ],
    },
  })

  assert.equal(polygons.length, 2)
  assert.deepEqual(polygons[0]?.outer, [
    [116.0, 39.0],
    [116.6, 39.0],
    [116.6, 39.6],
    [116.0, 39.6],
    [116.0, 39.0],
  ])
  assert.deepEqual(polygons[1]?.outer.at(-1), [116.8, 39.8])
})

test('demo only shows generated temperature samples while the temperature field is active', () => {
  const source = readFileSync(new URL('../src/main.ts', import.meta.url), 'utf8')

  assert.match(source, /syncTemperatureSampleLayer\(effectId === 'temperature-field'\)/)
  assert.match(source, /syncTemperatureSampleLayer\(false\)/)
  assert.match(source, /function syncTemperatureSampleLayer\(visible: boolean\): void/)
  assert.match(source, /if \(!visible\) return/)
})

test('demo exposes fire-billboard with user-provided longitude latitude and gif', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8')
  const source = readFileSync(new URL('../src/main.ts', import.meta.url), 'utf8')
  const generatedExample = source.match(/function getFireBillboardCode\(\): string \{[\s\S]*?fireBillboard\.destroy\(\)`\n\}/)?.[0] ?? ''

  assert.match(html, /data-effect="fire-billboard"/)
  assert.match(html, /id="scale"/)
  assert.match(source, /createFireBillboardEffect/)
  assert.match(source, /fireBillboardPoints/)
  assert.match(source, /longitude:/)
  assert.match(source, /latitude:/)
  assert.match(source, /gif:/)
  assert.match(source, /https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\/c\/c1\/Torche\.gif/)
  assert.match(source, /fire-orange-billboard\.gif/)
  assert.match(source, /fire-green-billboard\.gif/)
  assert.match(source, /fire-white-billboard\.gif/)
  assert.doesNotMatch(source, /Animated-flame\.gif/)
  assert.doesNotMatch(source, /dog\.gif/)
  assert.match(source, /scale: numberValue\(elements\.scale\)/)
  assert.match(generatedExample, /scale:/)
  assert.doesNotMatch(generatedExample, /width:/)
  assert.doesNotMatch(generatedExample, /height:/)
  assert.match(source, /'fire-billboard': \['scaleField', 'frameIntervalField'\]/)
  assert.match(source, /getFireBillboardCode/)
})

test('demo exposes P0 scene weather, post-process, and water-surface effects', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8')
  const source = readFileSync(new URL('../src/main.ts', import.meta.url), 'utf8')

  assert.match(html, /data-effect="scene-weather"/)
  assert.match(html, /data-effect="post-process"/)
  assert.match(html, /data-effect="water-surface"/)
  assert.match(html, /id="weatherType"/)
  assert.match(html, /id="postProcessType"/)
  assert.match(html, /id="waterType"/)
  assert.match(html, /value="flow">flow/)
  assert.match(html, /id="windDirection"/)
  assert.match(html, /id="waveStrength"/)
  assert.match(html, /id="reflectionStrength"/)
  assert.match(html, /id="distortionScale"/)
  assert.match(html, /id="reflectivity"/)
  assert.match(html, /id="refractionStrength"/)
  assert.match(html, /id="fresnelPower"/)

  assert.match(source, /createSceneWeatherEffect/)
  assert.match(source, /createPostProcessEffect/)
  assert.match(source, /createWaterSurfaceEffect/)
  assert.match(source, /distortionScale: numberValue\(elements\.distortionScale\)/)
  assert.match(source, /reflectivity: numberValue\(elements\.reflectivity\)/)
  assert.match(source, /refractionStrength: numberValue\(elements\.refractionStrength\)/)
  assert.match(source, /fresnelPower: numberValue\(elements\.fresnelPower\)/)
  assert.match(source, /waterSurfaceSegments/)
  assert.match(source, /getSceneWeatherCode/)
  assert.match(source, /getPostProcessCode/)
  assert.match(source, /getWaterSurfaceCode/)
  assert.match(source, /'scene-weather': \[/)
  assert.match(source, /'post-process': \[/)
  assert.match(source, /'water-surface': \[/)
})
