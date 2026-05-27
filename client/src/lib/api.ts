import { AgentResponse, HealthStatus, IncidentLog, SessionInfo } from './types';

const API_BASE = '/api';

export async function checkHealth(): Promise<HealthStatus> {
  const res = await fetch(`${API_BASE}/health`);
  return res.json();
}

export async function startSession(): Promise<SessionInfo> {
  const res = await fetch(`${API_BASE}/session/start`, { method: 'POST' });
  return res.json();
}

export async function getIncidents(): Promise<{ logs: IncidentLog[] }> {
  const res = await fetch(`${API_BASE}/incidents`);
  return res.json();
}

export async function simulateIncident(scenario: string): Promise<{
  logs: IncidentLog[];
  highlightedLocations: string[];
  safetyWarning?: string;
}> {
  const res = await fetch(`${API_BASE}/incidents/simulate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scenario })
  });
  return res.json();
}

export async function askAgent(
  sessionId: string,
  transcript: string,
  incidentLogs: IncidentLog[]
): Promise<AgentResponse> {
  const res = await fetch(`${API_BASE}/agent/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, transcript, incidentLogs })
  });
  return res.json();
}

export async function transcribeAudio(audioBlob: Blob): Promise<{
  transcript: string | null;
  fallbackRequired: boolean;
  message?: string;
}> {
  const formData = new FormData();
  formData.append('audio', audioBlob);
  const res = await fetch(`${API_BASE}/stt`, {
    method: 'POST',
    body: formData
  });
  return res.json();
}

export async function textToSpeech(text: string): Promise<{
  audio: string | null;
  contentType?: string;
  fallbackRequired: boolean;
  message?: string;
}> {
  const res = await fetch(`${API_BASE}/tts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });
  return res.json();
}

export async function generateReport(
  eventMode: string,
  transcript: string,
  agentResponse: AgentResponse,
  incidentLogs: IncidentLog[]
): Promise<{ report: string }> {
  const res = await fetch(`${API_BASE}/reports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ eventMode, transcript, agentResponse, incidentLogs })
  });
  return res.json();
}
