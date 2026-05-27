export interface IncidentLog {
  timestamp: string;
  message: string;
  severity?: 'info' | 'warning' | 'critical';
  location?: string;
}

export interface AgentResponse {
  situation: string;
  relevantLocation: string;
  blueprintPath: string;
  nextSafeChecks: string[];
  escalationRule: string;
  suggestedSpokenInstruction: string;
  highlightedLocations: string[];
  relevantAssets: string[];
  safetyWarning?: string;
}

export interface SessionInfo {
  sessionId: string;
  loadedContextFiles: string[];
}

export interface HealthStatus {
  ok: boolean;
  providers: {
    wisprFlowConfigured: boolean;
    elevenLabsConfigured: boolean;
    modelConfigured: boolean;
  };
}
