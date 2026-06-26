import React from 'react'
import { ATTRS } from './gameLogic'

export default function RadarChart({ levelPoints }) {
  const size = 220
  const cx = size / 2
  const cy = size / 2
  const r = 80
  const n = ATTRS.length

  function getPoint(i, ratio, radius) {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2
    return [cx + radius * ratio * Math.cos(angle), cy + radius * ratio * Math.sin(angle)]
  }

  const maxPts = Math.max(...ATTRS.map(a => levelPoints[a.key]), 5)
  const webLevels = [0.25, 0.5, 0.75, 1.0]
  const dataPoints = ATTRS.map((a, i) => getPoint(i, Math.min(levelPoints[a.key] / maxPts, 1), r))
  const labelPoints = ATTRS.map((a, i) => getPoint(i, 1.38, r))

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {webLevels.map(wl => (
        <polygon key={wl}
          points={ATTRS.map((_, i) => getPoint(i, wl, r).join(',')).join(' ')}
          fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
      ))}
      {ATTRS.map((_, i) => {
        const [x, y] = getPoint(i, 1, r)
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
      })}
      <polygon
        points={dataPoints.map(p => p.join(',')).join(' ')}
        fill="rgba(255,255,100,0.22)" stroke="rgba(255,255,100,0.8)" strokeWidth="2" />
      {dataPoints.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="4" fill={ATTRS[i].color} />
      ))}
      {ATTRS.map((a, i) => {
        const [x, y] = labelPoints[i]
        return (
          <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="middle"
            fill={a.color} fontSize="11" fontFamily="'M PLUS Rounded 1c'" fontWeight="900"
            style={{ filter: `drop-shadow(0 0 4px ${a.color})` }}>
            {a.label}
          </text>
        )
      })}
    </svg>
  )
}
