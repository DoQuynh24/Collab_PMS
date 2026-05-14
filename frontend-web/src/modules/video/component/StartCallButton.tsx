import { IconButton, Tooltip, CircularProgress } from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import { useStartCall } from '../api/start-call';
import { useJoinCall } from '../api/join-call';
import { useActiveRoom } from '../api/get-active-room';
import { useVideoCall } from '../context/VideoCallContext';
import { useGetCurrentUser } from '../../login/api/auth';
import { useGetProjectById } from '../../project/api/get-project-id';

interface Props {
  projectId: string;
}

export function StartCallButton({ projectId }: Props) {
  const { data: currentUser } = useGetCurrentUser();
  const { data: activeRoom } = useActiveRoom(projectId);
  const { data: project } = useGetProjectById(projectId);
  const { mutate: startCall, isPending: isStarting } = useStartCall();
  const { mutate: joinCall, isPending: isJoining } = useJoinCall();
  const { setActiveCall, activeCall } = useVideoCall();

  const isPending = isStarting || isJoining;
  const isInCall = !!activeCall;

  const memberMap: Record<number, { name: string; picture?: string }> = {};
  if (project?.project_members) {
    for (const m of project.project_members) {
      if (m.user) memberMap[m.user_id] = { name: m.user.name, picture: m.user.picture };
    }
  }

  const handleStart = () => {
    if (!currentUser) return;
    startCall(
      { project_id: projectId },
      {
        onSuccess: (data) => setActiveCall({
          ...data,
          userName: currentUser.name,
          memberMap,
          isHost: true,
          projectId,
        }),
      },
    );
  };

  const handleJoinExisting = () => {
    if (!activeRoom || !currentUser) return;
    joinCall(
      { channel_name: activeRoom.channel_name },
      {
        onSuccess: (data) => setActiveCall({
          ...data,
          userName: currentUser.name,
          memberMap,
          isHost: false,
          projectId,
        }),
      },
    );
  };

  if (isInCall) return null;

  if (activeRoom && activeRoom.host_id !== currentUser?.user_id) {
    return (
      <Tooltip title="Tham gia cuộc họp đang diễn ra">
        <IconButton
          size="small"
          onClick={handleJoinExisting}
          disabled={isPending}
          sx={{
            border: '1px solid #16a34a', borderRadius: '6px', p: '5px', color: '#16a34a',
            animation: 'pulse 1.5s infinite',
            '@keyframes pulse': {
              '0%, 100%': { boxShadow: '0 0 0 0 rgba(22,163,74,0.4)' },
              '50%': { boxShadow: '0 0 0 6px rgba(22,163,74,0)' },
            },
          }}
        >
          {isPending ? <CircularProgress size={16} sx={{ color: '#16a34a' }} /> : <VideocamIcon fontSize="small" />}
        </IconButton>
      </Tooltip>
    );
  }

  return (
    <Tooltip title={activeRoom ? 'Bạn đang tổ chức cuộc họp' : 'Bắt đầu cuộc họp video'}>
      <span>
        <IconButton
          size="small"
          onClick={handleStart}
          disabled={isPending || !!activeRoom}
          sx={{
            border: '1px solid #d3d3d3', borderRadius: '6px', p: '5px', color: '#5663ee',
            '&:disabled': { opacity: 0.5 },
          }}
        >
          {isPending ? <CircularProgress size={16} sx={{ color: '#5663ee' }} /> : <VideocamIcon fontSize="small" />}
        </IconButton>
      </span>
    </Tooltip>
  );
}
