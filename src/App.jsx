import React, { useState, useEffect, useRef } from 'react'
import { ATTRS, addEntry, addIssue, removeIssue, loadState, saveState, pointsNeeded } from './gameLogic'
import RadarChart from './RadarChart'
import './App.css'

export default function App() {
  const [state, setState] = useState(() => loadState())
  const [inputText, setInputText] = useState('')
  const [selectedAttr, setSelectedAttr] = useState('action')
  const [doubled, setDoubled] = useState(false)
  const [issueInput, setIssueInput] = useState('')
  const [showRadar, setShowRadar] = useState(false)
  const [showIssueInput, setShowIssueInput] = useState(false)
  const [levelUpAnim, setLevelUpAnim] = useState(false)
  const prevLevel = useRef(state.level)

  useEffect(() => {
    saveState(state)
    if (state.level > prevLevel.current) {
      setLevelUpAnim(true)
      setTimeout(() => setLevelUpAnim(false), 2000)
    }
    prevLevel.current = state.level
  }, [state])

  const needed = pointsNeeded(state.level)

  function handleSubmit() {
    if (!inputText.trim()) return
    setState(s => addEntry(s, inputText.trim(), selectedAttr, doubled))
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
        <span className={`lv-badge ${levelUpAnim ? 'lv-up' : ''}`}>Lv<span>{state.level}</span></span>
      </div>

      {/* Stats sidebar */}
      <div className="stats-panel">
        {ATTRS.map(a => (
          <div key={a.key} className="stat-row" style={{ color: a.color }}>
            <span className="stat-val">{state.levelPoints[a.key]}</span>
            <span className="stat-label">{a.label}</span>
            <div className="stat-bar">
              <div className="stat-bar-fill" style={{
                width: `${Math.min(state.levelPoints[a.key] / needed * 100, 100)}%`,
                background: a.color,
                boxShadow: `0 0 6px ${a.color}`,
              }} />
            </div>
          </div>
        ))}
      </div>

      {/* Center area - issues float here */}
      <div className="center-area">
        {state.issues.length > 0 && (
          <div className="issues-list">
            <div className="issues-title">📋 イシュー</div>
            {state.issues.map((iss, i) => (
              <div key={i} className="issue-item">
                <span>{iss}</span>
                <button className="issue-del" onClick={() => setState(s => removeIssue(s, i))}>×</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Log */}
      <div className="log-section">
        {state.log.map(entry => {
          const attr = ATTRS.find(a => a.key === entry.attr)
          return (
            <div key={entry.id} className="log-entry" style={{ borderColor: attr?.color }}>
              <span className="log-attr" style={{ color: attr?.color, borderColor: attr?.color }}>
                {attr?.label}
              </span>
              <span className="log-text">{entry.text}</span>
              {entry.points === 2 && <span className="log-x2">×2</span>}
            </div>
          )
        })}
      </div>

      {/* Input area */}
      <div className="input-area">
        {/* Attr selector */}
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

        {/* Text + submit */}
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
            placeholder="今日の行動を記録..."
          />
          <button className="submit-btn" onClick={handleSubmit}>＋</button>
        </div>

        {/* Issue + Radar toggles */}
        <div className="bottom-row">
          <button className="icon-btn" onClick={() => setShowIssueInput(v => !v)} title="イシューを追加">
            📋
          </button>
          <button className="icon-btn" onClick={() => setShowRadar(v => !v)} title="レーダーチャート">
            📊
          </button>
        </div>

        {showIssueInput && (
          <div className="issue-input-row">
            <input
              className="text-input"
              value={issueInput}
              onChange={e => setIssueInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleIssueAdd()}
              placeholder="新しいイシューを入力..."
            />
            <button className="submit-btn" onClick={handleIssueAdd}>追加</button>
          </div>
        )}
      </div>

      {/* Radar modal */}
      {showRadar && (
        <div className="modal-overlay" onClick={() => setShowRadar(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="lv-badge-sm">Lv{state.level}</span>
              <span className="next-label">NEXT {needed}pt</span>
              <button className="close-btn" onClick={() => setShowRadar(false)}>×</button>
            </div>
            <RadarChart levelPoints={state.levelPoints} level={state.level} />
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
        <div className="levelup-banner">
          🎉 LEVEL UP! → Lv{state.level} 🎉
        </div>
      )}
    </div>
  )
}
