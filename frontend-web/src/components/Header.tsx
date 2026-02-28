"use client";
import { AppBar, Toolbar, Typography, Box, IconButton, Avatar, Menu, MenuItem, Badge, InputBase } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import MailIcon from '@mui/icons-material/Mail';
import { useState } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import { HeaderMenu } from './HeaderMenu';
import { useGetCurrentUser } from '../modules/login/api/auth';

export function Header({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { data: user, isLoading } = useGetCurrentUser();

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
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, backgroundColor: '#5663ee', height: '50px' }}>
      <Toolbar sx={{ minHeight: '50px !important', alignItems: 'center !important' }}>
        <IconButton
          color="inherit"
          edge="start"
          onClick={onToggleSidebar}
        >
          <MenuIcon />
        </IconButton>
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, paddingLeft: '15px' }}>
          <Typography variant="h5">
            COLLAB
          </Typography>
          <HeaderMenu />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.15)', borderRadius: 4, ml: 2 }}>
          <InputBase
            placeholder="Search…"
            inputProps={{ 'aria-label': 'search' }}
            sx={{ color: 'white', ml: 1, flex: 1 }}
          />
          <IconButton type="button" sx={{ p: 1, color: 'white' }} aria-label="search">
            <SearchIcon />
          </IconButton>
        </Box>
        <Box sx={{ flexGrow: 0.1 }} />
        <Badge badgeContent={4} color="primary">
          <MailIcon sx={{ color: 'white' }} />
        </Badge>
        <Avatar
          src={user?.picture}
          sx={{ width: 32, height: 32, bgcolor: '#5663ee', color: '#fff', cursor: 'pointer', ml: 2 }}
          onClick={handleAvatarClick}
        >
          {!user?.picture && <AccountCircleIcon />}
        </Avatar>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          {isLoggedIn ? (
            <>
              <MenuItem onClick={goToMyAccount}>
                Tài khoản: {user && `${user.name || user.email}`}
              </MenuItem>
              <MenuItem onClick={handleLogout}>Đăng xuất</MenuItem>
            </>
          ) : (
            <MenuItem onClick={handleLogin}>Đăng nhập</MenuItem>
          )}
        </Menu>
      </Toolbar>
    </AppBar>
  );
}