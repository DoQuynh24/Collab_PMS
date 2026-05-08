import { useState } from 'react';
import {
  Drawer, Box, Typography, IconButton, Divider,
  List, ListItemButton, Tooltip, CircularProgress, Tabs, Tab,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined';
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { useGetNotifications } from '../api/get-notifications';
import { useMarkAllRead } from '../api/mark-all-read';
import { useMarkOneRead } from '../api/mark-one-read';
import { useDeleteNotification } from '../api/delete-notification';
import { useDeleteAllNotifications } from '../api/delete-all-notifications';
import { ModalConfirm } from '../../../components/modal/modalConfirm';
import type { INotification } from '../types';
import { NOTIFICATION_BG, NOTIFICATION_ICON_COLOR } from '../../../constant';
import { ROUTES } from '../../../routes/urls';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function NotificationPanel({ open, onClose }: Props) {
  const navigate = useNavigate();
  const { data: notifications = [], isLoading } = useGetNotifications();
  const { mutate: markAll } = useMarkAllRead();
  const { mutate: markOne } = useMarkOneRead();
  const { mutate: deleteOne } = useDeleteNotification();
  const { mutate: deleteAll } = useDeleteAllNotifications();
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);
  const [tab, setTab] = useState<'all' | 'unread'>('all');

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const displayed = tab === 'unread' ? notifications.filter(n => !n.is_read) : notifications;

  const handleClick = (n: INotification) => {
    if (!n.is_read) markOne(n.id);
    if (n.type === 'join_request_received' && n.project_id) {
      navigate(`${ROUTES.projectMembersSettings(n.project_id)}?tab=requests`);
    } else if (n.type === 'join_request_approved' && n.project_id) {
      navigate(ROUTES.projectBoard(n.project_id));
    } else if (n.type === 'join_request_rejected') {
      navigate('/home');
    } else if (n.type === 'new_comment' && n.project_id) {
      const url = n.entity_id
        ? `${ROUTES.projectBoard(n.project_id)}?taskId=${n.entity_id}`
        : ROUTES.projectBoard(n.project_id);
      navigate(url);
    } else if (n.type === 'assigned_task' && n.project_id) {
      const url = n.entity_id
        ? `${ROUTES.projectBoard(n.project_id)}?taskId=${n.entity_id}`
        : ROUTES.projectBoard(n.project_id);
      navigate(url);
    } else if (n.type === 'status_changed' && n.project_id) {
      const url = n.entity_id
        ? `${ROUTES.projectBoard(n.project_id)}?taskId=${n.entity_id}`
        : ROUTES.projectBoard(n.project_id);
      navigate(url);
    } else if (n.type === 'deadline_upcoming' && n.project_id) {
      const url = n.entity_id
        ? `${ROUTES.projectBoard(n.project_id)}?taskId=${n.entity_id}`
        : ROUTES.projectBoard(n.project_id);
      navigate(url);
    }
    onClose();
  };

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        variant="temporary"
        slotProps={{ backdrop: { invisible: true } }}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 2,
          '& .MuiDrawer-paper': {
            width: 380,
            top: '60px',
            height: 'calc(100% - 60px)',
            boxShadow: '-4px 0 20px rgba(0,0,0,0.12)',
            borderLeft: '1px solid #e5e7eb',
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2.5, py: 2, borderBottom: '1px solid #f3f4f6' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography fontSize={16} fontWeight={700} color="#111827">Thông báo</Typography>
            {unreadCount > 0 && (
              <Box sx={{ px: 1, py: 0.2, bgcolor: '#5663ee', color: '#fff', borderRadius: '10px', fontSize: 11, fontWeight: 600 }}>
                {unreadCount}
              </Box>
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {unreadCount > 0 && (
              <Tooltip title="Đánh dấu tất cả đã đọc">
                <IconButton size="small" onClick={() => markAll()} sx={{ color: '#5663ee' }}>
                  <DoneAllIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {notifications.length > 0 && (
              <Tooltip title="Xóa tất cả thông báo">
                <IconButton size="small" onClick={() => setConfirmDeleteAll(true)} sx={{ color: '#ef4444' }}>
                  <DeleteSweepIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            <IconButton size="small" onClick={onClose} sx={{ color: '#6b7280' }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{
            px: 1, minHeight: 40, borderBottom: '1px solid #f3f4f6',
            '& .MuiTab-root': { minHeight: 40, fontSize: 13, textTransform: 'none', py: 0 },
            '& .MuiTabs-indicator': { bgcolor: '#5663ee' },
          }}
        >
          <Tab value="all" label="Tất cả" sx={{ color: tab === 'all' ? '#5663ee' : '#6b7280' }} />
          <Tab
            value="unread"
            label={unreadCount > 0 ? `Chưa đọc (${unreadCount})` : 'Chưa đọc'}
            sx={{ color: tab === 'unread' ? '#5663ee' : '#6b7280' }}
          />
        </Tabs>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress size={28} sx={{ color: '#5663ee' }} />
          </Box>
        ) : displayed.length === 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8, gap: 1.5 }}>
            <NotificationsNoneIcon sx={{ fontSize: 48, color: '#d1d5db' }} />
            <Typography fontSize={14} color="#9ca3af">
              {tab === 'unread' ? 'Không có thông báo chưa đọc' : 'Chưa có thông báo nào'}
            </Typography>
          </Box>
        ) : (
          <List disablePadding sx={{ overflowY: 'auto', flex: 1 }}>
            {displayed.map((n, idx) => (
              <Box key={n.id}>
                {idx > 0 && <Divider />}
                <ListItemButton
                  onClick={() => handleClick(n)}
                  sx={{
                    px: 2.5, py: 1.5, gap: 1.5, alignItems: 'flex-start',
                    bgcolor: n.is_read ? 'transparent' : '#f8f9ff',
                    '&:hover': { bgcolor: '#f3f4f6' },
                    '&:hover .delete-btn': { opacity: 1 },
                  }}
                >
                  <Box sx={{
                    width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                    bgcolor: NOTIFICATION_BG[n.type],
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: NOTIFICATION_ICON_COLOR[n.type],
                  }}>
                    {n.type === 'join_request_received' && <GroupAddIcon fontSize="small" />}
                    {n.type === 'join_request_approved' && <CheckCircleOutlineIcon fontSize="small" />}
                    {n.type === 'join_request_rejected' && <CancelOutlinedIcon fontSize="small" />}
                    {n.type === 'new_comment' && <ChatBubbleOutlineIcon fontSize="small" />}
                    {n.type === 'assigned_task' && <AssignmentIndOutlinedIcon fontSize="small" />}
                    {n.type === 'status_changed' && <SwapHorizOutlinedIcon fontSize="small" />}
                    {n.type === 'deadline_upcoming' && <AccessTimeOutlinedIcon fontSize="small" />}
                  </Box>

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography fontSize={13} fontWeight={n.is_read ? 400 : 600} color="#111827" sx={{ lineHeight: 1.4 }}>
                      {n.title}
                    </Typography>
                    <Typography fontSize={12} color="#6b7280" mt={0.3} sx={{ lineHeight: 1.5 }}>
                      {n.body}
                    </Typography>
                    <Typography fontSize={11} color="#9ca3af" mt={0.5}>
                      {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: vi })}
                    </Typography>
                  </Box>

                  {!n.is_read && (
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#5663ee', flexShrink: 0, mt: 0.5 }} />
                  )}

                  <Tooltip title="Xóa thông báo">
                    <IconButton
                      size="small"
                      className="delete-btn"
                      onClick={(e) => { e.stopPropagation(); deleteOne(n.id); }}
                      sx={{ opacity: 0, flexShrink: 0, color: '#9ca3af', '&:hover': { color: '#ef4444' }, transition: 'opacity 0.15s' }}
                    >
                      <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                </ListItemButton>
              </Box>
            ))}
          </List>
        )}

        {displayed.length > 0 && (
          <Box sx={{ px: 2.5, py: 1.5, borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'flex-end' }}>
            <Typography fontSize={11} color="#9ca3af">
              {displayed.length} thông báo
            </Typography>
          </Box>
        )}
      </Drawer>

      <ModalConfirm
        open={confirmDeleteAll}
        setOpen={setConfirmDeleteAll}
        title="Xóa tất cả thông báo"
        message={<>Bạn có chắc chắn muốn xóa toàn bộ thông báo không?
                <br/>
                Hành động này không thể hoàn tác.</>}
        titleButton="Xóa tất cả"
        cancelButtonText="Hủy"
        onClick={() => deleteAll()}
        isDelete={true}
        confirmButtonProps={{ sx: { bgcolor: '#ef4444', '&:hover': { bgcolor: '#dc2626' } } }}
      />
    </>
  );
}
