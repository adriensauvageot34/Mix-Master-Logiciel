const splitPath = (path) => path.replace(/\[(\d+)\]/g, '.$1').split('.').filter(Boolean)

const ensureObjectPath = (state, keys) => {
  let node = state
  while (keys.length > 1) {
    const key = keys.shift()
    if (node[key] === undefined) node[key] = {}
    node = node[key]
  }
  return { node, lastKey: keys[0] }
}

const coerceTestsState = (state, pack) => {
  const defs = Array.isArray(pack.tests) ? pack.tests : pack.tests?.tests || []
  const tests = {}
  defs.forEach((test) => {
    const current = state.tests?.[test.id] || {}
    tests[test.id] = {
      verdict: current.verdict || (current.skipped ? 'SKIP' : 'SKIP'),
      reason: current.reason || ''
    }
  })
  return tests
}

const coercePathState = (state) => {
  if (state.path) return state.path
  if (state.paths?.selection) return { ...state.paths.selection }
  return { commit: '', trials: [] }
}

export function createDefaultState(doorId, runId, pack) {
  const testDefs = Array.isArray(pack.tests) ? pack.tests : pack.tests?.tests || []
  const targetsDefault = pack.rules?.targets?.primaryDefault || ''
  const defaultPath = { commit: '', trials: [] }
  return {
    doorId,
    runId,
    version: 1,
    status: '',
    toggles: { sigOff: false, ctrlOff: false },
    checkpoint: { current: '' },
    risk: { badge: '' },
    path: defaultPath,
    paths: { selection: defaultPath },
    targets: { primary: targetsDefault, secondary: [] },
    core: {
      pathCommit: '',
      croix: '',
      riskFocus: '',
      targetPrimary: targetsDefault,
      targetSecondary: 'Aucun',
      constats: ''
    },
    reference: { used: false, whatToVerify: '' },
    notes: { trial: '', constats: '', afterCommit: '' },
    handoff: { text: '' },
    journal: { entry: '' },
    tests: testDefs.reduce((acc, test) => {
      acc[test.id] = { verdict: 'SKIP', reason: '' }
      return acc
    }, {}),
    fields: {},
    runs: [],
    ui: { collapsedSections: {} }
  }
}

export function createStore(initialState, pack) {
  let state = structuredClone(initialState)
  state.path = coercePathState(state)
  state.paths = { selection: state.path }
  state.targets = state.targets || { primary: '', secondary: [] }
  state.core = state.core || {}
  state.tests = coerceTestsState(state, pack)
  state.ui = state.ui || { collapsedSections: {} }

  const listeners = new Set()

  const notify = () => listeners.forEach((l) => l(state))

  const syncCoreFromState = () => {
    const commitId = state.path?.commit || ''
    const pathDef = (pack.paths?.commits || []).find((p) => p.id === commitId) ||
      (pack.paths?.trials || []).find((p) => p.id === commitId)

    state.core.pathCommit = commitId ? pathDef?.label || commitId : ''
    state.core.croix = commitId ? pathDef?.croix || '' : ''
    state.core.riskFocus = commitId ? pathDef?.riskFocus || '' : ''

    state.core.targetPrimary = state.targets?.primary || ''
    const secondary = state.targets?.secondary || []
    state.core.targetSecondary = secondary.length ? secondary.join(', ') : 'Aucun'
  }

  const get = (path) => {
    if (!path) return state
    return splitPath(path).reduce((acc, key) => (acc ? acc[key] : undefined), state)
  }

  const set = (path, value) => {
    const keys = splitPath(path)
    const { node, lastKey } = ensureObjectPath(state, [...keys])
    node[lastKey] = value

    if (path.startsWith('path') || path.startsWith('targets')) {
      syncCoreFromState()
    }

    notify()
  }

  const subscribe = (listener) => {
    listeners.add(listener)
    return () => listeners.delete(listener)
  }

  const serialize = () => JSON.stringify(state)

  const update = (fn) => {
    state = fn(state)
    syncCoreFromState()
    notify()
  }

  syncCoreFromState()

  return { get, set, subscribe, serialize, state: state, update }
}
