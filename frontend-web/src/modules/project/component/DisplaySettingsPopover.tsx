import { useState } from "react";
import {
  Box, Typography, IconButton, Popover, Switch, Divider, Tooltip, useMediaQuery,
} from "@mui/material";
import TuneIcon from "@mui/icons-material/Tune";

export interface DisplaySettings {
  showTaskId: boolean;
  showPriority: boolean;
  showDeadline: boolean;
  showAssignee: boolean;
}

export const DEFAULT_DISPLAY_SETTINGS: DisplaySettings = {
  showTaskId: true,
  showPriority: true,
  showDeadline: true,
  showAssignee: true,
};

interface Props {
  settings: DisplaySettings;
  onChange: (s: DisplaySettings) => void;
}

const FIELDS: { key: keyof DisplaySettings; label: string; desc: string }[] = [
  { key: 'showTaskId',   label: 'Mã nhiệm vụ',     desc: 'Hiển thị TASK-ID bên dưới tiêu đề' },
  { key: 'showPriority', label: 'Độ ưu tiên',       desc: 'Hiển thị icon cờ màu theo mức ưu tiên' },
  { key: 'showDeadline', label: 'Hạn hoàn thành',   desc: 'Hiển thị ngày deadline trên card' },
  { key: 'showAssignee', label: 'Người thực hiện',  desc: 'Hiển thị avatar người được giao' },
];

export function DisplaySettingsPopover({ settings, onChange }: Props) {
  const isMobile = useMediaQuery("(max-width:900px)");
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);

  const activeCount = Object.values(settings).filter(Boolean).length;
  const isCustomized = activeCount < FIELDS.length;

  return (
    <>
      <Tooltip title="Tùy chỉnh hiển thị">
        <IconButton
          onClick={(e) => setAnchor(e.currentTarget)}
          sx={{
            borderRadius: isMobile ? "12px" : "6px", padding: "5px",
            border: "1px solid",
            borderColor: isCustomized ? "#5663ee" : "#d3d3d3",
            bgcolor: isCustomized ? "#eef0ff" : "transparent",
            color: isCustomized ? "#5663ee" : "inherit",
          }}
        >
          <TuneIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Popover
        open={Boolean(anchor)}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { width: 300, borderRadius: '10px', mt: 0.5 } } }}
      >
        <Box sx={{ px: 2.5, py: 2, borderBottom: '1px solid #f3f4f6' }}>
          <Typography fontSize={14} fontWeight={600} color="#111827">Tùy chỉnh hiển thị</Typography>
          <Typography fontSize={12} color="#9ca3af">Chọn thông tin hiển thị trên card nhiệm vụ</Typography>
        </Box>

        <Box sx={{ px: 1, py: 1 }}>
          {FIELDS.map((field, idx) => (
            <Box key={field.key}>
              {idx > 0 && <Divider sx={{ mx: 1.5 }} />}
              <Box sx={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                px: 1.5, py: 1.2, borderRadius: '8px',
                '&:hover': { bgcolor: '#f8fafc' },
              }}>
                <Box>
                  <Typography fontSize={13} fontWeight={500} color="#374151">{field.label}</Typography>
                  <Typography fontSize={11} color="#9ca3af">{field.desc}</Typography>
                </Box>
                <Switch
                  size="small"
                  checked={settings[field.key]}
                  onChange={(e) => onChange({ ...settings, [field.key]: e.target.checked })}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': { color: '#5663ee' },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#5663ee' },
                  }}
                />
              </Box>
            </Box>
          ))}
        </Box>

        {isCustomized && (
          <Box sx={{ px: 2.5, py: 1.5, borderTop: '1px solid #f3f4f6' }}>
            <Typography
              fontSize={12} color="#5663ee" sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
              onClick={() => onChange(DEFAULT_DISPLAY_SETTINGS)}
            >
              Đặt lại mặc định
            </Typography>
          </Box>
        )}
      </Popover>
    </>
  );
}
