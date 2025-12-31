const createOption = (item, type, name, checked, disabled) => {
  const label = document.createElement('label')
  label.style.display = 'flex'
  label.style.gap = '0.35rem'
  label.style.alignItems = 'center'
  const input = document.createElement('input')
  input.type = type
  input.name = name
  input.value = item.id
  input.checked = checked
  input.disabled = disabled
  label.append(input, document.createTextNode(item.label || item.id))
  return { label, input }
}

function mountPathPicker(el, pack, store) {
  el.innerHTML = ''
  const state = store.get('paths.selection') || { trials: [], commit: '' }
  const trialLimit = pack.rules?.trialMax || pack.rules?.trialsMax
  const trialsContainer = document.createElement('div')
  const title = document.createElement('h3')
  title.textContent = 'Trials'
  trialsContainer.append(title)
  ;(pack.paths?.trials || []).forEach((trial) => {
    const checked = state.trials?.includes(trial.id)
    const disabled = trialLimit ? state.trials?.length >= trialLimit && !checked : false
    const { label, input } = createOption(trial, 'checkbox', 'trial', checked, disabled)
    input.addEventListener('change', () => {
      const current = new Set(store.get('paths.selection.trials') || [])
      if (input.checked) current.add(trial.id)
      else current.delete(trial.id)
      store.set('paths.selection.trials', Array.from(current))
    })
    trialsContainer.append(label)
  })
  el.append(trialsContainer)

  const commitContainer = document.createElement('div')
  const commitTitle = document.createElement('h3')
  commitTitle.textContent = 'Commit'
  commitContainer.append(commitTitle)
  ;(pack.paths?.commits || []).forEach((commit) => {
    const checked = state.commit === commit.id
    const { label, input } = createOption(commit, 'radio', 'commit', checked)
    input.addEventListener('change', () => {
      if (input.checked) store.set('paths.selection.commit', commit.id)
    })
    commitContainer.append(label)
  })
  el.append(commitContainer)
}

function mountTargetPicker(el, pack, store) {
  el.innerHTML = ''
  const state = store.get('targets') || { primary: '', secondary: [] }

  const primary = document.createElement('div')
  const title = document.createElement('h3')
  title.textContent = 'Primary target'
  primary.append(title)
  ;(pack.targets?.primary || []).forEach((target) => {
    const checked = state.primary === target.id
    const { label, input } = createOption(target, 'radio', 'primary-target', checked)
    input.addEventListener('change', () => {
      if (input.checked) store.set('targets.primary', target.id)
    })
    primary.append(label)
  })
  el.append(primary)

  const secondary = document.createElement('div')
  const secTitle = document.createElement('h3')
  secTitle.textContent = 'Secondary targets'
  secondary.append(secTitle)
  ;(pack.targets?.secondary || []).forEach((target) => {
    const checked = state.secondary?.includes(target.id)
    const { label, input } = createOption(target, 'checkbox', 'secondary-target', checked)
    input.addEventListener('change', () => {
      const current = new Set(store.get('targets.secondary') || [])
      if (input.checked) current.add(target.id)
      else current.delete(target.id)
      store.set('targets.secondary', Array.from(current))
    })
    secondary.append(label)
  })
  el.append(secondary)
}

function mountTestsTable(el, pack, store) {
  el.innerHTML = ''
  const table = document.createElement('table')
  table.style.width = '100%'
  const tbody = document.createElement('tbody')
  ;(pack.tests || []).forEach((test, idx) => {
    const row = document.createElement('tr')
    const title = document.createElement('td')
    title.textContent = test.title || test.id
    const status = document.createElement('td')
    const skip = document.createElement('input')
    skip.type = 'checkbox'
    skip.checked = Boolean(store.get(`tests[${idx}].skipped`))
    skip.addEventListener('change', () => {
      const current = store.get(`tests[${idx}]`) || { id: test.id, status: 'pending', skipped: false }
      store.set(`tests[${idx}]`, { ...current, skipped: skip.checked })
    })
    status.append(skip)
    row.append(title, status)
    tbody.append(row)
  })
  table.append(tbody)
  el.append(table)
}

export function mountAll(rootEl, pack, store) {
  const mounts = Array.from(rootEl.querySelectorAll('[data-mount]'))
  mounts.forEach((el) => {
    const type = el.dataset.mount
    if (type === 'path-picker') mountPathPicker(el, pack, store)
    if (type === 'target-picker') mountTargetPicker(el, pack, store)
    if (type === 'tests-table') mountTestsTable(el, pack, store)
  })
}
