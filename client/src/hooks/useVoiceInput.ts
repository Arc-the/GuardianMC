import { useState, useRef, useCallback, useEffect } from 'react';

interface UseVoiceInputOptions {
  triggerWord?: string;
  onTriggerWord?: (transcript: string) => void;
}

interface UseVoiceInputReturn {
  isRecording: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
  startRecording: () => void;
  stopRecording: () => string;
}

export function useVoiceInput(options: UseVoiceInputOptions = {}): UseVoiceInputReturn {
  const { triggerWord = 'over', onTriggerWord } = options;
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const finalTranscriptRef = useRef('');
  const triggerWordRef = useRef(triggerWord);
  const onTriggerWordRef = useRef(onTriggerWord);

  // Keep refs updated
  useEffect(() => {
    triggerWordRef.current = triggerWord;
    onTriggerWordRef.current = onTriggerWord;
  }, [triggerWord, onTriggerWord]);

  const startRecording = useCallback(() => {
    setError(null);
    setTranscript('');
    setInterimTranscript('');
    finalTranscriptRef.current = '';

    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionClass) {
      setError('Speech recognition not supported in this browser');
      return;
    }

    const recognition = new SpeechRecognitionClass();
    recognition.continuous = true;  // Keep listening
    recognition.interimResults = true;  // Real-time transcription
    recognition.lang = 'en-US';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      let final = '';

      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript + ' ';
        } else {
          interim += result[0].transcript;
        }
      }

      if (final) {
        finalTranscriptRef.current = final.trim();
        setTranscript(final.trim());
      }
      setInterimTranscript(interim);

      // Check for trigger word in final or interim transcript
      const currentTrigger = triggerWordRef.current;
      const currentCallback = onTriggerWordRef.current;
      const fullText = (final + ' ' + interim).toLowerCase().trim();
      if (currentTrigger && currentCallback && fullText.endsWith(currentTrigger.toLowerCase())) {
        // Stop recognition and trigger callback
        recognition.stop();
        recognitionRef.current = null;
        setIsRecording(false);

        // Remove trigger word from transcript and call callback
        const cleanTranscript = (finalTranscriptRef.current + ' ' + interim)
          .trim()
          .replace(new RegExp(`\\s*${currentTrigger}\\s*$`, 'i'), '')
          .trim();

        setTranscript(cleanTranscript);
        setInterimTranscript('');
        currentCallback(cleanTranscript);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        setError(`Speech recognition error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      // Auto-restart if still recording (handles browser timeout)
      if (isRecording && recognitionRef.current) {
        try {
          recognition.start();
        } catch (e) {
          // Already started, ignore
        }
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  }, [isRecording]);

  const stopRecording = useCallback((): string => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsRecording(false);

    // Combine final and any remaining interim
    const fullTranscript = (finalTranscriptRef.current + ' ' + interimTranscript).trim();
    setTranscript(fullTranscript);
    setInterimTranscript('');

    return fullTranscript;
  }, [interimTranscript]);

  return {
    isRecording,
    transcript,
    interimTranscript,
    error,
    startRecording,
    stopRecording
  };
}
