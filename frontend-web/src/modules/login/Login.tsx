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
import Verify from '../../components/modal/modalVerify';
import styles from './Login.module.scss';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mounted, setMounted] = useState(false);
  const [showVerify, setShowVerify] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);

    if (mounted) {
      const searchParams = new URLSearchParams(location.search);
      const token = searchParams.get('token');
      if (token) {
        localStorage.setItem('access_token', token);
        fetch('http://localhost:3000/auth/check-user', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.is_active) {
              navigate('/dashboard');
            } else {
              setUserEmail(data.email);
              setShowVerify(true);
            }
          })
          .catch((err) => {
            console.error('Error checking user status:', err);
            setShowVerify(true);
          });
      }
    }
  }, [mounted, navigate, location]);

  if (!mounted) {
    return null;
  }

  const handleCloseVerify = () => {
    setShowVerify(false);
  };

  return (
    <Box className={styles.loginContainer}>
      <Button
        variant="outlined"
        onClick={() => setShowVerify(true)}
        className={styles.signInButton}
      >
        Sign In
      </Button>
      {showVerify && (
        <Verify
          email={userEmail}
          onClose={handleCloseVerify} 
        />
      )}
      {!showVerify && (
        <>
          <Box className={styles.bannerSection}>
            <Box className={styles.bannerContent}>
              <img
                src="/images/logo.jpg"
                alt="Banner"
              />
              <Typography variant="body1">
                With Collab you can easily create, duplicate and assign a worker to
                a specific shift or event. Every new shift will be added to your
                calendar where you can manage it.
              </Typography>
            </Box>
          </Box>
          <Box className={styles.formSection}>
            <Paper elevation={3} className={styles.loginPaper}>
              <Box className={styles.bannerImage}>
                <img
                  src="/images/banner1.jpg"
                  alt="Banner"
                />
              </Box>
              <Typography
                variant="h5"
                className={styles.title}
              >
                Get Started With Collab
              </Typography>
              <Typography
                className={styles.subtitle}
              >
                Enter your details below
              </Typography>
              <TextField
                fullWidth
                label="Enter Your Email"
                variant="outlined"
                margin="normal"
              />
              <Button
                fullWidth
                variant="contained"
                color="primary"
                className={styles.getStartedButton}
                onClick={() => navigate('/home')}
              >
                Get Started For Free
              </Button>
              <Box className={styles.dividerContainer}>
                <Divider className={styles.divider} />
                <Typography className={styles.dividerText} variant="body2">
                  Or continue with
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
                onClick={() =>
                  (window.location.href = 'http://localhost:3000/auth/google')
                }
                className={styles.googleButton}
              >
                Sign in with Google
              </Button>
            </Paper>
          </Box>
        </>
      )}
    </Box>
  );
}