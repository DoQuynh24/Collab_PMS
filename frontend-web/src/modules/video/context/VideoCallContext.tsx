import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { StartCallResponse, JoinCallResponse } from '../types';
import { videoKeys } from '../api/video-keys';

export type ActiveCallData = (StartCallResponse | JoinCallResponse) & {
  userName: string;
  memberMap: Record<number, { name: string; picture?: string }>;
  isHost: boolean;
  projectId: string;
};

interface VideoCallContextValue {
  activeCall: ActiveCallData | null;
  setActiveCall: (call: ActiveCallData) => void;
  clearActiveCall: () => void;
  isMinimized: boolean;
  setMinimized: (v: boolean) => void;
  onForceLeave: (() => void) | null;
  setOnForceLeave: (fn: (() => void) | null) => void;
}

const VideoCallContext = createContext<VideoCallContextValue | null>(null);

export function VideoCallProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient();
  const [activeCall, setActiveCallState] = useState<ActiveCallData | null>(null);
  const [isMinimized, setMinimized] = useState(false);
  const [onForceLeave, setOnForceLeave] = useState<(() => void) | null>(null);

  const setActiveCall = useCallback((call: ActiveCallData) => {
    setActiveCallState(call);
    setMinimized(false);
  }, []);

  const clearActiveCall = useCallback(() => {
    if (activeCall?.projectId) {
      qc.invalidateQueries({ queryKey: videoKeys.activeRoom(activeCall.projectId) });
    }
    setActiveCallState(null);
    setMinimized(false);
  }, [activeCall?.projectId, qc]);

  return (
    <VideoCallContext.Provider value={{
      activeCall, setActiveCall, clearActiveCall,
      isMinimized, setMinimized,
      onForceLeave, setOnForceLeave,
    }}>
      {children}
    </VideoCallContext.Provider>
  );
}

export function useVideoCall() {
  const ctx = useContext(VideoCallContext);
  if (!ctx) throw new Error('useVideoCall must be used inside VideoCallProvider');
  return ctx;
}
