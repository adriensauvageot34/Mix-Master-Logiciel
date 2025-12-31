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
}
