/**
 * StepExplainer.jsx
 * Displays a plain-English description of what A* is doing at the current step.
 * This is the main educational panel — great for viva explanations.
 */
export default function StepExplainer({ step, stepIndex, totalSteps, searchResult, isDone }) {
  const found = searchResult?.found

  if (!step) {
    return (
      <div className="glass p-5">
        <h2 className="text-sm font-semibold text-white/90 mb-1">Step Explainer</h2>
        <p className="text-[12px] text-white/40 leading-relaxed">
          Select a start and end node, then click <span className="text-cyan-400 font-medium">Execute A* Search</span> to begin.
          Each node expansion and cost calculation will be detailed here in real time.
        </p>
      </div>
    )
  }

  // Colour badge for the current node state
  const badgeColour = isDone && found
    ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
    : step.current_node === searchResult?.path?.at(-1)
      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
      : 'bg-orange-500/20 text-orange-300 border-orange-500/30'

  return (
    <div className="glass p-5 flex flex-col gap-3">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white/90">Step Explainer</h2>
        <span className="text-[10px] text-white/40 font-mono bg-white/[0.05] px-2 py-0.5 rounded-full border border-white/10">
          Step {stepIndex + 1} of {totalSteps}
        </span>
      </div>

      {/* Current node badge */}
      {step.current_node && (
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs w-fit ${badgeColour}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
          <span>Expanding Node: <span className="font-semibold font-mono tracking-wide">{step.current_node.replace(/_/g, ' ')}</span></span>
        </div>
      )}

      {/* g / h / f values */}
      {step.current_node && (
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'g(n)', value: step.g, colour: 'text-cyan-400',   desc: 'Exact cost from start',       bg: 'bg-cyan-500/10 border-cyan-500/20' },
            { label: 'h(n)', value: step.h, colour: 'text-amber-400',  desc: 'Euclidean heuristic to goal', bg: 'bg-amber-500/10 border-amber-500/20' },
            { label: 'f(n)', value: step.f, colour: 'text-purple-400', desc: 'Total estimated f = g + h',  bg: 'bg-purple-500/10 border-purple-500/20' },
          ].map(({ label, value, colour, desc, bg }) => (
            <div key={label} className={`${bg} border rounded-xl p-2.5 text-center`}>
              <div className={`text-lg font-bold font-mono ${colour}`}>{value}</div>
              <div className="text-[10px] text-white/70 font-semibold">{label}</div>
              <div className="text-[9px] text-white/35 mt-0.5 leading-tight">{desc}</div>
            </div>
          ))}
        </div>
      )}

      {/* Natural language description */}
      <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-3">
        <p className="text-[12px] text-white/75 leading-relaxed">
          {step.action}
        </p>
      </div>

      {/* Final result banner */}
      {isDone && (
        <div className={`p-3 rounded-xl border text-xs font-medium flex items-center justify-between ${
          found
            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
            : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
        }`}>
          <span>
            {found
              ? `Path found with total cost ${searchResult.total_cost} across ${searchResult.path.length} nodes!`
              : 'No path exists between the selected nodes.'}
          </span>
          {found && (
            <span className="text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/40">
              Optimal
            </span>
          )}
        </div>
      )}
    </div>
  )
}
