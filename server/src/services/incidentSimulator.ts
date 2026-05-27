import { nanoid } from "nanoid";
import type { IncidentLog, SimulatedScenario } from "../types.js";

export const initialIncidentLogs: IncidentLog[] = [
  { id: "seed-1", time: "19:42", message: "Crowd level high near Zone B", severity: "warning", locations: ["Zone B"] },
  { id: "seed-2", time: "19:44", message: "Projector B signal lost", severity: "warning", locations: ["Zone B", "AV Booth"] },
  { id: "seed-3", time: "19:45", message: "AV Controller reports HDMI timeout", severity: "warning", locations: ["AV Booth"] },
  { id: "seed-4", time: "19:46", message: "Network Rack NR-1 status normal", severity: "info", locations: ["Network Room"] },
  { id: "seed-5", time: "19:47", message: "Electrical Panel EP-2 voltage normal", severity: "info", locations: ["Electrical Room"] }
];

export function simulateIncident(scenario: SimulatedScenario, currentLogs: IncidentLog[]) {
  const nextLog = createScenarioLog(scenario);
  const highlightedLocations = nextLog.locations;
  const safetyWarning =
    scenario === "smoke_detector_alert"
      ? "Smoke detector alerts require immediate escalation to authorized safety/fire personnel."
      : undefined;

  return {
    logs: [...currentLogs, nextLog],
    highlightedLocations,
    safetyWarning
  };
}

function createScenarioLog(scenario: SimulatedScenario): IncidentLog {
  const time = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
  if (scenario === "network_rack_alert") {
    return {
      id: nanoid(8),
      time,
      message: "Packet loss spike detected at Network Rack NR-1",
      severity: "warning",
      locations: ["Network Room", "AV Booth"]
    };
  }

  if (scenario === "smoke_detector_alert") {
    return {
      id: nanoid(8),
      time,
      message: "Smoke Detector SD-G3 alarm active near Gate 3 Corridor",
      severity: "critical",
      locations: ["Gate 3 Corridor", "Security Desk", "First Aid"]
    };
  }

  return {
    id: nanoid(8),
    time,
    message: "Projector B failure repeated after HDMI timeout",
    severity: "warning",
    locations: ["Zone B", "AV Booth", "Electrical Room"]
  };
}
