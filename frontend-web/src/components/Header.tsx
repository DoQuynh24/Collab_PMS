"use client";
import { AppBar, Toolbar, Typography, Box, IconButton, Avatar, Menu, MenuItem, Badge, Tooltip, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/GridView';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import { useState, useEffect } from 'react';
import { HeaderMenu } from './HeaderMenu';
import { HelpPanel } from './HelpPanel';
import { NotificationPanel } from '../modules/notification/component/NotificationPanel';
import { useGetUnreadCount } from '../modules/notification/api/get-unread-count';
import { useGetCurrentUser } from '../modules/login/api/auth';
import { useTheme } from '../contexts/ThemeContext';

export function Header({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [notiOpen, setNotiOpen] = useState(false);
  const { data: user, isLoading } = useGetCurrentUser();
  const { mode, toggleTheme } = useTheme();
  const { data: unreadCount = 0 } = useGetUnreadCount();

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === '?' && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
        setHelpOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogin = () => {
    handleMenuClose();
    navigate('/login');
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    handleMenuClose();
    navigate('/login');
  };

  const goToMyAccount = () => {
    handleMenuClose();
    navigate('/account');
  };

  const isLoggedIn = !!user && !isLoading;

  return (
    <>
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, backgroundColor: '#5663ee', height: '60px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.57)' }}>
      <Toolbar sx={{ minHeight: '60px !important', alignItems: 'center !important', gap: 1 }}>
        <IconButton color="inherit" edge="start" onClick={onToggleSidebar}>
          <MenuIcon />
        </IconButton>

        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, pl: 1.5 }}>
          <Typography variant="h5" sx={{ letterSpacing: 0.5 }}>
            COLLAB
          </Typography>
          <HeaderMenu />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Tooltip title="Thông báo">
            <IconButton color="inherit" onClick={() => setNotiOpen(true)}>
              <Badge badgeContent={unreadCount || 0} color="error" sx={{ '& .MuiBadge-badge': { fontSize: 10, height: 16, minWidth: 16 } }}>
                <NotificationsOutlinedIcon fontSize="medium" />
              </Badge>
            </IconButton>
          </Tooltip>

          <Tooltip title="Trợ giúp">
            <IconButton color="inherit" onClick={() => setHelpOpen(true)}>
              <HelpOutlineIcon fontSize="medium" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Cài đặt">
            <IconButton color="inherit">
              <SettingsOutlinedIcon fontSize="medium" />
            </IconButton>
          </Tooltip>

          <Avatar
            src={user?.picture}
            sx={{ width: 32, height: 32, bgcolor: '#fff', color: '#5663ee', cursor: 'pointer', ml: 1 }}
            onClick={handleAvatarClick}
          >
            {!user?.picture && <AccountCircleIcon />}
          </Avatar>
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          slotProps={{
            paper: {
              sx: { borderRadius: '12px', mt: 0.5, width: 280, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' },
            },
          }}
        >
          {isLoggedIn && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 2, py: 2, bgcolor: '#f8fafc', borderBottom: '1px solid #f3f4f6' }}>
              <Avatar
                src={user?.picture}
                sx={{ width: 48, height: 48, flexShrink: 0 }}
              >
                {user?.name?.charAt(0).toUpperCase()}
              </Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Typography fontSize={15} fontWeight={700} color="#111827" noWrap>{user?.name}</Typography>
                <Typography fontSize={12} color="#6b7280" noWrap>{user?.email}</Typography>
              </Box>
            </Box>
          )}

          {isLoggedIn ? (
            <>
              <MenuItem onClick={goToMyAccount} sx={{ py: 1.2, gap: 1.5, fontSize: 14, color: '#374151' }}>
                <PersonOutlinedIcon fontSize="small" sx={{ color: '#6b7280' }} />
                Hồ sơ
              </MenuItem>
              <MenuItem onClick={() => { toggleTheme(); handleMenuClose(); }} sx={{ py: 1.2, gap: 1.5, fontSize: 14, color: '#374151' }}>
                {mode === 'dark'
                  ? <LightModeOutlinedIcon fontSize="small" sx={{ color: '#6b7280' }} />
                  : <DarkModeOutlinedIcon fontSize="small" sx={{ color: '#6b7280' }} />
                }
                {mode === 'dark' ? 'Chế độ sáng' : 'Chế độ tối'}
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout} sx={{ py: 1.2, gap: 1.5, fontSize: 14, color: '#374151' }}>
                <LogoutIcon fontSize="small" sx={{ color: '#6b7280' }} />
                Đăng xuất
              </MenuItem>
            </>
          ) : (
            <MenuItem onClick={handleLogin} sx={{ fontSize: 14 }}>Đăng nhập</MenuItem>
          )}
        </Menu>
      </Toolbar>
    </AppBar>

    <HelpPanel open={helpOpen} onClose={() => setHelpOpen(false)} />
    <NotificationPanel open={notiOpen} onClose={() => setNotiOpen(false)} />
    </>
  );
}
