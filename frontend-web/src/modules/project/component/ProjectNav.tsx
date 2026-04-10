import { Box, Button } from '@mui/material';
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
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, borderBottom: '1px solid #e0e0e0' }}>
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Button
            key={item.path}
            startIcon={item.icon}
            onClick={() => navigate(item.path)}
            sx={{
              textTransform: 'none',
              fontSize: 15,
              color: isActive ? '#5663ee' : '#555',
              borderBottom: isActive ? '3px solid #5663ee' : '3px solid transparent',
              borderRadius: 0,
              px: 2,
              py: 1.2,
              '&:hover': { background: '#f5f5f5', color: '#5663ee' },
            }}
          >
            {item.label}
          </Button>
        );
      })}
    </Box>
  );
}