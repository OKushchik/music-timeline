export default function LocalScoreBoard({ players = [], activeIndex = -1 }) {
  return (
    <div className="bg-darker border border-card rounded-xl p-4">
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
        Scores
      </h3>
      <ul className="flex flex-col gap-2">
        {players.map((p, i) => (
          <li
            key={p.name}
            className={`flex items-center justify-between rounded-lg px-2 py-1 transition
              ${i === activeIndex ? 'bg-primary/20 border border-primary/40' : ''}`}
          >
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-xs w-4">{i + 1}.</span>
              <span className="text-white text-sm font-medium">{p.name}</span>
              {i === activeIndex && (
                <span className="text-xs text-primary font-semibold">← now</span>
              )}
            </div>
            <span className="text-primary font-bold text-sm">{p.score} pts</span>
          </li>
        ))}
        {players.length === 0 && (
          <li className="text-gray-500 text-sm text-center py-2">No players yet</li>
        )}
      </ul>
    </div>
  );
}

