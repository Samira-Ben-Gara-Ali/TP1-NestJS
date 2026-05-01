import React, { useEffect, useRef, useState } from 'react';

import { io } from 'socket.io-client';

// IMPORTANT: no URL needed (same origin)
export const socket = io({
  path: '/socket.io',
  transports: ['websocket', 'polling'],
  withCredentials: true,
});

const MAX_LATENCY = 0.3;
const SAMPLE_RATE = 44100;

const workletCode = `
class AudioSender extends AudioWorkletProcessor {
  constructor() {
    super();
    this._buffer = [];
    this._bufferSize = 2048;
  }

  process(inputs) {
    const input = inputs[0];
    if (!input || !input[0]) return true;

    const samples = input[0];
    for (let i = 0; i < samples.length; i++) {
      this._buffer.push(samples[i]);
    }

    if (this._buffer.length >= this._bufferSize) {
      const chunk = new Float32Array(this._buffer.splice(0, this._bufferSize));
      this.port.postMessage(chunk.buffer, [chunk.buffer]);
    }

    return true;
  }
}

registerProcessor('audio-sender', AudioSender);
`;

export default function App() {
  const audioContextRef = useRef(null);
  const workletNodeRef = useRef(null);
  const sourceNodeRef = useRef(null);
  const playbackContextRef = useRef(null);
  const nextPlayTimeRef = useRef(0);
  const streamRef = useRef(null);
  const pendingChunksRef = useRef(0);

  const [room, setRoom] = useState('room1');
  const [recording, setRecording] = useState(false);

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');

  // ---------------- SOCKET ----------------
  useEffect(() => {
    playbackContextRef.current = new (
      window.AudioContext || window.webkitAudioContext
    )({
      sampleRate: SAMPLE_RATE,
    });

    socket.on('connect', () => console.log('Connected:', socket.id));

    // AUDIO RECEIVE
    socket.on('audio', (data) => {
      const raw = Array.isArray(data) ? data[0] : data;

      let float32Array;
      if (raw instanceof ArrayBuffer) {
        float32Array = new Float32Array(raw);
      } else if (raw?.buffer instanceof ArrayBuffer) {
        const ab = raw.buffer.slice(
          raw.byteOffset,
          raw.byteOffset + raw.byteLength,
        );
        float32Array = new Float32Array(ab);
      } else return;

      playChunk(float32Array);
    });

    // TEXT RECEIVE
    socket.on('text', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    // RESYNC AUDIO
    const syncInterval = setInterval(() => {
      const ctx = playbackContextRef.current;
      if (!ctx) return;

      const queuedAhead = nextPlayTimeRef.current - ctx.currentTime;

      if (queuedAhead > MAX_LATENCY) {
        nextPlayTimeRef.current = ctx.currentTime + 0.05;
        pendingChunksRef.current = 0;
      }
    }, 1000);

    return () => {
      socket.off('audio');
      socket.off('text');
      clearInterval(syncInterval);
      playbackContextRef.current?.close();
    };
  }, []);

  // ---------------- AUDIO PLAYBACK ----------------
  const playChunk = (float32Array) => {
    const ctx = playbackContextRef.current;
    if (!ctx) return;

    if (ctx.state === 'suspended') ctx.resume();

    const currentTime = ctx.currentTime;
    const queuedAhead = nextPlayTimeRef.current - currentTime;

    if (queuedAhead > MAX_LATENCY) return;

    if (nextPlayTimeRef.current < currentTime + 0.02) {
      nextPlayTimeRef.current = currentTime + 0.02;
    }

    const audioBuffer = ctx.createBuffer(1, float32Array.length, SAMPLE_RATE);
    audioBuffer.copyToChannel(float32Array, 0);

    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(ctx.destination);
    source.start(nextPlayTimeRef.current);

    pendingChunksRef.current++;
    source.onended = () => pendingChunksRef.current--;

    nextPlayTimeRef.current += audioBuffer.duration;
  };

  // ---------------- ROOM ----------------
  const joinRoom = () => {
    socket.emit('join-room', room);
  };

  // ---------------- AUDIO START ----------------
  const start = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        sampleRate: SAMPLE_RATE,
      },
    });

    streamRef.current = stream;

    const audioContext = new (window.AudioContext || window.webkitAudioContext)(
      {
        sampleRate: SAMPLE_RATE,
      },
    );

    audioContextRef.current = audioContext;

    const blob = new Blob([workletCode], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    await audioContext.audioWorklet.addModule(url);
    URL.revokeObjectURL(url);

    const source = audioContext.createMediaStreamSource(stream);
    sourceNodeRef.current = source;

    const workletNode = new AudioWorkletNode(audioContext, 'audio-sender');
    workletNodeRef.current = workletNode;

    workletNode.port.onmessage = (e) => {
      socket.emit('audio', e.data);
    };

    source.connect(workletNode);
    setRecording(true);
  };

  const stop = () => {
    workletNodeRef.current?.disconnect();
    sourceNodeRef.current?.disconnect();
    audioContextRef.current?.close();
    streamRef.current?.getTracks().forEach((t) => t.stop());

    workletNodeRef.current = null;
    sourceNodeRef.current = null;
    audioContextRef.current = null;
    streamRef.current = null;

    nextPlayTimeRef.current = 0;
    pendingChunksRef.current = 0;

    setRecording(false);
  };

  // ---------------- CHAT ----------------
  const sendMessage = () => {
    if (!text.trim()) return;

    const msg = {
      text,
      sender: socket.id,
      time: Date.now(),
    };

    socket.emit('text', msg);
    setText('');
  };

  // ---------------- UI ----------------
  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h2 style={styles.title}>🎧 Audio Room</h2>

        {/* ROOM */}
        <div style={styles.card}>
          <input
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            disabled={recording}
            style={styles.input}
            placeholder="Room name"
          />
          <button onClick={joinRoom} disabled={recording} style={styles.button}>
            Join
          </button>
        </div>

        {/* AUDIO */}
        <div style={styles.card}>
          <button onClick={start} disabled={recording} style={styles.start}>
            🎤 Start
          </button>
          <button onClick={stop} disabled={!recording} style={styles.stop}>
            ⛔ Stop
          </button>

          {recording && <span style={styles.live}>● Live</span>}
        </div>

        {/* CHAT */}
        <div style={styles.chat}>
          <div style={styles.chatBox}>
            {messages.map((m, i) => (
              <div key={i} style={styles.msg}>
                <b>{m.sender?.slice(0, 5)}:</b> {m.text}
              </div>
            ))}
          </div>

          <div style={styles.chatInput}>
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type message..."
              style={styles.input}
            />
            <button onClick={sendMessage} style={styles.button}>
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------- STYLES ----------------
const styles = {
  page: {
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: '#0f172a',
    fontFamily: 'sans-serif',
  },
  container: {
    width: 450,
    padding: 20,
    borderRadius: 16,
    background: '#111827',
    color: 'white',
  },
  title: {
    textAlign: 'center',
    marginBottom: 15,
  },
  card: {
    background: '#1f2937',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    display: 'flex',
    gap: 10,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    border: 'none',
    outline: 'none',
  },
  button: {
    padding: '10px 12px',
    borderRadius: 8,
    border: 'none',
    background: '#3b82f6',
    color: 'white',
    cursor: 'pointer',
  },
  start: {
    padding: '10px 12px',
    borderRadius: 8,
    border: 'none',
    background: '#10b981',
    color: 'white',
    cursor: 'pointer',
  },
  stop: {
    padding: '10px 12px',
    borderRadius: 8,
    border: 'none',
    background: '#ef4444',
    color: 'white',
    cursor: 'pointer',
  },
  live: {
    marginLeft: 10,
    color: '#f87171',
    fontWeight: 'bold',
  },
  chat: {
    marginTop: 10,
    background: '#0b1220',
    padding: 10,
    borderRadius: 10,
  },
  chatBox: {
    height: 150,
    overflowY: 'auto',
    marginBottom: 10,
  },
  msg: {
    fontSize: 13,
    padding: 4,
    borderBottom: '1px solid #1f2937',
  },
  chatInput: {
    display: 'flex',
    gap: 10,
  },
};
