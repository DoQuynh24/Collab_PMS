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
import { useGetCurrentUser } from '../modules/login/api/auth';

const DRAWER_WIDTH = 240;
const COLLAPSED_WIDTH = 65;
const MOBILE_DRAWER_WIDTH = 296;

const SIDEBAR_BG = '#5663ee';
const ACTIVE_BG = 'rgba(255,255,255,0.18)';
const HOVER_BG = 'rgba(255,255,255,0.10)';
const TEXT_COLOR = '#ffffff';
const ACTIVE_TEXT = '#ffffff';
const LABEL_COLOR = '#ffffff';

interface Props {
  open: boolean;
  onToggle: () => void;
  isMobile?: boolean;
}

export function Sidebar({ open, onToggle, isMobile = false }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: user } = useGetCurrentUser();

  const menuItems = [
    { text: 'Dành cho bạn', 
      icon: <Box component="img" src="/images/home.png" alt="home" sx={{ width: 22, height: 22, objectFit: 'contain' }} />, 
      path: '/home' },
    { text: 'Tham gia dự án',
      icon: <Box component="img" src="/images/microsoft-project.png" alt="join" sx={{ width: 25, height: 25, objectFit: 'contain' }} />, 
      path: joinProjectUrl },
  ];

  const isExpanded = isMobile || open;

  const handleNavigate = (path: string) => {
    navigate(path);
    if (isMobile) onToggle();
  };

  const renderItem = (item: { text: string; icon: React.ReactNode; path: string }) => {
    const isActive = location.pathname === item.path;
    return (
      <Tooltip key={item.text} title={!isExpanded ? item.text : ''} placement="right">
        <ListItemButton
          onClick={() => handleNavigate(item.path)}
          sx={{
            mx: isMobile ? 1.5 : 1,
            mb: 0.75,
            borderRadius: '14px',
            minHeight: isMobile ? 48 : 42,
            justifyContent: isExpanded ? 'initial' : 'center',
            bgcolor: isActive ? ACTIVE_BG : 'transparent',
            '&:hover': { bgcolor: isActive ? ACTIVE_BG : HOVER_BG },
            transition: 'background 0.15s',
          }}
        >
          <ListItemIcon sx={{
            minWidth: 0, mr: isExpanded ? 1.5 : 0,
            justifyContent: 'center',
            color: isActive ? ACTIVE_TEXT : TEXT_COLOR,
          }}>
            {item.icon}
          </ListItemIcon>
          {isExpanded && (
            <ListItemText
              primary={item.text}
              primaryTypographyProps={{
                fontSize: isMobile ? 14 : 13.5, fontWeight: isActive ? 600 : 400,
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
      variant={isMobile ? 'temporary' : 'permanent'}
      open={open}
      onClose={onToggle}
      ModalProps={{ keepMounted: true }}
      sx={{
        width: isMobile ? MOBILE_DRAWER_WIDTH : open ? DRAWER_WIDTH : COLLAPSED_WIDTH,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: isMobile ? `min(${MOBILE_DRAWER_WIDTH}px, 88vw)` : open ? DRAWER_WIDTH : COLLAPSED_WIDTH,
          boxSizing: 'border-box',
          overflowX: 'hidden',
          transition: 'width 0.3s ease',
          bgcolor: SIDEBAR_BG,
          backgroundImage: 'linear-gradient(180deg, #5663ee 0%, #4857e5 52%, #3948ca 100%)',
          borderTopRightRadius: isMobile ? '0' : '136px',
          borderBottomRightRadius: isMobile ? '0' : '24px',
          border: 'none',
          boxShadow: isMobile ? '0 20px 48px rgba(17, 24, 39, 0.28)' : 'none',
        },
      }}
    >
      <Toolbar sx={{ minHeight: '60px !important' }} />

      <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', py: 1.5, pt: isExpanded ? 1.5 : '20px', scrollbarWidth: 'none' }}>
        {isMobile && (
          <Box
            sx={{
              mx: 1.5,
              mb: 2,
              px: 1.75,
              py: 1.5,
              borderRadius: '18px',
              bgcolor: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.14)',
            }}
          >
            <Typography fontSize={11} fontWeight={700} letterSpacing={1.1} color="rgba(255,255,255,0.72)" sx={{ mb: 0.5 }}>
              TÀI KHOẢN
            </Typography>
            <Typography fontSize={16} fontWeight={700} color="#fff" noWrap>
              {user?.name ?? 'Người dùng'}
            </Typography>
            <Typography fontSize={12} color="rgba(255,255,255,0.76)" noWrap>
              {user?.email ?? 'Đang đồng bộ tài khoản'}
            </Typography>
          </Box>
        )}

        {isExpanded && (
          <Typography fontSize={11} fontWeight={600} color={LABEL_COLOR} letterSpacing={1}
            sx={{ px: isMobile ? 3 : 2.5, mb: 0.5, mt: 1 }}>
            MENU
          </Typography>
        )}
        <List disablePadding>
          {menuItems.map(renderItem)}
        </List>

        {isExpanded && (
          <Typography fontSize={11} fontWeight={600} color={LABEL_COLOR} letterSpacing={1}
            sx={{ px: isMobile ? 3 : 2.5, mb: 0.5, mt: 2 }}>
            DỰ ÁN
          </Typography>
        )}
        <ProjectList open={isExpanded} />

        {isExpanded && (
          <Typography fontSize={11} fontWeight={600} color={LABEL_COLOR} letterSpacing={1}
            sx={{ px: isMobile ? 3 : 2.5, mb: 0.5, mt: 2 }}>
            KHÁC
          </Typography>
        )}
        <List disablePadding>
          {(() => {
            const isActive = location.pathname === archiveUrl;
            return (
              <Tooltip title={!isExpanded ? 'Kho lưu trữ' : ''} placement="right">
                <ListItemButton
                  onClick={() => handleNavigate(archiveUrl)}
                  sx={{
                    mx: isMobile ? 1.5 : 1,
                    mb: 0.5,
                    borderRadius: '14px',
                    minHeight: isMobile ? 48 : 42,
                    justifyContent: isExpanded ? 'initial' : 'center',
                    bgcolor: isActive ? ACTIVE_BG : 'transparent',
                    '&:hover': { bgcolor: isActive ? ACTIVE_BG : HOVER_BG },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 0, mr: isExpanded ? 2 : 0, justifyContent: 'center', display: 'flex', alignItems: 'center', width: 24, flexShrink: 0 }}>
                    <Box component="img" src="/images/archive.png" alt="archive" sx={{ width: 22, height: 22, objectFit: 'contain' }} />
                  </ListItemIcon>
                  {isExpanded && (
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

      {isExpanded && (
        <Box sx={{ px: 2, py: 1.5, borderTop: '1px solid rgba(255, 255, 255, 0.28)' }}>
          <Typography fontSize={10} color="#fff" textAlign="center" lineHeight={2}>
            Collab - Project Management System
            <br />Phiên bản 1.0
          </Typography>
        </Box>
      )}
    </Drawer>
  );
}
