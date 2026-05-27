import { useState } from 'react';
import { AgentResponse, IncidentLog } from '../lib/types';
import { generateReport } from '../lib/api';

interface IncidentReportProps {
  lastResponse: AgentResponse | null;
  lastTranscript: string;
  incidentLogs: IncidentLog[];
}

export function IncidentReport({ lastResponse, lastTranscript, incidentLogs }: IncidentReportProps) {
  const [report, setReport] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!lastResponse) return;

    setIsGenerating(true);
    try {
      const result = await generateReport(
        'Live Event Mode - FIFA Watch Party Halftime',
        lastTranscript,
        lastResponse,
        incidentLogs
      );
      setReport(result.report);
    } catch (err) {
      console.error('Report generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!report) return;
    await navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Incident Report</h2>
        <div className="flex gap-2">
          <button
            onClick={handleGenerate}
            disabled={!lastResponse || isGenerating}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm rounded transition-colors"
          >
            {isGenerating ? 'Generating...' : 'Generate Report'}
          </button>
          {report && (
            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white text-sm rounded transition-colors"
            >
              {copied ? 'Copied!' : 'Copy Report'}
            </button>
          )}
        </div>
      </div>

      {report ? (
        <pre className="bg-slate-900 rounded-lg p-4 text-xs text-slate-300 overflow-x-auto whitespace-pre-wrap font-mono max-h-64 overflow-y-auto">
          {report}
        </pre>
      ) : (
        <p className="text-slate-500 text-sm">
          {lastResponse
            ? 'Click "Generate Report" to create an incident report from the last query.'
            : 'Ask the assistant a question first to generate a report.'}
        </p>
      )}
    </div>
  );
}
