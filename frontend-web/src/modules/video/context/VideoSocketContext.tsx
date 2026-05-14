import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { io, type Socket } from 'socket.io-client';
import { COLLAB_URL } from '../../../constant/config';
import type { IncomingCallPayload } from '../types';

interface VideoSocketContextValue {
  incomingCall: IncomingCallPayload | null;
  clearIncomingCall: () => void;
  onCallEnded: ((channelName: string) => void) | null;
  setOnCallEnded: (fn: ((channelName: string) => void) | null) => void;
}

const VideoSocketContext = createContext<VideoSocketContextValue | null>(null);

export function VideoSocketProvider({ userId, children }: { userId: number | null; children: ReactNode }) {
  const socketRef = useRef<Socket | null>(null);
  const [incomingCall, setIncomingCall] = useState<IncomingCallPayload | null>(null);
  const [onCallEnded, setOnCallEnded] = useState<((channelName: string) => void) | null>(null);

  const onCallEndedRef = useRef(onCallEnded);
  onCallEndedRef.current = onCallEnded;

  useEffect(() => {
    if (!userId) return;

    const socket = io(`${COLLAB_URL}/video`, {
      transports: ['websocket'],
      query: { userId },
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('register', { userId });
    });

    socket.on('call:incoming', (payload: IncomingCallPayload) => {
      setIncomingCall(payload);
    });

    socket.on('call:ended', ({ channelName }: { channelName: string }) => {
      setIncomingCall((prev) => prev?.channelName === channelName ? null : prev);
      onCallEndedRef.current?.(channelName);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [userId]);

  const clearIncomingCall = useCallback(() => setIncomingCall(null), []);

  return (
    <VideoSocketContext.Provider value={{ incomingCall, clearIncomingCall, onCallEnded, setOnCallEnded }}>
      {children}
    </VideoSocketContext.Provider>
  );
}

export function useVideoSocket() {
  const ctx = useContext(VideoSocketContext);
  if (!ctx) throw new Error('useVideoSocket must be used inside VideoSocketProvider');
  return ctx;
}
