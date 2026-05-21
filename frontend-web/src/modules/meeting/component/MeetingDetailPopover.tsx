import { useContext } from 'react';
import {
  Popover, Box, Typography, Avatar, AvatarGroup,
  Button, Divider, Tooltip, IconButton,
} from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PeopleIcon from '@mui/icons-material/People';
import VideocamIcon from '@mui/icons-material/Videocam';
import CancelIcon from '@mui/icons-material/Cancel';
import CloseIcon from '@mui/icons-material/Close';
import type { MeetingSchedule } from '../types/index';
import { useCancelMeeting } from '../api/cancel-meeting';
import { ToastContext } from '../../../components/notification/NotifiProvider';
import { ModalConfirm } from '../../../components/modal/modalConfirm';
import { useState } from 'react';

interface Props {
  meeting: MeetingSchedule | null;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  currentUserId?: number;
  projectId: string;
  onStartCall?: (meeting: MeetingSchedule) => void;
}

export function MeetingDetailPopover({ meeting, anchorEl, onClose, currentUserId, projectId, onStartCall }: Props) {
  const { mutate: cancelMeeting, isPending } = useCancelMeeting(projectId);
  const { showToast } = useContext(ToastContext)!;
  const [confirmCancel, setConfirmCancel] = useState(false);

  if (!meeting) return null;

  const startTime = new Date(meeting.start_time);
  const isCreator = meeting.created_by === currentUserId;
  const now = new Date();
  const canCancel = isCreator && meeting.status === 'scheduled' && startTime > now;
  const isNow = startTime <= now;
  const isSoon = !isNow && startTime > now && (startTime.getTime() - now.getTime()) <= 30 * 60 * 1000;

  const formatTime = (d: Date) =>
    d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

  const formatDate = (d: Date) =>
    d.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const handleCancel = () => {
    cancelMeeting(meeting.id, {
      onSuccess: () => { showToast('Đã hủy lịch họp', 'success'); onClose(); },
      onError: (err: any) => showToast(err?.response?.data?.message || 'Hủy thất bại', 'error'),
    });
  };

  return (
    <>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={onClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{ paper: { sx: { width: 340, borderRadius: 2, boxShadow: '0 8px 32px rgba(0,0,0,0.12)' } } }}
      >
        <Box sx={{ p: 2.5 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: isNow ? '#16a34a' : isSoon ? '#f59e0b' : '#5663ee', flexShrink: 0, mt: 0.3 }} />
              <Typography fontWeight={700} fontSize={15} color="#111827" sx={{ lineHeight: 1.3 }}>
                {meeting.title}
              </Typography>
            </Box>
            <IconButton size="small" onClick={onClose} sx={{ mt: -0.5 }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          {meeting.status === 'cancelled' && (
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.3, bgcolor: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 1, mb: 1.5 }}>
              <Typography fontSize={12} color="#dc2626" fontWeight={600}>❌ Đã hủy</Typography>
            </Box>
          )}
          {meeting.status === 'completed' && (
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.3, bgcolor: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: 1, mb: 1.5 }}>
              <Typography fontSize={12} color="#6b7280" fontWeight={600}>✓ Đã kết thúc</Typography>
            </Box>
          )}
          {isNow && meeting.status === 'scheduled' && (
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.3, bgcolor: '#f0fdf4', border: '1px solid #86efac', borderRadius: 1, mb: 1.5 }}>
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#16a34a', animation: 'pulse 1.5s infinite', '@keyframes pulse': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.4 } } }} />
              <Typography fontSize={12} color="#16a34a" fontWeight={600}>Đang diễn ra</Typography>
            </Box>
          )}
          {isSoon && meeting.status === 'scheduled' && (
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.3, bgcolor: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 1, mb: 1.5 }}>
              <Typography fontSize={12} color="#d97706" fontWeight={600}>⏰ Sắp bắt đầu</Typography>
            </Box>
          )}

          {/* Thời gian */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <EventIcon sx={{ fontSize: 16, color: '#6b7280' }} />
            <Typography fontSize={13} color="#374151">{formatDate(startTime)}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <AccessTimeIcon sx={{ fontSize: 16, color: '#6b7280' }} />
            <Typography fontSize={13} color="#374151">
              {formatTime(startTime)}
            </Typography>
          </Box>

          {meeting.description && (
            <Typography fontSize={13} color="#6b7280" sx={{ mb: 1.5, borderLeft: '3px solid #e5e7eb', pl: 1.5 }}>
              {meeting.description}
            </Typography>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <Avatar src={meeting.creator?.picture} sx={{ width: 20, height: 20, fontSize: 10 }}>
              {meeting.creator?.name?.charAt(0)}
            </Avatar>
            <Typography fontSize={13} color="#374151">
              <span style={{ color: '#6b7280' }}>Tổ chức bởi: </span>
              <strong>{meeting.creator?.name}</strong>
            </Typography>
          </Box>

          {meeting.participants.length > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <PeopleIcon sx={{ fontSize: 16, color: '#6b7280' }} />
              <AvatarGroup max={6} sx={{ '& .MuiAvatar-root': { width: 24, height: 24, fontSize: 10 } }}>
                {meeting.participants.map((p) => (
                  <Tooltip key={p.id} title={p.user?.name ?? ''}>
                    <Avatar src={p.user?.picture}>{p.user?.name?.charAt(0)}</Avatar>
                  </Tooltip>
                ))}
              </AvatarGroup>
              <Typography fontSize={12} color="#6b7280">{meeting.participants.length} người</Typography>
            </Box>
          )}

          <Divider sx={{ mb: 2 }} />

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {(isNow || isSoon) && onStartCall && meeting.status === 'scheduled' && (
              <Button
                variant="contained" size="small" startIcon={<VideocamIcon />}
                onClick={() => { onStartCall(meeting); onClose(); }}
                sx={{ textTransform: 'none', bgcolor: '#16a34a', '&:hover': { bgcolor: '#15803d' }, flex: 1 }}
              >
                {isNow ? 'Tham gia ngay' : 'Bắt đầu sớm'}
              </Button>
            )}
            {canCancel && (
              <Button
                variant="outlined" size="small" startIcon={<CancelIcon />}
                onClick={() => setConfirmCancel(true)}
                disabled={isPending}
                sx={{ textTransform: 'none', borderColor: '#ef4444', color: '#ef4444', '&:hover': { borderColor: '#dc2626', bgcolor: '#fef2f2' } }}
              >
                Hủy lịch
              </Button>
            )}
          </Box>
        </Box>
      </Popover>

      <ModalConfirm
        open={confirmCancel}
        setOpen={setConfirmCancel}
        title="Hủy lịch cuộc họp"
        message={<>Bạn có chắc muốn hủy cuộc họp <strong>"{meeting.title}"</strong>?<br />Tất cả người được mời sẽ nhận thông báo hủy.</>}
        titleButton="Hủy lịch"
        cancelButtonText="Giữ lại"
        onClick={handleCancel}
        isDelete
        confirmButtonProps={{ sx: { bgcolor: '#ef4444', '&:hover': { bgcolor: '#dc2626' } } }}
      />
    </>
  );
}
