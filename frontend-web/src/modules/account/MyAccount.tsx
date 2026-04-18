import {
  Box, Typography, Avatar, Paper, Divider,
  Chip, Stack, Tooltip,
} from '@mui/material';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import GoogleIcon from '@mui/icons-material/Google';
import { useGetCurrentUser } from '../login/api/auth';
import { useGetProjects } from '../project/api/get-project';
import { getProjectColor } from '../../utils/projectColor';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../routes/urls';
import LoadingPage from '../../components/loading/LoadingPage';

export function Account() {
  const { data: user, isLoading } = useGetCurrentUser();
  const { data: projects = [] } = useGetProjects();
  const navigate = useNavigate();

  if (isLoading) return <LoadingPage />;

  const joinedDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' })
    : '—';

  return (
    <Box>
      {/* Profile card */}
      <Paper elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden', mb: 3 }}>
        {/* Banner */}
        <Box sx={{ height: 100, bgcolor: '#5663ee', background: 'linear-gradient(135deg, #5663ee 0%, #818cf8 100%)', display: 'flex', alignItems: 'flex-end', px: 3, pb: 1.5 }}>
          <Typography fontSize={13} fontWeight={600} color="rgba(255,255,255,0.85)" letterSpacing={8} marginLeft={10}>
            TÀI KHOẢN CỦA TÔI
          </Typography>
        </Box>

        {/* Avatar + info */}
        <Box sx={{ px: 3, pb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 2, mt: -5, mb: 2 }}>
            <Avatar
              src={user?.picture ? user.picture.replace('=s96-c', '=s200-c') : undefined}
              sx={{ width: 80, height: 80, border: '4px solid #fff', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
            >
              {user?.name?.charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ mb: 0.5 }}>
              <Typography fontSize={20} fontWeight={700} color="#111827">{user?.name}</Typography>
              {user?.google_id && (
                <Chip
                  icon={<GoogleIcon sx={{ fontSize: '14px !important' }} />}
                  label="Google Account"
                  size="small"
                  sx={{ fontSize: 11, height: 20, bgcolor: '#f3f4f6', color: '#6b7280' }}
                />
              )}
            </Box>
          </Box>

          <Divider sx={{ mb: 2 }} />

          <Stack spacing={1.5}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <EmailOutlinedIcon sx={{ color: '#9ca3af', fontSize: 18 }} />
              <Typography fontSize={14} color="#374151">{user?.email}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <CalendarTodayOutlinedIcon sx={{ color: '#9ca3af', fontSize: 18 }} />
              <Typography fontSize={14} color="#374151">Tham gia từ {joinedDate}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <FolderOutlinedIcon sx={{ color: '#9ca3af', fontSize: 18 }} />
              <Typography fontSize={14} color="#374151">
                Đang tham gia <strong>{projects.length}</strong> dự án
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Paper>

      {projects.length > 0 && (
        <Paper elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden' }}>
          <Box sx={{ px: 3, py: 2, borderBottom: '1px solid #f3f4f6' }}>
            <Typography fontSize={15} fontWeight={600} color="#111827">Dự án đang tham gia</Typography>
          </Box>
          <Box sx={{ p: 2, display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
            {projects.map((project) => {
              const color = getProjectColor(project.project_id);
              return (
                <Tooltip key={project.project_id} title={`Đi tới dự án: ${project.name}`}>
                  <Box
                    onClick={() => navigate(ROUTES.projectBoard(project.project_id))}
                    sx={{
                      display: 'flex', alignItems: 'center', gap: 1.5,
                      px: 2, py: 1.2,
                      border: '1px solid #e5e7eb', borderRadius: '8px',
                      cursor: 'pointer', bgcolor: '#fff',
                      '&:hover': { bgcolor: '#f8fafc', borderColor: '#5663ee' },
                      transition: 'all 0.15s',
                      minWidth: 180,
                    }}
                  >
                    <Avatar
                      variant="rounded"
                      sx={{ width: 28, height: 28, fontSize: 12, fontWeight: 700, bgcolor: color.bg, color: color.text, borderRadius: '6px', flexShrink: 0 }}
                    >
                      {project.name.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography fontSize={13} fontWeight={500} color="#111827" noWrap>{project.name}</Typography>
                      <Typography fontSize={11} color="#9ca3af">
                        {project.access === 'private' ? '🔒 Riêng tư' : '🌐 Công khai'}
                      </Typography>
                    </Box>
                  </Box>
                </Tooltip>
              );
            })}
          </Box>
        </Paper>
      )}
    </Box>
  );
}

export default Account;
