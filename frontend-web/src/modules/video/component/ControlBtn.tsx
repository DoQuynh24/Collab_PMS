import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import type { ReactNode } from 'react';

interface Props {
  label: string;
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}

export function ControlBtn({ label, active, disabled, onClick, children }: Props) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
      <Tooltip title={label}>
        <span>
          <IconButton
            onClick={onClick}
            disabled={disabled}
            sx={{
              width: 52, height: 52,
              bgcolor: active ? '#374151' : '#1e2130',
              color: active ? '#ef4444' : '#fff',
              '&:hover': { bgcolor: active ? '#4b5563' : '#2d3148', transform: 'none' },
              '&:disabled': { opacity: 0.4 },
            }}
          >
            {children}
          </IconButton>
        </span>
      </Tooltip>
      <Typography fontSize={11} color="#6b7280">{label}</Typography>
    </Box>
  );
}
