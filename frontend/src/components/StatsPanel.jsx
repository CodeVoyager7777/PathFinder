/**
 * StatsPanel.jsx
 * Live view of the A* open set (priority queue) sorted by f(n),
 * plus summary statistics.
 */
export default function StatsPanel({ step, searchResult, isDone }) {
  if (!step) return null

  const openSet = step.open_set ?? []
  const closed  = step.closed_set?.length ?? 0
  const found   = searchResult?.found

  return (
    <div className="glass p-5 flex flex-col gap-3.5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-white/90">Open Set (Priority Queue)</h2>
          <p className="text-[10px] text-white/40 mt-0.5">Min-heap sorted by f(n) = g(n) + h(n)</p>
        </div>
        <div className="flex gap-2">
          <div className="bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg text-right">
            <span className="text-[10px] text-amber-300/70 block">Open</span>
            <span className="text-xs font-mono font-bold text-amber-400">{openSet.length}</span>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-lg text-right">
            <span className="text-[10px] text-blue-300/70 block">Closed</span>
            <span className="text-xs font-mono font-bold text-blue-400">{closed}</span>
          </div>
        </div>
      </div>

      {/* Open set table */}
      {openSet.length > 0 ? (
        <div className="overflow-y-auto max-h-44 rounded-xl border border-white/[0.08] bg-slate-950/40">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="bg-white/[0.04] border-b border-white/[0.08] text-white/40">
                <th className="px-3 py-2 text-left font-medium">Node</th>
                <th className="px-2 py-2 text-right font-medium">g(n)</th>
                <th className="px-2 py-2 text-right font-medium">h(n)</th>
                <th className="px-3 py-2 text-right font-medium">f(n)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {openSet.map((n, idx) => (
                <tr
                  key={n.node}
                  className={`transition-colors ${
                    idx === 0
                      ? 'bg-amber-500/15 text-amber-200 font-medium'
                      : 'text-white/70 hover:bg-white/[0.02]'
                  }`}
                >
                  <td className="px-3 py-1.5 flex items-center gap-1.5">
                    {idx === 0 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping inline-block" />
                    )}
                    <span>{n.label}</span>
                    {idx === 0 && <span className="text-[9px] bg-amber-400/20 px-1 rounded text-amber-300 ml-1">Next</span>}
                  </td>
                  <td className="px-2 py-1.5 text-right text-cyan-400 font-mono">{n.g}</td>
                  <td className="px-2 py-1.5 text-right text-amber-400 font-mono">{n.h}</td>
                  <td className="px-3 py-1.5 text-right text-purple-400 font-mono font-bold">{n.f}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-4 text-[11px] text-white/30 bg-white/[0.02] rounded-xl border border-white/[0.04]">
          {isDone ? (found ? 'Search complete.' : 'No path found.') : 'Open set is currently empty.'}
        </div>
      )}

      {/* Final path summary */}
      {isDone && found && searchResult?.path && (
        <div className="bg-purple-500/10 border border-purple-500/25 rounded-xl p-3 flex flex-col gap-2">
          <div className="text-[10px] text-purple-300/80 font-semibold uppercase tracking-wider">
            Optimal Route Found ({searchResult.path.length} Waypoints)
          </div>
          <div className="flex flex-wrap gap-1.5 items-center">
            {searchResult.path.map((nodeId, i) => (
              <span key={nodeId} className="flex items-center gap-1">
                <span className="px-2.5 py-1 rounded-lg bg-purple-500/25 text-purple-200 text-[11px] font-medium border border-purple-500/30">
                  {nodeId.replace(/_/g, ' ')}
                </span>
                {i < searchResult.path.length - 1 && (
                  <span className="text-purple-400/60 text-xs">→</span>
                )}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
