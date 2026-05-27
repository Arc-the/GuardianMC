import { Router } from 'express';
import { loadAllContext } from '../contextLoader';
import { SessionContext } from '../types';

const router = Router();

// In-memory session store (for hackathon simplicity)
export const sessions = new Map<string, SessionContext>();

router.post('/start', (req, res) => {
  const sessionId = `session-${Date.now()}`;
  const { files, content } = loadAllContext();

  const session: SessionContext = {
    sessionId,
    loadedContextFiles: files,
    contextContent: content,
    createdAt: new Date()
  };

  sessions.set(sessionId, session);

  res.json({
    sessionId,
    loadedContextFiles: files
  });
});

export { router as sessionRouter };
