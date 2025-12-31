#!/usr/bin/env node
import fs from 'fs'
import path from 'path'

const doorId = process.argv[2]
if (!doorId) {
  console.error('Usage: node tools/scaffold-door.js Pxx')
  process.exit(1)
}

const templateDir = path.resolve('doors/_template')
const targetDir = path.resolve(`doors/${doorId}`)

if (fs.existsSync(targetDir)) {
  console.error('Target door already exists')
  process.exit(1)
}

fs.mkdirSync(targetDir, { recursive: true })

for (const file of fs.readdirSync(templateDir)) {
  const src = path.join(templateDir, file)
  const dest = path.join(targetDir, file)
  const content = fs.readFileSync(src, 'utf8').replace(/_template/g, doorId)
  fs.writeFileSync(dest, content)
}

console.log(`Created door ${doorId} from template`)
