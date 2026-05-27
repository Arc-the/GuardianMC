import type { AgentResponse } from "../types.js";

const hazardPattern = /\b(smoke|fire|alarm|burning|burnt|sparking|electrical hazard|visible damage|breaker trip)\b/i;

export function isHazardTranscript(transcript: string): boolean {
  return hazardPattern.test(transcript);
}

export function enforceSafetyGuardrails(response: AgentResponse): AgentResponse {
  if (!isHazardTranscript(`${response.situation} ${response.safetyWarning ?? ""}`)) {
    return response;
  }

  return {
    ...response,
    escalationRule:
      "For fire, smoke, alarm, burning smell, visible damage, electrical hazard, or repeated breaker trip: stop troubleshooting and escalate to authorized safety/fire personnel.",
    safetyWarning:
      response.safetyWarning ??
      "Do not silence, bypass, ignore, or disable safety equipment. Move people away from the hazard area and escalate.",
    suggestedSpokenInstruction: response.suggestedSpokenInstruction.includes("Stop troubleshooting")
      ? response.suggestedSpokenInstruction
      : `Stop troubleshooting. ${response.suggestedSpokenInstruction}`
  };
}
