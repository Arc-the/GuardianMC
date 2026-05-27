export type IncidentSeverity = "info" | "warning" | "critical";

export type IncidentLog = {
  id: string;
  time: string;
  message: string;
  severity: IncidentSeverity;
  locations: string[];
};

export type SessionContext = {
  sessionId: string;
  loadedContextFiles: string[];
  combinedContext: string;
  startedAt: string;
};

export type AgentAskRequest = {
  sessionId: string;
  transcript: string;
  incidentLogs: IncidentLog[];
};

export type AgentResponse = {
  situation: string;
  relevantLocation: string;
  blueprintPath: string;
  nextSafeChecks: string[];
  escalationRule: string;
  suggestedSpokenInstruction: string;
  highlightedLocations: string[];
  relevantAssets: string[];
  safetyWarning?: string;
};

export type SimulatedScenario = "projector_failure" | "network_rack_alert" | "smoke_detector_alert";

export type ReportRequest = {
  eventMode: string;
  transcript: string;
  assistantResponse: AgentResponse;
  incidentLogs: IncidentLog[];
};
