import { useState } from "react";
import { Box, Typography, Avatar, IconButton } from "@mui/material";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import EditIcon from "@mui/icons-material/Edit";
import FlagIcon from "@mui/icons-material/Flag";
import { PRIORITIES } from "../../../constant/index";
import { Tooltip } from "@mui/material";

interface Props {
  title: string;
  code: string;
  priorityId: number;
}

export default function TaskCard({ title, code, priorityId }: Props) {

  const priority = PRIORITIES.find(p => p.id === priorityId);
  const [hovered, setHovered] = useState(false);
  
  return (
    <Box
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        background: "#fff",
        borderRadius: "8px",
        padding: "12px",
        boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
        marginBottom: "8px",
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography fontSize={14}>{title}</Typography>
        <Box display="flex" alignItems="center" gap={0.5}>
          {hovered && <EditIcon fontSize="small" sx={{ cursor: 'pointer', color: '#5c5c5c' }} />}
          <Tooltip title="Tùy chọn">
            <IconButton size="small" sx={{transition: "transform 0.2s ease", "&:hover": {background: "transparent",transform: "scale(1.15)"}}}>
              <MoreHorizIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Box display="flex" alignItems="center" justifyContent="space-between" mt={1}>
        <Box display="flex" alignItems="center" gap={0.5}>
          {priority && (
            <Tooltip title={priority.name} arrow>
              <FlagIcon fontSize="small" sx={{ color: priority.color }} />
            </Tooltip>
          )}
          <Typography fontSize={13} color="#6b6f76">{code}</Typography>
        </Box>
        <Avatar sx={{ width: 22, height: 22 }} />
      </Box>
    </Box>
  );
}