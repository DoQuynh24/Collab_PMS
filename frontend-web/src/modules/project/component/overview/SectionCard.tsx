import { Box, Typography, Paper, Divider } from '@mui/material';
import type { ReactNode } from 'react';
import styles from '../../ProjectOverview.module.scss';

interface Props {
  title: string;
  children: ReactNode;
  span2?: boolean;
  action?: ReactNode;
  maxHeight?: number;
  fixedHeight?: number;
}

export function SectionCard({ title, children, span2 = false, action, maxHeight, fixedHeight }: Props) {
  return (
    <Paper elevation={0} className={styles.card} sx={span2 ? { gridColumn: 'span 2' } : {}}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography className={styles.cardTitle} sx={{ mb: 0 }}>{title}</Typography>
        {action}
      </Box>
      <Divider sx={{ mb: 2 }} />
      <Box sx={{
        ...(fixedHeight ? { height: fixedHeight } : {}),
        ...(maxHeight ? { maxHeight } : {}),
        ...(fixedHeight || maxHeight ? { overflowY: 'auto', pr: 0.5 } : {}),
      }}>
        {children}
      </Box>
    </Paper>
  );
}
