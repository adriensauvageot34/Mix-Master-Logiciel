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

const toTestsConfig = (tests) => (Array.isArray(tests) ? { groups: [], tests } : { groups: tests.groups || [], tests: tests.tests || [] })

function renderTestRow(test, state, store) {
  const row = document.createElement('div')
  row.className = 'test-row'

  const title = document.createElement('div')
  title.className = 'test-title'
  title.textContent = test.label || test.id

  if (test.required || test.nonSkippable) {
    const badge = document.createElement('span')
    badge.className = 'pill'
    badge.textContent = test.nonSkippable ? 'Non skippable' : 'Required'
    title.append(badge)
  }

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

function mountRunSummary(el, store) {
  el.innerHTML = ''

  const render = () => {
    const runs = store.get('runs.queue') || []
    const activeId = store.get('runs.activeRunId')
    el.innerHTML = ''

    const header = document.createElement('div')
    header.className = 'run-summary-header'
    header.textContent = runs.length ? `Runs: ${runs.indexOf(runs.find((r) => r.id === activeId)) + 1}/${runs.length}` : 'Runs en attente'
    el.append(header)

    if (!runs.length) {
      const empty = document.createElement('p')
      empty.textContent = 'Aucun run créé pour le moment.'
      el.append(empty)
      return
    }

    const table = document.createElement('div')
    table.className = 'run-table'

    runs.forEach((run) => {
      const row = document.createElement('div')
      row.className = 'run-row'
      if (run.id === activeId) row.classList.add('active')

      const label = document.createElement('strong')
      label.textContent = run.label

      const placement = document.createElement('div')
      placement.className = 'run-meta'
      placement.textContent =
        run.placement.depth && run.placement.width && run.placement.height
          ? `${run.placement.depth}/${run.placement.width}/${run.placement.height}`
          : 'Placement ?'

      const priority = document.createElement('div')
      priority.className = 'run-meta'
      priority.textContent = run.priority || 'Priorité ?'

      const ref = document.createElement('div')
      ref.className = 'run-meta'
      ref.textContent = run.reference?.used ? `[REF] ${run.reference.whatToVerify}` : 'Reference ?'

      row.append(label, placement, priority, ref)
      table.append(row)
    })

    el.append(table)
  }

  render()
  store.subscribe(render)
}

function mountJournalList(el, store) {
  const render = () => {
    const entries = store.get('journal.entries') || []
    el.innerHTML = ''
    if (!entries.length) {
      const empty = document.createElement('p')
      empty.textContent = 'Aucune entrée pour le moment.'
      el.append(empty)
      return
    }

    const list = document.createElement('ul')
    list.className = 'journal-list'
    entries
      .slice()
      .reverse()
      .forEach((entry) => {
        const item = document.createElement('li')
        const ts = document.createElement('span')
        ts.className = 'ts'
        ts.textContent = new Date(entry.ts).toLocaleString()
        const text = document.createElement('p')
        text.textContent = entry.text
        item.append(ts, text)
        list.append(item)
      })
    el.append(list)
  }

  render()
  store.subscribe(render)
}

export function mountAll(rootEl, pack, store) {
  const mounts = Array.from(rootEl.querySelectorAll('[data-mount]'))
  mounts.forEach((el) => {
    const type = el.dataset.mount
    if (type === 'path-picker') mountPathPicker(el, pack, store)
    if (type === 'tests-table') mountTestsTable(el, pack, store)
    if (type === 'run-summary') mountRunSummary(el, store)
    if (type === 'journal-list') mountJournalList(el, store)
  })
}
