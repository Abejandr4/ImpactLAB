const AsteroidsDisplayBar = ({ topAsteroids, asteroidsDatabase, onSelectAsteroid }) => {
  // Normalize both sides: trim whitespace for reliable matching
  const topNamesSet = new Set(topAsteroids.map(name => name.trim()));

  const filteredAsteroids = asteroidsDatabase.filter(ast =>
    ast.full_name && topNamesSet.has(ast.full_name.trim())
  );

  const displayList = [...filteredAsteroids, ...filteredAsteroids];

  if (filteredAsteroids.length === 0) {
    return (
      <div className="w-full bg-black border-y border-zinc-800 py-4 text-center text-zinc-500 font-mono text-sm">
        No matching asteroids found.
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden bg-black border-y border-zinc-800 py-4">
      <div className="flex w-max animate-ticker hover:[animation-play-state:paused]">
        {displayList.map((ast, index) => (
          <div
            key={index}
            onClick={() => onSelectAsteroid?.(ast.full_name.trim())}
            className="flex items-center space-x-6 px-12 border-r border-zinc-900 last:border-r-0 cursor-pointer hover:bg-zinc-900/40"
          >
            <span className="font-mono text-lg font-bold uppercase tracking-wider text-green-500">
              {ast.full_name.trim()}
            </span>

            <div className="flex space-x-4 font-mono text-sm">
              <span className="text-zinc-500">
                DIA: <span className="text-zinc-300">{ast.diameter}km</span>
              </span>
              <span className="text-zinc-500">
                MAG: <span className="text-zinc-300">{ast.magnitud_absoluta}</span>
              </span>
            </div>

            <span className={`flex items-center gap-1 font-mono text-xs font-bold px-2 py-0.5 rounded-sm ${
              ast.es_peligroso
                ? 'bg-red-950/30 text-red-500 border border-red-900'
                : 'bg-emerald-950/30 text-emerald-500 border border-emerald-900'
            }`}>
              {ast.es_peligroso ? "⚠️ HAZARDOUS" : "✅ STABLE"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AsteroidsDisplayBar;