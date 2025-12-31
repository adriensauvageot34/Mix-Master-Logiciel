#!/usr/bin/env node
import fs from 'fs'
import path from 'path'

const dir = process.argv[2]
if (!dir) {
  console.error('Usage: node tools/validate-pack.js <door_dir>')
  process.exit(1)
}

const errors = []
const readJson = (name) => JSON.parse(fs.readFileSync(path.join(dir, name), 'utf8'))
const manifest = readJson('door.manifest.json')
const tests = readJson('door.tests.json')
const content = fs.readFileSync(path.join(dir, 'door.content.html'), 'utf8')
const resources = fs.readFileSync(path.join(dir, 'door.resources.html'), 'utf8')

;(manifest.sections || []).forEach((section) => {
  if (!content.includes(`data-section-id="${section.id}"`)) {
    errors.push(`Missing section content for ${section.id}`)
  }
})

;(manifest.resources || []).forEach((res) => {
  if (!resources.includes(`data-resource-id="${res.id}"`)) {
    errors.push(`Missing resource content for ${res.id}`)
  }
})

const ids = new Set()
;(tests || []).forEach((test) => {
  if (ids.has(test.id)) errors.push(`Duplicate test id ${test.id}`)
  ids.add(test.id)
})

if (errors.length) {
  console.error(errors.join('\n'))
  process.exit(1)
}

console.log('Pack looks valid')
