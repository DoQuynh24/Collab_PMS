import { useState } from "react";
import {
  Box,
  Typography,
  Popover,
  MenuItem,
  Tooltip,
  useMediaQuery,
} from "@mui/material";
import FlagIcon from "@mui/icons-material/Flag";
import { PRIORITIES } from "../../../constant/index";

interface Props {
  priority?: any;
  onPriorityChange: (priorityId: number) => void;
  showText?: boolean;
  showTooltip?: boolean;
  tooltipTitle?: string;
}

export default function PrioritySelector({
  priority,
  onPriorityChange,
  showText = true,
  showTooltip = false,
  tooltipTitle = "Độ ưu tiên",
}: Props) {
  const isMobile = useMediaQuery("(max-width:900px)");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    // Dùng preventDefault để ngăn mousedown bubble lên document
    // (quan trọng với AddTaskInline dùng mousedown listener)
    event.preventDefault();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => setAnchorEl(null);

  const handleSelect = (event: React.MouseEvent, id: number) => {
    event.stopPropagation();
    onPriorityChange(id);
    handleClose();
  };

  const content = (
    <Box
      // Dùng onMouseDown thay onClick để bắt trước document mousedown listener
      onMouseDown={(e) => {
        e.stopPropagation(); // Ngăn AddTaskInline detectClickOutside
        e.preventDefault();
      }}
      onClick={handleClick}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        cursor: "pointer",
        px: isMobile ? 0 : 1,
        py: isMobile ? 0 : 0.75,
        borderRadius: "6px",
        "&:hover": isMobile ? { background: "transparent" } : { background: "transparent", transform: "scale(1.15)" }
      }}
    >
      <FlagIcon
        sx={{
          color: priority ? priority.color : "#9e9e9e",
          fontSize: isMobile ? 18 : 20,
        }}
      />
      {showText && (
        <Typography fontSize={13} fontWeight={isMobile ? 600 : 400}>
          {priority ? priority.name : "Chưa chọn ưu tiên"}
        </Typography>
      )}
    </Box>
  );

  return (
    <>
      {showTooltip ? (
        <Tooltip title={tooltipTitle} arrow>
          {content}
        </Tooltip>
      ) : (
        content
      )}

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        onClick={(e) => e.stopPropagation()}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        slotProps={{
          paper: {
            onMouseDown: (e) => e.stopPropagation(),
            sx: { width: isMobile ? 'calc(100vw - 32px)' : undefined, maxWidth: 260 },
          },
        }}
      >
        <Box sx={{ py: 1, minWidth: 160 }}>
          {PRIORITIES.map((p) => (
            <MenuItem
              key={p.id}
              onClick={(e) => handleSelect(e, p.id)}
              sx={{ gap: 1.5 }}
            >
              <FlagIcon sx={{ color: p.color }} />
              <Typography>{p.name}</Typography>
            </MenuItem>
          ))}
        </Box>
      </Popover>
    </>
  );
}
