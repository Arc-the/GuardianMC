interface BlueprintMapProps {
  highlightedLocations: string[];
  safetyAlert: boolean;
}

const LOCATIONS = [
  { id: 'main-hall', name: 'Main Hall', row: 1, col: 2 },
  { id: 'zone-a', name: 'Zone A', row: 2, col: 1 },
  { id: 'zone-b', name: 'Zone B', row: 2, col: 3 },
  { id: 'av-booth', name: 'AV Booth', row: 3, col: 2 },
  { id: 'network-room', name: 'Network Room', row: 4, col: 1 },
  { id: 'electrical-room', name: 'Electrical Room', row: 4, col: 3 },
  { id: 'gate-1', name: 'Gate 1', row: 1, col: 1 },
  { id: 'gate-2', name: 'Gate 2', row: 1, col: 3 },
  { id: 'gate-3-corridor', name: 'Gate 3 Corridor', row: 5, col: 2 },
  { id: 'first-aid', name: 'First Aid', row: 3, col: 1 },
  { id: 'security-desk', name: 'Security Desk', row: 3, col: 3 },
];

export function BlueprintMap({ highlightedLocations, safetyAlert }: BlueprintMapProps) {
  const isHighlighted = (name: string) => {
    return highlightedLocations.some(
      loc => loc.toLowerCase().replace(/\s+/g, '-') === name.toLowerCase().replace(/\s+/g, '-') ||
             loc.toLowerCase().includes(name.toLowerCase().replace('-', ' ')) ||
             name.toLowerCase().replace('-', ' ').includes(loc.toLowerCase())
    );
  };

  return (
    <div className="bg-slate-800 rounded-lg p-4 h-full">
      <h2 className="text-lg font-semibold mb-4 text-white">Venue Blueprint</h2>
      <div className="grid grid-cols-3 gap-2 h-[calc(100%-3rem)]">
        {[1, 2, 3, 4, 5].map(row => (
          LOCATIONS.filter(loc => loc.row === row).length > 0 ? (
            <div key={row} className="contents">
              {[1, 2, 3].map(col => {
                const location = LOCATIONS.find(l => l.row === row && l.col === col);
                if (!location) {
                  return <div key={`${row}-${col}`} className="bg-slate-900/30 rounded" />;
                }
                const highlighted = isHighlighted(location.name);
                return (
                  <div
                    key={location.id}
                    className={`
                      rounded-lg p-3 flex items-center justify-center text-center text-sm font-medium
                      transition-all duration-300
                      ${highlighted && safetyAlert
                        ? 'bg-red-600 text-white animate-pulse'
                        : highlighted
                        ? 'bg-amber-500 text-slate-900 ring-2 ring-amber-300'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }
                    `}
                  >
                    {location.name}
                  </div>
                );
              })}
            </div>
          ) : (
            <div key={row} className="contents">
              {[1, 2, 3].map(col => (
                <div key={`empty-${row}-${col}`} className="bg-slate-900/30 rounded" />
              ))}
            </div>
          )
        ))}
      </div>
    </div>
  );
}
