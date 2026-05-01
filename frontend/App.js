import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://192.168.1.10:3000'); // CHANGE THIS

export default function App() {
  const recorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const [room, setRoom] = useState('room1');

  useEffect(() => {
    audioContextRef.current = new (
      window.AudioContext || window.webkitAudioContext
    )();

    socket.on('connect', () => {
      console.log('Connected:', socket.id);
    });

    socket.on('audio', async (data) => {
      let arrayBuffer;

      if (data instanceof ArrayBuffer) {
        arrayBuffer = data;
      } else if (data instanceof Blob) {
        arrayBuffer = await data.arrayBuffer();
      } else if (data?.buffer instanceof ArrayBuffer) {
        arrayBuffer = data.buffer.slice(
          data.byteOffset,
          data.byteOffset + data.byteLength,
        );
      } else {
        console.error('Unknown audio data type:', data);
        return;
      }

      const audioContext = audioContextRef.current;
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start();
    });

    return () => socket.off('audio');
  }, []);

  const joinRoom = () => {
    socket.emit('join-room', room);
    console.log('Joined room:', room);
  };

  const start = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const recorder = new MediaRecorder(stream);
    recorderRef.current = recorder;

    recorder.ondataavailable = async (e) => {
      if (e.data.size > 0) {
        const arrayBuffer = await e.data.arrayBuffer();
        socket.emit('audio', arrayBuffer);
      }
    };

    recorder.start(250);
  };

  const stop = () => {
    recorderRef.current?.stop();
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Audio Room</h2>

      <input
        value={room}
        onChange={(e) => setRoom(e.target.value)}
        placeholder="room"
      />

      <button onClick={joinRoom}>Join Room</button>

      <br />
      <br />

      <button onClick={start}>Start Mic</button>
      <button onClick={stop}>Stop</button>
    </div>
  );
}
