import { useState } from "react";
import { Box, Typography, Popover, MenuItem, Chip, Divider } from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import CircleIcon from "@mui/icons-material/Circle";
import { Settings as SettingsIcon} from '@mui/icons-material';
import { useGetProjectTaskStatuses } from "../../task-status/api/get-project-task-status";

interface Props {
  currentStatusId: number;
  currentStatusName?: string;
  projectId: string;
  onStatusChange: (statusId: number) => void;
}

export default function ChangeStatusSelector({
  currentStatusId,
  currentStatusName,
  projectId,
  onStatusChange,
}: Props) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const { data: statusData } = useGetProjectTaskStatuses(projectId);
  const statuses = statusData?.data || [];

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };

  const handleClose = () => setAnchorEl(null);

  const handleSelect = (e: React.MouseEvent, statusId: number) => {
    e.stopPropagation();
    onStatusChange(statusId);
    handleClose();
  };

  const getStatusColor = (index: number, total: number) => {
    if (index === 0) return "#6b7280";
    if (index === total - 1) return "#2563eb";
    return "#f59e0b";
  };

  return (
    <>
      <Chip
        label={
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Typography fontSize={12} fontWeight={500}>
              {currentStatusName || "—"}
            </Typography>
            <KeyboardArrowDownIcon sx={{ fontSize: 14 }} />
          </Box>
        }
        size="small"
        onClick={handleClick}
        onMouseDown={(e) => e.stopPropagation()}
        sx={{
          fontSize: 12,
          height: 26,
          bgcolor: "#5663ee",
          borderRadius: "6px",
          fontWeight: 500,
          cursor: "pointer",
          "&:hover": { bgcolor: "#505dee" },
           color: "white"
        }}
      />

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        slotProps={{ paper: { sx: { borderRadius: "8px", minWidth: 180 } } }}
      >
        <Box sx={{ py: 1 }}>
          {statuses.map((status, index) => (
            <MenuItem
              key={status.id}
              selected={status.id === currentStatusId}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => handleSelect(e, status.id)}
              sx={{
                gap: 1.5,
                fontSize: 13,
                "&.Mui-selected": { bgcolor: "#eff6ff" },
              }}
            >
              <CircleIcon
                sx={{
                  fontSize: 10,
                  color: getStatusColor(index, statuses.length),
                }}
              />
              <Typography fontSize={13}>{status.name.toUpperCase()}</Typography>
            </MenuItem>
          ))}
          <Divider sx={{ my: 1 }} />

          <MenuItem 
            sx={{ 
              fontSize: 14, 
              fontWeight: 500,
              "&:hover": { bgcolor: "#f0f7ff" }
            }}
          >
            <SettingsIcon fontSize="small" sx={{ mr: 1.5 ,  color: "#1890ff",}} />
            Tùy chỉnh trạng thái
          </MenuItem>
        </Box>
      </Popover>
    </>
  );
}