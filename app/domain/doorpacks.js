import templateMeta from '../../doors/_template/door.meta.json'
import templateManifest from '../../doors/_template/door.manifest.json'
import templateRules from '../../doors/_template/door.rules.json'
import templateTests from '../../doors/_template/door.tests.json'
import templatePaths from '../../doors/_template/door.paths.json'
import templateTargets from '../../doors/_template/door.targets.json'
import templateContent from '../../doors/_template/door.content.html?raw'
import templateResources from '../../doors/_template/door.resources.html?raw'
import templateCss from '../../doors/_template/door.css?raw'

import p14Meta from '../../doors/P14/door.meta.json'
import p14Manifest from '../../doors/P14/door.manifest.json'
import p14Rules from '../../doors/P14/door.rules.json'
import p14Tests from '../../doors/P14/door.tests.json'
import p14Paths from '../../doors/P14/door.paths.json'
import p14Targets from '../../doors/P14/door.targets.json'
import p14Content from '../../doors/P14/door.content.html?raw'
import p14Resources from '../../doors/P14/door.resources.html?raw'
import p14Css from '../../doors/P14/door.css?raw'

const packs = {
  _template: {
    meta: templateMeta,
    manifest: templateManifest,
    rules: templateRules,
    tests: templateTests,
    paths: templatePaths,
    targets: templateTargets,
    contentHtml: templateContent,
    resourcesHtml: templateResources,
    cssText: templateCss
  },
  P14: {
    meta: p14Meta,
    manifest: p14Manifest,
    rules: p14Rules,
    tests: p14Tests,
    paths: p14Paths,
    targets: p14Targets,
    contentHtml: p14Content,
    resourcesHtml: p14Resources,
    cssText: p14Css
  }
}

export const listDoorIds = () => Object.keys(packs)

export function getDoorPack(doorId) {
  const pack = packs[doorId]
  if (!pack) throw new Error(`Door pack not found: ${doorId}`)
  return pack
}
