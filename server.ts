import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { WebSocketServer, WebSocket } from 'ws';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Shared server-side Gemini client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// WebSocket Server for Live Voice Conversations (gemini-3.8-live)
const wss = new WebSocketServer({ server, path: '/api/live' });

wss.on('connection', async (clientWs: WebSocket) => {
  console.log('[Live API] Client connected to live voice stream');
  try {
    const session = await ai.live.connect({
      model: 'gemini-3.8-live',
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
        },
        systemInstruction:
          'You are the Grand Horizon Luxury Hotel AI Voice Concierge. ' +
          'Speak warmly, courteously, and professionally to assist hotel guests and staff ' +
          'with room details, booking policies, amenities, dining recommendations, and local travel.',
      },
      callbacks: {
        onmessage: (message: LiveServerMessage) => {
          const audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
          if (audio && clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(JSON.stringify({ type: 'audio', audio }));
          }
          if (message.serverContent?.interrupted && clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(JSON.stringify({ type: 'interrupted' }));
          }
          const textPart = message.serverContent?.modelTurn?.parts?.find((p) => p.text);
          if (textPart?.text && clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(JSON.stringify({ type: 'modelText', text: textPart.text }));
          }
          if (message.serverContent?.turnComplete && clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(JSON.stringify({ type: 'turnComplete' }));
          }
        },
        onerror: (err) => {
          console.error('[Live API] Session error:', err);
          if (clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(JSON.stringify({ type: 'error', error: String(err) }));
          }
        },
        onclose: () => {
          console.log('[Live API] Session closed by Gemini');
          if (clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(JSON.stringify({ type: 'closed' }));
          }
        },
      },
    });

    clientWs.on('message', (data: Buffer | string) => {
      try {
        const payload = JSON.parse(data.toString());
        if (payload.audio) {
          session.sendRealtimeInput({
            audio: { data: payload.audio, mimeType: 'audio/pcm;rate=16000' },
          });
        } else if (payload.text) {
          session.sendRealtimeInput({
            text: payload.text,
          });
        }
      } catch (err) {
        console.error('[Live API] Error parsing client message:', err);
      }
    });

    clientWs.on('close', () => {
      console.log('[Live API] Client disconnected');
      try {
        session.close();
      } catch {}
    });
  } catch (err) {
    console.error('[Live API] Failed to initialize live session:', err);
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(
        JSON.stringify({
          type: 'error',
          error: err instanceof Error ? err.message : String(err),
        })
      );
      clientWs.close();
    }
  }
});

// 1. Multi-Turn Chatbot Endpoint
// Supports gemini-4-argon (complex), gemini-3.8-flash (general), and gemini-3.1-flash-lite (fast)
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const {
      model = 'gemini-3.8-flash',
      systemInstruction,
      messages,
    } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    const contents = messages.map((m: { role: 'user' | 'model'; content: string }) => ({
      role: m.role === 'model' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model,
      contents,
      config: {
        systemInstruction:
          systemInstruction ||
          'You are the Grand Horizon Luxury Hotel AI Concierge and Operations Assistant. Help users with hotel management, guest reservations, luxury hospitality, and inquiries.',
      },
    });

    res.json({
      text: response.text || 'I could not generate a response. Please try again.',
      model,
    });
  } catch (error: any) {
    console.error('[Chat API Error]:', error);
    res.status(500).json({
      error: error?.message || 'Failed to process chat message.',
    });
  }
});

// 2. Maps Grounding Endpoint (gemini-3.8-flash with googleMaps)
app.post('/api/gemini/maps-grounding', async (req, res) => {
  try {
    const { prompt, userLocation } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required.' });
    }

    const config: any = {
      tools: [{ googleMaps: {} }],
    };

    if (userLocation?.latitude && userLocation?.longitude) {
      config.toolConfig = {
        retrievalConfig: {
          latLng: {
            latitude: Number(userLocation.latitude),
            longitude: Number(userLocation.longitude),
          },
        },
      };
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config,
    });

    const groundingChunks =
      response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    res.json({
      text: response.text || '',
      groundingChunks,
    });
  } catch (error: any) {
    console.error('[Maps Grounding API Error]:', error);
    res.status(500).json({
      error: error?.message || 'Failed to retrieve Google Maps grounded information.',
    });
  }
});

// 3. Search Grounding Endpoint (gemini-3.8-flash with googleSearch)
app.post('/api/gemini/search-grounding', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required.' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const groundingChunks =
      response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    res.json({
      text: response.text || '',
      groundingChunks,
    });
  } catch (error: any) {
    console.error('[Search Grounding API Error]:', error);
    res.status(500).json({
      error: error?.message || 'Failed to retrieve Google Search grounded information.',
    });
  }
});

// 4. Audio Transcription Endpoint (gemini-3.5-transcribe)
app.post('/api/gemini/transcribe', async (req, res) => {
  try {
    const { audioBase64, mimeType = 'audio/webm', prompt } = req.body;
    if (!audioBase64) {
      return res.status(400).json({ error: 'audioBase64 is required.' });
    }

    const audioPart = {
      inlineData: {
        mimeType,
        data: audioBase64,
      },
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-transcribe',
      contents: {
        parts: [
          audioPart,
          {
            text:
              prompt ||
              'Transcribe the speech in this audio clearly and accurately. Preserve hotel terminology and guest names if mentioned.',
          },
        ],
      },
    });

    res.json({
      text: response.text || '',
    });
  } catch (error: any) {
    console.error('[Transcription API Error]:', error);
    res.status(500).json({
      error: error?.message || 'Failed to transcribe audio.',
    });
  }
});

// Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  server.listen(port, () => {
    console.log(`[Grand Horizon Server] Running on http://localhost:${port}`);
  });
}

startServer().catch((err) => {
  console.error('[Grand Horizon Server] Startup error:', err);
});
