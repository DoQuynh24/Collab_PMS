import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Box, Typography, CircularProgress, Button, Paper } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useAcceptInvitation } from '../api/accept-invitation';

export function InvitationAccept() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [projectId, setProjectId] = useState('');
  const [message, setMessage] = useState('');
  const { mutate: acceptInvitation } = useAcceptInvitation();

  useEffect(() => {
    if (!token) { setStatus('error'); setMessage('Token không hợp lệ.'); return; }
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      localStorage.setItem('invitation_redirect', `/invitations/accept?token=${token}`);
      navigate('/login');
      return;
    }
    acceptInvitation(token, {
      onSuccess: (data) => { setStatus('success'); setProjectId(data.project_id); },
      onError: (err: any) => {
        const msg = err?.response?.data?.message || err?.message || 'Có lỗi xảy ra.';
        if (msg.includes('not for your email')) {
          localStorage.removeItem('access_token');
          localStorage.setItem('invitation_redirect', `/invitations/accept?token=${token}`);
          setStatus('error');
          setMessage('Lời mời này không dành cho tài khoản của bạn. Vui lòng đăng nhập đúng tài khoản.');
        } else {
          setStatus('error');
          setMessage(msg);
        }
      },
    });
  }, [token]);

  return (
    <Box sx={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', background: '#f4f5f7',
    }}>
      <Paper elevation={0} sx={{
        width: 420, borderRadius: '12px', p: 5,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
        border: '1px solid #e0e0e0',
      }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box
            component="img"
            src="/images/logo.jpg"
            alt="logo"
            sx={{ width: 52, height: 52, objectFit: 'cover' }}
          />
          <Typography fontWeight={700} fontSize={22} color="#5663ee">Collab PMS</Typography>
        </Box>
        {status === 'loading' && (
          <>
            <CircularProgress sx={{ color: '#5663ee', mt: 2 }} />
            <Typography fontSize={15} color="#555">Đang xử lý lời mời...</Typography>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircleOutlineIcon sx={{ fontSize: 64, color: '#4CAF50', mt: 1 }} />
            <Typography fontSize={22} fontWeight={600} color="#172b4d">Chào mừng bạn!</Typography>
            <Typography fontSize={15} color="#666" textAlign="center">
              Bạn đã tham gia dự án thành công. Hãy bắt đầu cộng tác với nhóm của bạn.
            </Typography>
            <Button
              variant="contained"
              fullWidth
              onClick={() => navigate(`/projects/${projectId}`)}
              sx={{ backgroundColor: '#5663ee', '&:hover': { backgroundColor: '#4451d3' }, mt: 1, borderRadius: '8px', py: 1.2 }}
            >
              Vào dự án ngay
            </Button>
          </>
        )}

        {status === 'error' && (
          <>
            <ErrorOutlineIcon sx={{ fontSize: 64, color: '#e53935', mt: 1 }} />
            <Typography fontSize={20} fontWeight={600} color="#172b4d">Có lỗi xảy ra</Typography>
            <Typography fontSize={14} color="#666" textAlign="center">{message}</Typography>
            <Button variant="contained" fullWidth onClick={() => navigate('/login')}
              sx={{ backgroundColor: '#5663ee', borderRadius: '8px', py: 1.2 }}>
              Đăng nhập lại
            </Button>
            <Button variant="outlined" fullWidth onClick={() => navigate('/')}
              sx={{ borderColor: '#d3d3d3', color: '#555', borderRadius: '8px', py: 1.2 }}>
              Về trang chủ
            </Button>
          </>
        )}
      </Paper>
    </Box>
  );
}

export default InvitationAccept;