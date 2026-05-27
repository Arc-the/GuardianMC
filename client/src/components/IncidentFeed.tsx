import { AlertTriangle, Network, Projector, Siren } from "lucide-react";
import type { IncidentLog, SimulatedScenario } from "../lib/types";

type IncidentFeedProps = {
  logs: IncidentLog[];
  onSimulate: (scenario: SimulatedScenario) => void;
};

const simulationButtons: Array<{ scenario: SimulatedScenario; label: string; icon: typeof Projector }> = [
  { scenario: "projector_failure", label: "Simulate Projector Failure", icon: Projector },
  { scenario: "network_rack_alert", label: "Simulate Network Rack Alert", icon: Network },
  { scenario: "smoke_detector_alert", label: "Simulate Smoke Detector Alert", icon: Siren }
];

export function IncidentFeed({ logs, onSimulate }: IncidentFeedProps) {
  return (
    <section className="min-h-0 rounded-md border border-ops-line bg-ops-panel p-4">
      <div className="mb-4 flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-ops-amber" />
        <h2 className="text-base font-semibold text-white">Live Incident Feed</h2>
      </div>
      <div className="mb-4 grid gap-2">
        {simulationButtons.map(({ scenario, label, icon: Icon }) => (
          <button
            key={scenario}
            onClick={() => onSimulate(scenario)}
            className="flex items-center justify-center gap-2 rounded-md border border-ops-line bg-ops-panel2 px-3 py-2 text-sm font-medium text-slate-100 transition hover:border-ops-cyan/60 hover:text-white"
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>
      <div className="max-h-[520px] space-y-2 overflow-auto pr-1">
        {logs.map((log) => (
          <div
            key={log.id}
            className={`rounded-md border p-3 text-sm ${
              log.severity === "critical"
                ? "border-ops-red/60 bg-ops-red/10"
                : log.severity === "warning"
                  ? "border-ops-amber/50 bg-ops-amber/10"
                  : "border-ops-line bg-ops-panel2"
            }`}
          >
            <div className="mb-1 flex items-center justify-between gap-2">
              <span className="font-mono text-xs text-slate-400">[{log.time}]</span>
              <span className="text-xs uppercase text-slate-500">{log.severity}</span>
            </div>
            <p className="text-slate-100">{log.message}</p>
            <p className="mt-1 text-xs text-slate-400">{log.locations.join(" -> ")}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
