import { createTheme } from '@mui/material';

export const theme = createTheme({
  components: {
    MuiAvatar: {
      defaultProps: {
        imgProps: {
          referrerPolicy: "no-referrer",
        },
      },
    },
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