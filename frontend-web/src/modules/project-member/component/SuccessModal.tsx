import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, Box, Avatar, IconButton,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../routes/urls';

interface UserInfo {
  email: string;
  name?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  projectName?: string;
  projectId?: string;
  users?: UserInfo[];
}

export function AddMemberSuccessModal({ open, onClose, projectName, projectId, users = [] }: Props) {
  const navigate = useNavigate();

  const handleMembersSettings = () => {
    onClose();
    if (projectId) navigate(ROUTES.projectMembersSettings(projectId));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography fontWeight={600} fontSize={16}>Đã thêm thành viên</Typography>
        <IconButton size="small" onClick={onClose}><CloseIcon fontSize="small" /></IconButton>
      </DialogTitle>

      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '5px !important' }}>
        <Typography fontSize={14}>
          Bạn đã thêm <strong>{users.length} thành viên</strong> vào dự án <strong>{projectName}</strong>.
        </Typography>

        {users.map((user) => (
          <Box key={user.email} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, border: '1px solid #e0e0e0', borderRadius: '8px' }}>
            <Avatar sx={{ width: 36, height: 36, bgcolor: '#e0e0e0' }}>
              <AccountCircleIcon sx={{ color: '#888' }} />
            </Avatar>
            <Box>
              <Typography fontSize={14} fontWeight={500}>{user.email}</Typography>
              <Typography fontSize={12} color="#888">{user.name}</Typography>
            </Box>
          </Box>
        ))}

        <Typography fontSize={13} color="#888">
          Thành viên sẽ nhận email thông báo và có thể truy cập dự án sau khi chấp nhận lời mời.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleMembersSettings} color="inherit"
          sx={{ textTransform: 'none', fontSize: 13 }}>
          Quản lý thành viên
        </Button>
        <Button onClick={onClose} variant="contained"
          sx={{ textTransform: 'none', backgroundColor: '#5663ee', '&:hover': { backgroundColor: '#4451d3' } }}>
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
}
