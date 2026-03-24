import { useRef, useState, useEffect } from "react";
import { Box, TextField, IconButton, Stack,Tooltip, Menu, MenuItem,} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import FlagIcon from "@mui/icons-material/Flag";
import CloseIcon from "@mui/icons-material/Close";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { PRIORITIES } from "../../../constant/index";


interface Props {
  statusId: number;
  onSubmit: (title: string, statusId: number, priorityId: number, deadline?: Date | null) => void;
  onClose: () => void; 
}

export default function AddTaskInline({ statusId, onSubmit, onClose }: Props) {
  const [title, setTitle] = useState("");
  const [priorityId, setPriorityId] = useState(1);
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openDatePicker, setOpenDatePicker] = useState(false);

  const boxRef = useRef<HTMLDivElement>(null);

  const handleSubmit = () => {
    if (!title.trim()) return;
    onSubmit(title, statusId, priorityId, deadline);
    setTitle("");
    setDeadline(null);
  };

  useEffect(() => {
  const handleClickOutside = (e: MouseEvent) => {
    if (openDatePicker || anchorEl) return;
    if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
      onClose();
    }
  };
  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
}, [openDatePicker, anchorEl]);

  const selectedPriority = PRIORITIES.find(p => p.id === priorityId);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
    <Box
       ref={boxRef}
      sx={{
        background: "#fff",
        border: "2px solid #5663ee",
        borderRadius: "8px",
        padding: "10px",
        marginBottom: "8px",
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        <TextField
          size="small"
          fullWidth
          placeholder="Cần phải làm gì?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <IconButton onClick={handleSubmit} sx={{color:"#5663ee", transition: "transform 0.2s ease", 
          "&:hover": {
            background: "transparent",
            transform: "scale(1.15)", 
          }}}>
          <SendIcon />
        </IconButton>
      </Stack>
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        mt={1}
        justifyContent="flex-start"
      >
         <Tooltip title="Hạn hoàn thành">
          {deadline ? (
            <Box
              onClick={() => setOpenDatePicker(true)}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                px: 1,
                py: 0.5,
                border: "1px solid #73a030",
                borderRadius: "6px",
                cursor: "pointer",
                transition: "all 0.2s ease",
                "&:hover": {
                  borderColor: "#4CAF50",
                },
              }}
            >
              <CalendarTodayIcon
                fontSize="small"
                sx={{
                  color: "#73a030",
                  transition: "transform 0.2s ease",
                }}
              />
              <Box sx={{ fontSize: "0.875rem", color: "#73a030" }}>
                {deadline.toLocaleDateString("vi-VN")}
              </Box>
              <IconButton
                size="small"
                sx={{
                  color: "#757575",
                  padding: 0.2,
                }}
                onClick={(e) => {
                  e.stopPropagation(); 
                  setDeadline(null);
                }}
              >
                <CloseIcon fontSize="inherit"   sx={{ fontSize: "1rem"}}/>
              </IconButton>
            </Box>
          ) : (
            <IconButton
              size="small"
              sx={{
                color: "#73a030",
                transition: "transform 0.2s ease",
                "&:hover": {
                  background: "transparent",
                  transform: "scale(1.15)",
                },
              }}
              onClick={() => setOpenDatePicker(true)}
            >
              <CalendarTodayIcon fontSize="small" />
            </IconButton>
          )}
        </Tooltip>

        <DatePicker
            open={openDatePicker}
            onOpen={() => setOpenDatePicker(true)}
            onClose={() => setOpenDatePicker(false)}
            value={deadline}
            onChange={(newValue) => {
              setDeadline(newValue);
              setOpenDatePicker(false); 
            }}
            slotProps={{
              textField: { sx: { display: "none" } }, 
            }}
          />

        <Tooltip title="Độ ưu tiên">
          <IconButton
            size="small"
            sx={{transition: "transform 0.2s ease", 
              "&:hover": {
                background: "transparent",
                transform: "scale(1.15)", 
              }}}
            onClick={(e) => setAnchorEl(e.currentTarget)}
          >
            <FlagIcon
              fontSize="small"
              sx={{ color: selectedPriority?.color }}
            />
          </IconButton>
        </Tooltip>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
        >
          {PRIORITIES.map((p) => (
            <MenuItem
              key={p.id}
              onClick={() => {
                setPriorityId(p.id);
                setAnchorEl(null);
              }}
            >
              <FlagIcon sx={{ color: p.color, mr: 1 }} />
              {p.name}
            </MenuItem>
          ))}
        </Menu>

        <Tooltip title="Phân công">
          <IconButton size="small" sx={{color:"#626469", transition: "transform 0.2s ease", 
              "&:hover": {
                background: "transparent",
                transform: "scale(1.15)", 
              }}}>
            <PersonOutlineIcon  fontSize="inherit"  sx={{ fontSize: "20px"}} />
          </IconButton>
        </Tooltip>
      </Stack>
    </Box>
    </LocalizationProvider>
  );
}