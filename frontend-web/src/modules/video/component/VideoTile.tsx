import type { RefObject } from 'react';
import { Box, Typography, Avatar, IconButton, Tooltip, Paper } from '@mui/material';
import MicOffIcon from '@mui/icons-material/MicOff';
import PushPinIcon from '@mui/icons-material/PushPin';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import type { RemoteUser, PinnedTarget } from '../types';
import { LOCAL_SCREEN_UID } from '../types';

interface LocalTileProps {
  localVideoRef: RefObject<HTMLDivElement | null>;
  userName: string;
  uid: number;
  isCameraOff: boolean;
  isMuted: boolean;
  isJoining: boolean;
  compact?: boolean;
}

interface ScreenTileProps {
  screenPreviewRef: RefObject<HTMLDivElement | null>;
  userName: string;
  pinnedUid: PinnedTarget;
  onPin: (uid: PinnedTarget) => void;
  compact?: boolean;
}

interface RemoteTileProps {
  user: RemoteUser;
  memberMap: Record<number, { name: string; picture?: string }>;
  pinnedUid: PinnedTarget;
  onPin: (uid: PinnedTarget) => void;
  compact?: boolean;
}

export function LocalTile({ localVideoRef, userName, isCameraOff, isMuted, isJoining, compact = false }: LocalTileProps) {
  return (
    <Paper sx={{
      position: 'relative', bgcolor: '#1a1d27', borderRadius: 2, overflow: 'hidden',
      border: '2px solid #5663ee', minHeight: compact ? 80 : 200,
    }}>
      {isJoining ? (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }} />
      ) : (
        <>
          <Box
            ref={localVideoRef}
            sx={{
              width: '100%', height: '100%', minHeight: compact ? 80 : 200,
              visibility: isCameraOff ? 'hidden' : 'visible',
              '& video': { width: '100% !important', height: '100% !important', objectFit: 'cover' },
            }}
          />
          {isCameraOff && (
            <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#1a1d27' }}>
              <Avatar sx={{ width: compact ? 36 : 72, height: compact ? 36 : 72, bgcolor: '#5663ee', fontSize: compact ? 14 : 28 }}>
                {userName.charAt(0).toUpperCase()}
              </Avatar>
            </Box>
          )}
        </>
      )}
      <Box sx={{ position: 'absolute', bottom: 4, left: 8, display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Typography fontSize={compact ? 10 : 12} color="#fff" sx={{ textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
          {compact ? userName.split(' ').pop() : `${userName} (Bạn)`}
        </Typography>
        {isMuted && <MicOffIcon sx={{ fontSize: compact ? 10 : 14, color: '#ef4444' }} />}
      </Box>
    </Paper>
  );
}

export function ScreenTile({ screenPreviewRef, userName, pinnedUid, onPin, compact = false }: ScreenTileProps) {
  const isPinned = pinnedUid === LOCAL_SCREEN_UID;
  return (
    <Paper
      sx={{
        position: 'relative', bgcolor: '#1a1d27', borderRadius: 2, overflow: 'hidden',
        border: isPinned ? '2px solid #5663ee' : '2px solid #374151',
        minHeight: compact ? 80 : 200, cursor: 'pointer',
        '&:hover .pin-btn': { opacity: 1 },
      }}
      onClick={() => onPin(isPinned ? null : LOCAL_SCREEN_UID)}
    >
      <Box
        ref={screenPreviewRef}
        sx={{
          width: '100%', height: '100%', minHeight: compact ? 80 : 200,
          '& video': { width: '100% !important', height: '100% !important', objectFit: 'contain' },
        }}
      />
      <Box sx={{ position: 'absolute', bottom: 4, left: 8 }}>
        <Typography fontSize={compact ? 10 : 12} color="#fff" sx={{ textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
          {compact ? 'Màn hình' : `Màn hình của ${userName}`}
        </Typography>
      </Box>
      <PinButton isPinned={isPinned} onToggle={(e) => { e.stopPropagation(); onPin(isPinned ? null : LOCAL_SCREEN_UID); }} />
    </Paper>
  );
}

export function RemoteTile({ user, memberMap, pinnedUid, onPin, compact = false }: RemoteTileProps) {
  const member = memberMap[user.uid];
  const displayName = member?.name ?? `Người dùng ${user.uid}`;
  const shortName = displayName.split(' ').pop() ?? displayName;
  const isPinned = pinnedUid === user.uid;

  return (
    <Paper
      sx={{
        position: 'relative', bgcolor: '#1a1d27', borderRadius: 2, overflow: 'hidden',
        border: isPinned ? '2px solid #5663ee' : '2px solid transparent',
        minHeight: compact ? 80 : 200, cursor: 'pointer',
        '&:hover .pin-btn': { opacity: 1 },
      }}
      onClick={() => compact && onPin(isPinned ? null : user.uid)}
    >
      <Box
        id={`remote-video-${user.uid}`}
        sx={{
          width: '100%', height: '100%', minHeight: compact ? 80 : 200,
          visibility: user.videoTrack ? 'visible' : 'hidden',
          '& video': { width: '100% !important', height: '100% !important', objectFit: 'cover' },
        }}
      />
      {!user.videoTrack && (
        <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#1a1d27' }}>
          <Avatar src={member?.picture} sx={{ width: compact ? 36 : 72, height: compact ? 36 : 72, bgcolor: '#374151', fontSize: compact ? 14 : 28 }}>
            {displayName.charAt(0).toUpperCase()}
          </Avatar>
        </Box>
      )}
      <Box sx={{ position: 'absolute', bottom: 4, left: 8 }}>
        <Typography fontSize={compact ? 10 : 12} color="#fff" sx={{ textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
          {compact ? shortName : displayName}
        </Typography>
      </Box>
      <PinButton isPinned={isPinned} onToggle={(e) => { e.stopPropagation(); onPin(isPinned ? null : user.uid); }} />
    </Paper>
  );
}

function PinButton({ isPinned, onToggle }: { isPinned: boolean; onToggle: (e: React.MouseEvent) => void }) {
  return (
    <Tooltip title={isPinned ? 'Bỏ ghim' : 'Ghim màn hình này'}>
      <IconButton
        className="pin-btn"
        size="small"
        onClick={onToggle}
        sx={{
          position: 'absolute', top: 4, right: 4,
          opacity: 0, color: '#fff',
          bgcolor: 'rgba(0,0,0,0.5)', transition: 'opacity 0.15s',
          '&:hover': { transform: 'none', bgcolor: 'rgba(0,0,0,0.7)' },
        }}
      >
        {isPinned ? <PushPinIcon sx={{ fontSize: 14 }} /> : <PushPinOutlinedIcon sx={{ fontSize: 14 }} />}
      </IconButton>
    </Tooltip>
  );
}
