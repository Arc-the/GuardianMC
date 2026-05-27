import { Router } from 'express';
import { askAgent } from '../services/missionAgent';
import { AgentAskRequest } from '../types';

const router = Router();

router.post('/ask', async (req, res) => {
  try {
    const request: AgentAskRequest = req.body;

    if (!request.transcript) {
      return res.status(400).json({ error: 'Transcript is required' });
    }

    const response = await askAgent(request);
    res.json(response);
  } catch (error) {
    console.error('Agent route error:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
});

export { router as agentRouter };
