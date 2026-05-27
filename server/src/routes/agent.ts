import { Router } from "express";
import { runMissionAgent } from "../services/missionAgent.js";
import type { AgentAskRequest, SessionContext } from "../types.js";

export const agentRouter = Router();

agentRouter.post("/ask", (req, res) => {
  const body = req.body as AgentAskRequest;
  if (!body?.sessionId || !body?.transcript) {
    res.status(400).json({ error: "sessionId and transcript are required" });
    return;
  }

  const sessions = req.app.locals.sessions as Map<string, SessionContext>;
  const context = sessions.get(body.sessionId);
  if (!context) {
    res.status(404).json({ error: "Session not found. Start a session first." });
    return;
  }

  res.json(runMissionAgent({ context, transcript: body.transcript, incidentLogs: body.incidentLogs || [] }));
});
