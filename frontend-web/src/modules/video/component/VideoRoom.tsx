import { useEffect, useRef, useState, useCallback } from 'react';
import {
  Box, Typography, IconButton, Tooltip, Avatar,
  CircularProgress, Paper,
} from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import CallEndIcon from '@mui/icons-material/CallEnd';
import MinimizeIcon from '@mui/icons-material/Remove';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare';
import AgoraRTC, {
  type IAgoraRTCClient,
  type ILocalVideoTrack,
  type ILocalAudioTrack,
  type IRemoteVideoTrack,
  type IRemoteAudioTrack,
  type IAgoraRTCRemoteUser,
} from 'agora-rtc-sdk-ng';
import { ControlBtn } from './ControlBtn';
import { useVideoSocket } from '../context/VideoSocketContext';
import { useLeaveCall } from '../api/leave-call';
import { leaveCallBeacon } from '../api/leave-call-beacon';

interface RemoteUser {
  uid: number;
  videoTrack?: IRemoteVideoTrack;
  audioTrack?: IRemoteAudioTrack;
}

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
  appId,
  channelName,
  token,
  uid,
  userName,
  memberMap = {},
  roomId,
  isHost,
  onLeave,
  onMinimize,
}: Props) {
  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const localVideoRef = useRef<HTMLDivElement>(null);

  // Ref để tránh stale closure và giữ state qua re-render
  const localVideoTrackRef = useRef<ILocalVideoTrack | null>(null);
  const localAudioTrackRef = useRef<ILocalAudioTrack | null>(null);
  const screenTrackRef = useRef<ILocalVideoTrack | null>(null);
  const roomIdRef = useRef(roomId);
  const onLeaveRef = useRef(onLeave);
  onLeaveRef.current = onLeave;

  const [localVideoTrack, setLocalVideoTrack] = useState<ILocalVideoTrack | null>(null);
  const [localAudioTrack, setLocalAudioTrack] = useState<ILocalAudioTrack | null>(null);
  const [remoteUsers, setRemoteUsers] = useState<RemoteUser[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isJoining, setIsJoining] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
    clientRef.current = client;

    client.on('user-published', async (user, mediaType) => {
      await client.subscribe(user, mediaType);
      setRemoteUsers((prev) => {
        const existing = prev.find((u) => u.uid === user.uid);
        if (existing) {
          return prev.map((u) =>
            u.uid === user.uid
              ? {
                  ...u,
                  videoTrack: mediaType === 'video' ? user.videoTrack : u.videoTrack,
                  audioTrack: mediaType === 'audio' ? user.audioTrack : u.audioTrack,
                }
              : u,
          );
        }
        return [
          ...prev,
          {
            uid: user.uid as number,
            videoTrack: mediaType === 'video' ? user.videoTrack : undefined,
            audioTrack: mediaType === 'audio' ? user.audioTrack : undefined,
          },
        ];
      });
      if (mediaType === 'audio') user.audioTrack?.play();
    });

    client.on('user-unpublished', (user, mediaType) => {
      setRemoteUsers((prev) =>
        prev.map((u) =>
          u.uid === user.uid
            ? {
                ...u,
                videoTrack: mediaType === 'video' ? undefined : u.videoTrack,
                audioTrack: mediaType === 'audio' ? undefined : u.audioTrack,
              }
            : u,
        ),
      );
    });

    client.on('user-left', (user: IAgoraRTCRemoteUser) => {
      setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
    });

    const join = async () => {
      try {
        await client.join(appId, channelName, token || null, uid);

        let audioTrack: ILocalAudioTrack | null = null;
        let videoTrack: ILocalVideoTrack | null = null;

        try {
          const tracks = await AgoraRTC.createMicrophoneAndCameraTracks();
          audioTrack = tracks[0];
          videoTrack = tracks[1];
        } catch {
          try {
            audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
            setIsCameraOff(true);
            setError('camera_busy');
          } catch {
          }
        }

        if (audioTrack) { localAudioTrackRef.current = audioTrack; setLocalAudioTrack(audioTrack); }
        if (videoTrack) { localVideoTrackRef.current = videoTrack; setLocalVideoTrack(videoTrack); }

        const toPublish = [audioTrack, videoTrack].filter(Boolean) as (ILocalAudioTrack | ILocalVideoTrack)[];
        if (toPublish.length > 0) await client.publish(toPublish);
      } catch (err: any) {
        setError(err?.message ?? 'join_failed');
      } finally {
        setIsJoining(false);
      }
    };

    join();

    return () => {
      localVideoTrackRef.current?.stop();
      localVideoTrackRef.current?.close();
      localAudioTrackRef.current?.stop();
      localAudioTrackRef.current?.close();
      client.leave().catch(() => {});
    };
  }, []);

  // ─── Đóng tab → leave (và tự end nếu là người cuối) ─────────────────────
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
    remoteUsers.forEach((u) => {
      if (u.videoTrack) {
        const el = document.getElementById(`remote-video-${u.uid}`);
        if (el) u.videoTrack.play(el as HTMLDivElement);
      }
    });
  }, [remoteUsers]);

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
      setIsSharing(false);
    } else {
      try {
        const screenTrack = await AgoraRTC.createScreenVideoTrack({}, 'disable') as ILocalVideoTrack;
        screenTrackRef.current = screenTrack;

        if (localVideoTrackRef.current) {
          await client.unpublish(localVideoTrackRef.current).catch(() => {});
        }
        await client.publish(screenTrack);

        screenTrack.on('track-ended', async () => {
          await client.unpublish(screenTrack).catch(() => {});
          screenTrack.stop();
          screenTrack.close();
          screenTrackRef.current = null;
          if (localVideoTrackRef.current) {
            await client.publish(localVideoTrackRef.current).catch(() => {});
            if (localVideoRef.current) localVideoTrackRef.current.play(localVideoRef.current);
          }
          setIsSharing(false);
        });

        setIsSharing(true);
      } catch {
      }
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
              <IconButton
                size="small"
                onClick={onMinimize}
                sx={{ color: '#9ca3af', '&:hover': { color: '#fff', transform: 'none' } }}
              >
                <MinimizeIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>

      {error === 'camera_busy' && (
        <Box sx={{ px: 3, py: 1, bgcolor: '#7c2d12', borderBottom: '1px solid #9a3412' }}>
          <Typography color="#fca5a5" fontSize={13}>
            ⚠️ Camera đang bị chiếm bởi ứng dụng khác. Bạn đang tham gia chỉ với âm thanh.
          </Typography>
        </Box>
      )}
      {error && error !== 'camera_busy' && (
        <Box sx={{ px: 3, py: 1, bgcolor: '#7c2d12', borderBottom: '1px solid #9a3412' }}>
          <Typography color="#fca5a5" fontSize={13}>⚠️ Không thể kết nối: {error}</Typography>
        </Box>
      )}

      <Box sx={{
        flex: 1, p: 2, overflow: 'hidden',
        display: 'grid', gap: 2,
        gridTemplateColumns: totalParticipants === 1 ? '1fr' : totalParticipants === 2 ? '1fr 1fr' : 'repeat(auto-fit, minmax(280px, 1fr))',
        gridAutoRows: '1fr',
      }}>
        <Paper sx={{ position: 'relative', bgcolor: '#1a1d27', borderRadius: 2, overflow: 'hidden', border: '2px solid #5663ee', minHeight: 200 }}>
          {isJoining ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <CircularProgress size={32} sx={{ color: '#5663ee' }} />
            </Box>
          ) : (
            <>
              <Box
                ref={localVideoRef}
                sx={{
                  width: '100%', height: '100%', minHeight: 200,
                  visibility: isCameraOff ? 'hidden' : 'visible',
                  '& video': { width: '100% !important', height: '100% !important', objectFit: 'cover' },
                }}
              />
              {isCameraOff && (
                <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#1a1d27' }}>
                  <Avatar sx={{ width: 72, height: 72, bgcolor: '#5663ee', fontSize: 28 }}>
                    {userName.charAt(0).toUpperCase()}
                  </Avatar>
                </Box>
              )}
            </>
          )}
          <Box sx={{ position: 'absolute', bottom: 8, left: 12, display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography fontSize={12} color="#fff" sx={{ textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
              {userName} (Bạn)
            </Typography>
            {isMuted && <MicOffIcon sx={{ fontSize: 14, color: '#ef4444' }} />}
          </Box>
        </Paper>

        {remoteUsers.map((u) => {
          const member = memberMap[u.uid];
          const displayName = member?.name ?? `Người dùng ${u.uid}`;
          return (
            <Paper key={u.uid} sx={{ position: 'relative', bgcolor: '#1a1d27', borderRadius: 2, overflow: 'hidden', minHeight: 200 }}>
              <Box
                id={`remote-video-${u.uid}`}
                sx={{
                  width: '100%', height: '100%', minHeight: 200,
                  visibility: u.videoTrack ? 'visible' : 'hidden',
                  '& video': { width: '100% !important', height: '100% !important', objectFit: 'cover' },
                }}
              />
              {!u.videoTrack && (
                <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#1a1d27' }}>
                  <Avatar src={member?.picture} sx={{ width: 72, height: 72, bgcolor: '#374151', fontSize: 28 }}>
                    {displayName.charAt(0).toUpperCase()}
                  </Avatar>
                </Box>
              )}
              <Box sx={{ position: 'absolute', bottom: 8, left: 12 }}>
                <Typography fontSize={12} color="#fff" sx={{ textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
                  {displayName}
                </Typography>
              </Box>
            </Paper>
          );
        })}
      </Box>

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
            <IconButton
              onClick={handleLeave}
              sx={{
                width: 52, height: 52,
                bgcolor: '#ef4444',
                color: '#fff',
                '&:hover': { bgcolor: '#dc2626', transform: 'none' },
              }}
            >
              <CallEndIcon />
            </IconButton>
          </Tooltip>
          <Typography fontSize={11} color="#ef4444" fontWeight={500}>
            Rời phòng
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
