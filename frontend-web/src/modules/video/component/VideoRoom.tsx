import { useEffect, useRef, useState, useCallback } from 'react';
import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import CallEndIcon from '@mui/icons-material/CallEnd';
import MinimizeIcon from '@mui/icons-material/Remove';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare';
import AgoraRTC, { type ILocalVideoTrack } from 'agora-rtc-sdk-ng';
import { ControlBtn } from './ControlBtn';
import { GridLayout, PinnedLayout } from './VideoLayout';
import { useAgoraClient } from '../hook/useAgoraClient';
import { useVideoSocket } from '../context/VideoSocketContext';
import { useLeaveCall } from '../api/leave-call';
import { leaveCallBeacon } from '../api/leave-call-beacon';
import type { PinnedTarget } from '../types';
import { LOCAL_SCREEN_UID } from '../types';

interface Props {
  appId: string;
  channelName: string;
  token: string;
  uid: number;
  userName: string;
  memberMap?: Record<number, { name: string; picture?: string }>;
  roomId: number;
  isHost: boolean;
  onLeave: () => void;
  onMinimize?: () => void;
}

export function VideoRoom({
  appId, channelName, token, uid, userName,
  memberMap = {}, roomId, isHost, onLeave, onMinimize,
}: Props) {
  const screenPreviewRef = useRef<HTMLDivElement>(null);
  const roomIdRef = useRef(roomId);
  const onLeaveRef = useRef(onLeave);
  onLeaveRef.current = onLeave;

  const {
    clientRef, localVideoRef, localVideoTrackRef, localAudioTrackRef, screenTrackRef,
    localVideoTrack, localAudioTrack, remoteUsers,
    isCameraOff, setIsCameraOff, isJoining, error,
  } = useAgoraClient({ appId, channelName, token, uid });

  const [isMuted, setIsMuted] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [pinnedUid, setPinnedUid] = useState<PinnedTarget>(null);

  const { setOnCallEnded } = useVideoSocket();
  const { mutate: leaveCall } = useLeaveCall();

  useEffect(() => {
    if (isHost) return;
    setOnCallEnded((endedChannelName: string) => {
      if (endedChannelName !== channelName) return;
      localVideoTrackRef.current?.stop();
      localVideoTrackRef.current?.close();
      localAudioTrackRef.current?.stop();
      localAudioTrackRef.current?.close();
      clientRef.current?.leave().catch(() => {});
      onLeaveRef.current();
    });
    return () => setOnCallEnded(null);
  }, [isHost, channelName]);

  useEffect(() => {
    const uids = remoteUsers.map((u) => u.uid);
    setPinnedUid((prev) => (typeof prev === 'number' && prev !== LOCAL_SCREEN_UID && !uids.includes(prev) ? null : prev));
  }, [remoteUsers]);

  useEffect(() => {
    const handleBeforeUnload = () => leaveCallBeacon(roomIdRef.current);
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  useEffect(() => {
    if (localVideoTrack && localVideoRef.current && !isCameraOff) {
      localVideoTrack.play(localVideoRef.current);
    }
  }, [localVideoTrack, isCameraOff]);

  useEffect(() => {
    if (isSharing && screenTrackRef.current && screenPreviewRef.current) {
      screenTrackRef.current.play(screenPreviewRef.current);
    }
  }, [isSharing]);

  useEffect(() => {
    const timer = setTimeout(() => {
      remoteUsers.forEach((u) => {
        if (u.videoTrack) {
          const el = document.getElementById(`remote-video-${u.uid}`);
          if (el) u.videoTrack.play(el as HTMLDivElement);
        }
      });
    }, 100);
    return () => clearTimeout(timer);
  }, [remoteUsers]);

  useEffect(() => {
    if (pinnedUid === null) return;
    if (pinnedUid === LOCAL_SCREEN_UID) {
      const el = document.getElementById('pinned-screen');
      if (el && screenTrackRef.current) screenTrackRef.current.play(el as HTMLDivElement);
    } else {
      const user = remoteUsers.find((u) => u.uid === pinnedUid);
      const el = document.getElementById('pinned-video');
      if (el && user?.videoTrack) user.videoTrack.play(el as HTMLDivElement);
    }
  }, [pinnedUid, remoteUsers]);

  const toggleMic = useCallback(async () => {
    if (!localAudioTrack) return;
    const newMuted = !isMuted;
    await localAudioTrack.setEnabled(!newMuted);
    setIsMuted(newMuted);
  }, [localAudioTrack, isMuted]);

  const toggleCamera = useCallback(async () => {
    if (!localVideoTrack) return;
    const newOff = !isCameraOff;
    await localVideoTrack.setEnabled(!newOff);
    setIsCameraOff(newOff);
    if (!newOff && localVideoRef.current) localVideoTrack.play(localVideoRef.current);
  }, [localVideoTrack, isCameraOff]);

  const toggleScreenShare = useCallback(async () => {
    const client = clientRef.current;
    if (!client) return;

    if (isSharing) {
      if (screenTrackRef.current) {
        await client.unpublish(screenTrackRef.current).catch(() => {});
        screenTrackRef.current.stop();
        screenTrackRef.current.close();
        screenTrackRef.current = null;
      }
      if (localVideoTrackRef.current) {
        await client.publish(localVideoTrackRef.current).catch(() => {});
        if (localVideoRef.current) localVideoTrackRef.current.play(localVideoRef.current);
      }
      setPinnedUid((prev) => (prev === LOCAL_SCREEN_UID ? null : prev));
      setIsSharing(false);
    } else {
      try {
        const screenTrack = await AgoraRTC.createScreenVideoTrack({}, 'disable') as ILocalVideoTrack;
        screenTrackRef.current = screenTrack;

        if (localVideoTrackRef.current) {
          await client.unpublish(localVideoTrackRef.current).catch(() => {});
        }
        await client.publish(screenTrack);
        setPinnedUid(LOCAL_SCREEN_UID);

        screenTrack.on('track-ended', async () => {
          await client.unpublish(screenTrack).catch(() => {});
          screenTrack.stop();
          screenTrack.close();
          screenTrackRef.current = null;
          if (localVideoTrackRef.current) {
            await client.publish(localVideoTrackRef.current).catch(() => {});
            if (localVideoRef.current) localVideoTrackRef.current.play(localVideoRef.current);
          }
          setPinnedUid((prev) => (prev === LOCAL_SCREEN_UID ? null : prev));
          setIsSharing(false);
        });

        setIsSharing(true);
      } catch {}
    }
  }, [isSharing, localVideoTrack]);

  const handleLeave = useCallback(async () => {
    if (screenTrackRef.current) {
      await clientRef.current?.unpublish(screenTrackRef.current).catch(() => {});
      screenTrackRef.current.stop();
      screenTrackRef.current.close();
      screenTrackRef.current = null;
    }
    localVideoTrackRef.current?.stop();
    localVideoTrackRef.current?.close();
    localAudioTrackRef.current?.stop();
    localAudioTrackRef.current?.close();
    await clientRef.current?.leave().catch(() => {});
    leaveCall({ roomId: roomIdRef.current });
    onLeave();
  }, [leaveCall, onLeave]);

  const layoutProps = {
    localVideoRef, screenPreviewRef, userName, uid, memberMap,
    remoteUsers, isCameraOff, isMuted, isJoining, isSharing,
    pinnedUid, onPin: setPinnedUid,
  };

  const totalParticipants = 1 + remoteUsers.length;

  return (
    <Box sx={{ position: 'fixed', inset: 0, zIndex: 2000, bgcolor: '#0f1117', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ px: 3, py: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1e2130' }}>
        <Typography color="#fff" fontWeight={600} fontSize={15}>Cuộc họp nhóm</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography color="#9ca3af" fontSize={13}>
            {isJoining ? 'Đang kết nối...' : `${totalParticipants} người tham gia`}
          </Typography>
          {onMinimize && (
            <Tooltip title="Thu nhỏ — vẫn trong cuộc họp">
              <IconButton size="small" onClick={onMinimize} sx={{ color: '#9ca3af', '&:hover': { color: '#fff', transform: 'none' } }}>
                <MinimizeIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>

      {error === 'camera_busy' && (
        <Box sx={{ px: 3, py: 1, bgcolor: '#7c2d12', borderBottom: '1px solid #9a3412' }}>
          <Typography color="#fca5a5" fontSize={13}>⚠️ Camera đang bị chiếm. Bạn đang tham gia chỉ với âm thanh.</Typography>
        </Box>
      )}
      {error && error !== 'camera_busy' && (
        <Box sx={{ px: 3, py: 1, bgcolor: '#7c2d12', borderBottom: '1px solid #9a3412' }}>
          <Typography color="#fca5a5" fontSize={13}>⚠️ Không thể kết nối: {error}</Typography>
        </Box>
      )}

      {pinnedUid !== null
        ? <PinnedLayout {...layoutProps} />
        : <GridLayout {...layoutProps} />
      }

      <Box sx={{ py: 2.5, display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 3, borderTop: '1px solid #1e2130' }}>
        <ControlBtn label={isMuted ? 'Bật mic' : 'Tắt mic'} active={isMuted} disabled={!localAudioTrack} onClick={toggleMic}>
          {isMuted ? <MicOffIcon /> : <MicIcon />}
        </ControlBtn>

        <ControlBtn label={isCameraOff ? 'Bật camera' : 'Tắt camera'} active={isCameraOff} disabled={!localVideoTrack} onClick={toggleCamera}>
          {isCameraOff ? <VideocamOffIcon /> : <VideocamIcon />}
        </ControlBtn>

        <ControlBtn label={isSharing ? 'Dừng chia sẻ' : 'Chia sẻ màn hình'} active={isSharing} onClick={toggleScreenShare}>
          {isSharing ? <StopScreenShareIcon /> : <ScreenShareIcon />}
        </ControlBtn>

        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
          <Tooltip title="Rời cuộc họp">
            <IconButton onClick={handleLeave} sx={{ width: 52, height: 52, bgcolor: '#ef4444', color: '#fff', '&:hover': { bgcolor: '#dc2626', transform: 'none' } }}>
              <CallEndIcon />
            </IconButton>
          </Tooltip>
          <Typography fontSize={11} color="#ef4444" fontWeight={500}>Rời phòng</Typography>
        </Box>
      </Box>
    </Box>
  );
}
