const splitPath = (path) => path.replace(/\[(\d+)\]/g, '.$1').split('.').filter(Boolean)

export function createDefaultState(doorId, runId, doorTests = []) {
  return {
    doorId,
    runId,
    version: 1,
    meta: {},
    paths: {
      selection: {
        commit: '',
        trials: []
      }
    },
    targets: {
      primary: '',
      secondary: []
    },
    tests: doorTests.map((test) => ({ id: test.id, status: 'pending', skipped: false })),
    fields: {},
    runs: [],
    journal: []
  }
}

export function createStore(initialState) {
  let state = structuredClone(initialState)
  const listeners = new Set()

  const notify = () => listeners.forEach((l) => l(state))

  const get = (path) => {
    if (!path) return state
    return splitPath(path).reduce((acc, key) => (acc ? acc[key] : undefined), state)
  }

  const set = (path, value) => {
    const keys = splitPath(path)
    let node = state
    while (keys.length > 1) {
      const key = keys.shift()
      if (node[key] === undefined) node[key] = {}
      node = node[key]
    }
    node[keys[0]] = value
    notify()
  }

  const subscribe = (listener) => {
    listeners.add(listener)
    return () => listeners.delete(listener)
  }

  const serialize = () => JSON.stringify(state)

  return { get, set, subscribe, serialize, state: state, update: (fn) => { state = fn(state); notify() } }
}
