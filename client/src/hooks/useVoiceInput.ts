import { useCallback, useMemo, useRef, useState } from "react";
import { api } from "../lib/api";

type SpeechRecognitionConstructor = new () => SpeechRecognition;

type SpeechRecognition = EventTarget & {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
};

type SpeechRecognitionEvent = {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
};

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

export function useVoiceInput(onTranscript: (value: string) => void) {
  const [isListening, setIsListening] = useState(false);
  const [status, setStatus] = useState("Ready for voice input.");
  const [error, setError] = useState("");
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Float32Array[]>([]);
  const inputSampleRateRef = useRef(44100);

  const browserSpeechSupported = useMemo(() => Boolean(window.SpeechRecognition || window.webkitSpeechRecognition), []);
  const microphoneSupported = useMemo(() => Boolean(navigator.mediaDevices?.getUserMedia), []);
  const isSupported = microphoneSupported || browserSpeechSupported;

  const cleanupAudio = useCallback(() => {
    processorRef.current?.disconnect();
    processorRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    void audioContextRef.current?.close();
    audioContextRef.current = null;
  }, []);

  const startBrowserSpeech = useCallback(() => {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) {
      return false;
    }

    const recognition = new Recognition();
    setError("");
    setStatus("Listening with browser speech recognition.");
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0]?.transcript || "")
        .join(" ")
        .trim();
      if (transcript) {
        onTranscript(transcript);
      }
    };
    recognition.onend = () => {
      setIsListening(false);
      setStatus("Browser speech recognition stopped.");
    };
    recognition.onerror = () => {
      setIsListening(false);
      setError("Browser speech recognition could not capture audio.");
      setStatus("Focus the transcript field and use Wispr Flow desktop dictation.");
    };
    recognitionRef.current = recognition;
    setIsListening(true);
    recognition.start();
    return true;
  }, [onTranscript]);

  const stopBrowserSpeech = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const start = useCallback(async () => {
    setError("");

    if (!microphoneSupported) {
      return startBrowserSpeech();
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
      const audioContext = new AudioContextConstructor();
      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);

      chunksRef.current = [];
      inputSampleRateRef.current = audioContext.sampleRate;
      processor.onaudioprocess = (event) => {
        chunksRef.current.push(new Float32Array(event.inputBuffer.getChannelData(0)));
      };

      source.connect(processor);
      processor.connect(audioContext.destination);
      audioContextRef.current = audioContext;
      processorRef.current = processor;
      streamRef.current = stream;
      setIsListening(true);
      setStatus("Recording operator audio for Wispr Flow.");
      return true;
    } catch {
      cleanupAudio();
      setStatus("Microphone capture failed. Trying browser speech recognition.");
      return startBrowserSpeech();
    }
  }, [cleanupAudio, microphoneSupported, startBrowserSpeech]);

  const stop = useCallback(async () => {
    if (processorRef.current) {
      const chunks = chunksRef.current;
      const sampleRate = inputSampleRateRef.current;
      cleanupAudio();
      setIsListening(false);
      setStatus("Transcribing with Wispr Flow.");

      try {
        const wav = encodeWav(chunks, sampleRate, 16000);
        const transcript = await api.transcribe(wav);
        onTranscript(transcript);
        setStatus("Wispr Flow transcript received.");
      } catch (sttError) {
        const message = sttError instanceof Error ? sttError.message : "Wispr Flow transcription failed.";
        setError(message);
        setStatus("Focus the transcript field and use Wispr Flow desktop dictation.");
      }
      return;
    }

    stopBrowserSpeech();
  }, [cleanupAudio, onTranscript, stopBrowserSpeech]);

  return { isListening, isSupported, status, error, start, stop };
}

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}

function encodeWav(chunks: Float32Array[], inputSampleRate: number, outputSampleRate: number): Blob {
  const samples = mergeChunks(chunks);
  const downsampled = downsample(samples, inputSampleRate, outputSampleRate);
  const buffer = new ArrayBuffer(44 + downsampled.length * 2);
  const view = new DataView(buffer);

  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + downsampled.length * 2, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, outputSampleRate, true);
  view.setUint32(28, outputSampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, "data");
  view.setUint32(40, downsampled.length * 2, true);

  let offset = 44;
  for (const sample of downsampled) {
    const clamped = Math.max(-1, Math.min(1, sample));
    view.setInt16(offset, clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff, true);
    offset += 2;
  }

  return new Blob([view], { type: "audio/wav" });
}

function mergeChunks(chunks: Float32Array[]) {
  const length = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const result = new Float32Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  return result;
}

function downsample(samples: Float32Array, inputSampleRate: number, outputSampleRate: number) {
  if (inputSampleRate === outputSampleRate) {
    return samples;
  }

  const ratio = inputSampleRate / outputSampleRate;
  const resultLength = Math.round(samples.length / ratio);
  const result = new Float32Array(resultLength);

  for (let index = 0; index < resultLength; index += 1) {
    const start = Math.floor(index * ratio);
    const end = Math.min(Math.floor((index + 1) * ratio), samples.length);
    let sum = 0;
    for (let sampleIndex = start; sampleIndex < end; sampleIndex += 1) {
      sum += samples[sampleIndex];
    }
    result[index] = sum / Math.max(1, end - start);
  }

  return result;
}

function writeString(view: DataView, offset: number, value: string) {
  for (let index = 0; index < value.length; index += 1) {
    view.setUint8(offset + index, value.charCodeAt(index));
  }
}
