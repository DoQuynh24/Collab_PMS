import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TodayIcon from '@mui/icons-material/Today';
import { MONTHS } from '../constant';

interface Props {
  year: number;
  month: number;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}

export function CalendarNav({ year, month, onPrev, onNext, onToday }: Props) {
  const today = new Date();
  const isCurrentView = year === today.getFullYear() && month === today.getMonth();

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
        <Tooltip title="Tháng trước">
          <IconButton size="small" onClick={onPrev} sx={{ borderRadius: 0, borderRight: '1px solid #e5e7eb', px: 1.2 }}>
            <ChevronLeftIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Typography fontSize={14} fontWeight={600} color="#111827" sx={{ px: 2.5, minWidth: 140, textAlign: 'center' }}>
          {MONTHS[month]} {year}
        </Typography>
        <Tooltip title="Tháng sau">
          <IconButton size="small" onClick={onNext} sx={{ borderRadius: 0, borderLeft: '1px solid #e5e7eb', px: 1.2 }}>
            <ChevronRightIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <Tooltip title="Về tháng hiện tại">
        <IconButton
          size="small"
          onClick={onToday}
          sx={{
            border: '1px solid',
            borderColor: isCurrentView ? '#5663ee' : '#e5e7eb',
            borderRadius: '6px', px: 1.5, gap: 0.5,
            bgcolor: isCurrentView ? '#eef0ff' : 'transparent',
          }}
        >
          <TodayIcon fontSize="small" sx={{ color: isCurrentView ? '#5663ee' : 'inherit' }} />
          <Typography fontSize={12} color={isCurrentView ? '#5663ee' : 'inherit'}>Hôm nay</Typography>
        </IconButton>
      </Tooltip>
    </Box>
  );
}
