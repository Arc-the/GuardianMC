# AngelMC MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a voice-first Mission Control MVP for the Cursor hackathon voice AI track.

**Architecture:** A Vite React client runs the operations dashboard and voice UI. A small Express TypeScript backend owns context loading, incident simulation, safety-first agent responses, report generation, and provider boundaries for Wispr Flow STT and ElevenLabs TTS.

**Tech Stack:** React, TypeScript, Vite, Tailwind CSS, Express, Vitest, Node 20+.

---

### Task 1: Project Scaffold

**Files:**
- Create: `package.json`
- Create: `client/package.json`
- Create: `client/index.html`
- Create: `client/tsconfig.json`
- Create: `client/vite.config.ts`
- Create: `client/tailwind.config.ts`
- Create: `client/postcss.config.cjs`
- Create: `server/package.json`
- Create: `server/tsconfig.json`

- [ ] Add npm workspaces and dev/build/test scripts.
- [ ] Add Vite React + Tailwind client setup.
- [ ] Add Express TypeScript server setup.

### Task 2: Backend Agent Core

**Files:**
- Create: `server/src/types.ts`
- Create: `server/src/contextLoader.ts`
- Create: `server/src/services/safetyGuardrails.ts`
- Create: `server/src/services/incidentSimulator.ts`
- Create: `server/src/services/missionAgent.ts`
- Create: `server/src/services/reportGenerator.ts`
- Create: `server/src/services/missionAgent.test.ts`
- Create: `server/context/event-brief.md`
- Create: `server/context/venue-assets.md`
- Create: `server/context/floor-map.md`
- Create: `server/context/safety-playbooks.md`
- Create: `server/context/incident-playbooks.md`

- [ ] Write tests proving Projector B and Gate 3 smoke responses include correct assets, map highlights, and safety escalation.
- [ ] Implement deterministic mission-control responses from context-backed venue facts.
- [ ] Implement report text generation.

### Task 3: Backend HTTP API

**Files:**
- Create: `server/src/index.ts`
- Create: `server/src/routes/session.ts`
- Create: `server/src/routes/incidents.ts`
- Create: `server/src/routes/agent.ts`
- Create: `server/src/routes/stt.ts`
- Create: `server/src/routes/tts.ts`
- Create: `server/src/routes/reports.ts`
- Create: `server/src/services/wisprFlow.ts`
- Create: `server/src/services/elevenLabs.ts`

- [ ] Expose `/api/health`, `/api/session/start`, `/api/incidents`, `/api/incidents/simulate`, `/api/stt`, `/api/agent/ask`, `/api/tts`, and `/api/reports`.
- [ ] Keep API keys server-only through `.env`.
- [ ] Return graceful provider-unavailable responses when Wispr Flow or ElevenLabs credentials are missing.

### Task 4: Client Dashboard

**Files:**
- Create: `client/src/main.tsx`
- Create: `client/src/App.tsx`
- Create: `client/src/index.css`
- Create: `client/src/lib/types.ts`
- Create: `client/src/lib/api.ts`
- Create: `client/src/components/TopBar.tsx`
- Create: `client/src/components/BlueprintMap.tsx`
- Create: `client/src/components/IncidentFeed.tsx`
- Create: `client/src/components/VoiceAssistant.tsx`
- Create: `client/src/components/IncidentReport.tsx`
- Create: `client/src/hooks/useVoiceInput.ts`
- Create: `client/src/hooks/useAudioPlayback.ts`

- [ ] Build the dark three-column operations layout.
- [ ] Implement map locations, highlights, incident feed simulation, voice assistant response card, and report section.
- [ ] Hide typed fallback behind Debug Mode and keep the primary controls voice-first.

### Task 5: Verification

**Files:**
- Modify: generated lockfile after install.

- [ ] Run `npm install`.
- [ ] Run `npm test`.
- [ ] Run `npm run build`.
- [ ] Start local dev servers and verify the app loads.
