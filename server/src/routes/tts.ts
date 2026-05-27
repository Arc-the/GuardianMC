import { Router } from 'express';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Check if ElevenLabs is configured
    if (!process.env.ELEVENLABS_API_KEY) {
      return res.json({
        audio: null,
        fallbackRequired: true,
        message: 'ElevenLabs not configured. Use browser speech synthesis.'
      });
    }

    const voiceId = process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM'; // Default Rachel voice
    const modelId = process.env.ELEVENLABS_MODEL_ID || 'eleven_multilingual_v2';

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': process.env.ELEVENLABS_API_KEY
        },
        body: JSON.stringify({
          text,
          model_id: modelId,
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75
          }
        })
      }
    );

    if (!response.ok) {
      console.error('ElevenLabs error:', await response.text());
      return res.json({
        audio: null,
        fallbackRequired: true,
        message: 'ElevenLabs TTS failed. Use browser fallback.'
      });
    }

    const audioBuffer = await response.arrayBuffer();
    const base64Audio = Buffer.from(audioBuffer).toString('base64');

    res.json({
      audio: base64Audio,
      contentType: 'audio/mpeg',
      fallbackRequired: false
    });
  } catch (error) {
    console.error('TTS error:', error);
    res.json({
      audio: null,
      fallbackRequired: true,
      message: 'TTS service error. Use browser fallback.'
    });
  }
});

export { router as ttsRouter };
