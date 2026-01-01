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
      verdict: current.verdict || 'SKIP',
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

const defaultRunsState = () => ({ queue: [], activeRunId: null })

export function createDefaultState(doorId, runId, pack) {
  const testDefs = Array.isArray(pack.tests) ? pack.tests : pack.tests?.tests || []
  const defaultPath = { commit: '', trials: [] }
  return {
    doorId,
    runId,
    version: 2,
    status: '',
    toggles: { sigOff: false, ctrlOff: false },
    checkpoint: { current: '' },
    risk: { badge: '' },
    path: defaultPath,
    paths: { selection: defaultPath },
    core: {
      pathCommit: '',
      croix: '',
      riskFocus: '',
      constats: ''
    },
    notes: { trial: '', constats: '', afterCommit: '' },
    handoff: { text: '' },
    journal: { draft: '', entries: [] },
    tests: testDefs.reduce((acc, test) => {
      acc[test.id] = { verdict: 'SKIP', reason: '' }
      return acc
    }, {}),
    fields: {},
    runs: defaultRunsState(),
    ui: { collapsedSections: {} }
  }
}

export function createStore(initialState, pack) {
  let state = structuredClone(initialState)
  state.path = coercePathState(state)
  state.paths = { selection: state.path }
  state.core = state.core || {}
  state.tests = coerceTestsState(state, pack)
  state.journal = state.journal || { draft: '', entries: [] }
  state.runs = state.runs?.queue ? state.runs : defaultRunsState()
  state.ui = state.ui || { collapsedSections: {} }

  const listeners = new Set()

  const notify = () => listeners.forEach((l) => l(state))

  const syncCoreFromState = () => {
    const commitId = state.path?.commit || ''
    const pathDef =
      (pack.paths?.commits || []).find((p) => p.id === commitId) ||
      (pack.paths?.trials || []).find((p) => p.id === commitId)

    state.core.pathCommit = commitId ? pathDef?.label || commitId : ''
    state.core.croix = commitId ? pathDef?.croix || '' : ''
    state.core.riskFocus = commitId ? pathDef?.riskFocus || '' : ''
  }

  const get = (path) => {
    if (!path) return state
    return splitPath(path).reduce((acc, key) => (acc ? acc[key] : undefined), state)
  }

  const set = (path, value) => {
    const keys = splitPath(path)
    const { node, lastKey } = ensureObjectPath(state, [...keys])
    node[lastKey] = value

    if (path.startsWith('path')) {
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
