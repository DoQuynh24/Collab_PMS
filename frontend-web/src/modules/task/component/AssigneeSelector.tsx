import { useState } from "react";
import {
  Box,
  Popover,
  List,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  TextField,
  Typography,
  Avatar,
  Tooltip,
} from "@mui/material";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import SearchIcon from "@mui/icons-material/Search";

interface Props {
  assignee?: any;
  projectMembers: any[];
  onAssigneeChange: (userId: number | null) => void;
  showText?: boolean;
  showUnassignedText?: boolean;
  showTooltip?: boolean;
  tooltipTitle?: string;
}

export default function AssigneeSelector({
  assignee,
  projectMembers,
  onAssigneeChange,
  showText = true,
  showUnassignedText = false,
  showTooltip = false,
  tooltipTitle = "Phân công",
}: Props) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [search, setSearch] = useState("");

  const open = Boolean(anchorEl);

  const filteredMembers = projectMembers.filter((m: any) =>
    m.user?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    event.preventDefault();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSearch("");
  };

  const trigger = (
    <Box
      onMouseDown={(e) => {
        e.stopPropagation();
        e.preventDefault();
      }}
      onClick={handleClick}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        cursor: "pointer",
        px: 1,
        py: 0.75,
        borderRadius: "6px",
        "&:hover": { background: "transparent", transform: "scale(1.15)"  }
      }}
    >
      {assignee ? (
        <>
          <Avatar src={assignee.picture} sx={{ width: 22, height: 22 }}>
            {assignee.name?.charAt(0)}
          </Avatar>
          {showText && <Typography fontSize={13}>{assignee.name}</Typography>}
        </>
      ) : (
        <>
          <Avatar sx={{ width: 22, height: 22, bgcolor: "#e0e0e0" }}>
            <PersonOutlineIcon fontSize="small" />
          </Avatar>
          {showUnassignedText && (                     
            <Typography fontSize={13} color="#9ca3af">
              Chưa phân công
            </Typography>
          )}
        </>
      )}
    </Box>
  );

  return (
    <>
      {showTooltip ? (
        <Tooltip title={tooltipTitle} arrow>
          {trigger}
        </Tooltip>
      ) : (
        trigger
      )}

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        onMouseDown={(e) => e.stopPropagation()}   
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        slotProps={{
          paper: {
            onMouseDown: (e) => e.stopPropagation(),
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Tìm thành viên..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: "#9ca3af" }} />,
            }}
            sx={{ mb: 1 }}
          />

          <List sx={{ maxHeight: 320, overflow: "auto" }}>
            <ListItemButton 
              onClick={(e) => {
                e.stopPropagation();
                onAssigneeChange(null);
                handleClose();
              }}
            >
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: "#e0e0e0" }}>
                  <PersonOutlineIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary="Bỏ phân công" />
            </ListItemButton>

            {filteredMembers.map((member: any) => (
              <ListItemButton
                key={member.user_id}
                onClick={(e) => {
                  e.stopPropagation();
                  onAssigneeChange(member.user_id);
                  handleClose();
                }}
              >
                <ListItemAvatar>
                  <Avatar src={member.user?.picture}>
                    {member.user?.name?.charAt(0)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText primary={member.user?.name} />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Popover>
    </>
  );
}