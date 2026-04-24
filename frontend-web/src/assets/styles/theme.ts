import { createTheme, type PaletteMode } from '@mui/material';

export const createAppTheme = (mode: PaletteMode) => createTheme({
  palette: {
    mode,
    ...(mode === 'dark' ? {
      background: { default: '#0f1117', paper: '#1a1d27' },
      text: { primary: '#fff', secondary: '#fff' },
      divider: '#2d3148',
    } : {
      background: { default: '#fff', paper: '#ffffff' },
      text: { primary: '#111827', secondary: '#6b7280' },
      divider: '#e5e7eb',
    }),
  },
  components: {
    MuiAvatar: {
      defaultProps: {
        imgProps: { referrerPolicy: 'no-referrer' },
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
    MuiPaper: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundImage: 'none',
          ...(theme.palette.mode === 'dark' && {
            border: '1px solid #2d3148',
          }),
        }),
      },
    },
  },
});

export const theme = createAppTheme('light');
