import { useEffect, useState } from "react";
import {
  Box,
  Dialog,
  Typography,
  IconButton,
  Tooltip,
  Avatar,
  Divider,
  TextField,
  Stack,
  Chip,
  Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import ShareIcon from "@mui/icons-material/Share";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import CheckIcon from "@mui/icons-material/Check";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { PRIORITIES } from "../../constant/index";
import type { ITask } from "./types";
import { useUpdateTask } from "./api/update-task";
import AssigneeSelector from "./component/AssigneeSelector";
import PrioritySelector from "./component/PrioritySelector";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { toDateString } from "../../utils/formatDate";
import styles from "./TaskDetailModal.module.scss";

interface Props {
  open: boolean;
  onClose: () => void;
  task: ITask;
  projectMembers: any[];
  projectId?: string;
}

export default function TaskDetailModal({
  open,
  onClose,
  task,
  projectMembers,
}: Props) {
  const [title, setTitle] = useState(task.title);
  const [editingTitle, setEditingTitle] = useState(false);
  const [description, setDescription] = useState(task.description || "");
  const [editingDesc, setEditingDesc] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "comments" | "history" | "worklog">("comments");

  const { mutate: updateTask, isPending } = useUpdateTask();
  const assigneeMember = projectMembers.find(
    (m: any) => m.user_id === task.assignee_id
  );
  const assignee = assigneeMember?.user;

  const priority = PRIORITIES.find((p) => p.id === task.priority_id);


  const [deadline, setDeadline] = useState<Date | null>(
    task.deadline ? new Date(task.deadline) : null
  );
  const [openDatePicker, setOpenDatePicker] = useState(false);
  
  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description || "");
    setDeadline(task.deadline ? new Date(task.deadline) : null);
  }, [task.task_id, task.title, task.description, task.deadline]);

  const handleTitleSave = () => {
    const trimmed = title.trim();
    if (!trimmed || trimmed === task.title) {
      setTitle(task.title);
      setEditingTitle(false);
      return;
    }
    updateTask(
      { taskId: task.task_id, payload: { title: trimmed } },
      { onSuccess: () => setEditingTitle(false), onError: () => { setTitle(task.title); setEditingTitle(false); } }
    );
  };

  const handleDescSave = () => {
    updateTask(
      { taskId: task.task_id, payload: { description } },
      { onSuccess: () => setEditingDesc(false) }
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      PaperProps={{
        sx: {
          width: "90vw",
          maxWidth: 1100,
          height: "88vh",
          borderRadius: "12px",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2,
          py: 1,
          borderBottom: "1px solid #e5e7eb",
          flexShrink: 0,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <Chip
            label={`TASK-${task.task_id}`}
            size="small"
            sx={{
              fontSize: 12,
              height: 22,
              bgcolor: "#e8f5e9",
              color: "#2e7d32",
              fontWeight: 600,
              borderRadius: "4px",
            }}
          />
        </Stack>

        <Stack direction="row" alignItems="center" spacing={0.5}>
          <Tooltip title="Khóa">
            <IconButton size="small"><LockOutlinedIcon fontSize="small" sx={{ color: "#6b7280" }} /></IconButton>
          </Tooltip>
          <Tooltip title="Người xem">
            <IconButton size="small">
              <Stack direction="row" alignItems="center" spacing={0.3}>
                <VisibilityOutlinedIcon fontSize="small" sx={{ color: "#6b7280" }} />
                <Typography fontSize={12} color="#6b7280">1</Typography>
              </Stack>
            </IconButton>
          </Tooltip>
          <Tooltip title="Chia sẻ">
            <IconButton size="small"><ShareIcon fontSize="small" sx={{ color: "#6b7280" }} /></IconButton>
          </Tooltip>
          <Tooltip title="Tùy chọn">
            <IconButton size="small"><MoreHorizIcon fontSize="small" sx={{ color: "#6b7280" }} /></IconButton>
          </Tooltip>
          <Tooltip title="Mở rộng">
            <IconButton size="small"><OpenInFullIcon fontSize="small" sx={{ color: "#6b7280" }} /></IconButton>
          </Tooltip>
          <Tooltip title="Đóng">
            <IconButton size="small" onClick={onClose}><CloseIcon fontSize="small" sx={{ color: "#6b7280" }} /></IconButton>
          </Tooltip>
        </Stack>
      </Box>

      <Box sx={{ display: "flex", flex: 1, overflow: "hidden" }}>

        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            px: 4,
            py: 3,
            "&::-webkit-scrollbar": { width: 6 },
            "&::-webkit-scrollbar-thumb": { bgcolor: "#d1d5db", borderRadius: 3 },
          }}
        >
          <Box sx={{ mb: 3 }}>
            {editingTitle ? (
              <Stack direction="row" spacing={1} alignItems="center">
                <TextField
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  autoFocus
                  fullWidth
                  multiline
                  variant="outlined"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      fontSize: 20,
                      fontWeight: 600,
                      borderRadius: "8px",
                      height: "40px"
                    },
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleTitleSave();
                    }
                    if (e.key === "Escape") {
                      setTitle(task.title);
                      setEditingTitle(false);
                    }
                  }}
                />

                <Tooltip title="Lưu (Enter)">
                  <IconButton 
                    color="success" 
                    onClick={handleTitleSave}
                    disabled={!title.trim() || title.trim() === task.title}
                  >
                    <CheckIcon />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Hủy (Esc)">
                  <IconButton 
                    color="default" 
                    onClick={() => {
                      setTitle(task.title);
                      setEditingTitle(false);
                    }}
                  >
                    <CloseIcon />
                  </IconButton>
                </Tooltip>
              </Stack>
            ) : (
              <Typography
                fontSize={22}
                fontWeight={700}
                sx={{
                  cursor: "text",
                  lineHeight: 1.35,
                  wordBreak: "break-word",
                  "&:hover": { 
                    bgcolor: "#f4f5f7", 
                    borderRadius: "8px",
                  
                  },
                }}
                onClick={() => setEditingTitle(true)}
              >
                {title}
              </Typography>
            )}
          </Box>
          <Typography fontWeight={600} fontSize={14} mb={1}>
            Mô tả chi tiết
          </Typography>
          {editingDesc ? (
            <Box>
              <TextField
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                multiline
                rows={4}
                fullWidth
                autoFocus
                variant="outlined"
                placeholder="Thêm mô tả..."
                sx={{
                  "& .MuiOutlinedInput-root": {
                    fontSize: 14,
                    borderRadius: "6px",
                    "& fieldset": { borderColor: "#5663ee" },
                  },
                }}
              />
              <Stack direction="row" spacing={1} mt={1} mb={2}>
                <Button
                  size="small"
                  variant="contained"
                  onClick={handleDescSave}
                  disabled={isPending}
                  sx={{ fontSize:"12px",bgcolor: "#5663ee", "&:hover": { bgcolor: "#4451d4" }, borderRadius: "6px", textTransform: "none" }}
                >
                  Lưu
                </Button>
                <Button
                  size="small"
                  onClick={() => { setDescription(task.description || ""); setEditingDesc(false); }}
                  sx={{ fontSize:"12px", color: "#6b7280", borderRadius: "6px", textTransform: "none" }}
                >
                  Hủy
                </Button>
              </Stack>
            </Box>
          ) : (
            <Box
              onClick={() => setEditingDesc(true)}
              sx={{
                fontSize: 14,
                color: description ? "#374151" : "#9ca3af",
                cursor: "text",
                minHeight: 40,
                p: 1,
                borderRadius: "6px",
                "&:hover": { bgcolor: "#f4f5f7" },
                mb: 3,
              }}
            >
              {description || "Thêm mô tả..."}
            </Box>
          )}

          <Typography fontWeight={600} fontSize={14} mb={1}>
            Tài liệu liên kết
          </Typography>
          <Box
            sx={{
              fontSize: 14,
              color: "#9ca3af",
              cursor: "pointer",
              p: 1,
              borderRadius: "6px",
              "&:hover": { bgcolor: "#f4f5f7" },
              mb: 3,
            }}
          >
            Thêm công việc liên kết...
          </Box>

          <Divider sx={{ mb: 2 }} />

          <Typography fontWeight={600} fontSize={14} mb={1.5}>
            Hoạt động
          </Typography>
          <Stack direction="row" alignItems="center" spacing={1} mb={2}>
            {(["all", "comments", "history", "worklog"] as const).map((tab) => (
              <Box
                key={tab}
                onClick={() => setActiveTab(tab)}
                sx={{
                  fontSize: 13,
                  px: 1.5,
                  py: 0.5,
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: activeTab === tab ? 600 : 400,
                  color: activeTab === tab ? "#111827" : "#6b7280",
                  bgcolor: activeTab === tab ? "#e5e7eb" : "transparent",
                  "&:hover": { bgcolor: "#f4f5f7" },
                }}
              >
                {tab === "all" ? "Tất cả" : tab === "comments" ? "Bình luận" : tab === "history" ? "Lịch sử" : "Work log"}
              </Box>
            ))}
          </Stack>

          <Stack direction="row" spacing={1.5} alignItems="flex-start">
            <Avatar sx={{ width: 32, height: 32, bgcolor: "#ef4444", fontSize: 13 }}>U</Avatar>
            <Box sx={{ flex: 1 }}>
              <TextField
                fullWidth
                multiline
                rows={2}
                placeholder="Thêm bình luận..."
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    fontSize: 13,
                    borderRadius: "8px",
                    bgcolor: "#f9fafb",
                    "& fieldset": { borderColor: "#e5e7eb" },
                    "&:hover fieldset": { borderColor: "#9ca3af" },
                    "&.Mui-focused fieldset": { borderColor: "#5663ee" },
                  },
                }}
              />
              <Typography fontSize={11} color="#9ca3af" mt={0.5}>
                Mẹo: nhấn <strong>M</strong> để bình luận
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Box
          sx={{
            width: 360,
            flexShrink: 0,
            borderLeft: "1px solid #e5e7eb",
            overflowY: "auto",
            px: 2,
            py: 2,
            "&::-webkit-scrollbar": { width: 6 },
            "&::-webkit-scrollbar-thumb": { bgcolor: "#d1d5db", borderRadius: 3 },
          }}
        >

          <Box
            sx={{
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              overflow: "hidden",
              mb: 2,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                px: 1.5,
                py: 1,
                bgcolor: "#f9fafb",
                borderBottom: "1px solid #e5e7eb",
                cursor: "pointer",
              }}
            >
              <Typography fontWeight={600} fontSize={13} flex={1}>Chi tiết</Typography>
              <KeyboardArrowDownIcon sx={{ fontSize: 18, color: "#6b7280" }} />
            </Box>

            <Box sx={{ px: 2, py: 1 }}>
              <Box className={styles.detailRow}>
                <Typography className={styles.detailLabel}>Người thực hiện</Typography>
                <AssigneeSelector
                  assignee={assignee}
                  projectMembers={projectMembers}
                  onAssigneeChange={(userId) =>
                    updateTask({
                      taskId: task.task_id,
                      payload: { assignee_id: userId },
                    })
                  }
                  showText={true}
                  showUnassignedText={true}
                />
              </Box>

              <Box className={styles.detailRow}>
                <Typography className={styles.detailLabel}>Độ ưu tiên</Typography>
                <PrioritySelector
                  priority={priority}
                  onPriorityChange={(priorityId) =>
                    updateTask({
                      taskId: task.task_id,
                      payload: { priority_id: priorityId },
                    })
                  }
                  showText={true}
                />
              </Box>
              
              <Box className={styles.detailRow}>
                <Typography className={styles.detailLabel}>Ngày tạo</Typography>
                <Typography fontSize={13} color="#111827">
                  {task.created_at 
                    ? new Date(task.created_at).toLocaleDateString("vi-VN", { 
                        day: "numeric", 
                        month: "short", 
                        year: "numeric",
                      })
                    : "—"}
                </Typography>
              </Box>

              <Box className={styles.detailRow} onClick={() => setOpenDatePicker(true)}>
                <Typography className={styles.detailLabel}>Hạn hoàn thành</Typography>
                
                {deadline ? (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.8,
                      px: 1.5,
                      py: 0.5,
                      border: "1px solid #73a030",
                      borderRadius: "6px",
                      cursor: "pointer",
                      bgcolor: "#f0f7f0",
                    }}
                  >
                    <CalendarTodayIcon fontSize="small" sx={{ color: "#73a030" }} />
                    <Typography fontSize={13} color="#73a030" sx={{ pt: "2px" }}>
                      {deadline.toLocaleDateString("vi-VN", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </Typography>
                    <IconButton
                      size="small"
                       sx={{ fontSize: "13px", pr:"0px"}}
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeadline(null);
                        updateTask({
                          taskId: task.task_id,
                          payload: { deadline: null },
                        });
                      }}
                    >
                      <CloseIcon fontSize="inherit" />
                    </IconButton>
                  </Box>
                ) : (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      color: "#9ca3af",
                    }}
                  >
                    <CalendarTodayIcon fontSize="small" />
                    <Typography fontSize={13}>Chưa có hạn</Typography>
                  </Box>
                )}
              </Box>

              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  open={openDatePicker}
                  onClose={() => setOpenDatePicker(false)}
                  value={deadline}
                  onChange={(newDate) => {
                    setDeadline(newDate);
                    updateTask({
                      taskId: task.task_id,
                      payload: { 
                        deadline: newDate ? toDateString(newDate) : null 
                      },
                    });
                  }}
                  slotProps={{ textField: { sx: { display: "none" } } }}
                />
              </LocalizationProvider>

              <Box className={styles.detailRow}>
                <Typography className={styles.detailLabel}>Người tạo</Typography>
                <Stack direction="row" alignItems="center" spacing={1}>
                  {task.creator ? (
                    <>
                      <Avatar src={task.creator.picture} sx={{ width: 20, height: 20, fontSize: 10 }}>
                        {task.creator.name?.charAt(0)}
                      </Avatar>
                      <Typography fontSize={13} color="#111827">{task.creator.name}</Typography>
                    </>
                  ) : (
                    <Typography fontSize={13} color="#9ca3af">—</Typography>
                  )}
                </Stack>
              </Box>
            </Box>
          </Box>

          <Box
            sx={{
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              overflow: "hidden",
              mb: 2,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                px: 1.5,
                py: 1,
                cursor: "pointer",
                "&:hover": { bgcolor: "#f4f5f7" },
              }}
            >
              <Typography fontWeight={600} fontSize={13} flex={1}>Phát triển</Typography>
              <KeyboardArrowDownIcon sx={{ fontSize: 18, color: "#6b7280" }} />
            </Box>
          </Box>

          <Box
            sx={{
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                px: 1.5,
                py: 1,
                cursor: "pointer",
                "&:hover": { bgcolor: "#f4f5f7" },
              }}
            >
              <Typography fontWeight={600} fontSize={13} flex={1}>Tự động hóa</Typography>
              <Typography fontSize={12} color="#6b7280" mr={1}>Rule executions</Typography>
              <KeyboardArrowDownIcon sx={{ fontSize: 18, color: "#6b7280" }} />
            </Box>
          </Box>
        </Box>
      </Box>
    </Dialog>
  );
}