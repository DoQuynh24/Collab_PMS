import { Box, CssBaseline } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { useState } from 'react';

export function Layout() {
  const [open, setOpen] = useState(true);

  const handleToggleSidebar = () => {
    setOpen(!open);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />
      <Header onToggleSidebar={handleToggleSidebar} />
      <Sidebar open={open} onToggle={handleToggleSidebar} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          pt: 10,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}