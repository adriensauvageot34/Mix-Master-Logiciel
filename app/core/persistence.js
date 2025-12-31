const prefix = 'mix-doors-state'

export const key = (doorId, runId) => `${prefix}:${doorId}:${runId}`

export function load(doorId, runId) {
  try {
    const raw = localStorage.getItem(key(doorId, runId))
    return raw ? JSON.parse(raw) : null
  } catch (err) {
    console.warn('Failed to load state', err)
    return null
  }
}

export function save(state) {
  try {
    const storageKey = key(state.doorId, state.runId)
    localStorage.setItem(storageKey, JSON.stringify(state))
  } catch (err) {
    console.warn('Failed to save state', err)
  }
}
