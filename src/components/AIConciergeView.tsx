import React, { useState, useRef, useEffect } from 'react';
import { User } from '../types';

interface AIConciergeViewProps {
  currentUser: User;
}

type AIMode = 'chat' | 'live' | 'maps' | 'search' | 'transcribe';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  modelUsed?: string;
  groundingChunks?: any[];
}

export const AIConciergeView: React.FC<AIConciergeViewProps> = ({ currentUser }) => {
  const [activeMode, setActiveMode] = useState<AIMode>('chat');

  // ==========================================
  // 1. CHATBOT STATE (gemini-3.8-flash, gemini-3.1-flash-lite, gemini-4-argon)
  // ==========================================
  const [chatRole, setChatRole] = useState<'concierge' | 'revenue' | 'operations'>('concierge');
  const [selectedModel, setSelectedModel] = useState<string>('gemini-3.8-flash');
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'model',
      content:
        `Welcome to the Grand Horizon AI Suite, **${currentUser.fullName}**! ` +
        `I am your intelligent Hotel Concierge & Operations Assistant powered by Google Gemini. ` +
        `\n\nYou can inquire about guest bookings, luxury amenities, local excursions with **Google Maps data**, live weather/events with **Google Search data**, or speak directly using **Live Voice** and **Audio Transcription**. How may I assist you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modelUsed: 'gemini-3.8-flash',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isChatLoading]);

  const roleSystemInstructions = {
    concierge:
      'You are the Chief Concierge at Grand Horizon Resort & Luxury Suites. ' +
      'Provide five-star, warm, polished hospitality advice. Help with room recommendations, ' +
      'spa packages, fine dining reservations, VIP amenities, and guest itinerary planning. Be courteous and elegant.',
    revenue:
      'You are the Hotel Revenue & Booking Operations Strategist at Grand Horizon. ' +
      'Provide sharp financial and operational insights on room pricing, occupancy optimization, ' +
      'seasonal demand forecasting, dynamic tariff yields, and corporate event packages.',
    operations:
      'You are the Front Desk & Housekeeping Operations Supervisor at Grand Horizon. ' +
      'Assist staff with rapid check-in/out protocols, guest incident resolution, room turnover coordination, ' +
      'maintenance ticket escalation, and inventory logistics.',
  };

  const handleSendChatMessage = async (overridePrompt?: string) => {
    const textToSend = overridePrompt || chatInput;
    if (!textToSend.trim() || isChatLoading) return;

    const userMessage: ChatMessage = {
      id: String(Date.now()),
      role: 'user',
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...chatMessages, userMessage];
    setChatMessages(newHistory);
    if (!overridePrompt) setChatInput('');
    setIsChatLoading(true);
    setChatError(null);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: selectedModel,
          systemInstruction: roleSystemInstructions[chatRole],
          messages: newHistory.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get a response from Gemini.');
      }

      const modelMessage: ChatMessage = {
        id: String(Date.now() + 1),
        role: 'model',
        content: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: data.model || selectedModel,
      };

      setChatMessages((prev) => [...prev, modelMessage]);
    } catch (err: any) {
      setChatError(err.message || 'Error connecting to Gemini.');
    } finally {
      setIsChatLoading(false);
    }
  };

  // ==========================================
  // 2. LIVE VOICE CONVERSATION STATE (gemini-3.8-live)
  // ==========================================
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [isLiveSpeaking, setIsLiveSpeaking] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState<string[]>([]);
  const [liveStatusText, setLiveStatusText] = useState('Click "Start Voice Session" to speak with Gemini Live');

  const wsRef = useRef<WebSocket | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const nextStartTimeRef = useRef<number>(0);

  const startLiveSession = async () => {
    try {
      setLiveStatusText('Requesting microphone access...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      // Audio contexts: 16kHz for input mic capture, 24kHz for Live API output audio playback
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000,
      });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 24000,
      });

      inputAudioCtxRef.current = inputCtx;
      outputAudioCtxRef.current = outputCtx;
      nextStartTimeRef.current = outputCtx.currentTime;

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/live`;
      setLiveStatusText('Connecting to Gemini 3.8 Live API WebSocket...');

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsLiveConnected(true);
        setLiveStatusText('Live voice session active! Speak naturally into your microphone.');

        // Stream mic audio in 16kHz PCM chunks
        const source = inputCtx.createMediaStreamSource(stream);
        const processor = inputCtx.createScriptProcessor(4096, 1, 1);
        scriptProcessorRef.current = processor;

        processor.onaudioprocess = (e) => {
          if (ws.readyState === WebSocket.OPEN) {
            const inputData = e.inputBuffer.getChannelData(0);
            // Convert Float32 to 16-bit PCM ArrayBuffer
            const buffer = new ArrayBuffer(inputData.length * 2);
            const view = new DataView(buffer);
            for (let i = 0; i < inputData.length; i++) {
              const s = Math.max(-1, Math.min(1, inputData[i]));
              view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
            }
            // Base64 encode PCM
            let binary = '';
            const bytes = new Uint8Array(buffer);
            for (let i = 0; i < bytes.byteLength; i++) {
              binary += String.fromCharCode(bytes[i]);
            }
            const base64Audio = btoa(binary);

            ws.send(JSON.stringify({ audio: base64Audio }));
          }
        };

        source.connect(processor);
        processor.connect(inputCtx.destination);
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'audio' && msg.audio) {
            setIsLiveSpeaking(true);
            playLiveAudioChunk(msg.audio);
          } else if (msg.type === 'interrupted') {
            setIsLiveSpeaking(false);
            // Reset audio scheduler
            if (outputAudioCtxRef.current) {
              nextStartTimeRef.current = outputAudioCtxRef.current.currentTime;
            }
          } else if (msg.type === 'modelText' && msg.text) {
            setLiveTranscript((prev) => [...prev.slice(-10), `Concierge: ${msg.text}`]);
          } else if (msg.type === 'turnComplete') {
            setIsLiveSpeaking(false);
          } else if (msg.type === 'error') {
            setLiveStatusText(`Error: ${msg.error}`);
          }
        } catch (e) {
          console.error('Error handling live message:', e);
        }
      };

      ws.onerror = (e) => {
        console.error('WebSocket error:', e);
        setLiveStatusText('WebSocket connection error.');
      };

      ws.onclose = () => {
        setIsLiveConnected(false);
        setIsLiveSpeaking(false);
        setLiveStatusText('Voice session ended.');
      };
    } catch (err: any) {
      console.error('Failed to start live session:', err);
      setLiveStatusText(`Failed to start: ${err.message || 'Microphone error'}`);
    }
  };

  const playLiveAudioChunk = (base64Audio: string) => {
    try {
      const outputCtx = outputAudioCtxRef.current;
      if (!outputCtx) return;

      const binary = atob(base64Audio);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const dataView = new DataView(bytes.buffer);
      const numSamples = Math.floor(bytes.length / 2);
      const float32 = new Float32Array(numSamples);
      for (let i = 0; i < numSamples; i++) {
        const int16 = dataView.getInt16(i * 2, true);
        float32[i] = int16 / 32768;
      }

      const audioBuffer = outputCtx.createBuffer(1, float32.length, 24000);
      audioBuffer.getChannelData(0).set(float32);

      const source = outputCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(outputCtx.destination);

      const currentTime = outputCtx.currentTime;
      const startTime = Math.max(nextStartTimeRef.current, currentTime);
      source.start(startTime);
      nextStartTimeRef.current = startTime + audioBuffer.duration;

      source.onended = () => {
        if (outputCtx.currentTime >= nextStartTimeRef.current - 0.05) {
          setIsLiveSpeaking(false);
        }
      };
    } catch (err) {
      console.error('Error playing live audio chunk:', err);
    }
  };

  const stopLiveSession = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }
    if (inputAudioCtxRef.current) {
      inputAudioCtxRef.current.close();
      inputAudioCtxRef.current = null;
    }
    if (outputAudioCtxRef.current) {
      outputAudioCtxRef.current.close();
      outputAudioCtxRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setIsLiveConnected(false);
    setIsLiveSpeaking(false);
    setLiveStatusText('Voice session stopped.');
  };

  useEffect(() => {
    return () => {
      stopLiveSession();
    };
  }, []);

  // ==========================================
  // 3. GOOGLE MAPS GROUNDING STATE (gemini-3.8-flash with googleMaps)
  // ==========================================
  const [mapsPrompt, setMapsPrompt] = useState('What are the best luxury fine dining restaurants and cultural attractions within 5 km of our resort?');
  const [mapsResult, setMapsResult] = useState<string>('');
  const [mapsChunks, setMapsChunks] = useState<any[]>([]);
  const [isMapsLoading, setIsMapsLoading] = useState(false);
  const [mapsError, setMapsError] = useState<string | null>(null);

  const handleQueryMaps = async (customPrompt?: string) => {
    const promptToUse = customPrompt || mapsPrompt;
    if (!promptToUse.trim()) return;

    setIsMapsLoading(true);
    setMapsError(null);
    setMapsResult('');
    setMapsChunks([]);

    try {
      // Try to get browser location or fallback to luxury resort coordinates
      let userLocation: { latitude: number; longitude: number } | undefined = undefined;
      try {
        if ('geolocation' in navigator) {
          const pos: any = await new Promise((resolve) => {
            navigator.geolocation.getCurrentPosition(resolve, () => resolve(null), { timeout: 3000 });
          });
          if (pos?.coords) {
            userLocation = {
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
            };
          }
        }
      } catch {}

      const response = await fetch('/api/gemini/maps-grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptToUse,
          userLocation,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch Maps Grounding information.');
      }

      setMapsResult(data.text);
      setMapsChunks(data.groundingChunks || []);
    } catch (err: any) {
      setMapsError(err.message || 'Error querying Google Maps data.');
    } finally {
      setIsMapsLoading(false);
    }
  };

  // ==========================================
  // 4. GOOGLE SEARCH GROUNDING STATE (gemini-3.8-flash with googleSearch)
  // ==========================================
  const [searchPrompt, setSearchPrompt] = useState('What is the current weather forecast, local festivals, and travel news for hotel visitors this week?');
  const [searchResult, setSearchResult] = useState<string>('');
  const [searchChunks, setSearchChunks] = useState<any[]>([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const handleQuerySearch = async (customPrompt?: string) => {
    const promptToUse = customPrompt || searchPrompt;
    if (!promptToUse.trim()) return;

    setIsSearchLoading(true);
    setSearchError(null);
    setSearchResult('');
    setSearchChunks([]);

    try {
      const response = await fetch('/api/gemini/search-grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptToUse }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch Search Grounding information.');
      }

      setSearchResult(data.text);
      setSearchChunks(data.groundingChunks || []);
    } catch (err: any) {
      setSearchError(err.message || 'Error querying Google Search data.');
    } finally {
      setIsSearchLoading(false);
    }
  };

  // ==========================================
  // 5. AUDIO TRANSCRIPTION STATE (gemini-3.5-transcribe)
  // ==========================================
  const [isRecordingTranscribe, setIsRecordingTranscribe] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcribeError, setTranscribeError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const timerRef = useRef<any>(null);

  const startTranscriptionRecording = async () => {
    try {
      setTranscribeError(null);
      audioChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        await sendAudioForTranscription(audioBlob, recorder.mimeType || 'audio/webm');
      };

      recorder.start();
      setIsRecordingTranscribe(true);
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordingSeconds((s) => s + 1);
      }, 1000);
    } catch (err: any) {
      setTranscribeError(err.message || 'Microphone access denied or error occurred.');
    }
  };

  const stopTranscriptionRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && isRecordingTranscribe) {
      mediaRecorderRef.current.stop();
      setIsRecordingTranscribe(false);
    }
  };

  const sendAudioForTranscription = async (blob: Blob, mimeType: string) => {
    setIsTranscribing(true);
    setTranscribeError(null);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(',')[1];
        const res = await fetch('/api/gemini/transcribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            audioBase64: base64Audio,
            mimeType,
            prompt: 'Transcribe this hotel voice note with punctuation and proper nouns.',
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Transcription failed.');
        }

        setTranscribedText(data.text);
      };
      reader.readAsDataURL(blob);
    } catch (err: any) {
      setTranscribeError(err.message || 'Error sending audio to Gemini Transcribe.');
    } finally {
      setIsTranscribing(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Banner & Mode Switcher */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#6C5CE7] to-[#FD79A8] flex items-center justify-center text-white text-xl shadow-lg shadow-[#6C5CE7]/30">
            <i className="fa-solid fa-wand-magic-sparkles"></i>
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <span>Grand Horizon AI Intelligence Suite</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#6C5CE7]/15 text-[#6C5CE7] border border-[#6C5CE7]/30">
                Powered by Gemini
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Live Voice Conversations, Multi-Turn Assistant, Google Maps & Search Grounding, and Audio Dictation
            </p>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveMode('chat')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeMode === 'chat'
                ? 'bg-white dark:bg-slate-900 text-[#6C5CE7] shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <i className="fa-solid fa-comments"></i>
            <span>Chatbot</span>
          </button>

          <button
            onClick={() => setActiveMode('live')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeMode === 'live'
                ? 'bg-white dark:bg-slate-900 text-rose-500 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <i className="fa-solid fa-microphone-lines text-rose-500"></i>
            <span>Live Voice</span>
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
          </button>

          <button
            onClick={() => setActiveMode('maps')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeMode === 'maps'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <i className="fa-solid fa-map-location-dot text-emerald-500"></i>
            <span>Maps Grounding</span>
          </button>

          <button
            onClick={() => setActiveMode('search')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeMode === 'search'
                ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <i className="fa-brands fa-google text-blue-500"></i>
            <span>Search Grounding</span>
          </button>

          <button
            onClick={() => setActiveMode('transcribe')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeMode === 'transcribe'
                ? 'bg-white dark:bg-slate-900 text-purple-600 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <i className="fa-solid fa-file-audio text-purple-500"></i>
            <span>Transcribe</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. MULTI-TURN GEMINI CHATBOT TAB */}
      {/* ========================================================================= */}
      {activeMode === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar: Role and Model Selection */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <i className="fa-solid fa-robot text-[#6C5CE7]"></i>
                <span>Assistant Persona</span>
              </h3>

              {/* Persona Selector */}
              <div className="space-y-2">
                {[
                  {
                    id: 'concierge',
                    label: 'VIP Concierge',
                    icon: 'fa-bell-concierge',
                    desc: 'Guest experience, fine dining, spa, luxury amenities',
                  },
                  {
                    id: 'revenue',
                    label: 'Revenue & Yield Manager',
                    icon: 'fa-chart-line',
                    desc: 'Tariffs, occupancy yields, seasonal forecasting',
                  },
                  {
                    id: 'operations',
                    label: 'Front Desk Supervisor',
                    icon: 'fa-clipboard-check',
                    desc: 'Rapid check-in/out, housekeeping, room turns',
                  },
                ].map((role) => (
                  <button
                    key={role.id}
                    onClick={() => setChatRole(role.id as any)}
                    className={`w-full text-left p-2.5 rounded-xl border transition cursor-pointer ${
                      chatRole === role.id
                        ? 'bg-purple-50 dark:bg-purple-950/40 border-[#6C5CE7] text-[#6C5CE7] dark:text-[#a29bfe] font-semibold'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-xs font-bold">
                      <i className={`fa-solid ${role.icon}`}></i>
                      <span>{role.label}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">{role.desc}</p>
                  </button>
                ))}
              </div>

              {/* Gemini Model Selector */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Gemini Model</span>
                  <span className="text-[10px] text-slate-400 font-normal">Task optimization</span>
                </label>
                <div className="space-y-1.5">
                  {[
                    {
                      id: 'gemini-3.8-flash',
                      name: 'gemini-3.8-flash',
                      badge: 'General Tasks (Default)',
                      color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
                    },
                    {
                      id: 'gemini-3.1-flash-lite',
                      name: 'gemini-3.1-flash-lite',
                      badge: 'Fast & Instant Queries',
                      color: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
                    },
                    {
                      id: 'gemini-4-argon',
                      name: 'gemini-4-argon',
                      badge: 'Complex Reasoning & Strategy',
                      color: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400',
                    },
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setSelectedModel(m.id)}
                      className={`w-full text-left p-2 rounded-xl border transition cursor-pointer text-xs ${
                        selectedModel === m.id
                          ? 'border-[#6C5CE7] bg-purple-50/50 dark:bg-purple-950/30 font-semibold'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[11px] text-slate-800 dark:text-slate-200">{m.name}</span>
                        {selectedModel === m.id && <i className="fa-solid fa-circle-check text-[#6C5CE7] text-xs"></i>}
                      </div>
                      <span className={`inline-block mt-1 text-[9px] font-bold px-1.5 py-0.2 rounded ${m.color}`}>
                        {m.badge}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sample Prompts */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Quick Prompts
                </span>
                {[
                  'Draft a VIP welcome letter for Suite 401',
                  'Suggest 3 ways to boost weekend suite occupancy',
                  'Calculate GST liability breakdown for a ₹24,000 stay',
                  'Best wine pairing for executive room service menu',
                ].map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendChatMessage(prompt)}
                    className="w-full text-left text-[11px] p-2 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-[#6C5CE7]/10 hover:text-[#6C5CE7] border border-slate-200 dark:border-slate-700 transition cursor-pointer truncate"
                  >
                    "{prompt}"
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Main Chat Thread */}
          <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-[650px]">
            {/* Chat Thread Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#6C5CE7]/10 text-[#6C5CE7] flex items-center justify-center">
                  <i className="fa-solid fa-headset text-sm"></i>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-white capitalize">
                    {chatRole.replace('-', ' ')} Assistant
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Model: {selectedModel} • Active Thread ({chatMessages.length} msgs)
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  setChatMessages([
                    {
                      id: 'welcome-reset',
                      role: 'model',
                      content: 'Conversation history reset. How can I assist you with Grand Horizon hotel operations?',
                      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                      modelUsed: selectedModel,
                    },
                  ]);
                }}
                className="text-[11px] font-semibold text-slate-400 hover:text-rose-500 cursor-pointer transition flex items-center gap-1"
                title="Clear conversation history"
              >
                <i className="fa-solid fa-trash-can text-xs"></i>
                <span>Clear</span>
              </button>
            </div>

            {/* Scrollable Message Thread */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {chatMessages.map((msg) => {
                const isUser = msg.role === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-3 max-w-2xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                  >
                    {/* Avatar */}
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs shadow-sm ${
                        isUser
                          ? 'bg-[#6C5CE7] text-white'
                          : 'bg-gradient-to-tr from-[#FD79A8] to-[#6C5CE7] text-white'
                      }`}
                    >
                      <i className={`fa-solid ${isUser ? 'fa-user' : 'fa-wand-magic-sparkles'}`}></i>
                    </div>

                    {/* Bubble */}
                    <div
                      className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                        isUser
                          ? 'bg-[#6C5CE7] text-white rounded-tr-none'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-200 dark:border-slate-700/80 shadow-sm'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{msg.content}</div>

                      <div
                        className={`flex items-center gap-2 mt-2 pt-1 border-t text-[10px] ${
                          isUser
                            ? 'border-white/20 text-purple-200 justify-end'
                            : 'border-slate-200 dark:border-slate-700 text-slate-400'
                        }`}
                      >
                        <span>{msg.timestamp}</span>
                        {msg.modelUsed && <span>• {msg.modelUsed}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}

              {isChatLoading && (
                <div className="flex gap-3 mr-auto max-w-md">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#FD79A8] to-[#6C5CE7] text-white flex items-center justify-center flex-shrink-0 text-xs shadow-sm">
                    <i className="fa-solid fa-wand-magic-sparkles"></i>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs rounded-tl-none border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                    <i className="fa-solid fa-circle-notch fa-spin text-[#6C5CE7]"></i>
                    <span>Gemini is thinking with {selectedModel}...</span>
                  </div>
                </div>
              )}

              {chatError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-600 text-xs flex items-center gap-2">
                  <i className="fa-solid fa-circle-exclamation"></i>
                  <span>{chatError}</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input Bar */}
            <div className="p-3.5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-b-2xl">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendChatMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder={`Ask ${chatRole.replace('-', ' ')} about hotel operations, guest services, tariffs...`}
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
                />

                {/* Quick Dictate Button to transcribe into input */}
                <button
                  type="button"
                  onClick={() => {
                    if (isRecordingTranscribe) {
                      stopTranscriptionRecording();
                    } else {
                      startTranscriptionRecording();
                    }
                  }}
                  title="Dictate with voice"
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs transition cursor-pointer border ${
                    isRecordingTranscribe
                      ? 'bg-rose-500 text-white animate-pulse border-rose-600'
                      : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <i className="fa-solid fa-microphone"></i>
                </button>

                <button
                  type="submit"
                  disabled={!chatInput.trim() || isChatLoading}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#6C5CE7] to-[#8575ff] hover:opacity-95 text-white text-xs font-semibold shadow-md shadow-[#6C5CE7]/30 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  <span>Send</span>
                  <i className="fa-solid fa-paper-plane text-[10px]"></i>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. LIVE VOICE CONVERSATIONS (gemini-3.8-live) */}
      {/* ========================================================================= */}
      {activeMode === 'live' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            <span>Gemini 3.8 Live API • Low Latency Voice</span>
          </div>

          <h3 className="text-xl font-bold text-slate-800 dark:text-white">
            Real-Time Voice Concierge
          </h3>
          <p className="text-xs text-slate-400 max-w-lg mx-auto">
            Speak directly with Grand Horizon's AI Concierge using real-time bidirectional audio streaming.
            Get spoken responses with instant interruptions and natural voice conversation.
          </p>

          {/* Animated Microphone Orb */}
          <div className="py-6 flex flex-col items-center justify-center">
            <div className="relative">
              {isLiveConnected && (
                <div
                  className={`absolute -inset-4 rounded-full opacity-75 blur-lg transition duration-500 ${
                    isLiveSpeaking
                      ? 'bg-rose-500 animate-ping'
                      : 'bg-[#6C5CE7] animate-pulse'
                  }`}
                ></div>
              )}

              <button
                onClick={isLiveConnected ? stopLiveSession : startLiveSession}
                className={`relative w-28 h-28 rounded-full flex flex-col items-center justify-center text-white text-3xl shadow-2xl transition-transform hover:scale-105 cursor-pointer ${
                  isLiveConnected
                    ? 'bg-gradient-to-tr from-rose-500 to-rose-600 shadow-rose-500/50'
                    : 'bg-gradient-to-tr from-[#6C5CE7] to-[#FD79A8] shadow-[#6C5CE7]/40'
                }`}
              >
                <i
                  className={`fa-solid ${
                    isLiveConnected
                      ? isLiveSpeaking
                        ? 'fa-volume-high animate-bounce'
                        : 'fa-microphone'
                      : 'fa-microphone'
                  }`}
                ></i>
                <span className="text-[10px] font-bold mt-1 tracking-wider uppercase">
                  {isLiveConnected ? (isLiveSpeaking ? 'Speaking' : 'Listening') : 'Start'}
                </span>
              </button>
            </div>

            <div className="mt-6">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                {liveStatusText}
              </span>
            </div>
          </div>

          {/* Live Audio Controls and Info */}
          <div className="flex justify-center gap-3">
            {isLiveConnected ? (
              <button
                onClick={stopLiveSession}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-md cursor-pointer transition flex items-center gap-2"
              >
                <i className="fa-solid fa-phone-slash"></i>
                <span>End Voice Session</span>
              </button>
            ) : (
              <button
                onClick={startLiveSession}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#6C5CE7] to-[#8575ff] text-white text-xs font-semibold shadow-lg shadow-[#6C5CE7]/30 hover:opacity-95 cursor-pointer transition flex items-center gap-2"
              >
                <i className="fa-solid fa-phone"></i>
                <span>Connect Live Microphone</span>
              </button>
            )}
          </div>

          {/* Live Transcript Stream */}
          {liveTranscript.length > 0 && (
            <div className="mt-6 text-left p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs space-y-1.5 max-h-48 overflow-y-auto font-mono">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Live Speech Log:
              </span>
              {liveTranscript.map((line, i) => (
                <p key={i} className="text-slate-700 dark:text-slate-200">
                  {line}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. GOOGLE MAPS GROUNDING TAB (gemini-3.8-flash with googleMaps) */}
      {/* ========================================================================= */}
      {activeMode === 'maps' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-lg">
                <i className="fa-solid fa-map-location-dot"></i>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <span>Google Maps Grounding Experience</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 font-bold border border-emerald-200 dark:border-emerald-800 uppercase">
                    gemini-3.8-flash + googleMaps tool
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Accurate, real-time geographic data for local tourist attractions, fine dining, airport transit, and navigation.
                </p>
              </div>
            </div>

            {/* Quick Map Query Presets */}
            <div className="flex flex-wrap gap-2">
              {[
                'Top 5 fine dining restaurants and rooftop bars near Grand Horizon',
                'Historical monuments, museums, and botanical gardens nearby',
                'Nearest international airport transit options and commute times',
                'Pharmacy, emergency clinics, and convenience stores within walking distance',
              ].map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setMapsPrompt(preset);
                    handleQueryMaps(preset);
                  }}
                  className="text-[11px] px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600 border border-slate-200 dark:border-slate-700 transition cursor-pointer text-slate-700 dark:text-slate-300"
                >
                  <i className="fa-solid fa-location-dot text-emerald-500 mr-1.5 text-[10px]"></i>
                  <span>{preset}</span>
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 text-xs">
                  <i className="fa-solid fa-compass"></i>
                </span>
                <input
                  type="text"
                  value={mapsPrompt}
                  onChange={(e) => setMapsPrompt(e.target.value)}
                  placeholder="Ask for nearby places, attractions, distances, or recommendations..."
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                onClick={() => handleQueryMaps()}
                disabled={isMapsLoading || !mapsPrompt.trim()}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-emerald-500/20 transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                {isMapsLoading ? (
                  <>
                    <i className="fa-solid fa-circle-notch fa-spin"></i>
                    <span>Grounding...</span>
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-magnifying-glass-location"></i>
                    <span>Find Places</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Maps Error */}
          {mapsError && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-600 text-xs flex items-center gap-2">
              <i className="fa-solid fa-circle-exclamation"></i>
              <span>{mapsError}</span>
            </div>
          )}

          {/* Maps Results & Grounding Chunks */}
          {mapsResult && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <i className="fa-solid fa-map-pin text-emerald-500"></i>
                  <span>Grounded Google Maps Places & Recommendations</span>
                </h4>
                <span className="text-[10px] text-slate-400 font-mono">
                  {mapsChunks.length} Maps source(s)
                </span>
              </div>

              {/* Verified Place Cards from Grounding Chunks */}
              {mapsChunks.length > 0 && (
                <div>
                  <h5 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2.5">
                    Verified Google Maps Locations & Links:
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {mapsChunks.map((chunk, idx) => {
                      const uri = chunk.maps?.uri || chunk.web?.uri;
                      const title = chunk.maps?.title || chunk.web?.title || `Location ${idx + 1}`;
                      if (!uri) return null;
                      return (
                        <a
                          key={idx}
                          href={uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 hover:border-emerald-500 transition group flex items-start gap-3"
                        >
                          <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 text-xs shadow-sm">
                            <i className="fa-solid fa-location-arrow"></i>
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 truncate">
                              {title}
                            </p>
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                              <span>Open on Google Maps</span>
                              <i className="fa-solid fa-arrow-up-right-from-square text-[9px]"></i>
                            </span>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Text Narrative */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                {mapsResult}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. GOOGLE SEARCH GROUNDING TAB (gemini-3.8-flash with googleSearch) */}
      {/* ========================================================================= */}
      {activeMode === 'search' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center text-lg">
                <i className="fa-brands fa-google"></i>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <span>Google Search Grounding Experience</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 font-bold border border-blue-200 dark:border-blue-800 uppercase">
                    gemini-3.8-flash + googleSearch tool
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Real-time web search for current local weather, live events, flight alerts, and up-to-date city information.
                </p>
              </div>
            </div>

            {/* Presets */}
            <div className="flex flex-wrap gap-2">
              {[
                'Current 7-day weather forecast and packing recommendations for hotel guests',
                'Major cultural events, concerts, and festivals happening this weekend',
                'Latest airport flight delays, traffic advisories, and transit status',
                'Current foreign currency exchange rates (USD, EUR, GBP to INR)',
              ].map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSearchPrompt(preset);
                    handleQuerySearch(preset);
                  }}
                  className="text-[11px] px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 border border-slate-200 dark:border-slate-700 transition cursor-pointer text-slate-700 dark:text-slate-300"
                >
                  <i className="fa-solid fa-sparkles text-blue-500 mr-1.5 text-[10px]"></i>
                  <span>{preset}</span>
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 text-xs">
                  <i className="fa-solid fa-globe"></i>
                </span>
                <input
                  type="text"
                  value={searchPrompt}
                  onChange={(e) => setSearchPrompt(e.target.value)}
                  placeholder="Search real-time web facts, weather, flights, or local news..."
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                onClick={() => handleQuerySearch()}
                disabled={isSearchLoading || !searchPrompt.trim()}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-500/20 transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                {isSearchLoading ? (
                  <>
                    <i className="fa-solid fa-circle-notch fa-spin"></i>
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-magnifying-glass"></i>
                    <span>Search Web</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Search Error */}
          {searchError && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-600 text-xs flex items-center gap-2">
              <i className="fa-solid fa-circle-exclamation"></i>
              <span>{searchError}</span>
            </div>
          )}

          {/* Search Results */}
          {searchResult && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <i className="fa-brands fa-google text-blue-500"></i>
                  <span>Grounded Google Search Results</span>
                </h4>
                <span className="text-[10px] text-slate-400 font-mono">
                  {searchChunks.length} Web citation(s)
                </span>
              </div>

              {/* Web Source Links */}
              {searchChunks.length > 0 && (
                <div>
                  <h5 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2.5">
                    Live Verified Web Citations:
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {searchChunks.map((chunk, idx) => {
                      const uri = chunk.web?.uri;
                      const title = chunk.web?.title || `Web Source ${idx + 1}`;
                      if (!uri) return null;
                      return (
                        <a
                          key={idx}
                          href={uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/60 hover:border-blue-500 transition group flex items-start gap-3"
                        >
                          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center flex-shrink-0 text-xs shadow-sm">
                            <i className="fa-solid fa-link"></i>
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 truncate">
                              {title}
                            </p>
                            <span className="text-[10px] text-blue-600 dark:text-blue-400 flex items-center gap-1 mt-0.5 truncate">
                              <span className="truncate">{uri.replace(/^https?:\/\//, '')}</span>
                              <i className="fa-solid fa-arrow-up-right-from-square text-[9px]"></i>
                            </span>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Narrative Content */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                {searchResult}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. AUDIO TRANSCRIPTION TAB (gemini-3.5-transcribe) */}
      {/* ========================================================================= */}
      {activeMode === 'transcribe' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm max-w-3xl mx-auto space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center text-lg">
              <i className="fa-solid fa-file-audio"></i>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <span>Microphone Audio Dictation & Transcription</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-600 font-bold border border-purple-200 dark:border-purple-800 uppercase">
                  gemini-3.5-transcribe
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Dictate front desk notes, guest special requests, or room maintenance logs with speech-to-text.
              </p>
            </div>
          </div>

          {/* Recording Controls */}
          <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-center space-y-4">
            <div className="flex items-center justify-center">
              <button
                type="button"
                onClick={isRecordingTranscribe ? stopTranscriptionRecording : startTranscriptionRecording}
                disabled={isTranscribing}
                className={`w-20 h-20 rounded-full flex flex-col items-center justify-center text-white text-2xl shadow-xl transition-all cursor-pointer ${
                  isRecordingTranscribe
                    ? 'bg-rose-500 animate-pulse shadow-rose-500/50 scale-110'
                    : 'bg-gradient-to-tr from-[#6C5CE7] to-[#FD79A8] shadow-[#6C5CE7]/30 hover:scale-105'
                }`}
              >
                <i className={`fa-solid ${isRecordingTranscribe ? 'fa-stop' : 'fa-microphone'}`}></i>
                <span className="text-[9px] font-bold mt-1 uppercase">
                  {isRecordingTranscribe ? `${recordingSeconds}s` : 'Record'}
                </span>
              </button>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                {isRecordingTranscribe
                  ? `Recording in progress (${recordingSeconds} seconds)... Click Stop to transcribe.`
                  : isTranscribing
                  ? 'Gemini 3.5 is transcribing your audio...'
                  : 'Click the microphone to start recording your voice.'}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Supports room service requests, guest remarks, booking dictation, and staff notes.
              </p>
            </div>
          </div>

          {/* Transcribe Error */}
          {transcribeError && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-600 text-xs flex items-center gap-2">
              <i className="fa-solid fa-circle-exclamation"></i>
              <span>{transcribeError}</span>
            </div>
          )}

          {/* Transcribed Output Display */}
          {transcribedText && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <i className="fa-solid fa-align-left text-[#6C5CE7]"></i>
                  <span>Transcribed Text:</span>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(transcribedText);
                      alert('Transcribed text copied to clipboard!');
                    }}
                    className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:text-[#6C5CE7] px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 transition cursor-pointer flex items-center gap-1"
                  >
                    <i className="fa-solid fa-copy text-[10px]"></i>
                    <span>Copy Text</span>
                  </button>

                  <button
                    onClick={() => {
                      setChatInput(transcribedText);
                      setActiveMode('chat');
                    }}
                    className="text-[11px] font-semibold text-white px-2.5 py-1 rounded-lg bg-[#6C5CE7] hover:bg-[#5a4bd4] transition cursor-pointer flex items-center gap-1 shadow-sm"
                  >
                    <i className="fa-solid fa-comments text-[10px]"></i>
                    <span>Send to Chatbot</span>
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 leading-relaxed font-mono">
                {transcribedText}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
