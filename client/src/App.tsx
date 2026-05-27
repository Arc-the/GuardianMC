import { useState, useEffect, useCallback } from 'react';
import { TopBar } from './components/TopBar';
import { BlueprintMap } from './components/BlueprintMap';
import { IncidentFeed } from './components/IncidentFeed';
import { VoiceAssistant } from './components/VoiceAssistant';
import { IncidentReport } from './components/IncidentReport';
import { checkHealth, startSession, getIncidents, simulateIncident, askAgent } from './lib/api';
import { AgentResponse, IncidentLog, SessionInfo } from './lib/types';

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [incidentLogs, setIncidentLogs] = useState<IncidentLog[]>([]);
  const [highlightedLocations, setHighlightedLocations] = useState<string[]>([]);
  const [safetyAlert, setSafetyAlert] = useState(false);
  const [lastResponse, setLastResponse] = useState<AgentResponse | null>(null);
  const [lastTranscript, setLastTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [debugMode, setDebugMode] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  // Initialize connection
  useEffect(() => {
    const init = async () => {
      try {
        const health = await checkHealth();
        setIsConnected(health.ok);

        if (health.ok) {
          const sessionInfo = await startSession();
          setSession(sessionInfo);

          const incidents = await getIncidents();
          setIncidentLogs(incidents.logs);
        }
      } catch (err) {
        console.error('Initialization error:', err);
        setIsConnected(false);
      }
    };

    init();
  }, []);

  const handleSimulate = useCallback(async (scenario: string) => {
    setIsSimulating(true);
    try {
      const result = await simulateIncident(scenario);
      setIncidentLogs(result.logs);
      setHighlightedLocations(result.highlightedLocations);
      if (result.safetyWarning) {
        setSafetyAlert(true);
      }
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setIsSimulating(false);
    }
  }, []);

  const handleAsk = useCallback(async (transcript: string): Promise<AgentResponse | null> => {
    if (!session) return null;

    setIsProcessing(true);
    setLastTranscript(transcript);

    try {
      const response = await askAgent(session.sessionId, transcript, incidentLogs);
      setLastResponse(response);
      setHighlightedLocations(response.highlightedLocations);
      setSafetyAlert(!!response.safetyWarning);
      return response;
    } catch (err) {
      console.error('Agent error:', err);
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [session, incidentLogs]);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <TopBar isConnected={isConnected} />

      <main className="flex-1 p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
          {/* Left: Blueprint Map */}
          <div className="lg:col-span-1 min-h-[400px]">
            <BlueprintMap
              highlightedLocations={highlightedLocations}
              safetyAlert={safetyAlert}
            />
          </div>

          {/* Middle: Incident Feed */}
          <div className="lg:col-span-1 min-h-[400px]">
            <IncidentFeed
              logs={incidentLogs}
              onSimulate={handleSimulate}
              isLoading={isSimulating}
            />
          </div>

          {/* Right: Voice Assistant */}
          <div className="lg:col-span-1 min-h-[400px]">
            <VoiceAssistant
              onAsk={handleAsk}
              lastResponse={lastResponse}
              isProcessing={isProcessing}
              voiceEnabled={voiceEnabled}
              onVoiceToggle={setVoiceEnabled}
              debugMode={debugMode}
              onDebugToggle={setDebugMode}
            />
          </div>
        </div>

        {/* Bottom: Incident Report */}
        <div className="mt-4">
          <IncidentReport
            lastResponse={lastResponse}
            lastTranscript={lastTranscript}
            incidentLogs={incidentLogs}
          />
        </div>
      </main>

      {/* Session Info */}
      {session && (
        <footer className="bg-slate-800 border-t border-slate-700 px-6 py-2 text-xs text-slate-500">
          Session: {session.sessionId} | Context files: {session.loadedContextFiles.join(', ')}
        </footer>
      )}
    </div>
  );
}

export default App;
