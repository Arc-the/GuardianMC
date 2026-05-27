import { Clipboard, FileText } from "lucide-react";

type IncidentReportProps = {
  report: string;
  onGenerate: () => void;
};

export function IncidentReport({ report, onGenerate }: IncidentReportProps) {
  return (
    <section className="rounded-md border border-ops-line bg-ops-panel p-4">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-ops-cyan" />
          <h2 className="text-base font-semibold text-white">Incident Report</h2>
        </div>
        <div className="flex gap-2">
          <button onClick={onGenerate} className="rounded-md bg-ops-cyan px-3 py-2 text-sm font-semibold text-slate-950">
            Generate Incident Report
          </button>
          <button
            onClick={() => report && navigator.clipboard.writeText(report)}
            className="flex items-center gap-2 rounded-md border border-ops-line bg-ops-panel2 px-3 py-2 text-sm text-slate-100"
          >
            <Clipboard className="h-4 w-4" />
            Copy Report
          </button>
        </div>
      </div>
      <pre className="min-h-40 overflow-auto whitespace-pre-wrap rounded-md border border-ops-line bg-ops-bg p-4 text-sm leading-6 text-slate-200">
        {report || "Generate a report after the assistant responds."}
      </pre>
    </section>
  );
}
