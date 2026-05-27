import { Router } from 'express';
import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

interface WisprFlowResponse {
  text?: string;
  transcript?: string;
}

router.post('/', upload.single('audio'), async (req, res) => {
  try {
    // Check if Wispr Flow is configured
    if (!process.env.WISPRFLOW_API_KEY) {
      return res.json({
        transcript: null,
        fallbackRequired: true,
        message: 'Wispr Flow not configured. Use browser speech recognition.'
      });
    }

    const audioFile = req.file;
    if (!audioFile) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    // Call Wispr Flow API using native fetch with Blob
    const blob = new Blob([new Uint8Array(audioFile.buffer)], { type: 'audio/webm' });
    const formData = new FormData();
    formData.append('file', blob, 'audio.webm');

    const response = await fetch('https://api.wisprflow.com/v1/transcribe', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.WISPRFLOW_API_KEY}`
      },
      body: formData
    });

    if (!response.ok) {
      console.error('Wispr Flow error:', await response.text());
      return res.json({
        transcript: null,
        fallbackRequired: true,
        message: 'Wispr Flow transcription failed. Use browser fallback.'
      });
    }

    const data = await response.json() as WisprFlowResponse;
    res.json({
      transcript: data.text || data.transcript,
      fallbackRequired: false
    });
  } catch (error) {
    console.error('STT error:', error);
    res.json({
      transcript: null,
      fallbackRequired: true,
      message: 'STT service error. Use browser fallback.'
    });
  }
});

export { router as sttRouter };
