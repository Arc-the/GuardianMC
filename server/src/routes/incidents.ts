import { Router } from "express";
import { initialIncidentLogs, simulateIncident } from "../services/incidentSimulator.js";
import type { IncidentLog, SimulatedScenario } from "../types.js";

export const incidentsRouter = Router();

let logs: IncidentLog[] = [...initialIncidentLogs];

incidentsRouter.get("/", (_req, res) => {
  res.json({ logs });
});

incidentsRouter.post("/simulate", (req, res) => {
  const scenario = req.body?.scenario as SimulatedScenario;
  if (!["projector_failure", "network_rack_alert", "smoke_detector_alert"].includes(scenario)) {
    res.status(400).json({ error: "Unsupported scenario" });
    return;
  }

  const result = simulateIncident(scenario, logs);
  logs = result.logs;
  res.json(result);
});
