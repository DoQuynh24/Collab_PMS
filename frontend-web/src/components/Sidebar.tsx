import {
  Drawer, 
  List, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Toolbar,
  Box,
  Tooltip,
  Typography,} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { archiveUrl, joinProjectUrl } from '../routes/urls';
import ProjectList from '../modules/project/component/list/ProjectList';

const DRAWER_WIDTH = 240;
const COLLAPSED_WIDTH = 65;

const SIDEBAR_BG = '#5663ee';
const ACTIVE_BG = 'rgba(255,255,255,0.18)';
const HOVER_BG = 'rgba(255,255,255,0.10)';
const TEXT_COLOR = '#ffffff';
const ACTIVE_TEXT = '#ffffff';
const LABEL_COLOR = '#ffffff';

interface Props {
  open: boolean;
  onToggle: () => void;
}

export function Sidebar({ open }: Props) {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { text: 'Dành cho bạn', 
      icon: <Box component="img" src="/images/home.png" alt="home" sx={{ width: 22, height: 22, objectFit: 'contain' }} />, 
      path: '/home' },
    { text: 'Tham gia dự án',
      icon: <Box component="img" src="/images/microsoft-project.png" alt="join" sx={{ width: 25, height: 25, objectFit: 'contain' }} />, 
      path: joinProjectUrl },
  ];

  const renderItem = (item: { text: string; icon: React.ReactNode; path: string }) => {
    const isActive = location.pathname === item.path;
    return (
      <Tooltip key={item.text} title={!open ? item.text : ''} placement="right">
        <ListItemButton
          onClick={() => navigate(item.path)}
          sx={{
            mx: 1, mb: 0.5, borderRadius: '10px',
            minHeight: 42,
            justifyContent: open ? 'initial' : 'center',
            bgcolor: isActive ? ACTIVE_BG : 'transparent',
            '&:hover': { bgcolor: isActive ? ACTIVE_BG : HOVER_BG },
            transition: 'background 0.15s',
          }}
        >
          <ListItemIcon sx={{
            minWidth: 0, mr: open ? 1.5 : 0,
            justifyContent: 'center',
            color: isActive ? ACTIVE_TEXT : TEXT_COLOR,
          }}>
            {item.icon}
          </ListItemIcon>
          {open && (
            <ListItemText
              primary={item.text}
              primaryTypographyProps={{
                fontSize: 13.5, fontWeight: isActive ? 600 : 400,
                color: isActive ? ACTIVE_TEXT : TEXT_COLOR,
                noWrap: true,
              }}
            />
          )}
        </ListItemButton>
      </Tooltip>
    );
  };

  return (
    <Drawer
      variant="permanent"
      open={open}
      sx={{
        width: open ? DRAWER_WIDTH : COLLAPSED_WIDTH,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: open ? DRAWER_WIDTH : COLLAPSED_WIDTH,
          boxSizing: 'border-box',
          overflowX: 'hidden',
          transition: 'width 0.3s ease',
          bgcolor: SIDEBAR_BG,
          borderTopRightRadius: '136px',
          border: 'none',
          boxShadow: 'none',
        },
      }}
    >
      <Toolbar sx={{ minHeight: '50px !important' }} />

      <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', py: 1.5, pt: open ? 1.5 : '20px', scrollbarWidth: 'none' }}>

        {open && (
          <Typography fontSize={11} fontWeight={600} color={LABEL_COLOR} letterSpacing={1}
            sx={{ px: 2.5, mb: 0.5, mt: 2 }}>
            MENU
          </Typography>
        )}
        <List disablePadding>
          {menuItems.map(renderItem)}
        </List>

        {open && (
          <Typography fontSize={11} fontWeight={600} color={LABEL_COLOR} letterSpacing={1}
            sx={{ px: 2.5, mb: 0.5, mt: 2 }}>
            DỰ ÁN
          </Typography>
        )}
        <ProjectList open={open} />

        {open && (
          <Typography fontSize={11} fontWeight={600} color={LABEL_COLOR} letterSpacing={1}
            sx={{ px: 2.5, mb: 0.5, mt: 2 }}>
            KHÁC
          </Typography>
        )}
        <List disablePadding>
          {(() => {
            const isActive = location.pathname === archiveUrl;
            return (
              <Tooltip title={!open ? 'Kho lưu trữ' : ''} placement="right">
                <ListItemButton
                  onClick={() => navigate(archiveUrl)}
                  sx={{
                    mx: 1, mb: 0.5, borderRadius: '10px',
                    minHeight: 42,
                    justifyContent: open ? 'initial' : 'center',
                    bgcolor: isActive ? ACTIVE_BG : 'transparent',
                    '&:hover': { bgcolor: isActive ? ACTIVE_BG : HOVER_BG },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 0, mr: open ? 2 : 0, justifyContent: 'center', display: 'flex', alignItems: 'center', width: 24, flexShrink: 0 }}>
                    <Box component="img" src="/images/archive.png" alt="archive" sx={{ width: 22, height: 22, objectFit: 'contain' }} />
                  </ListItemIcon>
                  {open && (
                    <ListItemText
                      primary="Kho lưu trữ"
                      primaryTypographyProps={{
                        fontSize: 13.5, fontWeight: isActive ? 600 : 400,
                        color: isActive ? ACTIVE_TEXT : TEXT_COLOR,
                        noWrap: true,
                      }}
                    />
                  )}
                </ListItemButton>
              </Tooltip>
            );
          })()}
        </List>
      </Box>

      {open && (
        <Box sx={{ px: 2, py: 1.5, borderTop: '1px solid rgba(255, 255, 255, 1)' }}>
          <Typography fontSize={10} color="#fff" textAlign="center" lineHeight={2}>
            Collab - Project Management System
            <br />Phiên bản 1.0
          </Typography>
        </Box>
      )}
    </Drawer>
  );
}
