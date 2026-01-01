const applyBinding = (el, store) => {
  const path = el.dataset.bind
  const value = store.get(path)
  if (el.type === 'checkbox') {
    el.checked = Boolean(value)
  } else if (el.type === 'radio') {
    el.checked = el.value === value
  } else if (el.hasAttribute('readonly')) {
    el.value = value ?? ''
    el.textContent = value ?? ''
  } else {
    el.value = value ?? ''
  }
}

export function bindAll(rootEl, store) {
  const bound = Array.from(rootEl.querySelectorAll('[data-bind]'))
  bound.forEach((el) => {
    applyBinding(el, store)
    const path = el.dataset.bind
    const handler = () => {
      if (el.type === 'checkbox') {
        store.set(path, el.checked)
      } else if (el.type === 'radio') {
        if (el.checked) store.set(path, el.value)
      } else {
        store.set(path, el.value)
      }
    }
    el.addEventListener('input', handler)
    el.addEventListener('change', handler)
  })

  store.subscribe(() => bound.forEach((el) => applyBinding(el, store)))

  rootEl.addEventListener('click', (event) => {
    const actionEl = event.target.closest('[data-action]')
    if (!actionEl) return
    const action = actionEl.dataset.action
    if (action === 'add-journal-entry') {
      const draft = (store.get('journal.draft') || '').trim()
      if (!draft) return
      store.update((state) => {
        const entry = { ts: Date.now(), text: draft, doorId: state.doorId, runId: state.runs?.activeRunId }
        return { ...state, journal: { draft: '', entries: [...(state.journal?.entries || []), entry] } }
      })
    }
  })
}
