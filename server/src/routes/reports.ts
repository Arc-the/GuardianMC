import { Router } from "express";
import { generateIncidentReport } from "../services/reportGenerator.js";
import type { ReportRequest } from "../types.js";

export const reportsRouter = Router();

reportsRouter.post("/", (req, res) => {
  const body = req.body as ReportRequest;
  if (!body?.assistantResponse) {
    res.status(400).json({ error: "assistantResponse is required" });
    return;
  }

  res.json({ report: generateIncidentReport(body) });
});
