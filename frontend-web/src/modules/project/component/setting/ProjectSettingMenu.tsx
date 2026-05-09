import {
  Menu,
  MenuItem,
  Typography,
  Divider,
  Box,
  ListItemIcon,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Group as GroupIcon,
  Notifications as NotificationsIcon,
  Flag as FlagIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../../routes/urls';

interface Props {
  anchorEl: null | HTMLElement;
  onClose: () => void;
  projectId?: string;
  projectName?: string;
}

export default function ProjectSettingsMenu({ anchorEl, onClose, projectId, projectName }: Props) {
  const navigate = useNavigate();
  const open = Boolean(anchorEl);

  const handleNavigate = (subPath: string) => {
    onClose();
    if (projectId) {
      if (subPath === "/details") {
        navigate(ROUTES.projectDetailsSettings(projectId));
      } else if (subPath === "/members") {
        navigate(ROUTES.projectMembersSettings(projectId));
      } else if (subPath === "/statuses") {
        navigate(ROUTES.projectStatusesSettings(projectId));
      } else if (subPath === "/notifications") {
        navigate(ROUTES.projectNotificationsSettings(projectId));
      }
    }
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      PaperProps={{
        sx: {
          width: 320,
          borderRadius: '10px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
          mt: 1,
        },
      }}
    >
      <Box sx={{ px: 2, py: 1.5 }}>
        <Typography variant="inherit" fontWeight={600} color="#333">
          Cài đặt dự án
        </Typography>
        <Typography variant="caption" fontSize={13} color="#666">
          {projectName}
        </Typography>
      </Box>

      <Divider />

      <MenuItem onClick={() => handleNavigate('/details')}>
        <ListItemIcon>
          <SettingsIcon fontSize="small" />
        </ListItemIcon>
        <Box>
          <Typography fontSize={14} fontWeight={500}>Cài đặt chung</Typography>
          <Typography fontSize={12} color="#666">Quản lý tên, mô tả, quyền truy cập</Typography>
        </Box>
      </MenuItem>

      <MenuItem onClick={() => handleNavigate('/members')}>
        <ListItemIcon>
          <GroupIcon fontSize="small" />
        </ListItemIcon>
        <Box>
          <Typography fontSize={14} fontWeight={500}>Thành viên & Quyền</Typography>
          <Typography fontSize={12} color="#666">Quản lý thành viên, vai trò</Typography>
        </Box>
      </MenuItem>

      <MenuItem onClick={() => handleNavigate('/statuses')}>
        <ListItemIcon>
          <FlagIcon fontSize="small" />
        </ListItemIcon>
        <Box>
          <Typography fontSize={14} fontWeight={500}>Quản lý trạng thái</Typography>
          <Typography fontSize={12} color="#666">Tạo, chỉnh sửa trạng thái tùy chỉnh</Typography>
        </Box>
      </MenuItem>

      <MenuItem onClick={() => handleNavigate('/notifications')}>
        <ListItemIcon>
          <NotificationsIcon fontSize="small" />
        </ListItemIcon>
        <Box>
          <Typography fontSize={14} fontWeight={500}>Thông báo</Typography>
          <Typography fontSize={12} color="#666">Cài đặt thông báo dự án</Typography>
        </Box>
      </MenuItem>
    </Menu>
  );
}