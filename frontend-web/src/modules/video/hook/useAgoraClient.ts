import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import AgoraRTC, {
  type IAgoraRTCClient,
  type ILocalVideoTrack,
  type ILocalAudioTrack,
  type IAgoraRTCRemoteUser,
} from 'agora-rtc-sdk-ng';
import type { RemoteUser } from '../types';

interface Params {
  appId: string;
  channelName: string;
  token: string;
  uid: number;
}

interface AgoraClientState {
  clientRef: RefObject<IAgoraRTCClient | null>;
  localVideoRef: RefObject<HTMLDivElement | null>;
  localVideoTrackRef: RefObject<ILocalVideoTrack | null>;
  localAudioTrackRef: RefObject<ILocalAudioTrack | null>;
  screenTrackRef: RefObject<ILocalVideoTrack | null>;
  localVideoTrack: ILocalVideoTrack | null;
  localAudioTrack: ILocalAudioTrack | null;
  remoteUsers: RemoteUser[];
  setRemoteUsers: React.Dispatch<React.SetStateAction<RemoteUser[]>>;
  isCameraOff: boolean;
  setIsCameraOff: React.Dispatch<React.SetStateAction<boolean>>;
  isJoining: boolean;
  error: string | null;
}

export function useAgoraClient({ appId, channelName, token, uid }: Params): AgoraClientState {
  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const localVideoRef = useRef<HTMLDivElement | null>(null);
  const localVideoTrackRef = useRef<ILocalVideoTrack | null>(null);
  const localAudioTrackRef = useRef<ILocalAudioTrack | null>(null);
  const screenTrackRef = useRef<ILocalVideoTrack | null>(null);

  const [localVideoTrack, setLocalVideoTrack] = useState<ILocalVideoTrack | null>(null);
  const [localAudioTrack, setLocalAudioTrack] = useState<ILocalAudioTrack | null>(null);
  const [remoteUsers, setRemoteUsers] = useState<RemoteUser[]>([]);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isJoining, setIsJoining] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

    const subscribeExistingUsers = async () => {
      for (const user of client.remoteUsers) {
        if (user.hasVideo) {
          try {
            await client.subscribe(user, 'video');
            if (user.videoTrack) {
              setRemoteUsers((prev) => {
                const existing = prev.find((u) => u.uid === user.uid);
                if (existing) {
                  if (existing.videoTrack) return prev;
                  return prev.map((u) =>
                    u.uid === user.uid ? { ...u, videoTrack: user.videoTrack } : u,
                  );
                }
                return [...prev, { uid: user.uid as number, videoTrack: user.videoTrack, audioTrack: undefined }];
              });
            }
          } catch {}
        }

        if (user.hasAudio) {
          try {
            await client.subscribe(user, 'audio');
            if (user.audioTrack) {
              setRemoteUsers((prev) => {
                const existing = prev.find((u) => u.uid === user.uid);
                if (existing) {
                  if (existing.audioTrack) return prev;
                  return prev.map((u) =>
                    u.uid === user.uid ? { ...u, audioTrack: user.audioTrack } : u,
                  );
                }
                return [...prev, { uid: user.uid as number, videoTrack: undefined, audioTrack: user.audioTrack }];
              });
              user.audioTrack.play();
            }
          } catch {}
        }
      }
    };

    client.on('connection-state-change', (curState) => {
      if (curState === 'CONNECTED') {
        subscribeExistingUsers();
      }
    });

    const join = async () => {
      try {
        await client.join(appId, channelName, token || null, uid);

        await subscribeExistingUsers();

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
          } catch {}
        }

        if (audioTrack) { localAudioTrackRef.current = audioTrack; setLocalAudioTrack(audioTrack); }
        if (videoTrack) { localVideoTrackRef.current = videoTrack; setLocalVideoTrack(videoTrack); }

        const toPublish = [audioTrack, videoTrack].filter(Boolean) as (ILocalAudioTrack | ILocalVideoTrack)[];
        if (toPublish.length > 0) await client.publish(toPublish);

        await subscribeExistingUsers();
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

  return {
    clientRef,
    localVideoRef,
    localVideoTrackRef,
    localAudioTrackRef,
    screenTrackRef,
    localVideoTrack,
    localAudioTrack,
    remoteUsers,
    setRemoteUsers,
    isCameraOff,
    setIsCameraOff,
    isJoining,
    error,
  };
}
