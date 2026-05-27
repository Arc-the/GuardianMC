import type { AgentResponse, IncidentLog, ProviderStatus, SessionStartResponse, SimulatedScenario } from "./types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {})
    }
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const api = {
  health: () =>
    request<{ ok: boolean; providers: ProviderStatus }>("/api/health"),
  startSession: () => request<SessionStartResponse>("/api/session/start", { method: "POST", body: "{}" }),
  getIncidents: () => request<{ logs: IncidentLog[] }>("/api/incidents"),
  simulateIncident: (scenario: SimulatedScenario) =>
    request<{ logs: IncidentLog[]; highlightedLocations: string[]; safetyWarning?: string }>("/api/incidents/simulate", {
      method: "POST",
      body: JSON.stringify({ scenario })
    }),
  askAgent: (sessionId: string, transcript: string, incidentLogs: IncidentLog[]) =>
    request<AgentResponse>("/api/agent/ask", {
      method: "POST",
      body: JSON.stringify({ sessionId, transcript, incidentLogs })
    }),
  generateReport: (eventMode: string, transcript: string, assistantResponse: AgentResponse, incidentLogs: IncidentLog[]) =>
    request<{ report: string }>("/api/reports", {
      method: "POST",
      body: JSON.stringify({ eventMode, transcript, assistantResponse, incidentLogs })
    }),
  transcribe: async (audio: Blob) => {
    const response = await fetch(`${API_BASE_URL}/api/stt`, {
      method: "POST",
      headers: { "Content-Type": audio.type || "audio/wav" },
      body: audio
    });

    const payload = (await response.json()) as { ok: boolean; transcript?: string; reason?: string };
    if (!response.ok || !payload.ok || !payload.transcript) {
      throw new Error(payload.reason || `ElevenLabs speech-to-text request failed: ${response.status}`);
    }

    return payload.transcript;
  },
  speak: async (text: string) => {
    const response = await fetch(`${API_BASE_URL}/api/tts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    });

    if (!response.ok || response.headers.get("content-type")?.includes("application/json")) {
      return null;
    }

    return URL.createObjectURL(await response.blob());
  }
};
