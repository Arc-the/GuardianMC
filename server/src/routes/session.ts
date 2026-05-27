import { Router } from "express";
import { loadSessionContext } from "../contextLoader.js";
import type { SessionContext } from "../types.js";

export const sessionRouter = Router();

sessionRouter.post("/start", async (req, res, next) => {
  try {
    const context = await loadSessionContext();
    const sessions = req.app.locals.sessions as Map<string, SessionContext>;
    sessions.set(context.sessionId, context);
    res.json({
      sessionId: context.sessionId,
      loadedContextFiles: context.loadedContextFiles
    });
  } catch (error) {
    next(error);
  }
});
