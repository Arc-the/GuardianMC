import type { ReportRequest } from "../types.js";

export function generateIncidentReport(request: ReportRequest): string {
  const lastFive = request.incidentLogs.slice(-5);
  const safetyLine = request.assistantResponse.safetyWarning
    ? `\nSafety Warning: ${request.assistantResponse.safetyWarning}`
    : "";

  return [
    "AngelMC Incident Report",
    `Event Mode: ${request.eventMode}`,
    `Operator Transcript: ${request.transcript || "No transcript captured"}`,
    `Assistant Diagnosis: ${request.assistantResponse.situation}`,
    `Relevant Assets: ${request.assistantResponse.relevantAssets.join(", ") || "None identified"}`,
    `Blueprint Path: ${request.assistantResponse.blueprintPath}`,
    "Last 5 Incident Logs:",
    ...lastFive.map((log) => `- [${log.time}] ${log.message}`),
    `Recommended Next Action: ${request.assistantResponse.suggestedSpokenInstruction}`,
    `Escalation Rule: ${request.assistantResponse.escalationRule}${safetyLine}`
  ].join("\n");
}
