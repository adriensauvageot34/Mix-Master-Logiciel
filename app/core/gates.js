const getValueAtPath = (state, path) =>
  path.split('.').reduce((acc, key) => (acc ? acc[key] : undefined), state)

const isEmptyValue = (value) => {
  if (value === undefined || value === null) return true
  if (typeof value === 'string') return value.trim() === ''
  if (Array.isArray(value)) return value.length === 0
  return false
}

export function evaluateDone(rules = {}, state) {
  const blockers = []
  const doneRules = rules.doneGates || rules.done || []

  doneRules.forEach((rule) => {
    if (rule.type === 'requiredField') {
      const value = getValueAtPath(state, rule.path)
      if (isEmptyValue(value)) blockers.push(rule.message || `Missing field: ${rule.path}`)
    }
    if (rule.type === 'requiredTestNotSkipped') {
      const test = state.tests?.[rule.testId]
      if (!test || test.verdict === 'SKIP') {
        blockers.push(rule.message || `Test ${rule.testId} must not be skipped`)
      }
    }
  })

  return { ok: blockers.length === 0, blockers }
}
