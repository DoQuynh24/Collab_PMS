import {
  Box, Typography, IconButton, Tooltip, Switch, Divider, CircularProgress, Paper,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetProjectById } from '../../api/get-project-id';
import { useGetCurrentUser } from '../../../login/api/auth';
import { useGetNotificationPreferences } from '../../../notification/api/get-notification-preferences';
import { useUpdateNotificationPreferences } from '../../../notification/api/update-notification-preferences';
import type { INotificationPreference } from '../../../notification/api/get-notification-preferences';
import { ROUTES } from '../../../../routes/urls';

type PrefKey = keyof INotificationPreference;

interface RowConfig {
  label: string;
  description: string;
  note?: string;
  inappKey: PrefKey | null;
  emailKey: PrefKey | null;
}

export function ProjectNotificationSettings() {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const { data: project } = useGetProjectById(projectId!);
  const { data: currentUser } = useGetCurrentUser();
  const { data: prefs, isLoading } = useGetNotificationPreferences(projectId!);
  const { mutate: updatePref } = useUpdateNotificationPreferences(projectId!);

  const members = project?.project_members ?? [];
  const isOwner = project?.owner_id === currentUser?.user_id;
  const isAdminOrOwner = isOwner || members.some(
    (m: any) => m.user_id === currentUser?.user_id && m.role === 'admin'
  );

  const ROWS: RowConfig[] = [
    {
      label: 'Được giao nhiệm vụ',
      description: 'Khi bạn được giao một nhiệm vụ trong dự án.',
      inappKey: 'assigned_inapp',
      emailKey: 'assigned_email',
    },
    {
      label: 'Thay đổi trạng thái',
      description: 'Khi trạng thái nhiệm vụ của bạn bị thay đổi bởi người khác.',
      inappKey: 'status_inapp',
      emailKey: 'status_email',
    },
    {
      label: 'Bình luận mới',
      description: 'Có bình luận mới trên nhiệm vụ bạn tạo.',
      inappKey: 'comment_inapp',
      emailKey: null,
    },
    {
      label: '@Mention',
      description: 'Được nhắc đến trực tiếp trong bình luận.',
      inappKey: 'mention_inapp',
      emailKey: 'mention_email',
    },
    ...(isAdminOrOwner ? [{
      label: 'Yêu cầu tham gia dự án',
      description: 'Có người gửi yêu cầu tham gia dự án.',
      note: 'Chỉ Admin và Chủ sở hữu nhận loại thông báo này.',
      inappKey: 'project_inapp' as PrefKey,
      emailKey: 'project_email' as PrefKey,
    }] : []),
  ];

  const handleToggle = (key: PrefKey, value: boolean) => {
    updatePref({ [key]: value });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Tooltip title="Quay lại">
          <IconButton onClick={() => navigate(ROUTES.projectDetail(projectId!))}>
            <ArrowBackIcon />
          </IconButton>
        </Tooltip>
        <Typography variant="h5" fontWeight={600}>Cài đặt thông báo</Typography>
      </Box>

      <Typography color="#555" mb={2}>
        Tùy chỉnh cách bạn nhận thông báo cho dự án <strong>{project?.name}</strong>. Cài đặt này chỉ áp dụng riêng cho bạn, thay đổi được lưu tự động. Mặc định tất cả thông báo đang bật.
      </Typography>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress size={28} sx={{ color: '#5663ee' }} />
        </Box>
      ) : (
        <Paper elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
          {/* Header */}
          <Box sx={{
            display: 'grid', gridTemplateColumns: '1fr 100px 100px',
            px: 3, py: 1.5, bgcolor: '#f9fafb', borderBottom: '1px solid #e5e7eb',
          }}>
            <Typography fontSize={13} fontWeight={600} color="#6b7280" textTransform="uppercase" letterSpacing={0.5}>
              Sự kiện
            </Typography>
            <Typography fontSize={13} fontWeight={600} color="#6b7280" textTransform="uppercase" letterSpacing={0.5} textAlign="center">
              In-app
            </Typography>
            <Typography fontSize={13} fontWeight={600} color="#6b7280" textTransform="uppercase" letterSpacing={0.5} textAlign="center">
              Email
            </Typography>
          </Box>

          {ROWS.map((row, idx) => {
            const inappVal = row.inappKey ? (prefs?.[row.inappKey] ?? true) : null;
            const emailVal = row.emailKey ? (prefs?.[row.emailKey] ?? true) : null;

            const hasBoth = row.inappKey !== null && row.emailKey !== null;
            const inappDisabled = hasBoth && !emailVal; 
            const emailDisabled = hasBoth && !inappVal;

            return (
              <Box key={row.label}>
                {idx > 0 && <Divider />}
                <Box sx={{
                  display: 'grid', gridTemplateColumns: '1fr 100px 100px',
                  px: 3, py: 2, alignItems: 'center',
                  '&:hover': { bgcolor: '#fafafa' },
                }}>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Typography fontSize={14} fontWeight={500} color="#111827">
                        {row.label}
                      </Typography>
                      {row.note && (
                        <Tooltip title={row.note} arrow placement="right">
                          <InfoOutlinedIcon sx={{ fontSize: 15, color: '#9ca3af', cursor: 'help' }} />
                        </Tooltip>
                      )}
                    </Box>
                    <Typography fontSize={12} color="#6b7280" mt={0.3}>
                      {row.description}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    {row.inappKey !== null ? (
                      <Tooltip title={inappDisabled ? 'Phải bật ít nhất một kênh thông báo' : ''} arrow>
                        <span>
                          <Switch
                            size="small"
                            checked={!!inappVal}
                            disabled={inappDisabled}
                            onChange={(_, checked) => handleToggle(row.inappKey!, checked)}
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': { color: '#5663ee' },
                              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#5663ee' },
                              '& .MuiSwitch-switchBase.Mui-checked.Mui-disabled': { color: '#5663ee' },
                              '& .MuiSwitch-switchBase.Mui-checked.Mui-disabled + .MuiSwitch-track': { bgcolor: '#5663ee', opacity: 0.7 },
                            }}
                          />
                        </span>
                      </Tooltip>
                    ) : (
                      <Typography fontSize={13} color="#d1d5db">—</Typography>
                    )}
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    {row.emailKey !== null ? (
                      <Tooltip title={emailDisabled ? 'Phải bật ít nhất một kênh thông báo' : ''} arrow>
                        <span>
                          <Switch
                            size="small"
                            checked={!!emailVal}
                            disabled={emailDisabled}
                            onChange={(_, checked) => handleToggle(row.emailKey!, checked)}
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': { color: '#5663ee' },
                              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#5663ee' },
                              '& .MuiSwitch-switchBase.Mui-checked.Mui-disabled': { color: '#5663ee' },
                              '& .MuiSwitch-switchBase.Mui-checked.Mui-disabled + .MuiSwitch-track': { bgcolor: '#5663ee', opacity: 0.7 },
                            }}
                          />
                        </span>
                      </Tooltip>
                    ) : (
                      <Typography fontSize={13} color="#d1d5db">—</Typography>
                    )}
                  </Box>
                </Box>
              </Box>
            );
          })}

          <Divider />
          <Box sx={{ px: 3, py: 1, bgcolor: '#f9fafb', borderTop: '1px solid #e5e7eb' }}>
            <Typography fontSize={11} fontWeight={600} color="#9ca3af" textTransform="uppercase" letterSpacing={0.5}>
              Nhắc nhở tự động — không thể tắt
            </Typography>
          </Box>
          {[
            { label: 'Deadline sắp tới', description: 'Nhắc nhở trước 1 ngày khi nhiệm vụ sắp đến hạn.' },
            { label: 'Nhiệm vụ quá hạn', description: 'Thông báo một lần khi nhiệm vụ đã quá deadline.' },
          ].map((item, idx) => (
            <Box key={item.label}>
              {idx > 0 && <Divider />}
              <Box sx={{
                display: 'grid', gridTemplateColumns: '1fr 100px 100px',
                px: 3, py: 2, alignItems: 'center', bgcolor: '#fafafa',
              }}>
                <Box>
                  <Typography fontSize={14} fontWeight={500} color="#6b7280">{item.label}</Typography>
                  <Typography fontSize={12} color="#9ca3af" mt={0.3}>{item.description}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Tooltip title="Không thể tắt — đây là nhắc nhở quan trọng" arrow>
                    <Switch size="small" checked disabled sx={{ opacity: 0.5 }} />
                  </Tooltip>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Tooltip title="Không thể tắt — đây là nhắc nhở quan trọng" arrow>
                    <Switch size="small" checked disabled sx={{ opacity: 0.5 }} />
                  </Tooltip>
                </Box>
              </Box>
            </Box>
          ))}
        </Paper>
      )}
    </Box>
  );
}

export default ProjectNotificationSettings;
