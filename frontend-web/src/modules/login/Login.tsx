import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Divider,
  Paper,
} from '@mui/material';
import styles from './Login.module.scss';
import { startGoogleLogin } from './api/auth';


export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    if (mounted) {
      const searchParams = new URLSearchParams(location.search);
      const token = searchParams.get('token');

      if (token) {
        localStorage.setItem('access_token', token);

        navigate('/');
      }
    }
  }, [mounted, navigate, location]);

  if (!mounted) {
    return null;
  }

  return (
    <Box className={styles.loginContainer}>
      <Box className={styles.bannerSection}>
        <Box className={styles.bannerContent}>
          <img src="/images/logo.jpg" alt="Banner" />
          <Typography variant="body1">
            Collab giúp bạn dễ dàng quản lý dự án.
            <br/> 
            Bạn có thể nhanh chóng tạo, sao chép và phân công nhiệm vụ cho thành viên. 
            Mọi nhiệm vụ đều được cập nhật trên bảng công việc, theo dõi tiến độ mọi lúc.
          </Typography>
        </Box>
      </Box>

      <Box className={styles.formSection}>
        <Paper elevation={3} className={styles.loginPaper}>
          <Box className={styles.bannerImage}>
            <img src="/images/banner1.jpg" alt="Banner" />
          </Box>
          <Typography variant="h5" className={styles.title}>
            Bắt đầu cùng với Collab
          </Typography>
          <Typography className={styles.subtitle}>
            Nhập thông tin của bạn bên dưới
          </Typography>

          <TextField
            fullWidth
            label="Nhập email của bạn"
            variant="outlined"
            margin="normal"
          />

          <Button
            fullWidth
            variant="contained"
            color="primary"
            className={styles.getStartedButton}
            onClick={startGoogleLogin} 
          >
            Bắt đầu miễn phí
          </Button>

          <Box className={styles.dividerContainer}>
            <Divider className={styles.divider} />
            <Typography className={styles.dividerText} variant="body2">
              Hoặc tiếp tục với
            </Typography>
            <Divider className={styles.divider} />
          </Box>

          <Button
            fullWidth
            variant="outlined"
            startIcon={
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google"
              />
            }
            onClick={startGoogleLogin} 
            className={styles.googleButton}
          >
            Đăng nhập bằng Google
          </Button>
        </Paper>
      </Box>
    </Box>
  );
}

export default Login;