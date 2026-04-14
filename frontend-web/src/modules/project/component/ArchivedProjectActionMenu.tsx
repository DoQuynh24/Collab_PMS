import { useState } from "react";
import { IconButton, Menu, MenuItem, Divider } from "@mui/material";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import RestoreIcon from "@mui/icons-material/Restore";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { ModalConfirm } from "../../../components/modal/modalConfirm";
import type { IProject } from "../types";

interface Props {
  project: IProject;
  canRestore: boolean;
  isOwner: boolean;
  onRestore: () => void;
  onDelete: () => void;
}

export function ArchivedProjectActionMenu({ project, canRestore, isOwner, onRestore, onDelete }: Props) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openRestore, setOpenRestore] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  if (!canRestore && !isOwner) return null;

  return (
    <>
      <IconButton
        size="small"
        onClick={(e) => { e.stopPropagation(); setAnchorEl(e.currentTarget); }}
      >
        <MoreHorizIcon fontSize="small" />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        slotProps={{ paper: { sx: { width: 200, borderRadius: "8px" } } }}
      >
        {canRestore && (
          <MenuItem
            onClick={() => { setAnchorEl(null); setOpenRestore(true); }}
            sx={{ py: 1.2, fontSize: 14 }}
          >
            <RestoreIcon fontSize="small" sx={{ mr: 1.5, color: "#2563eb" }} />
            Khôi phục dự án
          </MenuItem>
        )}
        {canRestore && isOwner && <Divider />}
        {isOwner && (
          <MenuItem
            onClick={() => { setAnchorEl(null); setOpenDelete(true); }}
            sx={{ py: 1.2, fontSize: 14, color: "#bd534a" }}
          >
            <DeleteOutlineIcon fontSize="small" sx={{ mr: 1.5 }} />
            Xóa vĩnh viễn
          </MenuItem>
        )}
      </Menu>

      <ModalConfirm
        open={openRestore}
        setOpen={setOpenRestore}
        title="Khôi phục dự án"
        message={
          <>Dự án <strong>"{project.name}"</strong> sẽ được khôi phục và hiển thị lại trong danh sách dự án đang hoạt động.</>
        }
        titleButton="Khôi phục"
        cancelButtonText="Hủy"
        onClick={() => { onRestore(); setOpenRestore(false); }}
        isArchive={true}
      />

      <ModalConfirm
        open={openDelete}
        setOpen={setOpenDelete}
        title="Xóa vĩnh viễn dự án"
        message={
          <>
            Bạn sắp xóa vĩnh viễn dự án <strong>"{project.name}"</strong> cùng toàn bộ task và dữ liệu liên quan.
            <br />
            Hành động này <strong>không thể hoàn tác</strong>.
          </>
        }
        titleButton="Xóa"
        cancelButtonText="Hủy"
        onClick={() => { onDelete(); setOpenDelete(false); }}
        isDelete={true}
        confirmButtonProps={{ sx: { backgroundColor: "#d32f2f", "&:hover": { backgroundColor: "#b71c1c" } } }}
      />
    </>
  );
}
