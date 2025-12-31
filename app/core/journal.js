export function createJournal(state) {
  const logEvent = (entry) => {
    state.journal = state.journal || []
    state.journal.push({ ...entry, at: new Date().toISOString() })
  }

  return { logEvent }
}
