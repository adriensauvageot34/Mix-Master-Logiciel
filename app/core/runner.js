import runConfig from '../../resources/global/run-config.json'

const findFamily = (familyId) => runConfig.families.find((f) => f.id === familyId)

export function createRunQueue(selectedFamilies = []) {
  return selectedFamilies.map((familyId, idx) => {
    const family = findFamily(familyId) || { id: familyId, label: familyId, defaults: {} }
    const defaults = family.defaults || {}
    return {
      id: `run_${idx + 1}_${familyId.toLowerCase()}`,
      family: family.id,
      label: family.label || family.id,
      status: 'TODO',
      placement: {
        depth: defaults.depth || null,
        width: defaults.width || null,
        height: defaults.height || null
      },
      priority: null,
      reference: { used: false, whatToVerify: '' },
      notes: ''
    }
  })
}

export function setRunPlacement(queue, runId, placement) {
  return queue.map((run) => (run.id === runId ? { ...run, placement: { ...run.placement, ...placement } } : run))
}

export function setRunPriority(queue, runId, priority) {
  return queue.map((run) => (run.id === runId ? { ...run, priority } : run))
}

export function setRunReference(queue, runId, used, whatToVerify) {
  return queue.map((run) =>
    run.id === runId ? { ...run, reference: { used, whatToVerify: used ? whatToVerify : '' } } : run
  )
}

export function setRunStatus(queue, runId, status) {
  return queue.map((run) => (run.id === runId ? { ...run, status } : run))
}

export function nextRun(queue, activeRunId) {
  const idx = queue.findIndex((r) => r.id === activeRunId)
  if (idx === -1) return null
  return queue[idx + 1]?.id || null
}

export function prevRun(queue, activeRunId) {
  const idx = queue.findIndex((r) => r.id === activeRunId)
  if (idx <= 0) return null
  return queue[idx - 1]?.id || null
}

export function createRunner(store) {
  const setRuns = (updater) => {
    store.update((state) => {
      const runs = state.runs || { queue: [], activeRunId: null }
      const updated = typeof updater === 'function' ? updater(runs) : updater
      return { ...state, runs: updated }
    })
  }

  const startRuns = (families) => {
    const queue = createRunQueue(families)
    setRuns({ queue, activeRunId: queue[0]?.id || null })
    return queue
  }

  const applyPlacement = (runId, placement) =>
    setRuns((runs) => ({ ...runs, queue: setRunPlacement(runs.queue, runId, placement) }))

  const applyPriority = (runId, priority) =>
    setRuns((runs) => ({ ...runs, queue: setRunPriority(runs.queue, runId, priority) }))

  const applyReference = (runId, used, whatToVerify) =>
    setRuns((runs) => ({ ...runs, queue: setRunReference(runs.queue, runId, used, whatToVerify) }))

  const applyStatus = (runId, status) =>
    setRuns((runs) => ({ ...runs, queue: setRunStatus(runs.queue, runId, status) }))

  const goNext = () =>
    setRuns((runs) => ({ ...runs, activeRunId: nextRun(runs.queue, runs.activeRunId) || runs.activeRunId }))

  const goPrev = () =>
    setRuns((runs) => ({ ...runs, activeRunId: prevRun(runs.queue, runs.activeRunId) || runs.activeRunId }))

  return { startRuns, applyPlacement, applyPriority, applyReference, applyStatus, goNext, goPrev }
}
