import { useContext, useState } from "react";
import {
  IconButton,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  ListItemText,
  Typography,
  Tooltip,
} from "@mui/material";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import LinkIcon from "@mui/icons-material/Link";
import ArchiveIcon from "@mui/icons-material/Archive";
import DeleteIcon from "@mui/icons-material/Delete";
import { useDeleteTask } from "../api/delete-task";
import type { ITask } from "../types";
import { useArchiveTask } from "../api/archive-task";
import { ModalConfirm } from "../../../components/modal/modalConfirm";
import { ToastContext } from "../../../components/notification/NotifiProvider";

interface Props {
  task: ITask;
  onOpenDetail: () => void;
}

export default function TaskCardMenu({ task, onOpenDetail }: Props) {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [openArchiveConfirm, setOpenArchiveConfirm] = useState(false);
    const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
    const open = Boolean(anchorEl);

    const { showToast } = useContext(ToastContext)!;

    const { mutate: archiveTaskMutate } = useArchiveTask();
    const { mutate: deleteTaskMutate } = useDeleteTask();

    const handleOpen = (e: React.MouseEvent<HTMLElement>) => {
        e.stopPropagation();
        setAnchorEl(e.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleArchiveClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setOpenArchiveConfirm(true);
        handleClose();
    };

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setOpenDeleteConfirm(true);
        handleClose();
    };

    const handleCopyLink = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(`${window.location.origin}/projects/${task.project_id}?task=${task.task_id}`);
        handleClose();
    };

    const handleArchiveSuccess = () => {
        archiveTaskMutate(task.task_id, {
        onSuccess: () => {
            showToast("Nhiệm vụ đã được lưu trữ thành công", "success");
        },
        onError: () => {
            showToast("Lưu trữ nhiệm vụ thất bại", "error");
        },
        });
    }

    const handleDeleteSuccess = () => {
        deleteTaskMutate(task.task_id, {
        onSuccess: () => {
            showToast("Nhiệm vụ đã được xóa vĩnh viễn", "success");
        },
        onError: () => {
            showToast("Xóa nhiệm vụ thất bại", "error");
        },
        });
    }

    return (
        <>
        <Tooltip title="Tùy chọn">
        <IconButton
            size="small"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={handleOpen}
            sx={{ transition: "transform 0.2s ease", "&:hover": { background: "transparent", transform: "scale(1.15)" } }}
        >
            <MoreHorizIcon fontSize="small" />
        </IconButton>
        </Tooltip>

        <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={() => handleClose()}
            onClick={(e) => e.stopPropagation()}
            slotProps={{ paper: { sx: { width: 220, borderRadius: "8px", boxShadow: "0 4px 20px rgba(0,0,0,0.15)" } } }}
        >
        
            <MenuItem dense onClick={() => { onOpenDetail(); handleClose(); }}>
            <ListItemIcon>
                <EditOutlinedIcon fontSize="small" sx={{ color: "#1976d2" }} />
            </ListItemIcon>
            <ListItemText><Typography fontSize={14}>Chỉnh sửa chi tiết</Typography></ListItemText>
            </MenuItem>

            <MenuItem dense onClick={handleCopyLink}>
                <ListItemIcon><LinkIcon fontSize="small" sx={{ color: "#2e7d32" }} /></ListItemIcon>
                <ListItemText><Typography fontSize={14}>Sao chép liên kết</Typography></ListItemText>
            </MenuItem>

            <Divider sx={{ my: 0.5 }} />

            <MenuItem dense onClick={handleArchiveClick}>
            <ListItemIcon><ArchiveIcon fontSize="small" sx={{ color: "#f57c00" }} /></ListItemIcon>
            <ListItemText><Typography fontSize={14}>Lưu trữ nhiệm vụ</Typography></ListItemText>
            </MenuItem>

            <MenuItem dense onClick={handleDeleteClick}>
            <ListItemIcon><DeleteIcon fontSize="small" sx={{ color: "#d32f2f" }} /></ListItemIcon>
            <ListItemText><Typography fontSize={14} color="#d32f2f">Xóa nhiệm vụ</Typography></ListItemText>
            </MenuItem>
        </Menu>
        <ModalConfirm
            open={openArchiveConfirm}
            setOpen={setOpenArchiveConfirm}
            title="Lưu trữ nhiệm vụ"
            message={
                <>
                Nhiệm vụ này cùng tài liệu liên quan sẽ được lưu trữ và không còn hiển thị tại đây. 
                Bạn và thành viên sẽ không thể chỉnh sửa.
                <br />
                Bạn có thể khôi phục nhiệm vụ này từ mục{" "}
                <span style={{ textDecoration: "underline", color: "blue", cursor:"pointer" }}>
                    Lưu trữ
                </span>.
                </>
            }
            titleButton="Lưu trữ"
            cancelButtonText="Hủy"
            onClick={handleArchiveSuccess}
            isArchive={true}
        />

        <ModalConfirm
            open={openDeleteConfirm}
            setOpen={setOpenDeleteConfirm}
            title="Xóa vĩnh viễn nhiệm vụ"
            message={
                <>Bạn sắp xóa vĩnh viễn nhiệm vụ này cùng các bình luận, tệp đính kèm và toàn bộ dữ liệu liên quan. 
                <br />
                Hành động này không thể hoàn tác.
                </>
            }
            titleButton="Xóa"
            cancelButtonText="Hủy"
            onClick={handleDeleteSuccess}
            confirmButtonProps={{
            sx: { backgroundColor: "#d32f2f", "&:hover": { backgroundColor: "#b71c1c" } },
            }}
            isDelete={true}
        />
    </>
        
    );
}