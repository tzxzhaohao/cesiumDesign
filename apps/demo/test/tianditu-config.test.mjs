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
