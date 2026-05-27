type WisprResult =
  | { ok: true; transcript: string; provider: "wispr-flow" }
  | { ok: false; reason: string; provider: "wispr-flow" };

export function isWisprFlowConfigured(): boolean {
  return Boolean(process.env.WISPRFLOW_API_KEY && process.env.WISPRFLOW_BASE_URL);
}

export async function transcribeWithWisprFlow(audio: Buffer): Promise<WisprResult> {
  if (!isWisprFlowConfigured()) {
    return {
      ok: false,
      provider: "wispr-flow",
      reason: "Wispr Flow API credentials are not configured. Use Wispr Flow desktop dictation or browser speech recognition."
    };
  }

  const response = await fetch(process.env.WISPRFLOW_BASE_URL!, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.WISPRFLOW_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      audio: audio.toString("base64"),
      language: ["en"],
      context: {
        app: { type: "operations_dashboard" },
        dictionary_context: ["AngelMC", "Projector B", "AV Controller AC-2", "Electrical Panel EP-2", "Gate 3 Corridor"],
        textbox_contents: {
          before_text: "",
          selected_text: "",
          after_text: ""
        }
      }
    })
  });

  if (!response.ok) {
    return { ok: false, provider: "wispr-flow", reason: `Wispr Flow request failed with ${response.status}` };
  }

  const payload = (await response.json()) as { text?: string; transcript?: string };
  const transcript = payload.text ?? payload.transcript ?? "";
  return transcript.trim()
    ? { ok: true, provider: "wispr-flow", transcript: transcript.trim() }
    : { ok: false, provider: "wispr-flow", reason: "Wispr Flow returned an empty transcript." };
}
