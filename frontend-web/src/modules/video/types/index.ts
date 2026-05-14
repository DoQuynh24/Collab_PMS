export interface VideoRoom {
  id: number;
  channel_name: string;
  project_id: string;
  host_id: number;
  status: 'active' | 'ended';
  created_at: string;
  host?: {
    user_id: number;
    name: string;
    picture?: string;
  };
}

export interface StartCallResponse {
  room: VideoRoom;
  token: string;
  channelName: string;
  appId: string;
}

export interface JoinCallResponse {
  room: VideoRoom;
  token: string;
  channelName: string;
  appId: string;
}

export interface IncomingCallPayload {
  roomId: number;
  channelName: string;
  projectId: string;
  projectName: string;
  hostId: number;
  hostName: string;
  hostPicture?: string;
}

export interface RemoteUser {
  uid: number;
  videoTrack?: import('agora-rtc-sdk-ng').IRemoteVideoTrack;
  audioTrack?: import('agora-rtc-sdk-ng').IRemoteAudioTrack;
}

export const LOCAL_SCREEN_UID = -1 as const;

export type PinnedTarget = typeof LOCAL_SCREEN_UID | number | null;
