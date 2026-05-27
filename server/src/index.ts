import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { sessionRouter } from './routes/session';
import { agentRouter } from './routes/agent';
import { sttRouter } from './routes/stt';
import { ttsRouter } from './routes/tts';
import { incidentsRouter } from './routes/incidents';
import { reportsRouter } from './routes/reports';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8787;

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    providers: {
      wisprFlowConfigured: !!process.env.WISPRFLOW_API_KEY,
      elevenLabsConfigured: !!process.env.ELEVENLABS_API_KEY,
      modelConfigured: !!process.env.MODEL_API_KEY
    }
  });
});

// Routes
app.use('/api/session', sessionRouter);
app.use('/api/agent', agentRouter);
app.use('/api/stt', sttRouter);
app.use('/api/tts', ttsRouter);
app.use('/api/incidents', incidentsRouter);
app.use('/api/reports', reportsRouter);

app.listen(PORT, () => {
  console.log(`AngelMC server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
