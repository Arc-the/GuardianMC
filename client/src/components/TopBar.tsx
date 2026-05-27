interface TopBarProps {
  isConnected: boolean;
}

export function TopBar({ isConnected }: TopBarProps) {
  return (
    <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">AngelMC</h1>
          <p className="text-slate-400 text-sm">
            Hands-free blueprint and incident support for live event engineers
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span className="px-3 py-1 bg-green-600 text-white text-sm font-medium rounded-full">
            Live Event Mode
          </span>
          <span className="px-3 py-1 bg-amber-600 text-white text-sm font-medium rounded-full">
            FIFA Watch Party - Halftime
          </span>
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
               title={isConnected ? 'Connected' : 'Disconnected'} />
        </div>
      </div>
    </header>
  );
}
