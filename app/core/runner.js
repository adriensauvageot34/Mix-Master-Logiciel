export function createRunner(store) {
  const queueRun = (config) => {
    const runs = store.get('runs') || []
    store.set('runs', [...runs, { ...config, id: `run-${runs.length + 1}` }])
  }

  return { queueRun }
}
