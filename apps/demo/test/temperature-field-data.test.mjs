import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { Buffer } from 'node:buffer'
import ts from 'typescript'

const {
  createRandomTemperatureSamples,
  isPointInPolygon,
  parseTiandituAdministrativePolygons,
  parseTiandituRegionString,
} = await importTemperatureFieldData()

const sampleTiandituPayload = {
  data: [
    {
      name: '北京市',
      points: [
        {
          region:
            '115.42,39.44 115.70,39.56 115.79,39.80 115.78,40.16 115.92,40.44 116.17,40.65 116.46,41.06 116.84,40.98 117.21,40.74 117.51,40.66 117.43,40.27 117.25,40.06 117.31,39.85 116.93,39.63 116.71,39.54 116.42,39.44 116.08,39.46',
        },
      ],
    },
  ],
}

test('parseTiandituAdministrativePolygons reads Tianditu points.region boundaries', () => {
  const polygons = parseTiandituAdministrativePolygons(sampleTiandituPayload)

  assert.equal(polygons.length, 1)
  assert.equal(polygons[0].outer.length, 17)
  assert.deepEqual(polygons[0].outer[0], [115.42, 39.44])
  assert.deepEqual(polygons[0].outer.at(-1), [116.08, 39.46])
})

test('parseTiandituRegionString supports multi-ring region strings', () => {
  const rings = parseTiandituRegionString('116.1,39.7 116.6,39.7 116.6,40.1|116.2,39.8 116.3,39.8 116.3,39.9')

  assert.equal(rings.length, 2)
  assert.deepEqual(rings[0], [
    [116.1, 39.7],
    [116.6, 39.7],
    [116.6, 40.1],
  ])
  assert.deepEqual(rings[1], [
    [116.2, 39.8],
    [116.3, 39.8],
    [116.3, 39.9],
  ])
})

test('createRandomTemperatureSamples places each configured temperature type inside the boundary', () => {
  const [polygon] = parseTiandituAdministrativePolygons(sampleTiandituPayload)
  const configs = [
    { type: 'low', value: 15, color: '#57c7ff', count: 2 },
    { type: 'hot', value: 68, color: '#ff8a2d', count: 2 },
    { type: 'critical', value: 88, color: '#ff3e2f', count: 1 },
  ]

  const samples = createRandomTemperatureSamples([polygon], configs, 9528)

  assert.equal(samples.length, 5)
  assert.deepEqual(
    samples.map((sample) => sample.type),
    ['low', 'low', 'hot', 'hot', 'critical'],
  )
  samples.forEach((sample) => {
    assert.equal(isPointInPolygon([sample.longitude, sample.latitude], polygon.outer), true)
  })
})

async function importTemperatureFieldData() {
  const source = readFileSync(new URL('../src/temperature-field-data.ts', import.meta.url), 'utf8')
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2022,
      verbatimModuleSyntax: true,
    },
  }).outputText
  const encoded = Buffer.from(transpiled, 'utf8').toString('base64')
  return import(`data:text/javascript;base64,${encoded}`)
}
