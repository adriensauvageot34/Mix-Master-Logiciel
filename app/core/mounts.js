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
  const state = store.get('path') || { trials: [], commit: '' }
  const trialLimit = pack.rules?.path?.trialMax || pack.rules?.trialsMax
  const trialsContainer = document.createElement('div')
  const title = document.createElement('h3')
  title.textContent = 'Trials'
  trialsContainer.append(title)
  const updateTrialDisables = () => {
    if (!trialLimit) return
    const count = (store.get('path.trials') || []).length
    trialsContainer.querySelectorAll('input[name="trial"]').forEach((input) => {
      input.disabled = !input.checked && count >= trialLimit
    })
  }
  ;(pack.paths?.trials || []).forEach((trial) => {
    const checked = state.trials?.includes(trial.id)
    const disabled = trialLimit ? state.trials?.length >= trialLimit && !checked : false
    const { label, input } = createOption(trial, 'checkbox', 'trial', checked, disabled)
    input.addEventListener('change', () => {
      const current = new Set(store.get('path.trials') || [])
      if (input.checked) current.add(trial.id)
      else current.delete(trial.id)
      store.set('path.trials', Array.from(current))
      updateTrialDisables()
    })
    trialsContainer.append(label)
  })
  el.append(trialsContainer)
  updateTrialDisables()

  const commitContainer = document.createElement('div')
  const commitTitle = document.createElement('h3')
  commitTitle.textContent = 'Commit'
  commitContainer.append(commitTitle)
  ;(pack.paths?.commits || []).forEach((commit) => {
    const checked = state.commit === commit.id
    const { label, input } = createOption(commit, 'radio', 'commit', checked)
    input.addEventListener('change', () => {
      if (input.checked) store.set('path.commit', commit.id)
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

const toTestsConfig = (tests) => (Array.isArray(tests) ? { groups: [], tests } : { groups: tests.groups || [], tests: tests.tests || [] })

function renderTestRow(test, state, store) {
  const row = document.createElement('div')
  row.className = 'test-row'

  const title = document.createElement('div')
  title.className = 'test-title'
  title.textContent = test.label || test.id

  const controls = document.createElement('div')
  controls.className = 'test-controls'

  const verdict = state?.verdict || 'SKIP'

  const radioGroup = document.createElement('div')
  radioGroup.className = 'test-radios'

  const makeRadio = (value, label) => {
    const wrap = document.createElement('label')
    wrap.className = 'test-radio'
    const input = document.createElement('input')
    input.type = 'radio'
    input.name = `test-${test.id}`
    input.value = value
    input.checked = verdict === value
    input.disabled = value === 'SKIP' && test.nonSkippable
    input.addEventListener('change', () => {
      if (input.checked) {
        const current = store.get(`tests.${test.id}`) || { reason: '' }
        store.set(`tests.${test.id}`, { ...current, verdict: value })
      }
    })
    wrap.append(input, document.createTextNode(label))
    return wrap
  }

  radioGroup.append(makeRadio('PASS', 'PASS'), makeRadio('FAIL', 'FAIL'), makeRadio('SKIP', 'SKIP'))

  controls.append(radioGroup)

  if (test.reasonField) {
    const reason = document.createElement('textarea')
    reason.placeholder = 'Notes / reason'
    reason.rows = 2
    reason.value = state?.reason || ''
    reason.disabled = verdict === 'PASS'
    reason.addEventListener('input', () => {
      const current = store.get(`tests.${test.id}`) || { verdict: 'SKIP' }
      store.set(`tests.${test.id}`, { ...current, reason: reason.value })
    })
    controls.append(reason)
  }

  row.append(title, controls)
  return row
}

function mountTestsTable(el, pack, store) {
  el.innerHTML = ''
  const config = toTestsConfig(pack.tests || {})
  const groups = new Map((config.groups || []).map((g) => [g.id, g.label || g.id]))

  const groupsOrder = [...new Set((config.tests || []).map((t) => t.group || 'default'))]
  groupsOrder.forEach((groupId) => {
    const groupLabel = groups.get(groupId) || (groupId === 'default' ? 'Tests' : groupId)
    const groupWrap = document.createElement('section')
    groupWrap.className = 'test-group'
    const header = document.createElement('h3')
    header.textContent = groupLabel
    groupWrap.append(header)

    config.tests
      .filter((t) => (t.group || 'default') === groupId)
      .forEach((test) => {
        const state = store.get(`tests.${test.id}`) || { verdict: 'SKIP', reason: '' }
        groupWrap.append(renderTestRow(test, state, store))
      })

    el.append(groupWrap)
  })
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
