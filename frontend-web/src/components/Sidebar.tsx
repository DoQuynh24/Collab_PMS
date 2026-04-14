import { 
  Drawer, 
  IconButton, 
  List, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Toolbar 
} from '@mui/material';
import { Home as HomeIcon, ArchiveOutlined } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { homeUrl, archiveUrl } from '../routes/urls';
import ProjectList from '../modules/project/component/list/ProjectList';

const drawerWidth = 230;
const collapsedWidth = 60;

export function Sidebar({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { text: 'Trang chủ', icon: <HomeIcon />, path: homeUrl },
    { text: 'Kho lưu trữ', icon: <ArchiveOutlined />, path: archiveUrl },
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
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: open ? 3 : 'auto',
                justifyContent: 'center',
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.text}
              sx={{ opacity: open ? 1 : 0 }}
            />
          </ListItemButton>
        ))}
        <ProjectList open={open} />
      </List>
    </Drawer>
  );
}