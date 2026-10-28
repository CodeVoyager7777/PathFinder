import { useState, useEffect, useRef } from 'react'
import GraphCanvas from './components/GraphCanvas'
import ControlPanel from './components/ControlPanel'
import StepExplainer from './components/StepExplainer'
import StatsPanel from './components/StatsPanel'

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api'

export default function App() {
  const [graph, setGraph] = useState({ nodes: [], edges: [] })
  const [selectedStart, setSelectedStart] = useState('main_gate')
  const [selectedEnd, setSelectedEnd] = useState('hostel_a')

  const [loading, setLoading] = useState(false)
  const [searchResult, setSearchResult] = useState(null)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)

  // playMode: 'idle' | 'running' | 'paused' | 'done'
  const [playMode, setPlayMode] = useState('idle')
  const [playSpeed, setPlaySpeed] = useState(700) // ms per step

  const timerRef = useRef(null)

  // 1. Fetch graph definition on mount
  useEffect(() => {
    fetch(`${API_BASE}/graph`)
      .then(res => res.json())
      .then(data => {
        setGraph(data)
        if (data.nodes?.length > 1) {
          setSelectedStart(data.nodes[0].id)
          setSelectedEnd(data.nodes[Math.min(9, data.nodes.length - 1)].id)
        }
      })
      .catch(err => console.error('Failed to load campus graph:', err))
  }, [])

  // 2. Clear timer helper
  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  // 3. Playback timer loop
  useEffect(() => {
    if (playMode === 'running' && searchResult?.steps) {
      timerRef.current = setInterval(() => {
        setCurrentStepIndex(prev => {
          const next = prev + 1
          if (next >= searchResult.steps.length - 1) {
            stopTimer()
            setPlayMode('done')
            return searchResult.steps.length - 1
          }
          return next
        })
      }, playSpeed)
    } else {
      stopTimer()
    }
    return () => stopTimer()
  }, [playMode, playSpeed, searchResult])

  // 4. Run A* search via FastAPI backend
  const handleRun = async () => {
    stopTimer()
    setLoading(true)
    setSearchResult(null)
    setCurrentStepIndex(0)
    setPlayMode('idle')

    try {
      const res = await fetch(`${API_BASE}/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ start: selectedStart, end: selectedEnd }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.detail || 'Search failed')
      }

      const data = await res.json()
      setSearchResult(data)
      setCurrentStepIndex(0)
      if (data.steps && data.steps.length > 0) {
        setPlayMode('running')
      } else {
        setPlayMode('done')
      }
    } catch (err) {
      alert(`Search error: ${err.message}`)
      setPlayMode('idle')
    } finally {
      setLoading(false)
    }
  }

  const handlePlay = () => {
    if (playMode === 'done') {
      setCurrentStepIndex(0)
    }
    setPlayMode('running')
  }

  const handlePause = () => {
    setPlayMode('paused')
  }

  const handleStepForward = () => {
    setPlayMode('paused')
    if (searchResult?.steps && currentStepIndex < searchResult.steps.length - 1) {
      const next = currentStepIndex + 1
      setCurrentStepIndex(next)
      if (next === searchResult.steps.length - 1) {
        setPlayMode('done')
      }
    }
  }

  const handleStepBack = () => {
    setPlayMode('paused')
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1)
    }
  }

  const handleReset = () => {
    stopTimer()
    setSearchResult(null)
    setCurrentStepIndex(0)
    setPlayMode('idle')
  }

  const currentStep = searchResult?.steps ? searchResult.steps[currentStepIndex] : null
  const isDone = playMode === 'done' || (searchResult?.steps && currentStepIndex === searchResult.steps.length - 1)
  const finalPath = searchResult?.path || []

  return (
    <div className="w-screen h-screen bg-[#070b14] text-slate-100 flex flex-col overflow-hidden select-none">
      {/* ── Top Navigation Bar ───────────────────────────────────────── */}
      <header className="h-14 border-b border-white/[0.08] px-6 flex items-center justify-between bg-white/[0.02] backdrop-blur-md z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white shadow-md shadow-cyan-500/20">
            A*
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
              PathFinder <span className="text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full font-normal">Interactive A* Visualizer</span>
            </h1>
            <p className="text-[10px] text-white/40">Campus Graph • Heuristic Search • g(n) + h(n)</p>
          </div>
        </div>

        {/* Legend */}
        <div className="hidden lg:flex items-center gap-4 text-[11px] text-white/50 bg-white/[0.03] px-3.5 py-1.5 rounded-full border border-white/[0.06]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
            <span>Start</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50" />
            <span>Target</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-400 shadow-sm shadow-orange-500/50" />
            <span>Expanding</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm shadow-amber-500/50" />
            <span>Open Set</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-400 shadow-sm shadow-blue-500/50" />
            <span>Closed Set</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400 shadow-sm shadow-purple-500/50" />
            <span>Optimal Path</span>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              playMode === 'running' ? 'bg-cyan-400' : isDone ? 'bg-purple-400' : 'bg-emerald-400'
            }`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${
              playMode === 'running' ? 'bg-cyan-500' : isDone ? 'bg-purple-500' : 'bg-emerald-500'
            }`}></span>
          </span>
          <span className="text-[11px] text-white/60 font-mono capitalize">
            {playMode === 'idle' ? 'Ready' : playMode}
          </span>
        </div>
      </header>

      {/* ── Main Content Area ────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Graph Canvas with ambient background */}
        <div className="flex-1 relative flex flex-col p-4 overflow-hidden">
          <div className="absolute inset-0 bg-radial from-cyan-900/10 via-transparent to-transparent pointer-events-none" />
          
          <div className="flex-1 glass border border-white/[0.08] relative overflow-hidden flex items-center justify-center p-2">
            <GraphCanvas
              graph={graph}
              currentStep={currentStep}
              selectedStart={selectedStart}
              selectedEnd={selectedEnd}
              finalPath={finalPath}
              isDone={isDone}
            />

            {/* Hint overlay */}
            <div className="absolute bottom-3 left-4 text-[11px] text-white/30 pointer-events-none flex items-center gap-2">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
              Hover any node for instant g(n), h(n), f(n) evaluation
            </div>
          </div>
        </div>

        {/* Right: Glassmorphism Control & Inspection Sidebar */}
        <div className="w-[420px] shrink-0 border-l border-white/[0.08] bg-[#090e1c]/60 backdrop-blur-xl p-4 flex flex-col gap-4 overflow-y-auto">
          {/* Controls */}
          <ControlPanel
            nodes={graph.nodes}
            selectedStart={selectedStart}
            selectedEnd={selectedEnd}
            onStartChange={setSelectedStart}
            onEndChange={setSelectedEnd}
            onRun={handleRun}
            onPlay={handlePlay}
            onPause={handlePause}
            onStepForward={handleStepForward}
            onStepBack={handleStepBack}
            onReset={handleReset}
            playMode={playMode}
            playSpeed={playSpeed}
            onSpeedChange={setPlaySpeed}
            loading={loading}
            searchResult={searchResult}
            currentStepIndex={currentStepIndex}
          />

          {/* Step Explainer */}
          <StepExplainer
            step={currentStep}
            stepIndex={currentStepIndex}
            totalSteps={searchResult?.steps?.length ?? 0}
            searchResult={searchResult}
            isDone={isDone}
          />

          {/* Stats / Priority Queue Table */}
          <StatsPanel
            step={currentStep}
            searchResult={searchResult}
            isDone={isDone}
          />
        </div>
      </div>
    </div>
  )
}
