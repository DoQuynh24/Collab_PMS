import { useEffect, useState } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import styles from './modalVerify.module.scss';

interface VerifyProps {
  email: string | null;
  onClose: () => void; 
}

export default function Verify({ email, onClose }: VerifyProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleResendEmail = async () => {
    try {
      await fetch('http://localhost:3000/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({ email }),
      });
      alert('Verification email resent successfully!');
    } catch (error) {
      alert('Failed to resend verification email.');
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <>
      <Box className={styles.overlay} onClick={onClose} />
      <Paper className={styles.verifyModal}>
        <Button className={styles.closeButton} onClick={onClose}>
          &times;
        </Button>
        <Box className={styles.logoSection}>
          <img
            src="/images/logo.jpg"
            alt="Logo"
          />
          <Typography variant="h5" className={styles.title}>Collab</Typography>
        </Box>
        <Box className={styles.verifyImage}>
          <img
            src="/images/verify.jpg"
            alt="Verify Email"
          />
        </Box>
        <Typography className={styles.instructions} color="text.secondary">
          <p>We’ve sent a verification link to your email.</p>
          <p>{email || 'your email address'}</p>
          <p>Please check your inbox and activate your account.</p>
        </Typography>
        <Button
          fullWidth
          variant="contained"
          className={styles.checkEmailButton}
          onClick={() => alert('Please click the link in your email to verify.')}
        >
          Check Your Email
        </Button>
        <Box className={styles.resendLink}>
          <Typography variant="body2" className={styles.resendText}>
            Didn’t receive the email?{' '}
            <Typography
              component="span"
              className={styles.resendAction}
              onClick={handleResendEmail}
            >
              Resend
            </Typography>
          </Typography>
        </Box>
      </Paper>
    </>
  );
}