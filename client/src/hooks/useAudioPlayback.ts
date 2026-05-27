import { useState, useCallback, useRef } from 'react';
import { textToSpeech } from '../lib/api';

interface UseAudioPlaybackReturn {
  isPlaying: boolean;
  playAudio: (text: string) => Promise<void>;
  stopAudio: () => void;
  useBrowserFallback: boolean;
}

export function useAudioPlayback(): UseAudioPlaybackReturn {
  const [isPlaying, setIsPlaying] = useState(false);
  const [useBrowserFallback, setUseBrowserFallback] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playBrowserTTS = useCallback((text: string) => {
    return new Promise<void>((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      utterance.onend = () => {
        setIsPlaying(false);
        resolve();
      };

      utterance.onerror = () => {
        setIsPlaying(false);
        resolve();
      };

      setIsPlaying(true);
      speechSynthesis.speak(utterance);
    });
  }, []);

  const playAudio = useCallback(async (text: string) => {
    if (!text) return;

    if (useBrowserFallback) {
      await playBrowserTTS(text);
      return;
    }

    try {
      const result = await textToSpeech(text);

      if (result.fallbackRequired || !result.audio) {
        setUseBrowserFallback(true);
        await playBrowserTTS(text);
        return;
      }

      // Play base64 audio
      const audioData = `data:${result.contentType || 'audio/mpeg'};base64,${result.audio}`;
      const audio = new Audio(audioData);
      audioRef.current = audio;

      audio.onended = () => {
        setIsPlaying(false);
      };

      audio.onerror = () => {
        setIsPlaying(false);
        setUseBrowserFallback(true);
        playBrowserTTS(text);
      };

      setIsPlaying(true);
      await audio.play();
    } catch (err) {
      console.error('TTS error:', err);
      setUseBrowserFallback(true);
      await playBrowserTTS(text);
    }
  }, [useBrowserFallback, playBrowserTTS]);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    speechSynthesis.cancel();
    setIsPlaying(false);
  }, []);

  return {
    isPlaying,
    playAudio,
    stopAudio,
    useBrowserFallback
  };
}
