import { useState, useRef, useEffect } from "react";
import {
  Box,
  Typography,
  Avatar,
  IconButton,
  Tooltip,
  TextField,
  CircularProgress,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import FlagIcon from "@mui/icons-material/Flag";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { PRIORITIES } from "../../../constant/index";
import type { ITask } from "../types";
import { useUpdateTask } from "../api/update-task";
import TaskDetailModal from "../TaskDetailModal";
import { toSortableId } from "../hook/useBoardDnd";
import TaskCardMenu from "./TaskCardMenu";
import DeadlineChip from "./DeadlineChip";

interface Props {
  task: ITask;
  projectMembers: any[];
  projectId?: string;
}

export default function TaskCard({ task, projectMembers, projectId }: Props) {
  const [hovered, setHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [modalOpen, setModalOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { mutate: updateTask, isPending } = useUpdateTask();

  const sortableId = toSortableId(task.task_id);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: sortableId });

  const priority = PRIORITIES.find((p) => p.id === task.priority_id);
  const assigneeMember = projectMembers.find((m: any) => m.user_id === task.assignee_id);
  const assignee = assigneeMember?.user;

  const isOverdue = task.deadline
    ? new Date(task.deadline) < new Date()
    : false;

  useEffect(() => {
    if (isEditing) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isEditing]);

  const handleStartEdit = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    setEditTitle(task.title);
    setIsEditing(true);
  };

  const handleSave = () => {
    const trimmed = editTitle.trim();
    if (!trimmed || trimmed === task.title) {
      setIsEditing(false);
      setEditTitle(task.title);
      return;
    }
    updateTask(
      { taskId: task.task_id, payload: { title: trimmed } },
      {
        onSuccess: () => setIsEditing(false),
        onError: () => {
          setIsEditing(false);
          setEditTitle(task.title);
        },
      }
    );
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditTitle(task.title);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") { e.preventDefault(); handleSave(); }
    if (e.key === "Escape") { handleCancel(); }
  };

  const handleCardClick = () => {
    if (!isEditing && !isDragging) setModalOpen(true);
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={{
          transform: CSS.Transform.toString(transform),
          transition: transition ?? "transform 200ms ease",
          opacity: isDragging ? 0 : 1,
          position: "relative",
          zIndex: isDragging ? 999 : "auto" as any,
        }}
        {...attributes}
        {...listeners}
      >
        <Box
          onClick={handleCardClick}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          sx={{
            background: "#fff",
            borderRadius: "8px",
            padding: "12px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            marginBottom: "8px",
            cursor: isEditing ? "default" : "grab",
            border: isOverdue ? "1px solid #ef5350" : "1px solid transparent",
            userSelect: "none",
            "&:hover": {
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            },
            "&:active": {
              cursor: "grabbing",
            },
          }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="flex-start"
            minWidth={0}
          >
            {isEditing ? (
              <Box
                display="flex" alignItems="center" gap={0.5} flex={1} mr={0.5}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
              >
                <TextField
                  inputRef={inputRef}
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={handleSave}
                  size="small" fullWidth disabled={isPending} variant="outlined"
                />
                {isPending ? (
                  <CircularProgress size={18} sx={{ color: "#5663ee", ml: 0.5 }} />
                ) : (
                  <>
                    <Tooltip title="Lưu (Enter)">
                      <IconButton size="small"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={(e) => { e.stopPropagation(); handleSave(); }}
                        sx={{ color: "#2e7d32" }}>
                        <CheckIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Hủy (Esc)">
                      <IconButton size="small"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={(e) => { e.stopPropagation(); handleCancel(); }}
                        sx={{ color: "#c62828" }}>
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </>
                )}
              </Box>
            ) : (
              <>
                <Typography
                  fontSize={14} fontWeight={500}
                  sx={{ flex: 1, lineHeight: 1.4, wordBreak: "break-word", whiteSpace: "pre-wrap", minWidth: 0 }}
                >
                  {task.title}
                </Typography>

                <Box
                  display="flex" alignItems="center" gap={0.5}
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                >
                  {hovered && (
                    <Tooltip title="Chỉnh sửa tiêu đề">
                      <IconButton size="small" sx={{ color: "#5c5c5c" }} onClick={handleStartEdit}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  <TaskCardMenu 
                    task={task}
                    onOpenDetail={() => setModalOpen(true)}/>
                </Box>
              </>
            )}
          </Box>

          {!isEditing && (
            <Typography fontSize={13} color="#6b6f76" mt={0.5}>
              {`TASK-${task.task_id}`}
            </Typography>
          )}

          <Box
            display="flex" alignItems="center" justifyContent="space-between" mt={1.5}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <Box display="flex" alignItems="center" gap={1.5}>
              {priority && (
                <Tooltip title={priority.name} arrow>
                  <FlagIcon fontSize="small" sx={{ color: priority.color }} />
                </Tooltip>
              )}
              {task.deadline && (
                <DeadlineChip deadline={task.deadline} />
              )}
            </Box>

            <Tooltip title={assignee?.name || "Chưa phân công"} arrow>
              {assignee ? (
                <Avatar src={assignee.picture} sx={{ width: 26, height: 26 }}>
                  {assignee.name?.charAt(0).toUpperCase()}
                </Avatar>
              ) : (
                <Avatar sx={{ width: 26, height: 26, bgcolor: "#e0e0e0", border: "1px dashed #9e9e9e" }}>
                  <PersonOutlineIcon fontSize="small" sx={{ color: "#757575" }} />
                </Avatar>
              )}
            </Tooltip>
          </Box>
        </Box>
      </div>

      <TaskDetailModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        task={task}
        projectMembers={projectMembers}
        projectId={projectId}
      />
    </>
  );
}