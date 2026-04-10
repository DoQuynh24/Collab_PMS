import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Stack,
  Chip,
} from "@mui/material";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditIcon from "@mui/icons-material/Edit";
import type { ITaskStatus } from "../../../task-status/types";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export function StatusRow({
  status,
  onEdit,
  onDelete,
  canManage,
}: {
  status: ITaskStatus;
  onEdit: (status: ITaskStatus) => void;
  onDelete: (status: ITaskStatus) => void;
  canManage: boolean;
}) {
  
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =useSortable({ id: status.id });

  return (
    <Box
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
      }}
      sx={{
        display: "flex",
        alignItems: "center",
        px: 2,
        py: 1.5,
        borderBottom: "1px solid #f3f4f6",
        bgcolor: "#fff",
        "&:last-child": { borderBottom: "none" },
        "&:hover": { bgcolor: "#fafafa" },
        gap: 2,
      }}
    >
      {canManage && (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Kéo thả">
        <Box {...attributes} {...listeners} sx={{ cursor: "grab", color: "#5663ee", "&:active": { cursor: "grabbing" } }}>
          <DragIndicatorIcon fontSize="small" />
        </Box>
        </Tooltip>
        </Stack>
      )}

      <Box sx={{ flex: 1 }}>
        <Chip
          label={status.name.toUpperCase()}
          size="small"
          sx={{
            fontSize: 12,
            fontWeight: 500,
            bgcolor: "#5663ee",
            color: "#fff",
            borderRadius: "4px",
          }}
        />
      </Box>

      <Typography fontSize={12} color="#9ca3af" sx={{ minWidth: 60 }}>
        #{status.order_index + 1}
      </Typography>

      {canManage && (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Đổi tên">
            <IconButton size="small" onClick={() => onEdit(status)} sx={{ color: "#6b7280" }}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Xóa">
            <IconButton size="small" onClick={() => onDelete(status)} sx={{ color: "#ef4444" }}>
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      )}
    </Box>
  );
}