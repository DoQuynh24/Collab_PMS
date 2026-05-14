import {
  Box, Typography, Avatar, Button, Paper, IconButton, Tooltip,
} from '@mui/material';
import CallIcon from '@mui/icons-material/Call';
import CallEndIcon from '@mui/icons-material/CallEnd';
import VideocamIcon from '@mui/icons-material/Videocam';
import CloseIcon from '@mui/icons-material/Close';
import { useJoinCall } from '../api/join-call';
import { useVideoCall } from '../context/VideoCallContext';
import type { IncomingCallPayload } from '../types';
import { useGetCurrentUser } from '../../login/api/auth';
import { useGetProjectById } from '../../project/api/get-project-id';

interface Props {
  call: IncomingCallPayload;
  onDismiss: () => void;
}

export function IncomingCallBanner({ call, onDismiss }: Props) {
  const { mutate: joinCall, isPending } = useJoinCall();
  const { data: currentUser } = useGetCurrentUser();
  const { data: project } = useGetProjectById(call.projectId);
  const { setActiveCall } = useVideoCall();

  const memberMap: Record<number, { name: string; picture?: string }> = {};
  if (project?.project_members) {
    for (const m of project.project_members) {
      if (m.user) memberMap[m.user_id] = { name: m.user.name, picture: m.user.picture };
    }
  }

  const handleAccept = () => {
    if (!currentUser) return;
    joinCall(
      { channel_name: call.channelName },
      {
        onSuccess: (data) => {
          setActiveCall({
            ...data,
            userName: currentUser.name,
            memberMap,
            isHost: false,
            projectId: call.projectId,
          });
          onDismiss();
        },
      },
    );
  };

  return (
    <Paper
      elevation={8}
      sx={{
        position: 'fixed', top: 80, right: 24, zIndex: 1500,
        width: 320, borderRadius: 3, overflow: 'hidden',
        border: '1px solid #e5e7eb',
        animation: 'slideIn 0.3s ease',
        '@keyframes slideIn': {
          from: { transform: 'translateX(120%)', opacity: 0 },
          to: { transform: 'translateX(0)', opacity: 1 },
        },
      }}
    >
      <Box sx={{ bgcolor: '#5663ee', px: 2, py: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <VideocamIcon sx={{ color: '#fff', fontSize: 18 }} />
          <Typography color="#fff" fontSize={13} fontWeight={600}>Cuộc gọi video đến</Typography>
        </Box>
        <Tooltip title="Đóng thông báo">
          <IconButton
            size="small"
            onClick={onDismiss}
            sx={{ color: 'rgba(255,255,255,0.8)', p: 0.5, '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.15)', transform: 'none' } }}
          >
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      </Box>

      <Box sx={{ px: 2.5, py: 2, bgcolor: '#fff' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
          <Avatar src={call.hostPicture} sx={{ width: 44, height: 44, bgcolor: '#5663ee' }}>
            {call.hostName.charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography fontWeight={600} fontSize={14} color="#111827">{call.hostName}</Typography>
            <Typography fontSize={12} color="#6b7280">{call.projectName}</Typography>
          </Box>
        </Box>

        <Typography fontSize={13} color="#374151" mb={2}>
          Đang mời bạn tham gia cuộc họp nhóm
        </Typography>

        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            fullWidth variant="outlined"
            startIcon={<CallEndIcon />}
            onClick={onDismiss}
            sx={{ textTransform: 'none', borderColor: '#ef4444', color: '#ef4444', '&:hover': { borderColor: '#dc2626', bgcolor: '#fef2f2' }, borderRadius: 2 }}
          >
            Từ chối
          </Button>
          <Button
            fullWidth variant="contained"
            startIcon={<CallIcon />}
            onClick={handleAccept}
            disabled={isPending}
            sx={{ textTransform: 'none', bgcolor: '#16a34a', '&:hover': { bgcolor: '#15803d' }, borderRadius: 2 }}
          >
            {isPending ? 'Đang kết nối...' : 'Tham gia'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}
