import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { transcribeWithWisprFlow } from "./wisprFlow.js";

const originalEnv = process.env;

describe("transcribeWithWisprFlow", () => {
  beforeEach(() => {
    process.env = {
      ...originalEnv,
      WISPRFLOW_API_KEY: "wf_test_key",
      WISPRFLOW_BASE_URL: "https://api.wisprflow.ai/api"
    };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it("sends base64 wav audio as JSON with bearer auth", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ text: "Where is the breaker for Projector B?" })
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await transcribeWithWisprFlow(Buffer.from("wav-bytes"));

    expect(result).toEqual({
      ok: true,
      provider: "wispr-flow",
      transcript: "Where is the breaker for Projector B?"
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.wisprflow.ai/api",
      expect.objectContaining({
        method: "POST",
        headers: {
          Authorization: "Bearer wf_test_key",
          "Content-Type": "application/json"
        },
        body: expect.any(String)
      })
    );

    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string) as { audio: string; language: string[] };
    expect(body.audio).toBe(Buffer.from("wav-bytes").toString("base64"));
    expect(body.language).toEqual(["en"]);
  });

  it("returns a provider-unavailable reason when credentials are absent", async () => {
    process.env.WISPRFLOW_API_KEY = "";
    process.env.WISPRFLOW_BASE_URL = "";

    const result = await transcribeWithWisprFlow(Buffer.from("wav-bytes"));

    expect(result.ok).toBe(false);
    expect(result.provider).toBe("wispr-flow");
    if (!result.ok) {
      expect(result.reason).toContain("credentials are not configured");
    }
  });
});
