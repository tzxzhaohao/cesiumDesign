import { cpSync, rmSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const currentDir = path.dirname(fileURLToPath(import.meta.url))
const source = path.resolve(currentDir, '../../knowledge')
const target = path.resolve(currentDir, '../dist/knowledge')

rmSync(target, { recursive: true, force: true })
cpSync(source, target, { recursive: true })
