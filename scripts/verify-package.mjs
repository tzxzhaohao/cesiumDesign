import { execFileSync } from 'node:child_process'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'

const root = process.cwd()
const tmp = mkdtempSync(path.join(tmpdir(), 'geo-effect-kit-pack-'))

try {
  const output = execFileSync('pnpm', ['--filter', '@ztgkzhaohao/geo-effect-kit', 'pack', '--pack-destination', tmp], {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  })

  const tarball = output
    .trim()
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => line.endsWith('.tgz'))

  if (!tarball) {
    throw new Error(`Could not find packed tarball in output:\n${output}`)
  }

  const tarballPath = path.isAbsolute(tarball) ? tarball : path.join(tmp, path.basename(tarball))
  const listing = execFileSync('tar', ['-tzf', tarballPath], {
    cwd: root,
    encoding: 'utf8',
  })

  const required = [
    'package/package.json',
    'package/dist/index.js',
    'package/dist/index.d.ts',
    'package/README.md',
    'package/LICENSE',
  ]

  for (const file of required) {
    if (!listing.includes(file)) {
      throw new Error(`Packed package is missing ${file}`)
    }
  }

  const forbidden = [
    'package/test/',
    'package/src/',
    'package/apps/',
    'package/node_modules/',
  ]

  for (const file of forbidden) {
    if (listing.includes(file)) {
      throw new Error(`Packed package includes forbidden path ${file}`)
    }
  }

  console.log(`Package tarball verified: ${tarballPath}`)
} finally {
  rmSync(tmp, { recursive: true, force: true })
}
