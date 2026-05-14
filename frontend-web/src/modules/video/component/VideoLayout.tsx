import type { RefObject } from 'react';
import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import PushPinIcon from '@mui/icons-material/PushPin';
import { LocalTile, ScreenTile, RemoteTile } from './VideoTile';
import type { RemoteUser, PinnedTarget } from '../types';
import { LOCAL_SCREEN_UID } from '../types';

interface SharedProps {
  localVideoRef: RefObject<HTMLDivElement | null>;
  screenPreviewRef: RefObject<HTMLDivElement | null>;
  userName: string;
  uid: number;
  memberMap: Record<number, { name: string; picture?: string }>;
  remoteUsers: RemoteUser[];
  isCameraOff: boolean;
  isMuted: boolean;
  isJoining: boolean;
  isSharing: boolean;
  pinnedUid: PinnedTarget;
  onPin: (uid: PinnedTarget) => void;
}

export function GridLayout({ localVideoRef, screenPreviewRef, userName, uid, memberMap, remoteUsers, isCameraOff, isMuted, isJoining, isSharing, pinnedUid, onPin }: SharedProps) {
  const totalTiles = 1 + (isSharing ? 1 : 0) + remoteUsers.length;
  return (
    <Box sx={{
      flex: 1, p: 2, overflow: 'hidden',
      display: 'grid', gap: 2,
      gridTemplateColumns: totalTiles === 1 ? '1fr' : totalTiles === 2 ? '1fr 1fr' : 'repeat(auto-fit, minmax(280px, 1fr))',
      gridAutoRows: '1fr',
    }}>
      <LocalTile localVideoRef={localVideoRef} userName={userName} uid={uid} isCameraOff={isCameraOff} isMuted={isMuted} isJoining={isJoining} />
      {isSharing && <ScreenTile screenPreviewRef={screenPreviewRef} userName={userName} pinnedUid={pinnedUid} onPin={onPin} />}
      {remoteUsers.map((u) => (
        <RemoteTile key={u.uid} user={u} memberMap={memberMap} pinnedUid={pinnedUid} onPin={onPin} />
      ))}
    </Box>
  );
}

export function PinnedLayout({ localVideoRef, screenPreviewRef, userName, uid, memberMap, remoteUsers, isCameraOff, isMuted, isJoining, isSharing, pinnedUid, onPin }: SharedProps) {
  const pinnedUser = typeof pinnedUid === 'number' && pinnedUid !== LOCAL_SCREEN_UID
    ? remoteUsers.find((u) => u.uid === pinnedUid)
    : null;

  const pinnedName = pinnedUid === LOCAL_SCREEN_UID
    ? `${userName} (Màn hình)`
    : pinnedUser
      ? (memberMap[pinnedUid as number]?.name ?? `Người dùng ${pinnedUid}`)
      : '';

  return (
    <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden', p: 2, gap: 2 }}>
      {/* Main pinned area */}
      <Box sx={{ flex: 1, position: 'relative', bgcolor: '#1a1d27', borderRadius: 2, overflow: 'hidden' }}>
        {pinnedUid === LOCAL_SCREEN_UID ? (
          <Box
            id="pinned-screen"
            sx={{ width: '100%', height: '100%', '& video': { width: '100% !important', height: '100% !important', objectFit: 'contain' } }}
          />
        ) : (
          <Box
            id="pinned-video"
            sx={{ width: '100%', height: '100%', '& video': { width: '100% !important', height: '100% !important', objectFit: 'contain' } }}
          />
        )}
        <Box sx={{ position: 'absolute', bottom: 12, left: 16 }}>
          <Typography fontSize={13} color="#fff" fontWeight={500} sx={{ textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}>
            {pinnedName}
          </Typography>
        </Box>
        <Tooltip title="Bỏ ghim">
          <IconButton
            size="small"
            onClick={() => onPin(null)}
            sx={{ position: 'absolute', top: 8, right: 8, color: '#fff', bgcolor: 'rgba(0,0,0,0.5)', '&:hover': { bgcolor: 'rgba(0,0,0,0.7)', transform: 'none' } }}
          >
            <PushPinIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
      </Box>

      <Box sx={{ width: 160, display: 'flex', flexDirection: 'column', gap: 1.5, overflowY: 'auto' }}>
        <LocalTile localVideoRef={localVideoRef} userName={userName} uid={uid} isCameraOff={isCameraOff} isMuted={isMuted} isJoining={isJoining} compact />
        {isSharing && <ScreenTile screenPreviewRef={screenPreviewRef} userName={userName} pinnedUid={pinnedUid} onPin={onPin} compact />}
        {remoteUsers.map((u) => (
          <RemoteTile key={u.uid} user={u} memberMap={memberMap} pinnedUid={pinnedUid} onPin={onPin} compact />
        ))}
      </Box>
    </Box>
  );
}
