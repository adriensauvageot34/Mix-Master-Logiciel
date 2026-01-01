const getValueAtPath = (state, path) =>
  path.split('.').reduce((acc, key) => (acc ? acc[key] : undefined), state)

const isEmptyValue = (value) => {
  if (value === undefined || value === null) return true
  if (typeof value === 'string') return value.trim() === ''
  if (Array.isArray(value)) return value.length === 0
  return false
}

const flattenTests = (testsDef = []) => {
  const tests = Array.isArray(testsDef) ? testsDef : testsDef.tests || []
  return tests
}

export function evaluateDone(rules = {}, state, testsDef = []) {
  const blockers = []
  const tests = flattenTests(testsDef)
  const doneRules = rules.doneGates || rules.done || []

  doneRules.forEach((rule) => {
    if (rule.type === 'requiredField') {
      const value = getValueAtPath(state, rule.path)
      if (isEmptyValue(value)) blockers.push(rule.message || `Missing field: ${rule.path}`)
    }
    if (rule.type === 'requiredTestNotSkipped') {
      const test = state.tests?.[rule.testId]
      if (!test || test.verdict === 'SKIP' || !test.verdict) {
        blockers.push(rule.message || `Test ${rule.testId} must not be skipped`)
      }
    }
  })

  tests.forEach((test) => {
    const verdict = state.tests?.[test.id]?.verdict
    if (test.nonSkippable && (!verdict || verdict === 'SKIP')) {
      blockers.push(`Test ${test.id} ne peut pas être SKIP`)
    }
    if (test.required && (!verdict || verdict === 'SKIP')) {
      blockers.push(`Test ${test.id} requis manquant`)
    }
  })

  if (rules.doneRequiresAllRunsValidated) {
    const queue = state.runs?.queue || []
    const invalid = queue.filter((r) => r.status !== 'VALID')
    if (invalid.length) blockers.push('Tous les runs doivent être VALID')
  }

  return { ok: blockers.length === 0, blockers }
}
