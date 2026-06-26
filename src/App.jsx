import React, { useState, useEffect, useRef } from 'react'
import {
  ATTRS, addHypothesis, completeCard, deleteCard,
  addIssue, doLevelUp, canLevelUp, loadState, saveState
} from './gameLogic'
import RadarChart from './RadarChart'
import './App.css'

// Card component
function Card({ card, onComplete, onDelete }) {
  const [showResult, setShowResult] = useState(false)
  const [resultText, setResultText] = useState('')
  const [hovered, setHovered] = useState(false)
  const attr = ATTRS.find(a => a.key === card.attr)

  const isComplete = card.result !== null

  function submit() {
    if (!resultText.trim()) return
    onComplete(card.id, resultText.trim())
    setShowResult(false)
    setResultText('')
  }

  return (
    <div
      className={`card ${isComplete ? 'card-done' : 'card-pending'}`}
      style={{ '--card-color': attr.color, borderColor: attr.color }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Popup on hover */}
      {hovered && (
        <div className="card-popup">
          <div className="popup-attr" style={{ color: attr.color }}>{attr.label}{card.doubled ? ' ×2' : ''}</div>
          <div className="popup-section">
            <span className="popup-label">仮説</span>
            <span>{card.hypothesis}</span>
          </div>
          {isComplete && (
            <div className="popup-section">
              <span className="popup-label">結果</span>
              <span>{card.result}</span>
            </div>
          )}
          <div className="popup-date">{card.date}</div>
        </div>
      )}

      <div className="card-inner" onClick={() => !isComplete && setShowResult(v => !v)}>
        <span className="card-attr-tag" style={{ color: attr.color, borderColor: attr.color }}>
          {attr.label}{card.doubled ? '×2' : ''}
        </span>
        <span className="card-hypo">{card.hypothesis}</span>
        {isComplete && (
          <span className="card-result-preview">→ {card.result}</span>
        )}
        {!isComplete && (
          <button
            className="card-delete-btn"
            onClick={e => { e.stopPropagation(); onDelete(card.id) }}
          >×</button>
        )}
      </div>

      {showResult && !isComplete && (
        <div className="card-result-input" onClick={e => e.stopPropagation()}>
          <input
            className="text-input"
            autoFocus
            placeholder="結果を入力..."
            value={resultText}
            onChange={e => setResultText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submit()}
          />
          <button className="submit-btn" onClick={submit}>✓</button>
        </div>
      )}
    </div>
  )
}

export default function App() {
  const [state, setState] = useState(() => loadState())
  const [inputText, setInputText] = useState('')
  const [selectedAttr, setSelectedAttr] = useState('action')
  const [doubled, setDoubled] = useState(false)
  const [issueInput, setIssueInput] = useState('')
  const [showIssueInput, setShowIssueInput] = useState(false)
  const [showRadar, setShowRadar] = useState(false)
  const [levelUpAnim, setLevelUpAnim] = useState(false)
  const prevLevel = useRef(state.level)

  useEffect(() => {
    saveState(state)
    if (state.level > prevLevel.current) {
      setLevelUpAnim(true)
      setTimeout(() => setLevelUpAnim(false), 2200)
    }
    prevLevel.current = state.level
  }, [state])

  const canLvUp = canLevelUp(state)

  function handleSubmit() {
    if (!inputText.trim()) return
    setState(s => addHypothesis(s, inputText.trim(), selectedAttr, doubled))
    setInputText('')
    setDoubled(false)
  }

  function handleIssueAdd() {
    if (!issueInput.trim()) return
    setState(s => addIssue(s, issueInput.trim()))
    setIssueInput('')
    setShowIssueInput(false)
  }

  return (
    <div className="app">
      {/* Header */}
      <div className="header">
        <span className="goal-text">レベル {state.level + 1} をめざそう</span>
        <div className="header-right">
          {canLvUp && (
            <button className="lvup-btn" onClick={() => setState(s => doLevelUp(s))}>
              LEVEL UP!
            </button>
          )}
          <span className={`lv-badge ${levelUpAnim ? 'lv-up' : ''}`}>
            Lv<span>{state.level}</span>
          </span>
        </div>
      </div>

      {/* Stats panel — positioned below header */}
      <div className="stats-panel">
        {ATTRS.map(a => (
          <div key={a.key} className="stat-row" style={{ color: a.color }}>
            <span className="stat-val">{state.levelPoints[a.key]}</span>
            <span className="stat-label">{a.label}</span>
          </div>
        ))}
        <div className="issues-badge" onClick={() => setShowIssueInput(v => !v)} title="イシュー">
          📋 <span>{state.issues.length}</span>
        </div>
      </div>

      {/* Cards list */}
      <div className="cards-area">
        {state.cards.map(card => (
          <Card
            key={card.id}
            card={card}
            onComplete={(id, result) => setState(s => completeCard(s, id, result))}
            onDelete={id => setState(s => deleteCard(s, id))}
          />
        ))}
      </div>

      {/* Input area */}
      <div className="input-area">
        <div className="attr-selector">
          {ATTRS.map(a => (
            <button
              key={a.key}
              className={`attr-btn ${selectedAttr === a.key ? 'active' : ''}`}
              style={{ '--attr-color': a.color }}
              onClick={() => setSelectedAttr(a.key)}
            >
              {a.label}
            </button>
          ))}
        </div>

        <div className="input-row">
          <button
            className={`double-btn ${doubled ? 'on' : ''}`}
            onClick={() => setDoubled(d => !d)}
            title="1時間以上: 2倍"
          >×2</button>
          <input
            className="text-input"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            placeholder="仮説を入力..."
          />
          <button className="submit-btn" onClick={handleSubmit}>＋</button>
        </div>

        <div className="bottom-row">
          <button className="icon-btn" onClick={() => setShowIssueInput(v => !v)} title="イシューを追加">
            📋 {state.issues.length > 0 && <span className="issue-count">{state.issues.length}</span>}
          </button>
          <button className="icon-btn" onClick={() => setShowRadar(v => !v)} title="レーダーチャート">
            📊
          </button>
        </div>

        {showIssueInput && (
          <div className="issue-panel">
            <div className="issue-list-small">
              {state.issues.map((iss, i) => (
                <div key={iss.id ?? i} className="issue-item-small">
                  <span>{typeof iss === 'string' ? iss : iss.text}</span>
                </div>
              ))}
            </div>
            <div className="issue-input-row">
              <input
                className="text-input"
                value={issueInput}
                onChange={e => setIssueInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleIssueAdd()}
                placeholder="新しいイシューを追加..."
              />
              <button className="submit-btn" onClick={handleIssueAdd}>追加</button>
            </div>
          </div>
        )}
      </div>

      {/* Radar modal */}
      {showRadar && (
        <div className="modal-overlay" onClick={() => setShowRadar(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="lv-badge-sm">Lv{state.level}</span>
              <span className="next-label">全属性1pt → LEVEL UP</span>
              <button className="close-btn" onClick={() => setShowRadar(false)}>×</button>
            </div>
            <RadarChart levelPoints={state.levelPoints} />
            <div className="radar-stats">
              {ATTRS.map(a => (
                <div key={a.key} className="radar-stat" style={{ color: a.color }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: 900 }}>{state.levelPoints[a.key]}</span>
                  <span style={{ fontSize: '0.7rem' }}>{a.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {levelUpAnim && (
        <div className="levelup-banner">🎉 LEVEL UP! → Lv{state.level} 🎉</div>
      )}
    </div>
  )
}
