import { LinearProgress, Tooltip } from '@mui/material';
import styles from '../../ProjectOverview.module.scss';

interface Props {
  value: number;
  color?: string;
  tooltipTitle: string;
  height?: number;
}

export function ProgressBar({ value, color = '#5663ee', tooltipTitle, height }: Props) {
  return (
    <Tooltip title={tooltipTitle} placement="top">
      <LinearProgress
        variant="determinate"
        value={value}
        className={height ? undefined : styles.progressBar}
        sx={{
          ...(height ? { height, borderRadius: height / 2, bgcolor: '#e5e7eb', flex: 1 } : {}),
          '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: height ? height / 2 : 3 },
        }}
      />
    </Tooltip>
  );
}
