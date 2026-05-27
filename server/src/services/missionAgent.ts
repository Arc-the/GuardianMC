import type { AgentResponse, IncidentLog, SessionContext } from "../types.js";
import { enforceSafetyGuardrails } from "./safetyGuardrails.js";

type MissionAgentInput = {
  context: SessionContext;
  transcript: string;
  incidentLogs: IncidentLog[];
};

const baseEscalation =
  "If there is visible damage, smoke, burning smell, or a repeated breaker trip, stop troubleshooting and escalate to authorized safety/fire personnel.";

export function runMissionAgent(input: MissionAgentInput): AgentResponse {
  const normalized = input.transcript.toLowerCase();

  if (normalized.includes("smoke") || normalized.includes("gate 3") || normalized.includes("alarm")) {
    return enforceSafetyGuardrails({
      situation: "Smoke Detector SD-G3 is reporting near the Gate 3 Corridor during the live event.",
      relevantLocation: "Gate 3 Corridor",
      blueprintPath: "Gate 3 Corridor -> Security Desk -> First Aid evacuation support",
      nextSafeChecks: [
        "Move nearby guests and staff away from the Gate 3 Corridor.",
        "Verify visible conditions from a safe distance without silencing the alarm.",
        "Notify authorized safety/fire personnel and venue security immediately."
      ],
      escalationRule:
        "Smoke and fire alarms require immediate escalation to authorized safety/fire personnel. Do not silence or bypass alarms.",
      suggestedSpokenInstruction:
        "Stop troubleshooting. Move people away from Gate 3 Corridor and call authorized safety or fire personnel now.",
      highlightedLocations: ["Gate 3 Corridor", "Security Desk", "First Aid"],
      relevantAssets: ["Smoke Detector SD-G3", "Security Desk", "First Aid"],
      safetyWarning: "Do not silence or bypass the alarm. Do not re-enter the area until authorized safety staff clears it."
    });
  }

  if (normalized.includes("network") || normalized.includes("nr-1") || normalized.includes("rack")) {
    return {
      situation: "Network Rack NR-1 supports the AV system, ticket scanners, and staff Wi-Fi.",
      relevantLocation: "Network Room",
      blueprintPath: "AV Booth -> Network Room -> Network Rack NR-1",
      nextSafeChecks: [
        "Confirm whether AV Controller AC-2 is still reachable from the AV Booth.",
        "Check NR-1 status lights from the Network Room without unplugging live equipment.",
        "Escalate to network support if multiple services drop at the same time."
      ],
      escalationRule: baseEscalation,
      suggestedSpokenInstruction: "Go to the Network Room and inspect NR-1 status lights without unplugging live gear.",
      highlightedLocations: ["Network Room", "AV Booth"],
      relevantAssets: ["Network Rack NR-1", "AV Controller AC-2"]
    };
  }

  if (normalized.includes("av") || normalized.includes("projector") || normalized.includes("breaker") || normalized.includes("zone b")) {
    return {
      situation: "Projector B appears to have lost signal during halftime in Zone B.",
      relevantLocation: "Zone B ceiling mount, AV Booth, and Electrical Room",
      blueprintPath: "Projector B -> AV Controller AC-2 -> Electrical Panel EP-2 -> breaker 14",
      nextSafeChecks: [
        "Check whether AV Controller AC-2 is powered on in the AV Booth.",
        "Confirm the HDMI/source input is active and the controller reports normally.",
        "If authorized, inspect Electrical Panel EP-2 breaker 14 without bypassing safety procedures."
      ],
      escalationRule: baseEscalation,
      suggestedSpokenInstruction:
        "Go to the AV Booth first and check AC-2. If the controller is normal, inspect Electrical Panel EP-2 breaker 14 if authorized.",
      highlightedLocations: ["Zone B", "AV Booth", "Electrical Room"],
      relevantAssets: ["Projector B", "AV Controller AC-2", "Electrical Panel EP-2", "Breaker 14"]
    };
  }

  const latest = input.incidentLogs.at(-1);
  return {
    situation: latest ? `Latest incident context: ${latest.message}.` : "No active incident is selected yet.",
    relevantLocation: latest?.locations.join(", ") || "Main Hall",
    blueprintPath: "Main Hall -> Security Desk -> relevant venue zone",
    nextSafeChecks: [
      "Confirm the affected location and asset name.",
      "Check the latest incident feed for correlated alerts.",
      "Escalate if the issue involves smoke, fire, alarms, visible damage, or electrical hazards."
    ],
    escalationRule: baseEscalation,
    suggestedSpokenInstruction: "Tell me the affected asset or location, and I will route you to the safest next check.",
    highlightedLocations: latest?.locations.length ? latest.locations : ["Main Hall", "Security Desk"],
    relevantAssets: []
  };
}
