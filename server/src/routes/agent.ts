import { Router } from "express";
import { loadSessionContext } from "../contextLoader.js";
import { runMissionAgent } from "../services/missionAgent.js";
import type { AgentAskRequest, SessionContext } from "../types.js";

export const agentRouter = Router();

agentRouter.post("/ask", async (req, res, next) => {
  const body = req.body as AgentAskRequest;
  if (!body?.sessionId || !body?.transcript) {
    res.status(400).json({ error: "sessionId and transcript are required" });
    return;
  }

  try {
    const sessions = req.app.locals.sessions as Map<string, SessionContext>;
    let context = sessions.get(body.sessionId);
    if (!context) {
      context = await loadSessionContext();
      sessions.set(body.sessionId, context);
    }

    res.json(runMissionAgent({ context, transcript: body.transcript, incidentLogs: body.incidentLogs || [] }));
  } catch (error) {
    next(error);
  }
});
