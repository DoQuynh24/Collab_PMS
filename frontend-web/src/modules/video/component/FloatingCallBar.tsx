import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import CallEndIcon from '@mui/icons-material/CallEnd';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import { useVideoCall } from '../context/VideoCallContext';
import { useEndCall } from '../api/end-call';
import { useLeaveCall } from '../api/leave-call';

export function FloatingCallBar() {
  const { activeCall, clearActiveCall, setMinimized } = useVideoCall();
  const { mutate: endCall } = useEndCall();
  const { mutate: leaveCall } = useLeaveCall();

  if (!activeCall) return null;

  const handleLeave = () => {
    if (activeCall.isHost) {
      endCall({ roomId: activeCall.room.id, projectId: activeCall.projectId });
    } else {
      leaveCall({ roomId: activeCall.room.id });
    }
    clearActiveCall();
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 1400,
        bgcolor: '#1a1d27',
        border: '1px solid #2d3148',
        borderRadius: 3,
        px: 2,
        py: 1.5,
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        minWidth: 220,
        animation: 'slideUp 0.25s ease',
        '@keyframes slideUp': {
          from: { transform: 'translateY(80px)', opacity: 0 },
          to: { transform: 'translateY(0)', opacity: 1 },
        },
      }}
    >
      <Box sx={{
        width: 10, height: 10, borderRadius: '50%', bgcolor: '#16a34a', flexShrink: 0,
        animation: 'pulse 1.5s infinite',
        '@keyframes pulse': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(22,163,74,0.5)' },
          '50%': { boxShadow: '0 0 0 6px rgba(22,163,74,0)' },
        },
      }} />

      <VideocamIcon sx={{ color: '#9ca3af', fontSize: 18 }} />

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography fontSize={13} fontWeight={600} color="#fff" noWrap>
          Đang trong cuộc họp
        </Typography>
        <Typography fontSize={11} color="#6b7280" noWrap>
          {activeCall.isHost ? 'Bạn là người tổ chức' : 'Thành viên'}
        </Typography>
      </Box>

      <Tooltip title="Mở lại cuộc họp">
        <IconButton
          size="small"
          onClick={() => setMinimized(false)}
          sx={{ color: '#5663ee', '&:hover': { color: '#818cf8', transform: 'none' } }}
        >
          <OpenInFullIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Tooltip>

      <Tooltip title={activeCall.isHost ? 'Kết thúc cuộc họp' : 'Rời cuộc họp'}>
        <IconButton
          size="small"
          onClick={handleLeave}
          sx={{
            color: activeCall.isHost ? '#ef4444' : '#f97316',
            '&:hover': { color: activeCall.isHost ? '#dc2626' : '#ea6c00', transform: 'none' },
          }}
        >
          <CallEndIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Tooltip>
    </Box>
  );
}
