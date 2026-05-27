import { useCallback } from "react";
import { api } from "../lib/api";

export function useAudioPlayback() {
  return useCallback(async (text: string) => {
    const audioUrl = await api.speak(text).catch(() => null);
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      await audio.play();
      return;
    }

    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 0.92;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    }
  }, []);
}
