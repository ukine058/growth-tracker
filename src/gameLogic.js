// 5 attributes
export const ATTRS = [
  { key: 'action',    label: '行動', color: '#ff6b6b' },
  { key: 'result',    label: '実績', color: '#ffd93d' },
  { key: 'ability',   label: '能力', color: '#6bcb77' },
  { key: 'spirit',    label: '精神', color: '#4d96ff' },
  { key: 'knowledge', label: '知識', color: '#c77dff' },
]

// Points needed per attribute to level up from lvl N
// Lv1→2: all≥5, Lv2→3: all≥6, ...
export function pointsNeeded(level) {
  return level + 4  // lv1→5pts, lv2→6pts, ...
}

// Default state
export function defaultState() {
  return {
    level: 1,
    // cumulative total points per attr (across all levels including carry-over)
    totalPoints: { action: 0, result: 0, ability: 0, spirit: 0, knowledge: 0 },
    // points earned *within current level* (carry-over already seeded)
    levelPoints: { action: 0, result: 0, ability: 0, spirit: 0, knowledge: 0 },
    issues: [],      // pending issues (strings)
    log: [],         // { id, text, attr, points, date }
  }
}

// Given current state, check if level-up conditions are met, return new state
export function checkLevelUp(state) {
  let s = { ...state, levelPoints: { ...state.levelPoints } }
  let leveled = true
  while (leveled) {
    const needed = pointsNeeded(s.level)
    leveled = ATTRS.every(a => s.levelPoints[a.key] >= needed)
    if (leveled) {
      s = { ...s, level: s.level + 1, levelPoints: { ...s.levelPoints } }
      // carry over excess points
      ATTRS.forEach(a => {
        s.levelPoints[a.key] = s.levelPoints[a.key] - needed
      })
    }
  }
  return s
}

// Add a log entry, return new state
export function addEntry(state, text, attr, doubled) {
  const pts = doubled ? 2 : 1
  const entry = {
    id: Date.now(),
    text,
    attr,
    points: pts,
    date: new Date().toLocaleDateString('ja-JP'),
  }
  const newTotal = { ...state.totalPoints, [attr]: state.totalPoints[attr] + pts }
  const newLevel = { ...state.levelPoints, [attr]: state.levelPoints[attr] + pts }

  let newIssues = [...state.issues]
  if (attr === 'spirit' && newIssues.length > 0) {
    newIssues = newIssues.slice(1)
  }

  let newState = {
    ...state,
    totalPoints: newTotal,
    levelPoints: newLevel,
    issues: newIssues,
    log: [entry, ...state.log],
  }
  newState = checkLevelUp(newState)
  return newState
}

export function addIssue(state, text) {
  return { ...state, issues: [...state.issues, text] }
}

export function removeIssue(state, idx) {
  const issues = state.issues.filter((_, i) => i !== idx)
  return { ...state, issues }
}

export function loadState() {
  try {
    const raw = localStorage.getItem('growth-tracker-v1')
    if (raw) return JSON.parse(raw)
  } catch {}
  return defaultState()
}

export function saveState(state) {
  localStorage.setItem('growth-tracker-v1', JSON.stringify(state))
}
