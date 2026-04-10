import { useState, useContext } from "react";
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  TextField,
  Button,
  Paper,
  Stack,
  CircularProgress,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";

import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";

import { useNavigate, useParams } from "react-router-dom";
import { useGetProjectTaskStatuses } from "../../../task-status/api/get-project-task-status";
import { useAddStatus } from "../../../task-status/api/add-task-status";
import { useMoveStatus } from "../../../task-status/api/move-task-status";
import { useDeleteStatus } from "../../../task-status/api/delete-task-status";
import { useUpdateStatus } from "../../../task-status/api/update-task-status";
import { ToastContext } from "../../../../components/notification/NotifiProvider";
import { ModalConfirm } from "../../../../components/modal/modalConfirm";
import { ROUTES } from "../../../../routes/urls";
import type { ITaskStatus } from "../../../task-status/types";
import { StatusRow } from "./StatusRow";
import LoadingPage from "../../../../components/loading/LoadingPage";
import { useGetCurrentUser } from "../../../login/api/auth";
import { useGetProjectById } from "../../api/get-project-id";

export function ProjectStatusSettings() {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const { showToast } = useContext(ToastContext)!;

  const { data: statusData, isLoading } = useGetProjectTaskStatuses(projectId!);
  const { mutate: addStatus, isPending: isAdding } = useAddStatus();
  const { mutate: moveStatus } = useMoveStatus();
  const { mutate: deleteStatus } = useDeleteStatus(projectId!);
  const { mutate: updateStatus } = useUpdateStatus(projectId!);
  const { data: currentUser } = useGetCurrentUser();
  const { data: project } = useGetProjectById(projectId!);

  const [localStatuses, setLocalStatuses] = useState<ITaskStatus[]>([]);
  const [newStatusName, setNewStatusName] = useState("");
  const [addingNew, setAddingNew] = useState(false);

  const [editingStatus, setEditingStatus] = useState<ITaskStatus | null>(null);
  const [editName, setEditName] = useState("");

  const [deletingStatus, setDeletingStatus] = useState<ITaskStatus | null>(null);

  const statuses = localStatuses.length > 0 ? localStatuses : statusData?.data ?? [];

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const isOwner = project?.owner_id === currentUser?.user_id;
  const members = project?.project_members || [];
  const isAdmin = members.some(
    (m: any) => m.user_id === currentUser?.user_id && m.role === "admin"
  );

  const canManageStatus = isOwner || isAdmin;

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = statuses.findIndex((s) => s.id === active.id);
    const newIndex = statuses.findIndex((s) => s.id === over.id);
    const reordered = arrayMove(statuses, oldIndex, newIndex);
    setLocalStatuses(reordered);

  moveStatus(
    { project_id: projectId!, ordered_ids: reordered.map((s) => s.id) },
      {
        onSuccess: () => showToast("Đã cập nhật thứ tự", "success"),
        onError: () => {
          setLocalStatuses(statuses);
          showToast("Cập nhật thứ tự thất bại", "error");
        },
      }
    );
  };

  const handleAddStatus = () => {
    const name = newStatusName.trim();
    if (!name) return;
    addStatus(
      { project_id: projectId!, name },
      {
        onSuccess: () => {
          showToast("Đã thêm trạng thái mới", "success");
          setNewStatusName("");
          setAddingNew(false);
          setLocalStatuses([]); 
        },
        onError: () => showToast("Thêm trạng thái thất bại", "error"),
      }
    );
  };

  const handleEditSave = () => {
    const name = editName.trim();
    if (!name || !editingStatus) return;

    updateStatus({
      statusId: editingStatus.id,
      payload: { name }
    }, {
      onSuccess: () => {
        showToast("Đã cập nhật tên trạng thái", "success");
        setEditingStatus(null);
        setEditName("");
      },
      onError: () => showToast("Cập nhật thất bại", "error"),
    });
  };

  const handleDeleteConfirm = () => {
    if (!deletingStatus) return;
    deleteStatus(deletingStatus.id, {
      onSuccess: () => {
        showToast("Đã xóa trạng thái", "success");
        setDeletingStatus(null);
      },
      onError: () => showToast("Xóa trạng thái thất bại", "error"),
    });
  };

  if (isLoading) return <LoadingPage />;

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        <Tooltip title="Quay lại">
          <IconButton onClick={() => navigate(ROUTES.projectDetail(projectId!))}>
            <ArrowBackIcon />
          </IconButton>
        </Tooltip>
        <Typography variant="h5" fontWeight={600}>Quản lý trạng thái</Typography>
      </Box>

      <Typography color="#555" marginBottom={4}>
        Trang quản lý trạng thái giúp bạn tùy chỉnh các cột trên bảng Kanban để theo dõi tiến độ công việc 
        một cách hiệu quả. Bạn có thể tạo thêm trạng thái mới, chỉnh sửa tên, thay đổi thứ tự hoặc xóa 
        những trạng thái không còn phù hợp. Việc sắp xếp và quản lý trạng thái linh hoạt sẽ giúp cả nhóm 
        dễ dàng nắm bắt tiến độ dự án, phân công nhiệm vụ rõ ràng và làm việc đồng bộ hơn.
      </Typography>

      <Box >
        <Paper elevation={0} sx={{ border: "1px solid #e5e7eb", borderRadius: "8px", overflow: "hidden", mb: 3 }}>

        <Box sx={{ display: "flex", alignItems: "center", px: 2, py: 1.5, bgcolor: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
          <Box sx={{ width: 20, mr: 2 }} />
          <Typography fontSize={14} fontWeight={600} flex={1}>Tên trạng thái</Typography>
          <Typography fontSize={14} fontWeight={600} sx={{ minWidth: 60 }}>Vị trí</Typography>
          {canManageStatus && (
          <Typography fontSize={14} fontWeight={600} >Hành động</Typography>
          )}
        </Box>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={statuses.map((s) => s.id)} strategy={verticalListSortingStrategy}>
            {statuses.map((status) => (
              editingStatus?.id === status.id ? (
                <Box key={status.id} sx={{
                  display: "flex", alignItems: "center", px: 3, py: 1.8,
                  borderBottom: "1px solid #f3f4f6", bgcolor: "#fefce8", gap: 2,
                }}>
                  <Box sx={{ width: 40 }} />
                  <TextField
                    size="small" 
                    value={editName} 
                    autoFocus
                    fullWidth
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleEditSave();
                      if (e.key === "Escape") setEditingStatus(null);
                    }}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "6px", fontSize: 14 } }}
                  />
                  <Stack direction="row" spacing={1}>
                    <Tooltip title="Lưu">
                      <IconButton size="small" onClick={handleEditSave} sx={{ color: "#16a34a" }}>
                        <CheckIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Hủy">
                      <IconButton size="small" onClick={() => setEditingStatus(null)} sx={{ color: "#6b7280" }}>
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Box>
              ) : (
                <StatusRow
                  key={status.id}
                  status={status}
                  canManage={canManageStatus}
                  onEdit={(s) => { setEditingStatus(s); setEditName(s.name); }}
                  onDelete={(s) => setDeletingStatus(s)}
                />
              )
            ))}
          </SortableContext>
        </DndContext>

        {canManageStatus && (   
          <Box sx={{ 
            p: 2, 
            borderTop: "1px solid #e2e8f0", 
            bgcolor: "#fafafa",
            display: "flex",
            alignItems: "center",
            gap: 2
          }}>
            {addingNew ? (
              <>
                <TextField
                  size="small"
                  fullWidth
                  autoFocus
                  placeholder="Nhập tên trạng thái mới..."
                  value={newStatusName}
                  onChange={(e) => setNewStatusName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddStatus();
                    if (e.key === "Escape") {
                      setAddingNew(false);
                      setNewStatusName("");
                    }
                  }}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px", bgcolor: "#fff" } }}
                />
                <Button
                  variant="contained"
                  onClick={handleAddStatus}
                  disabled={!newStatusName.trim() || isAdding}
                  startIcon={isAdding ? <CircularProgress size={16} color="inherit" /> : <CheckIcon />}
                  sx={{ 
                    px: 3, 
                    borderRadius: "8px", 
                    textTransform: "none",
                    bgcolor: "#5663ee",
                    "&:hover": { bgcolor: "#4451d4" }
                  }}
                >
                  Thêm
                </Button>
                <Button
                  onClick={() => { setAddingNew(false); setNewStatusName(""); }}
                  disabled={isAdding}
                  sx={{ 
                    px: 3, 
                    borderRadius: "8px", 
                    textTransform: "none",
                    color: "#64748b"
                  }}
                >
                  Hủy
                </Button>
              </>
            ) : (
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => setAddingNew(true)}
                sx={{ 
                  borderRadius: "8px", 
                  textTransform: "none",
                  borderColor: "#5663ee",
                  color: "#5663ee",
                  "&:hover": { borderColor: "#4451d4", color: "#4451d4", bgcolor: "transparent" }
                }}
              >
                Thêm trạng thái mới
              </Button>
            )}
          </Box>
        )}
      </Paper>
      </Box>

      <ModalConfirm
        open={Boolean(deletingStatus)}
        setOpen={(v) => { if (!v) setDeletingStatus(null); }}
        title="Xóa trạng thái"
        message={
          <>
            Bạn sắp xóa trạng thái <strong>{deletingStatus?.name}</strong>.
            Các task đang ở trạng thái này sẽ không còn được phân loại nữa.
            <br />Hành động này không thể hoàn tác.
          </>
        }
        titleButton="Xóa"
        cancelButtonText="Hủy"
        onClick={handleDeleteConfirm}
        confirmButtonProps={{
          sx: { bgcolor: "#ef4444", "&:hover": { bgcolor: "#dc2626" } },
        }}
        isDelete={true}
      />
    </Box>
  );
}

export default ProjectStatusSettings;