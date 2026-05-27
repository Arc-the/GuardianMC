import express, { Router } from "express";
import { transcribeWithWisprFlow } from "../services/wisprFlow.js";

export const sttRouter = Router();

sttRouter.post("/", express.raw({ type: "*/*", limit: "20mb" }), async (req, res, next) => {
  try {
    const audio = Buffer.isBuffer(req.body) ? req.body : Buffer.alloc(0);
    if (!audio.length) {
      res.status(400).json({ ok: false, reason: "No audio payload received." });
      return;
    }

    const result = await transcribeWithWisprFlow(audio);
    res.status(result.ok ? 200 : 503).json(result);
  } catch (error) {
    next(error);
  }
});
