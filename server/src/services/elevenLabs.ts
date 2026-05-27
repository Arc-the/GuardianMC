type ElevenLabsResult =
  | { ok: true; audio: ArrayBuffer; contentType: string }
  | { ok: false; reason: string };

export function isElevenLabsConfigured(): boolean {
  return Boolean(process.env.ELEVENLABS_API_KEY && process.env.ELEVENLABS_VOICE_ID);
}

export async function synthesizeWithElevenLabs(text: string): Promise<ElevenLabsResult> {
  if (!isElevenLabsConfigured()) {
    return { ok: false, reason: "ElevenLabs credentials are not configured. Use browser speech synthesis fallback." };
  }

  const modelId = process.env.ELEVENLABS_MODEL_ID || "eleven_multilingual_v2";
  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${process.env.ELEVENLABS_VOICE_ID}`, {
    method: "POST",
    headers: {
      "xi-api-key": process.env.ELEVENLABS_API_KEY!,
      "Content-Type": "application/json",
      Accept: "audio/mpeg"
    },
    body: JSON.stringify({
      text,
      model_id: modelId,
      voice_settings: {
        stability: 0.48,
        similarity_boost: 0.78
      }
    })
  });

  if (!response.ok) {
    return { ok: false, reason: `ElevenLabs request failed with ${response.status}` };
  }

  return {
    ok: true,
    audio: await response.arrayBuffer(),
    contentType: response.headers.get("content-type") || "audio/mpeg"
  };
}
