export interface IncidentLog {
  timestamp: string;
  message: string;
  severity?: 'info' | 'warning' | 'critical';
  location?: string;
}

export interface AgentAskRequest {
  sessionId: string;
  transcript: string;
  incidentLogs: IncidentLog[];
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

export interface SessionContext {
  sessionId: string;
  loadedContextFiles: string[];
  contextContent: string;
  createdAt: Date;
}

export interface SimulateRequest {
  scenario: 'projector_failure' | 'network_rack_alert' | 'smoke_detector_alert';
}
