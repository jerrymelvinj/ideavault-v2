"use client";

import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, RefreshCw, Send, Sparkles, Volume2 } from "lucide-react";

interface VoiceRecorderProps {
  onTranscriptComplete: (text: string) => void;
}

export function VoiceRecorder({ onTranscriptComplete }: VoiceRecorderProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [supported, setSupported] = useState(true);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        setSupported(false);
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event: any) => {
        let currentTranscript = "";
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };

      recognition.onerror = (event: any) => {
        console.warn("Voice recognition warning:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setTranscript("");
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleReset = () => {
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
    setTranscript("");
  };

  const handleSend = () => {
    if (transcript.trim()) {
      onTranscriptComplete(transcript.trim());
      handleReset();
    }
  };

  if (!supported) {
    return (
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 text-center">
        Browser Voice Speech API is not supported in this browser. Please use Chrome/Edge or type your text note manually.
      </div>
    );
  }

  return (
    <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 space-y-4 shadow-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-xl border ${isListening ? "bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse" : "bg-indigo-600/20 text-indigo-400 border-indigo-500/30"}`}>
            {isListening ? <Mic className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              Hands-Free Voice Capture <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">Phase 2</span>
            </h3>
            <p className="text-xs text-slate-400">Speak your thoughts naturally — AI transcribes and organizes automatically.</p>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={toggleListening}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold shadow-lg transition-all ${
            isListening
              ? "bg-rose-600 hover:bg-rose-500 text-white animate-pulse"
              : "bg-indigo-600 hover:bg-indigo-500 text-white"
          }`}
        >
          {isListening ? (
            <>
              <MicOff className="w-4 h-4" /> Stop Recording
            </>
          ) : (
            <>
              <Mic className="w-4 h-4" /> Start Voice Note
            </>
          )}
        </button>
      </div>

      {/* Real-Time Waveform & Transcript Output Box */}
      <div className="min-h-[90px] p-4 rounded-xl bg-slate-950/90 border border-slate-800 text-xs space-y-2 relative">
        {isListening && (
          <div className="flex items-center gap-1 text-rose-400 font-semibold mb-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" /> Listening & Transcribing...
          </div>
        )}

        <p className="text-slate-200 leading-relaxed italic">
          {transcript || (isListening ? "Listening... Speak your concept..." : "Click 'Start Voice Note' to speak...")}
        </p>

        {transcript && (
          <div className="pt-3 border-t border-slate-900 flex justify-end gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
              title="Clear transcript"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleSend}
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg flex items-center gap-1 shadow-md"
            >
              <Send className="w-3 h-3" /> Capture Voice Note
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
