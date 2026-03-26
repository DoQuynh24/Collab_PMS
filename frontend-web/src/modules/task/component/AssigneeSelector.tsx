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
import { useGetCurrentUser } from "../../login/api/auth";

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
  const { data: currentUser } = useGetCurrentUser();
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
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ width: 22, height: 22, bgcolor: "#e0e0e0" }}>
              <PersonOutlineIcon fontSize="small" />
            </Avatar>
            {showUnassignedText && (
              <Typography fontSize={13} color="#9ca3af">Chưa phân công</Typography>
            )}
          </Box>
          {showUnassignedText && (
            <Typography
              fontSize={12}
              color="primary"
              sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
              onClick={(e) => {
                e.stopPropagation();
                const me = projectMembers.find(m => m.user_id === currentUser?.user_id);
                if (me) onAssigneeChange(me.user_id);
              }}
            >
              Phân công cho tôi
            </Typography>
          )}
        </Box>
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
              <ListItemText 
                primary={
                  member.user_id === currentUser?.user_id 
                    ? `${member.user?.name} (Phân công cho tôi)` 
                    : member.user?.name
                }
                secondary={member.user?.email}
              />
            </ListItemButton>
          ))}
          </List>
        </Box>
      </Popover>
    </>
  );
}