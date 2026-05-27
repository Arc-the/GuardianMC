import { IncidentLog } from '../lib/types';

interface IncidentFeedProps {
  logs: IncidentLog[];
  onSimulate: (scenario: string) => void;
  isLoading: boolean;
}

export function IncidentFeed({ logs, onSimulate, isLoading }: IncidentFeedProps) {
  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-900/30';
      case 'warning': return 'text-amber-400 bg-amber-900/30';
      default: return 'text-slate-400 bg-slate-800';
    }
  };

  return (
    <div className="bg-slate-800 rounded-lg p-4 h-full flex flex-col">
      <h2 className="text-lg font-semibold mb-4 text-white">Live Incident Feed</h2>

      <div className="flex-1 overflow-y-auto space-y-2 mb-4">
        {logs.map((log, index) => (
          <div
            key={index}
            className={`p-2 rounded text-sm ${getSeverityColor(log.severity)}`}
          >
            <span className="font-mono text-xs opacity-70">[{log.timestamp}]</span>{' '}
            {log.message}
            {log.location && (
              <span className="ml-2 text-xs opacity-50">@ {log.location}</span>
            )}
          </div>
        ))}
      </div>

      <div className="border-t border-slate-700 pt-4 space-y-2">
        <p className="text-xs text-slate-500 mb-2">Simulate Incident:</p>
        <div className="grid grid-cols-1 gap-2">
          <button
            onClick={() => onSimulate('projector_failure')}
            disabled={isLoading}
            className="px-3 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-sm rounded transition-colors"
          >
            Projector Failure
          </button>
          <button
            onClick={() => onSimulate('network_rack_alert')}
            disabled={isLoading}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm rounded transition-colors"
          >
            Network Rack Alert
          </button>
          <button
            onClick={() => onSimulate('smoke_detector_alert')}
            disabled={isLoading}
            className="px-3 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-sm rounded transition-colors"
          >
            Smoke Detector Alert
          </button>
        </div>
      </div>
    </div>
  );
}
