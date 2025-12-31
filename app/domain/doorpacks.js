// app/domain/doorpacks.js

// --- _template imports
import templateMeta from "../../doors/_template/door.meta.json";
import templateManifest from "../../doors/_template/door.manifest.json";
import templateRules from "../../doors/_template/door.rules.json";
import templateTests from "../../doors/_template/door.tests.json";
import templatePaths from "../../doors/_template/door.paths.json";
import templateTargets from "../../doors/_template/door.targets.json";
import templateContentHtml from "../../doors/_template/door.content.html?raw";
import templateResourcesHtml from "../../doors/_template/door.resources.html?raw";
import templateCssText from "../../doors/_template/door.css?raw";

// --- P14 imports
import p14Meta from "../../doors/P14/door.meta.json";
import p14Manifest from "../../doors/P14/door.manifest.json";
import p14Rules from "../../doors/P14/door.rules.json";
import p14Tests from "../../doors/P14/door.tests.json";
import p14Paths from "../../doors/P14/door.paths.json";
import p14Targets from "../../doors/P14/door.targets.json";
import p14ContentHtml from "../../doors/P14/door.content.html?raw";
import p14ResourcesHtml from "../../doors/P14/door.resources.html?raw";
import p14CssText from "../../doors/P14/door.css?raw";

// --- Registry (bundled packs, no runtime fetch)
const PACKS = {
  _template: {
    meta: templateMeta,
    manifest: templateManifest,
    rules: templateRules,
    tests: templateTests,
    paths: templatePaths,
    targets: templateTargets,
    contentHtml: templateContentHtml,
    resourcesHtml: templateResourcesHtml,
    cssText: templateCssText
  },
  P14: {
    meta: p14Meta,
    manifest: p14Manifest,
    rules: p14Rules,
    tests: p14Tests,
    paths: p14Paths,
    targets: p14Targets,
    contentHtml: p14ContentHtml,
    resourcesHtml: p14ResourcesHtml,
    cssText: p14CssText
  }
};

export function getDoorPack(doorId) {
  const pack = PACKS[doorId];
  if (!pack) throw new Error(`Door pack not found: ${doorId}`);
  return pack;
}

export function listDoorIds() {
  return Object.keys(PACKS);
}
