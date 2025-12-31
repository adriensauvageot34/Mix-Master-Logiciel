export function evaluateDone(rules = {}, state) {
  const blockers = []
  const doneRules = rules.done || []

  doneRules.forEach((rule) => {
    if (rule.type === 'requiredField') {
      const path = rule.path
      const value = path.split('.').reduce((acc, key) => (acc ? acc[key] : undefined), state)
      if (!value) blockers.push(`Missing field: ${path}`)
    }
    if (rule.type === 'requiredTestNotSkipped') {
      const skipped = (state.tests || []).filter((t) => t.skipped)
      if (skipped.length) blockers.push('Some tests are skipped')
    }
  })

  return { ok: blockers.length === 0, blockers }
}
