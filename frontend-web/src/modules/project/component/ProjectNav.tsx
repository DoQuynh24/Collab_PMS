import { Box, Button, useMediaQuery } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { ROUTES } from '../../../routes/urls';

interface Props {
  projectId?: string;
}

export function ProjectNav({ projectId }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery('(max-width:900px)');

  const navItems = [
    { 
      label: 'Tổng quan', 
      path: ROUTES.projectDetail(projectId!), 
      icon: <DashboardIcon fontSize="small" /> 
    },
    { 
      label: 'Danh sách', 
      path: ROUTES.projectList(projectId!), 
      icon: <ViewListIcon fontSize="small" /> 
    },
    { 
      label: 'Bảng',         
      path: ROUTES.projectBoard(projectId!), 
      icon: <ViewKanbanIcon fontSize="small" /> 
    },
    { 
      label: 'Lịch', 
      path: ROUTES.projectCalendar(projectId!), 
      icon: <CalendarMonthIcon fontSize="small" /> 
    },
  ];

  return (
    <Box
      sx={{
        display: isMobile ? 'grid' : 'flex',
        gridTemplateColumns: isMobile ? 'repeat(4, minmax(0, 1fr))' : undefined,
        alignItems: 'center',
        gap: isMobile ? 0.75 : 0.5,
        py: { xs: 1, sm: 0 },
        px: { xs: 0.5, sm: 0 },
        borderBottom: isMobile ? 'none' : '1px solid #e0e0e0',
        overflowX: 'auto',
        overflowY: 'hidden',
        scrollbarWidth: 'none',
      }}
    >
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Button
            key={item.path}
            startIcon={item.icon}
            onClick={() => navigate(item.path)}
            sx={{
              textTransform: 'none',
              fontSize: { xs: 11, sm: 15 },
              color: isActive ? '#5663ee' : '#555',
              borderBottom: isMobile ? 'none' : (isActive ? '3px solid #5663ee' : '3px solid transparent'),
              borderRadius: isMobile ? '16px' : 0,
              px: { xs: 0.5, sm: 2 },
              py: { xs: 1.1, sm: 1.2 },
              minWidth: 0,
              minHeight: isMobile ? 60 : undefined,
              flexShrink: 0,
              whiteSpace: 'nowrap',
              background: isMobile && isActive ? '#eef0ff' : 'transparent',
              border: isMobile ? '1px solid' : 'none',
              borderColor: isMobile ? (isActive ? '#c7d2fe' : '#e5e7eb') : 'transparent',
              '& .MuiButton-startIcon': {
                margin: 0,
                mb: isMobile ? 0.4 : 0,
                mr: isMobile ? 0 : 1,
              },
              '&:hover': { background: isMobile ? '#f8faff' : '#f5f5f5', color: '#5663ee' },
              flexDirection: isMobile ? 'column' : 'row',
            }}
          >
            {item.label}
          </Button>
        );
      })}
    </Box>
  );
}
