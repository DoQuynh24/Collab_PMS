"use client";
import { AppBar, Toolbar, Typography, Box, IconButton, Avatar, Menu, MenuItem, Badge, Tooltip, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/GridView';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
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

export function Header({ onToggleSidebar, isMobile = false }: { onToggleSidebar: () => void; isMobile?: boolean }) {
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
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: '#5663ee',
        backgroundImage: 'linear-gradient(90deg, #5663ee 0%, #4f5ee6 100%)',
        height: { xs: '56px', sm: '60px' },
        boxShadow: '0 8px 24px rgba(86, 99, 238, 0.22)',
      }}
    >
      <Toolbar sx={{ minHeight: { xs: '56px !important', sm: '60px !important' }, alignItems: 'center !important', gap: { xs: 0.5, sm: 1 }, px: { xs: 1, sm: 2 } }}>
        <IconButton color="inherit" edge="start" onClick={onToggleSidebar}>
          <MenuIcon />
        </IconButton>

        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, pl: { xs: 0.5, sm: 1.5 }, minWidth: 0 }}>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h5" sx={{ letterSpacing: 0.5, fontSize: { xs: 18, sm: 24 }, whiteSpace: 'nowrap', fontWeight: 800, lineHeight: 1.1 }}>
              COLLAB
            </Typography>
            {isMobile && (
              <Typography fontSize={10} color="rgba(255,255,255,0.74)" sx={{ letterSpacing: 0.6 }}>
                Quản lý dự án trên điện thoại
              </Typography>
            )}
          </Box>
          {!isMobile && <HeaderMenu />}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0, sm: 0.5 } }}>
          <Tooltip title="Thông báo">
            <IconButton color="inherit" onClick={() => setNotiOpen(true)} size={isMobile ? 'small' : 'medium'}>
              <Badge badgeContent={unreadCount || 0} color="error" sx={{ '& .MuiBadge-badge': { fontSize: 10, height: 16, minWidth: 16 } }}>
                <NotificationsOutlinedIcon fontSize="medium" />
              </Badge>
            </IconButton>
          </Tooltip>

        
            <Tooltip title="Trợ giúp">
              <IconButton color="inherit" onClick={() => setHelpOpen(true)} size="medium">
                <HelpOutlineIcon fontSize="medium" />
              </IconButton>
            </Tooltip>
         
          <Avatar
            src={user?.picture}
            sx={{ width: { xs: 30, sm: 32 }, height: { xs: 30, sm: 32 }, bgcolor: '#fff', color: '#5663ee', cursor: 'pointer', ml: { xs: 0.5, sm: 1 } }}
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
              sx: { borderRadius: '12px', mt: 0.5, width: { xs: 240, sm: 280 }, maxWidth: 'calc(100vw - 24px)', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' },
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
