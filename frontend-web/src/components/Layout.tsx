import { Box, CssBaseline, Breadcrumbs, Link, Typography } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';

export function Layout() {
  const [open, setOpen] = useState(true); 

  const handleToggleSidebar = () => {
    setOpen(!open);
  };

  const location = useLocation();

  const breadcrumbMap: { [key: string]: string } = {
    '/home': 'Trang chủ',
  };

  const getBreadcrumbs = () => {
    const pathnames = location.pathname.split('/').filter((x) => x);
    const breadcrumbs = pathnames.map((value, index) => {
      const to = `/${pathnames.slice(0, index + 1).join('/')}`;
      const isLast = index === pathnames.length - 1;
      return isLast ? (
        <Typography
          key={to}
          color="text.primary"
          sx={{ fontSize: 'inherit' }} 
        >
          {breadcrumbMap[to] || value}
        </Typography>
      ) : (
        <Link key={to} color="inherit" href={to} onClick={(e) => e.preventDefault()} sx={{ textDecoration: 'none' }}>
          {breadcrumbMap[to] || value}
        </Link>
      );
    });

    if (location.pathname === '/' || location.pathname === '/home') {
      return [
        <Typography key="/home" color="text.primary">
          Trang chủ
        </Typography>,
      ];
    }

    return breadcrumbs;
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
          pt: 6, 
        }}
      >
      <Breadcrumbs aria-label="breadcrumb" sx={{ pt: 2, pb: 2 }}>
        {getBreadcrumbs()}
      </Breadcrumbs>
      <Outlet />
      </Box>
    </Box>
  );
}