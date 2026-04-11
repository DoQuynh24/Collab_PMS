import { useState } from "react";
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
import type { ITask } from "../types";
import { useTaskActionConfirm } from "../hook/useTaskActionConfirm";

interface Props {
  task: ITask;
  onOpenDetail: () => void;
}

export default function TaskCardMenu({ task, onOpenDetail }: Props) {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const { confirmArchive, confirmDelete, taskActionModals } = useTaskActionConfirm()

    const handleOpen = (e: React.MouseEvent<HTMLElement>) => {
        e.stopPropagation();
        setAnchorEl(e.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleCopyLink = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(`${window.location.origin}/projects/${task.project_id}?task=${task.task_id}`);
        handleClose();
    };

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

            <MenuItem dense onClick={(e) => { e.stopPropagation(); confirmArchive(task.task_id); handleClose(); }}>
            <ListItemIcon><ArchiveIcon fontSize="small" sx={{ color: "#f57c00" }} /></ListItemIcon>
            <ListItemText><Typography fontSize={14}>Lưu trữ nhiệm vụ</Typography></ListItemText>
            </MenuItem>

            <MenuItem dense onClick={(e) => { e.stopPropagation(); confirmDelete(task.task_id); handleClose(); }}>
            <ListItemIcon><DeleteIcon fontSize="small" sx={{ color: "#d32f2f" }} /></ListItemIcon>
            <ListItemText><Typography fontSize={14} color="#d32f2f">Xóa nhiệm vụ</Typography></ListItemText>
            </MenuItem>
        </Menu>

        {taskActionModals}
    </>
        
    );
}