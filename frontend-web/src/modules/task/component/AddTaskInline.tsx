import { useRef, useState, useEffect } from "react";
import {
  Box,
  TextField,
  IconButton,
  Stack,
  Tooltip,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import CloseIcon from "@mui/icons-material/Close";

import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

import { PRIORITIES } from "../../../constant/index";
import PrioritySelector from "./PrioritySelector";
import AssigneeSelector from "./AssigneeSelector";

interface ProjectMember {
  user_id: number;
  user?: {
    name?: string;
    email?: string;
    picture?: string;
  };
}

interface Props {
  statusId: number;
  projectMembers: ProjectMember[];
  onSubmit: (
    title: string,
    statusId: number,
    priorityId: number,
    deadline?: Date | null,
    assigneeId?: number | null
  ) => void;
  onClose: () => void;
}

export default function AddTaskInline({
  statusId,
  projectMembers,
  onSubmit,
  onClose,
}: Props) {
  const [title, setTitle] = useState("");
  const [priorityId, setPriorityId] = useState(1); 
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [assigneeId, setAssigneeId] = useState<number | null>(null);

  const [openDatePicker, setOpenDatePicker] = useState(false);

  const boxRef = useRef<HTMLDivElement>(null);

  const selectedPriority = PRIORITIES.find((p) => p.id === priorityId);
  const selectedAssignee = projectMembers.find((m) => m.user_id === assigneeId)?.user;

  const handleSubmit = () => {
    if (!title.trim()) return;

    onSubmit(title, statusId, priorityId, deadline, assigneeId);

    setTitle("");
    setDeadline(null);
    setAssigneeId(null);
    setPriorityId(1);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (openDatePicker) return;
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openDatePicker, onClose]);

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

          <IconButton
            onClick={handleSubmit}
            sx={{
              color: "#5663ee",
              "&:hover": { background: "transparent", transform: "scale(1.15)" },
            }}
          >
            <SendIcon />
          </IconButton>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center" mt={1}>
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
                }}
              >
                <CalendarTodayIcon fontSize="small" sx={{ color: "#73a030" }} />
                <Box sx={{ fontSize: "13px", color: "#73a030", pt:"4px" }}>
                  {deadline.toLocaleDateString("vi-VN", {
                    month: "short",
                    day: "numeric",
                  })}
                </Box>
                <IconButton
                  size="small"
                  sx={{ fontSize: "13px", pr:"0px"}}
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeadline(null);
                  }}
                >
                  <CloseIcon fontSize="inherit" />
                </IconButton>
              </Box>
            ) : (
              <IconButton
                size="small"
                sx={{ color: "#73a030" }}
                onClick={() => setOpenDatePicker(true)}
              >
                <CalendarTodayIcon fontSize="small" />
              </IconButton>
            )}
          </Tooltip>

          <DatePicker
            open={openDatePicker}
            onClose={() => setOpenDatePicker(false)}
            value={deadline}
            onChange={(newValue) => {
              setDeadline(newValue);
              setOpenDatePicker(false);
            }}
            slotProps={{ textField: { sx: { display: "none" } } }}
          />

          <PrioritySelector
            priority={selectedPriority}
            onPriorityChange={setPriorityId}
            showText={false}
            showTooltip={true}          
            tooltipTitle="Độ ưu tiên"
          />

          <AssigneeSelector
            assignee={selectedAssignee}
            projectMembers={projectMembers}
            onAssigneeChange={setAssigneeId}
            showText={false}
            showUnassignedText={false}
            showTooltip={true}           
            tooltipTitle="Phân công"
          />
        </Stack>
      </Box>
    </LocalizationProvider>
  );
}