/**
 * GraphCanvas.jsx
 * Renders the interactive campus graph as an SVG.
 *
 * Node states and their colours:
 *   unvisited  — dark slate (default)
 *   start      — green  (always shown on the start node)
 *   end        — red    (always shown on the end node)
 *   open       — amber  (node is in the A* open/priority set)
 *   closed     — blue   (node has been fully expanded)
 *   current    — orange (node being expanded this step)
 *   path       — purple (nodes on the final optimal path, shown when done)
 *
 * Props:
 *   graph         { nodes: [{id,label,x,y}], edges: [{from,to,weight}] }
 *   currentStep   step object from the backend trace, or null
 *   selectedStart string node id
 *   selectedEnd   string node id
 *   finalPath     array of node ids (empty while searching)
 *   isDone        boolean — true once the last step has been reached
 */
import { useState, useMemo } from 'react'

const VW = 900
const VH = 560
const R  = 22   // node radius

// Visual style per node state
const S = {
  unvisited: { fill: '#0f172a', stroke: '#1e3a5f', sw: 1.5, text: '#475569', glow: null },
  start:     { fill: '#052e16', stroke: '#22c55e', sw: 2.5, text: '#86efac', glow: '#22c55e' },
  end:       { fill: '#450a0a', stroke: '#f87171', sw: 2.5, text: '#fca5a5', glow: '#f87171' },
  open:      { fill: '#422006', stroke: '#fbbf24', sw: 2,   text: '#fde68a', glow: '#fbbf24' },
  closed:    { fill: '#0c1a3a', stroke: '#60a5fa', sw: 1.5, text: '#93c5fd', glow: null    },
  current:   { fill: '#431407', stroke: '#fb923c', sw: 3,   text: '#fed7aa', glow: '#fb923c' },
  path:      { fill: '#3b0764', stroke: '#c084fc', sw: 3,   text: '#e9d5ff', glow: '#c084fc' },
}

export default function GraphCanvas({
  graph, currentStep, selectedStart, selectedEnd, finalPath, isDone
}) {
  const [hoveredNode, setHoveredNode] = useState(null)
  const { nodes = [], edges = [] } = graph

  // Build id->node map for O(1) lookup
  const nodeMap = useMemo(() => {
    const m = {}
    nodes.forEach(n => { m[n.id] = n })
    return m
  }, [nodes])

  // Derive the visual state for a node
  const getState = (id) => {
    if (id === selectedStart) return 'start'
    if (id === selectedEnd)   return 'end'
    if (!currentStep)          return 'unvisited'

    if (isDone && finalPath.length > 0) {
      // After search: highlight path; dim everything else as closed
      if (finalPath.includes(id))              return 'path'
      if (currentStep.closed_set.includes(id)) return 'closed'
      return 'unvisited'
    }

    // During step-by-step playback
    if (currentStep.current_node === id)                     return 'current'
    if (currentStep.closed_set.includes(id))                 return 'closed'
    if (currentStep.open_set.some(n => n.node === id))       return 'open'
    return 'unvisited'
  }

  // Get g/h/f values for a node (for hover tooltip)
  const getValues = (id) => {
    if (!currentStep) return null
    if (currentStep.current_node === id)
      return { g: currentStep.g, h: currentStep.h, f: currentStep.f }
    const o = currentStep.open_set.find(n => n.node === id)
    return o ? { g: o.g, h: o.h, f: o.f } : null
  }

  // Check if an edge (a<->b) is part of the final path
  const isPathEdge = (a, b) => {
    if (!isDone || finalPath.length < 2) return false
    for (let i = 0; i < finalPath.length - 1; i++) {
      if ((finalPath[i] === a && finalPath[i+1] === b) ||
          (finalPath[i] === b && finalPath[i+1] === a)) return true
    }
    return false
  }

  const hNode  = hoveredNode ? nodeMap[hoveredNode] : null
  const hState = hoveredNode ? getState(hoveredNode)  : null
  const hVals  = hoveredNode ? getValues(hoveredNode) : null

  return (
    <div className="relative w-full h-full min-h-[480px] flex items-center justify-center">
      <svg
        viewBox={`0 0 ${VW} ${VH}`}
        className="w-full h-full max-h-[580px]"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Subtle dot-grid background */}
        <defs>
          <pattern id="dots" width="36" height="36" patternUnits="userSpaceOnUse">
            <circle cx="18" cy="18" r="1" fill="rgba(255,255,255,0.035)" />
          </pattern>
        </defs>
        <rect width={VW} height={VH} fill="url(#dots)" rx={16} />

        {/* ── EDGES ───────────────────────────────────────────── */}
        {edges.map((edge, i) => {
          const a = nodeMap[edge.from]
          const b = nodeMap[edge.to]
          if (!a || !b) return null
          const path = isPathEdge(edge.from, edge.to)
          const mx = (a.x + b.x) / 2
          const my = (a.y + b.y) / 2
          return (
            <g key={i}>
              {/* Glow layer for path edges */}
              {path && (
                <line
                  x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                  stroke="#a855f7" strokeWidth={10} opacity={0.25}
                  strokeLinecap="round"
                />
              )}
              {/* Main edge line */}
              <line
                className="edge-line"
                x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                stroke={path ? '#c084fc' : '#1e3a5f'}
                strokeWidth={path ? 3 : 1.5}
                opacity={path ? 1 : 0.8}
                strokeLinecap="round"
              />
              {/* Weight label — small, at midpoint */}
              <rect
                x={mx - 12} y={my - 8}
                width={24} height={16}
                rx={4}
                fill="#080c18"
                opacity={0.8}
              />
              <text
                x={mx} y={my}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={10}
                fontFamily="Inter,sans-serif"
                fontWeight="500"
                fill={path ? '#c084fc' : '#475569'}
              >
                {edge.weight}
              </text>
            </g>
          )
        })}

        {/* ── NODE GLOW HALOS ─────────────────────────────────── */}
        {nodes.map(node => {
          const st  = getState(node.id)
          const cfg = S[st]
          if (!cfg.glow) return null
          return (
            <circle
              key={`glow-${node.id}`}
              className="node-glow"
              cx={node.x} cy={node.y}
              r={R + 12}
              fill={cfg.glow}
              opacity={st === 'current' ? 0.35 : 0.18}
              style={{ pointerEvents: 'none' }}
            />
          )
        })}

        {/* ── NODES ───────────────────────────────────────────── */}
        {nodes.map(node => {
          const st   = getState(node.id)
          const cfg  = S[st]
          const isHov = hoveredNode === node.id

          // Short label: first word only, max 8 chars
          const short = node.label.split(' ')[0].slice(0, 8)

          return (
            <g
              key={node.id}
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
            >
              {/* Hover ring */}
              {isHov && (
                <circle
                  cx={node.x} cy={node.y} r={R + 7}
                  fill="none"
                  stroke="rgba(255,255,255,0.22)"
                  strokeWidth={1}
                />
              )}
              {/* Main circle */}
              <circle
                className="node-circle"
                cx={node.x} cy={node.y} r={R}
                fill={cfg.fill}
                stroke={cfg.stroke}
                strokeWidth={cfg.sw}
              />
              {/* Icon letter */}
              <text
                x={node.x} y={node.y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={11}
                fontFamily="Inter,sans-serif"
                fontWeight="700"
                fill={cfg.text}
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              >
                {st === 'start' ? 'S' : st === 'end' ? 'E' : node.label.charAt(0)}
              </text>
              {/* Label below circle */}
              <text
                x={node.x} y={node.y + R + 13}
                textAnchor="middle"
                fontSize={10}
                fontFamily="Inter,sans-serif"
                fontWeight="500"
                fill={cfg.text}
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              >
                {short}
              </text>
            </g>
          )
        })}

        {/* ── HOVER TOOLTIP (pure SVG) ────────────────────────── */}
        {hNode && (() => {
          const lines = [hNode.label]
          if (hVals) {
            lines.push(`g(n) = ${hVals.g}`)
            lines.push(`h(n) = ${hVals.h}`)
            lines.push(`f(n) = ${hVals.f}`)
          } else {
            lines.push(`Status: ${hState}`)
          }
          const tw = 160
          const th = 22 + lines.length * 16
          // Keep tooltip inside viewBox
          let tx = hNode.x + 30
          let ty = hNode.y - th / 2
          if (tx + tw > VW - 10) tx = hNode.x - tw - 10
          if (ty < 8)            ty = 8
          if (ty + th > VH - 8)  ty = VH - th - 8
          const colors = ['#f8fafc', '#22d3ee', '#fbbf24', '#c084fc']
          return (
            <g style={{ pointerEvents: 'none' }}>
              <rect
                x={tx} y={ty} width={tw} height={th}
                rx={8}
                fill="#070d1a"
                fillOpacity={0.96}
                stroke="rgba(255,255,255,0.14)"
                strokeWidth={1}
              />
              {lines.map((ln, i) => (
                <text
                  key={i}
                  x={tx + 10} y={ty + 16 + i * 16}
                  fontSize={11}
                  fontFamily="Inter,sans-serif"
                  fontWeight={i === 0 ? '600' : '400'}
                  fill={colors[i] ?? '#94a3b8'}
                >
                  {ln}
                </text>
              ))}
            </g>
          )
        })()}
      </svg>
    </div>
  )
}
