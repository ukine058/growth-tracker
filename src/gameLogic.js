export const ATTRS = [
  { key: 'action',    label: '行動', color: '#ff6b6b' },
  { key: 'result',    label: '実績', color: '#ffd93d' },
  { key: 'ability',   label: '能力', color: '#6bcb77' },
  { key: 'spirit',    label: '精神', color: '#4d96ff' },
  { key: 'knowledge', label: '知識', color: '#c77dff' },
]

export function defaultState() {
  return {
    level: 1,
    // points within the current level (used for level-up check, consumed -1 on level up)
    levelPoints: { action: 0, result: 0, ability: 0, spirit: 0, knowledge: 0 },
    // cumulative total (never decreases)
    totalPoints: { action: 0, result: 0, ability: 0, spirit: 0, knowledge: 0 },
    issues: [],   // array of strings
    cards: [],    // { id, hypothesis, result, attr, doubled, date }
  }
}

// Can level up if all attrs have >= 1 point in levelPoints
export function canLevelUp(state) {
  return ATTRS.every(a => state.levelPoints[a.key] >= 1)
}

export function doLevelUp(state) {
  if (!canLevelUp(state)) return state
  const newLevel = { ...state.levelPoints }
  ATTRS.forEach(a => { newLevel[a.key] -= 1 })
  return { ...state, level: state.level + 1, levelPoints: newLevel }
}

// Add hypothesis card (no score yet)
export function addHypothesis(state, text, attr, doubled) {
  const card = {
    id: Date.now(),
    hypothesis: text,
    result: null,
    attr,
    doubled,
    date: new Date().toLocaleDateString('ja-JP'),
  }
  return { ...state, cards: [card, ...state.cards] }
}

// Complete card with result → award points
export function completeCard(state, id, resultText) {
  const cards = state.cards.map(c => {
    if (c.id !== id) return c
    return { ...c, result: resultText }
  })
  const card = state.cards.find(c => c.id === id)
  if (!card) return state

  const pts = card.doubled ? 2 : 1
  const attr = card.attr

  // spirit: remove one issue
  let issues = [...state.issues]
  if (attr === 'spirit' && issues.length > 0) {
    issues = issues.slice(1)
  }

  const newLevel = { ...state.levelPoints, [attr]: state.levelPoints[attr] + pts }
  const newTotal = { ...state.totalPoints, [attr]: state.totalPoints[attr] + pts }

  return { ...state, cards, levelPoints: newLevel, totalPoints: newTotal, issues }
}

// Delete a hypothesis-only card
export function deleteCard(state, id) {
  return { ...state, cards: state.cards.filter(c => c.id !== id) }
}

export function addIssue(state, text) {
  return { ...state, issues: [...state.issues, { id: Date.now(), text }] }
}

export function loadState() {
  try {
    const raw = localStorage.getItem('growth-tracker-v2')
    if (raw) return JSON.parse(raw)
  } catch {}
  return defaultState()
}

export function saveState(state) {
  localStorage.setItem('growth-tracker-v2', JSON.stringify(state))
}
