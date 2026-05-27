import { Router } from "express";
import { synthesizeWithElevenLabs } from "../services/elevenLabs.js";

export const ttsRouter = Router();

ttsRouter.post("/", async (req, res, next) => {
  try {
    const text = String(req.body?.text || "").trim();
    if (!text) {
      res.status(400).json({ ok: false, reason: "text is required" });
      return;
    }

    const result = await synthesizeWithElevenLabs(text);
    if (!result.ok) {
      res.status(503).json(result);
      return;
    }

    res.setHeader("content-type", result.contentType);
    res.send(Buffer.from(result.audio));
  } catch (error) {
    next(error);
  }
});
