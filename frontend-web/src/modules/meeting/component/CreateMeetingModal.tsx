import { useState, useContext, useEffect } from 'react';
import {
  Drawer, Box, Typography, TextField, Button, IconButton,
  Avatar, Chip, Divider, CircularProgress,
  Popover, List, ListItemButton, ListItemAvatar, ListItemText,
  Checkbox,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EventIcon from '@mui/icons-material/Event';
import PeopleIcon from '@mui/icons-material/People';
import SearchIcon from '@mui/icons-material/Search';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import { useCreateMeeting } from '../api/create-meeting';
import { ToastContext } from '../../../components/notification/NotifiProvider';
import { useCheckMeetingConflicts } from '../api/check-meeting-conflicts';
import type { ParticipantMeetingConflict } from '../types';

interface Member {
  user_id: number;
  role: string;
  user?: { user_id: number; name: string; picture?: string; email: string };
}

interface Props {
  open: boolean;
  onClose: () => void;
  projectId: string;
  projectMembers: Member[];
  ownerId?: number;
}

interface FormErrors {
  title?: string;
  date?: string;
  time?: string;
  participants?: string;
}

export function CreateMeetingModal({ open, onClose, projectId, projectMembers, ownerId }: Props) {
  const { mutate: createMeeting, isPending } = useCreateMeeting();
  const { showToast } = useContext(ToastContext)!;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [search, setSearch] = useState('');
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});

  const allMemberIds = projectMembers.map((m) => m.user_id);
  const isAllSelected = selectedIds.length === allMemberIds.length;

  useEffect(() => {
    if (open) {
      setSelectedIds(projectMembers.map((m) => m.user_id));
      setDate(new Date().toISOString().slice(0, 10));
      setErrors({});
    }
  }, [open]);

  const startTime = date && time ? new Date(`${date}T${time}:00`).toISOString() : null;
  const shouldCheckConflicts = open && Boolean(startTime) && selectedIds.length > 0;
  const { data: conflicts = [], isFetching: isCheckingConflicts } = useCheckMeetingConflicts(
    startTime ? { project_id: projectId, start_time: startTime, participant_ids: selectedIds } : null,
    shouldCheckConflicts,
  );

  const conflictMap = new Map<number, ParticipantMeetingConflict>(
    conflicts.map((conflict) => [conflict.user_id, conflict]),
  );

  const filteredMembers = projectMembers.filter((m) =>
    m.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    m.user?.email?.toLowerCase().includes(search.toLowerCase()),
  );

  const toggleMember = (uid: number) => {
    setSelectedIds((prev) =>
      prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid],
    );
    setErrors((prev) => ({ ...prev, participants: undefined }));
  };

  const toggleAll = () => {
    setSelectedIds(isAllSelected ? [] : [...allMemberIds]);
    setErrors((prev) => ({ ...prev, participants: undefined }));
  };

  const handleSubmit = () => {
    const nextErrors: FormErrors = {};

    if (!title.trim()) nextErrors.title = 'Vui lòng nhập tên cuộc họp';
    if (!date) nextErrors.date = 'Vui lòng chọn ngày';
    if (!time) nextErrors.time = 'Vui lòng chọn giờ';
    if (selectedIds.length === 0) nextErrors.participants = 'Vui lòng chọn ít nhất 1 người tham gia';

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    createMeeting(
      { project_id: projectId, title: title.trim(), description: description.trim() || undefined, start_time: startTime!, participant_ids: selectedIds },
      {
        onSuccess: () => { showToast('Đã đặt lịch cuộc họp', 'success'); handleClose(); },
        onError: (err: any) => showToast(err?.response?.data?.message || 'Đặt lịch thất bại', 'error'),
      },
    );
  };

  const handleClose = () => {
    setTitle(''); setDescription(''); setDate(''); setTime('');
    setSelectedIds([]); setSearch(''); setAnchorEl(null); setErrors({});
    onClose();
  };

  const now = new Date();
  const minDate = now.toISOString().slice(0, 10);
  const isToday = date === minDate;
  const minTime = isToday
    ? `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    : undefined;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={handleClose}
      slotProps={{ paper: { sx: { width: 420, display: 'flex', flexDirection: 'column' } } }}
    >
      <Box sx={{ px: 3, py: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e5e7eb', bgcolor: '#5663ee' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EventIcon sx={{ color: '#fff', fontSize: 20 }} />
          <Typography fontWeight={700} fontSize={16} color="#fff">Đặt lịch cuộc họp</Typography>
        </Box>
        <IconButton size="small" onClick={handleClose} sx={{ color: '#fff' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <Box sx={{ flex: 1, overflowY: 'auto', px: 3, py: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <TextField
          label="Tên cuộc họp *"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (errors.title) {
              setErrors((prev) => ({ ...prev, title: undefined }));
            }
          }}
          fullWidth size="small"
          placeholder="VD: Họp review sprint tuần này"
          autoFocus
          error={!!errors.title}
          helperText={errors.title}
        />

        <TextField
          label="Nội dung (tùy chọn)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth size="small" multiline rows={3}
          placeholder="Mô tả ngắn về cuộc họp..."
        />

        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            label="Ngày *" type="date" value={date}
            onChange={(e) => {
              setDate(e.target.value);
              setTime('');
              setErrors((prev) => ({ ...prev, date: undefined, time: undefined }));
            }}
            size="small" sx={{ flex: 1.4 }}
            inputProps={{ min: minDate }}
            InputLabelProps={{ shrink: true }}
            error={!!errors.date}
            helperText={errors.date}
          />
          <TextField
            label="Giờ bắt đầu *" type="time" value={time}
            onChange={(e) => {
              setTime(e.target.value);
              if (errors.time) {
                setErrors((prev) => ({ ...prev, time: undefined }));
              }
            }}
            size="small" sx={{ flex: 1 }}
            inputProps={{ min: minTime, lang: 'vi' }}
            InputLabelProps={{ shrink: true }}
            error={!!errors.time}
            helperText={errors.time}
          />
        </Box>

        <Divider />

        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PeopleIcon sx={{ fontSize: 18, color: '#5663ee' }} />
              <Typography fontSize={14} fontWeight={600}>Người tham gia</Typography>
              {selectedIds.length > 0 && (
                <Chip label={selectedIds.length} size="small" sx={{ bgcolor: '#eef0ff', color: '#5663ee', fontWeight: 600, height: 20, fontSize: 11 }} />
              )}
            </Box>
            <Button
              size="small"
              startIcon={<PersonAddIcon fontSize="small" />}
              onClick={(e) => setAnchorEl(e.currentTarget)}
              sx={{ textTransform: 'none', fontSize: 13, color: '#5663ee' }}
            >
              Thêm
            </Button>
          </Box>
          {errors.participants && (
            <Typography fontSize={12} color="error" sx={{ mb: 1.5 }}>
              {errors.participants}
            </Typography>
          )}

          {selectedIds.length === 0 ? (
            <Typography fontSize={13} color="#9ca3af" sx={{ py: 1 }}>Chưa chọn ai — nhấn Thêm để chọn</Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {selectedIds.map((uid) => {
                  const m = projectMembers.find((x) => x.user_id === uid);
                  if (!m?.user) return null;
                  return (
                    <Chip
                      key={uid}
                      avatar={<Avatar src={m.user.picture} sx={{ width: 20, height: 20 }}>{m.user.name.charAt(0)}</Avatar>}
                      label={m.user.name}
                      onDelete={() => toggleMember(uid)}
                      size="small"
                      sx={{ bgcolor: '#f4f5f7', fontSize: 12 }}
                    />
                  );
                })}
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {selectedIds.map((uid) => {
                  const member = projectMembers.find((item) => item.user_id === uid);
                  if (!member?.user) return null;

                  const conflict = conflictMap.get(uid);
                  const hasConflict = conflict?.has_conflict ?? false;

                  return (
                    <Box
                      key={`selected-${uid}`}
                      sx={{
                        border: '1px solid #e5e7eb',
                        borderRadius: 2,
                        px: 1.5,
                        py: 1.25,
                        bgcolor: '#fff',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25 }}>
                        <Avatar src={member.user.picture} sx={{ width: 32, height: 32, fontSize: 13 }}>
                          {member.user.name.charAt(0)}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography fontSize={13} fontWeight={600} color="#111827">
                            {member.user.name}
                            {uid === ownerId ? ' 👑' : ''}
                          </Typography>
                          <Typography fontSize={11} color="#9ca3af">
                            {member.user.email}
                          </Typography>

                          {!startTime && (
                            <Typography fontSize={12} color="#9ca3af" sx={{ mt: 0.75 }}>
                              Chọn ngày và giờ để kiểm tra lịch của thành viên.
                            </Typography>
                          )}

                          {startTime && isCheckingConflicts && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.9 }}>
                              <CircularProgress size={12} sx={{ color: '#5663ee' }} />
                              <Typography fontSize={12} color="#6b7280">
                                Đang kiểm tra lịch...
                              </Typography>
                            </Box>
                          )}

                          {startTime && !isCheckingConflicts && hasConflict && (
                            <Box
                              sx={{
                                mt: 1,
                                borderRadius: 1.5,
                                border: '1px solid #fdba74',
                                bgcolor: '#fff7ed',
                                px: 1.25,
                                py: 1,
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                                <WarningAmberRoundedIcon sx={{ fontSize: 16, color: '#ea580c', mt: 0.1 }} />
                                <Box>
                                  <Typography fontSize={12} color="#9a3412" sx={{ lineHeight: 1.5 }}>
                                    Bận vào thời gian này.
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>
                          )}

                          {startTime && !isCheckingConflicts && !hasConflict && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 1 }}>
                              <CheckCircleRoundedIcon sx={{ fontSize: 16, color: '#16a34a' }} />
                              <Typography fontSize={12} color="#15803d" fontWeight={500}>
                                Rảnh vào thời gian này
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          )}
        </Box>
      </Box>

      <Box sx={{ px: 3, py: 2, borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
        <Button onClick={handleClose} sx={{ textTransform: 'none', color: '#6b7280' }}>Hủy</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isPending}
          sx={{ textTransform: 'none', bgcolor: '#5663ee', '&:hover': { bgcolor: '#4451d4' }, px: 3 }}
        >
          {isPending ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : 'Đặt lịch'}
        </Button>
      </Box>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => { setAnchorEl(null); setSearch(''); }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{ paper: { sx: { width: 300, borderRadius: 2 } } }}
      >
        <Box sx={{ p: 1.5 }}>
          <TextField
            fullWidth size="small"
            placeholder="Tìm thành viên..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: '#9ca3af', fontSize: 18 }} /> }}
            autoFocus
          />
        </Box>
        <List dense sx={{ maxHeight: 280, overflowY: 'auto', pt: 0 }}>
          <ListItemButton onClick={toggleAll} sx={{ borderBottom: '1px solid #f3f4f6' }}>
            <Checkbox checked={isAllSelected} indeterminate={selectedIds.length > 0 && !isAllSelected} size="small" sx={{ p: 0.5, mr: 1, color: '#5663ee', '&.Mui-checked': { color: '#5663ee' } }} />
            <ListItemText primary={<Typography fontSize={13} fontWeight={600}>Tất cả ({allMemberIds.length} người)</Typography>} />
          </ListItemButton>

          {filteredMembers.map((m) => {
            if (!m.user) return null;
            const checked = selectedIds.includes(m.user_id);
            return (
              <ListItemButton key={m.user_id} onClick={() => toggleMember(m.user_id)}>
                <Checkbox checked={checked} size="small" sx={{ p: 0.5, mr: 1, color: '#5663ee', '&.Mui-checked': { color: '#5663ee' } }} />
                <ListItemAvatar sx={{ minWidth: 36 }}>
                  <Avatar src={m.user.picture} sx={{ width: 28, height: 28, fontSize: 12 }}>
                    {m.user.name.charAt(0)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={<Typography fontSize={13}>{m.user.name}{m.user_id === ownerId ? ' 👑' : ''}</Typography>}
                  secondary={<Typography fontSize={11} color="#9ca3af">{m.user.email}</Typography>}
                />
              </ListItemButton>
            );
          })}
        </List>
        <Box sx={{ p: 1.5, borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'flex-end' }}>
          <Button size="small" variant="contained" onClick={() => { setAnchorEl(null); setSearch(''); }}
            sx={{ textTransform: 'none', bgcolor: '#5663ee', '&:hover': { bgcolor: '#4451d4' } }}>
            Xong
          </Button>
        </Box>
      </Popover>
    </Drawer>
  );
}
