import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Typography, Box, Select, MenuItem,
  FormControl, IconButton, Autocomplete,
  CircularProgress,
  createFilterOptions,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import EmailIcon from '@mui/icons-material/Email';
import { useState } from 'react';
import { useInviteMember } from '../api/add-member';
import { useSearchUsers } from '../api/search-users';
import { AddMemberSuccessModal } from './SuccessModal';
import { ROLES, type RoleKey } from '../../../constant';

interface UserSearchResult {
  user_id: number;
  name: string;
  email: string;
  picture?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  projectName?: string;
  projectId?: string;
}

export function AddMemberModal({ open, onClose, projectName, projectId }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [role, setRole] = useState<RoleKey>('member');

  const { data: options = [] } = useSearchUsers(searchQuery);
  const { mutate: addMember, isPending } = useInviteMember(projectId!);

  const [successUsers, setSuccessUsers] = useState<UserSearchResult[]>([]);

  const [selectedUsers, setSelectedUsers] = useState<UserSearchResult[]>([]);

  const filter = createFilterOptions<UserSearchResult>();

  const handleAdd = () => {
    if (!selectedUsers.length) return;
    Promise.all(
      selectedUsers.map(user =>
        new Promise((resolve) => addMember(
          { invited_email: user.email,
            role: role },
          { onSuccess: resolve }
        ))
      )
    ).then(() => {
      setSuccessUsers(selectedUsers);
    });
  };

  return (
    <>
    <Dialog open={open && !successUsers.length} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ pr: 8 }}>
        <Typography fontWeight={600} fontSize={20}>
          Thêm thành viên vào {projectName}
        </Typography>
        <Box sx={{ position: 'absolute', top: 12, right: 12 }}>
          <IconButton size="small" onClick={onClose}><CloseIcon fontSize="small" /></IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
        <Box>
          <Typography fontSize={15} fontWeight={500} mb={0.5}>
            Tên hoặc email <span style={{ color: 'red' }}>*</span>
          </Typography>
          <Autocomplete
            multiple
            freeSolo
            options={options}
            filterOptions={(options, params) => {
              const filtered = filter(options, params);
              const { inputValue } = params;
              
              const isExisting = options.some(o => o.email === inputValue);
              if (inputValue !== '' && !isExisting) {
                filtered.push({
                  user_id: 0,
                  name: 'Chọn địa chỉ email',
                  email: inputValue,
                  picture: undefined,
                });
              }
              return filtered;
            }}
            getOptionLabel={(option) => typeof option === 'string' ? option : option.email}
            onInputChange={(_, value) => setSearchQuery(value)}
            onChange={(_, value) => {
              const users = value.map(v =>
                typeof v === 'string'
                  ? { user_id: 0, name: '', email: v, picture: undefined }
                  : v
              );
              setSelectedUsers(users);
            }}
            renderOption={(props, option) => (
              <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EmailIcon fontSize="small" sx={{ color: '#888' }} />
                <Box>
                  <Typography fontSize={14}>{option.email}</Typography>
                  <Typography fontSize={12} color="#888">
                    {option.user_id === 0 ? 'Chọn địa chỉ email' : option.name}
                  </Typography>
                </Box>
              </Box>
            )}
            renderInput={(params) => (
              <TextField {...params} size="small" placeholder="vd: example@gmail.com" />
            )}
          />
        </Box>

        <Box>
          <Typography fontSize={13} fontWeight={500} mb={1} color="#575757">
            có thể thêm từ
          </Typography>
          <Box display="flex" gap={1}>
            <Button variant="outlined" startIcon={<img src="https://www.google.com/favicon.ico" width={16} />}
              sx={{ borderColor: '#d3d3d3', color: '#333', textTransform: 'none', borderRadius: '8px', flex: 1 }}>
              Google
            </Button>
            <Button variant="outlined" startIcon={<img src="https://slack.com/favicon.ico" width={16} />}
              sx={{ borderColor: '#d3d3d3', color: '#333', textTransform: 'none', borderRadius: '8px', flex: 1 }}>
              Slack
            </Button>
            <Button variant="outlined" startIcon={<img src="https://microsoft.com/favicon.ico" width={16} />}
              sx={{ borderColor: '#d3d3d3', color: '#333', textTransform: 'none', borderRadius: '8px', flex: 1 }}>
              Microsoft
            </Button>
          </Box>
        </Box>

        <Box>
          <Typography fontSize={15} fontWeight={500} mb={0.5}>
            Vai trò <span style={{ color: 'red' }}>*</span>
          </Typography>
          <FormControl fullWidth size="small">
            <Select
              value={role}
              onChange={(e) => setRole(e.target.value as RoleKey)}
            >
              {ROLES.map(r => (
                <MenuItem key={r.key} value={r.key}>
                  <Box>
                    <Typography fontSize={14} fontWeight={500}>{r.label}</Typography>
                    <Typography fontSize={12} color="#888">
                      {r.key === 'member'
                        ? 'Có thể xem, thêm và chỉnh sửa công việc trong dự án.'
                        : 'Có thể quản lý dự án, thêm thành viên và chỉnh sửa cài đặt.'}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Typography fontSize={12} color="#888" sx={{ pb: 1 }}>
          <span style={{ color: 'red' }}>*</span> Thành viên được mời sẽ nhận email thông báo và có thể truy cập dự án sau khi chấp nhận lời mời.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">Hủy</Button>
        <Button
          variant="contained"
          onClick={handleAdd}
          disabled={!selectedUsers.length || isPending}
          startIcon={isPending ? <CircularProgress size={16} color="inherit" /> : null}
          sx={{ backgroundColor: '#5663ee', '&:hover': { backgroundColor: '#4451d3' } }}
        >
          {isPending ? 'Đang thêm...' : `Thêm ${selectedUsers.length > 0 ? selectedUsers.length : ''} thành viên`}
        </Button>
      </DialogActions>
    </Dialog>
    <AddMemberSuccessModal
        open={!!successUsers.length}
        onClose={() => { setSuccessUsers([]); onClose(); }}
        projectName={projectName}
        users={successUsers}
      />
    </>
  );
}