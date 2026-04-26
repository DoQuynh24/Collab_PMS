import { 
  Drawer, 
  IconButton, 
  List, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Toolbar,
  Box,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { homeUrl, archiveUrl, joinProjectUrl } from '../routes/urls';
import ProjectList from '../modules/project/component/list/ProjectList';

const drawerWidth = 230;
const collapsedWidth = 60;

export function Sidebar({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { text: 'Dành cho bạn', 
      icon: <Box component="img" src="/images/home.png" alt="home" sx={{ width: 22, height: 22, objectFit: 'contain' }} />, 
      path: homeUrl },
    { text: 'Tham gia dự án',
      icon: <Box component="img" src="/images/microsoft-project.png" alt="join" sx={{ width: 22, height: 22, objectFit: 'contain' }} />, 
      path: joinProjectUrl },
  ];

  return (
    <Drawer
      variant="permanent"
      open={open}
      sx={{
        width: open ? drawerWidth : collapsedWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: open ? drawerWidth : collapsedWidth,
          boxSizing: 'border-box',
          overflowX: 'hidden',
          transition: 'width 0.3s',
          ...(open && { overflowX: 'initial' }),
        },
      }}
    >
      <Toolbar sx={{ justifyContent: 'flex-end' }}>
        {open && (
          <IconButton onClick={onToggle} sx={{ color: 'inherit' }}>
          </IconButton>
        )}
      </Toolbar>
      <List>
        {menuItems.map((item) => (
          <ListItemButton
            key={item.text}
            onClick={() => navigate(item.path)}
            selected={location.pathname === item.path}
            sx={{
              justifyContent: open ? 'initial' : 'center',
              px: 2.5,
              minHeight: 44,
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: open ? 2 : 0,
                justifyContent: 'center',
                display: 'flex',
                alignItems: 'center',
                width: 24,
                flexShrink: 0,
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.text}
              sx={{ opacity: open ? 1 : 0, whiteSpace: 'nowrap', overflow: 'hidden' }}
            />
          </ListItemButton>
        ))}
        <ProjectList open={open} />
        <ListItemButton
          onClick={() => navigate(archiveUrl)}
          selected={location.pathname === archiveUrl}
          sx={{ justifyContent: open ? 'initial' : 'center', px: 2.5, minHeight: 44 }}
        >
          <ListItemIcon sx={{ minWidth: 0, mr: open ? 2 : 0, justifyContent: 'center', display: 'flex', alignItems: 'center', width: 24, flexShrink: 0 }}>
            <Box component="img" src="/images/archive.png" alt="archive" sx={{ width: 22, height: 22, objectFit: 'contain' }} />
          </ListItemIcon>
          <ListItemText primary="Kho lưu trữ" sx={{ opacity: open ? 1 : 0, whiteSpace: 'nowrap', overflow: 'hidden' }} />
        </ListItemButton>
      </List>
    </Drawer>
  );
}