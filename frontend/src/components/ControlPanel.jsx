/**
 * ControlPanel.jsx
 * Glassmorphism control card — node selectors, run/playback buttons,
 * speed slider, and step progress indicator.
 *
 * playMode: 'idle' | 'running' | 'paused' | 'done'
 */
export default function ControlPanel({
  nodes, selectedStart, selectedEnd,
  onStartChange, onEndChange,
  onRun, onPlay, onPause, onStepForward, onStepBack, onReset,
  playMode, playSpeed, onSpeedChange,
  loading, searchResult, currentStepIndex
}) {
  const totalSteps  = searchResult?.steps?.length ?? 0
  const hasResult   = !!searchResult
  const isRunning   = playMode === 'running'
  const isDone      = playMode === 'done'
  const canGoBack   = hasResult && currentStepIndex > 0
  const canGoFwd    = hasResult && currentStepIndex < totalSteps - 1

  // Progress percentage for the mini progress bar
  const pct = totalSteps > 0 ? ((currentStepIndex + 1) / totalSteps) * 100 : 0

  return (
    <div className="glass p-5 flex flex-col gap-4">
      {/* Header */}
      <div>
        <h2 className="text-sm font-semibold text-white/90 tracking-wide">Controls & Navigation</h2>
        <p className="text-[11px] text-white/40 mt-0.5">Select journey & run A* search</p>
      </div>

      {/* Node selectors */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] font-medium text-emerald-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            Start Node
          </label>
          <select
            value={selectedStart}
            onChange={e => onStartChange(e.target.value)}
            disabled={isRunning}
            className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-3 py-2
                       text-xs text-white/90 focus:outline-none focus:border-emerald-500/60
                       focus:ring-1 focus:ring-emerald-500/30 transition-all cursor-pointer
                       disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {nodes.map(n => (
              <option
                key={n.id}
                value={n.id}
                disabled={n.id === selectedEnd}
                className="bg-slate-900 text-white"
              >
                {n.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-medium text-rose-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500 inline-block"></span>
            End Node
          </label>
          <select
            value={selectedEnd}
            onChange={e => onEndChange(e.target.value)}
            disabled={isRunning}
            className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-3 py-2
                       text-xs text-white/90 focus:outline-none focus:border-rose-500/60
                       focus:ring-1 focus:ring-rose-500/30 transition-all cursor-pointer
                       disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {nodes.map(n => (
              <option
                key={n.id}
                value={n.id}
                disabled={n.id === selectedStart}
                className="bg-slate-900 text-white"
              >
                {n.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Run button */}
      <button
        onClick={onRun}
        disabled={loading || isRunning || selectedStart === selectedEnd}
        className="w-full py-2.5 rounded-xl text-xs font-semibold tracking-wide
                   bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600
                   hover:from-cyan-400 hover:via-blue-500 hover:to-indigo-500
                   active:scale-[0.98] transition-all duration-150
                   disabled:opacity-40 disabled:cursor-not-allowed
                   text-white shadow-lg shadow-cyan-500/20"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
            Computing A*...
          </span>
        ) : 'Execute A* Search'}
      </button>

      {/* Playback controls — only visible after a search */}
      {hasResult && (
        <div className="pt-2 border-t border-white/[0.08] flex flex-col gap-3">
          {/* Progress bar */}
          <div>
            <div className="flex justify-between text-[11px] text-white/40 mb-1.5">
              <span>Step Progress</span>
              <span className="font-mono text-cyan-400">{currentStepIndex + 1} / {totalSteps}</span>
            </div>
            <div className="h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${pct}%`,
                  background: isDone
                    ? 'linear-gradient(90deg,#a855f7,#ec4899)'
                    : 'linear-gradient(90deg,#06b6d4,#3b82f6)'
                }}
              />
            </div>
          </div>

          {/* Playback buttons */}
          <div className="flex items-center gap-2">
            {/* Step Back */}
            <button
              onClick={onStepBack}
              disabled={!canGoBack || isRunning}
              title="Previous Step"
              className="flex-1 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-white/70 hover:text-white
                         hover:bg-white/[0.1] active:scale-95 transition-all text-xs font-medium flex items-center justify-center gap-1
                         disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <span>&#9664;</span> Step
            </button>

            {/* Play / Pause */}
            {isRunning ? (
              <button
                onClick={onPause}
                title="Pause"
                className="flex-[2] py-2 rounded-xl bg-amber-500/20 border border-amber-500/40
                           text-amber-300 hover:bg-amber-500/30 active:scale-95 transition-all text-xs font-semibold flex items-center justify-center gap-1"
              >
                <span>&#9646;&#9646;</span> Pause
              </button>
            ) : (
              <button
                onClick={onPlay}
                disabled={isDone && !canGoFwd}
                title="Play"
                className="flex-[2] py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40
                           text-emerald-300 hover:bg-emerald-500/30 active:scale-95 transition-all text-xs font-semibold flex items-center justify-center gap-1
                           disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <span>&#9654;</span> {isDone ? 'Finished' : 'Auto Play'}
              </button>
            )}

            {/* Step Forward */}
            <button
              onClick={onStepForward}
              disabled={!canGoFwd || isRunning}
              title="Next Step"
              className="flex-1 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-white/70 hover:text-white
                         hover:bg-white/[0.1] active:scale-95 transition-all text-xs font-medium flex items-center justify-center gap-1
                         disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Step <span>&#9654;</span>
            </button>
          </div>

          {/* Speed + Reset row */}
          <div className="flex items-center gap-3 pt-1">
            <div className="flex-1">
              <div className="flex justify-between text-[10px] text-white/40 mb-1">
                <span>Playback Delay</span>
                <span className="font-mono text-cyan-300">{playSpeed >= 1000 ? `${(playSpeed/1000).toFixed(1)}s` : `${playSpeed}ms`}</span>
              </div>
              <input
                type="range"
                min={200}
                max={2000}
                step={100}
                value={playSpeed}
                onChange={e => onSpeedChange(Number(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <div className="flex justify-between text-[9px] text-white/20 mt-0.5">
                <span>Fast</span>
                <span>Slow</span>
              </div>
            </div>
            <button
              onClick={onReset}
              className="px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300
                         hover:bg-red-500/20 active:scale-95 transition-all self-center"
            >
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
