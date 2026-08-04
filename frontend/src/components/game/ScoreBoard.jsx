export default function ScoreBoard({ players = [] }) {
  const sorted = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className="bg-darker border border-card rounded-xl p-4">
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
        Scores
      </h3>
      <ul className="flex flex-col gap-2">
        {sorted.map((p, i) => (
          <li key={p.userId} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-xs w-4">{i + 1}.</span>
              <span className="text-white text-sm font-medium">{p.username}</span>
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

