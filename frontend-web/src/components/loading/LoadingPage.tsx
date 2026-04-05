import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import styles from './LoadingPage.module.scss';

type LoadingPageProps = {
    loadFiles?: boolean;
};

const LoadingPage: React.FC<LoadingPageProps> = ({ loadFiles }) => {
    return (
        <Box
            className={
                loadFiles === true
                    ? styles.loadingFiles
                    : styles.loadingContainer
            }
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <CircularProgress size={40} className={styles.loadingLogo} />
            <Typography variant="body1" className={styles.loadingText} sx={{ mt: 2 }}>
                Đang tải...
            </Typography>
        </Box>
    );
};

export default LoadingPage;