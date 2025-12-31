const requiredFields = ['meta', 'manifest', 'rules', 'tests', 'paths', 'targets', 'contentHtml', 'resourcesHtml']

export function validatePack(pack, id) {
  requiredFields.forEach((field) => {
    if (pack[field] === undefined) {
      throw new Error(`Pack ${id || ''} missing field ${field}`)
    }
  })
}

export function normalizePack(pack) {
  const manifest = {
    sections: pack.manifest?.sections || [],
    resources: pack.manifest?.resources || [],
    t3Order: pack.manifest?.t3Order || []
  }

  const testsConfig = Array.isArray(pack.tests)
    ? { groups: [], tests: pack.tests }
    : {
        groups: pack.tests?.groups || [],
        tests: pack.tests?.tests || []
      }

  return {
    ...pack,
    manifest,
    rules: pack.rules || { done: [] },
    tests: testsConfig,
    paths: pack.paths || { trials: [], commits: [] },
    targets: pack.targets || { primary: [], secondary: [] },
    contentHtml: pack.contentHtml || '',
    resourcesHtml: pack.resourcesHtml || '',
    cssText: pack.cssText || ''
  }
}
