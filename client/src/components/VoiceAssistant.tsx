import { useState } from 'react';
import { useVoiceInput } from '../hooks/useVoiceInput';
import { useAudioPlayback } from '../hooks/useAudioPlayback';
import { AgentResponse } from '../lib/types';

interface VoiceAssistantProps {
  onAsk: (transcript: string) => Promise<AgentResponse | null>;
  lastResponse: AgentResponse | null;
  isProcessing: boolean;
  voiceEnabled: boolean;
  onVoiceToggle: (enabled: boolean) => void;
  debugMode: boolean;
  onDebugToggle: (enabled: boolean) => void;
}

export function VoiceAssistant({
  onAsk,
  lastResponse,
  isProcessing,
  voiceEnabled,
  onVoiceToggle,
  debugMode,
  onDebugToggle
}: VoiceAssistantProps) {
  const { isPlaying, playAudio, stopAudio } = useAudioPlayback();
  const [debugInput, setDebugInput] = useState('');

  const handleTriggerWord = async (text: string) => {
    if (text) {
      const response = await onAsk(text);
      if (response && voiceEnabled) {
        await playAudio(response.suggestedSpokenInstruction);
      }
    }
  };

  const { isRecording, transcript, interimTranscript, error, startRecording, stopRecording } = useVoiceInput({
    triggerWord: 'over',
    onTriggerWord: handleTriggerWord
  });

  const handleVoiceButton = async () => {
    if (isRecording) {
      const text = stopRecording();
      if (text) {
        const response = await onAsk(text);
        if (response && voiceEnabled) {
          await playAudio(response.suggestedSpokenInstruction);
        }
      }
    } else {
      startRecording();
    }
  };

  const handleDebugSubmit = async () => {
    if (!debugInput.trim()) return;
    const response = await onAsk(debugInput);
    setDebugInput('');
    if (response && voiceEnabled) {
      await playAudio(response.suggestedSpokenInstruction);
    }
  };

  // Combined display of final + interim transcript
  const displayTranscript = transcript + (interimTranscript ? ' ' + interimTranscript : '');

  return (
    <div className="bg-slate-800 rounded-lg p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Voice Assistant</h2>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm text-slate-400">
            <input
              type="checkbox"
              checked={voiceEnabled}
              onChange={(e) => onVoiceToggle(e.target.checked)}
              className="rounded"
            />
            Voice Reply
          </label>
        </div>
      </div>

      {/* Main Voice Button */}
      <button
        onClick={handleVoiceButton}
        disabled={isProcessing}
        className={`
          w-full py-6 rounded-lg text-xl font-semibold transition-all mb-4
          ${isRecording
            ? 'bg-red-600 hover:bg-red-500 animate-pulse'
            : 'bg-emerald-600 hover:bg-emerald-500'
          }
          ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
          text-white
        `}
      >
        {isRecording ? 'Stop & Ask' : isProcessing ? 'Processing...' : 'Start Voice Input'}
      </button>

      {isRecording && (
        <p className="text-xs text-emerald-400 mb-2 animate-pulse">
          Listening... Say "over" to submit, or click "Stop & Ask"
        </p>
      )}

      {/* Real-time Transcript */}
      {(displayTranscript || isRecording) && (
        <div className="bg-slate-900 rounded-lg p-3 mb-4">
          <p className="text-xs text-slate-500 mb-1">
            {isRecording ? 'Live Transcript:' : 'Transcript:'}
          </p>
          <p className="text-white">
            {transcript}
            {interimTranscript && (
              <span className="text-slate-400 italic"> {interimTranscript}</span>
            )}
            {isRecording && !displayTranscript && (
              <span className="text-slate-500">Listening...</span>
            )}
          </p>
        </div>
      )}

      {error && (
        <p className="text-red-400 text-sm mb-4">{error}</p>
      )}

      {/* Response Card */}
      {lastResponse && (
        <div className="flex-1 overflow-y-auto bg-slate-900 rounded-lg p-4 space-y-3">
          <div>
            <p className="text-xs text-slate-500">Situation</p>
            <p className="text-white text-sm">{lastResponse.situation}</p>
          </div>

          <div>
            <p className="text-xs text-slate-500">Location</p>
            <p className="text-white text-sm">{lastResponse.relevantLocation}</p>
          </div>

          <div>
            <p className="text-xs text-slate-500">Blueprint Path</p>
            <p className="text-amber-400 text-sm font-mono">{lastResponse.blueprintPath}</p>
          </div>

          <div>
            <p className="text-xs text-slate-500">Safe Checks</p>
            <ol className="list-decimal list-inside text-white text-sm">
              {lastResponse.nextSafeChecks.map((check, i) => (
                <li key={i}>{check}</li>
              ))}
            </ol>
          </div>

          <div>
            <p className="text-xs text-slate-500">Escalation Rule</p>
            <p className="text-white text-sm">{lastResponse.escalationRule}</p>
          </div>

          {lastResponse.safetyWarning && (
            <div className="bg-red-900/50 border border-red-600 rounded p-3">
              <p className="text-red-400 font-semibold text-sm">{lastResponse.safetyWarning}</p>
            </div>
          )}

          <div className="pt-2 border-t border-slate-700">
            <p className="text-xs text-slate-500">Spoken Instruction</p>
            <p className="text-emerald-400 text-sm italic">"{lastResponse.suggestedSpokenInstruction}"</p>
            {voiceEnabled && (
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => playAudio(lastResponse.suggestedSpokenInstruction)}
                  disabled={isPlaying}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs rounded"
                >
                  {isPlaying ? 'Playing...' : 'Replay'}
                </button>
                {isPlaying && (
                  <button
                    onClick={stopAudio}
                    className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white text-xs rounded"
                  >
                    Stop
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Debug Mode Toggle */}
      <div className="mt-4 pt-4 border-t border-slate-700">
        <label className="flex items-center gap-2 text-xs text-slate-500 cursor-pointer">
          <input
            type="checkbox"
            checked={debugMode}
            onChange={(e) => onDebugToggle(e.target.checked)}
            className="rounded"
          />
          Debug Mode (text input)
        </label>

        {debugMode && (
          <div className="mt-2 flex gap-2">
            <input
              type="text"
              value={debugInput}
              onChange={(e) => setDebugInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleDebugSubmit()}
              placeholder="Type question..."
              className="flex-1 px-3 py-2 bg-slate-900 text-white text-sm rounded border border-slate-600 focus:border-emerald-500 focus:outline-none"
            />
            <button
              onClick={handleDebugSubmit}
              disabled={isProcessing}
              className="px-4 py-2 bg-slate-600 hover:bg-slate-500 disabled:opacity-50 text-white text-sm rounded"
            >
              Ask
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
