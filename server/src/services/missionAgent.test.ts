import { describe, expect, it } from "vitest";
import { runMissionAgent } from "./missionAgent.js";
import type { IncidentLog, SessionContext } from "../types.js";

const context: SessionContext = {
  sessionId: "test-session",
  loadedContextFiles: ["event-brief.md", "venue-assets.md", "floor-map.md", "safety-playbooks.md"],
  combinedContext: "Projector B uses AV Controller AC-2 and Electrical Panel EP-2 breaker 14. Smoke Detector SD-G3 is in Gate 3 Corridor.",
  startedAt: "2026-05-27T12:30:00.000Z"
};

const logs: IncidentLog[] = [
  { id: "1", time: "19:44", message: "Projector B signal lost", severity: "warning", locations: ["Zone B", "AV Booth"] },
  { id: "2", time: "19:47", message: "Electrical Panel EP-2 voltage normal", severity: "info", locations: ["Electrical Room"] }
];

describe("runMissionAgent", () => {
  it("answers the Projector B breaker question with the correct safe asset path", () => {
    const response = runMissionAgent({
      context,
      transcript: "Where is the breaker for Projector B?",
      incidentLogs: logs
    });

    expect(response.relevantLocation).toContain("Zone B");
    expect(response.blueprintPath).toContain("EP-2");
    expect(response.blueprintPath).toContain("breaker 14");
    expect(response.highlightedLocations).toEqual(expect.arrayContaining(["Zone B", "AV Booth", "Electrical Room"]));
    expect(response.suggestedSpokenInstruction).toContain("if authorized");
  });

  it("handles Gate 3 smoke alarms with escalation instead of troubleshooting", () => {
    const response = runMissionAgent({
      context,
      transcript: "Smoke alarm near Gate 3, what should I do?",
      incidentLogs: logs
    });

    expect(response.relevantLocation).toBe("Gate 3 Corridor");
    expect(response.highlightedLocations).toEqual(expect.arrayContaining(["Gate 3 Corridor", "Security Desk"]));
    expect(response.safetyWarning).toContain("Do not silence");
    expect(response.escalationRule).toContain("authorized safety/fire personnel");
    expect(response.suggestedSpokenInstruction).toContain("Stop troubleshooting");
  });
});
