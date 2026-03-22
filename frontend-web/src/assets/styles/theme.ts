import { createTheme } from '@mui/material';

export const theme = createTheme({
  components: {
    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: 'transform 0.2s ease',
          '&:hover': {
            background: 'transparent',
            transform: 'scale(1.10)',
          },
        },
      },
    },
  },
});