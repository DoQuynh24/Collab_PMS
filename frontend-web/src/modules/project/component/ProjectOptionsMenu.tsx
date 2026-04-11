import { Menu, MenuItem, Divider } from '@mui/material';
import { PersonAdd as PersonAddIcon, Star as StarIcon, Delete as DeleteIcon,
  Settings as SettingsIcon, Archive as ArchiveIcon } from '@mui/icons-material';
import { AddMemberModal } from '../../project-member/component/AddMemberFormModal';
import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../routes/urls';
import { ToastContext } from '../../../components/notification/NotifiProvider';
import { ModalConfirm } from '../../../components/modal/modalConfirm';
import { useArchiveProject } from '../api/archive-project';
import { useDeleteProject } from '../api/delete-project';
import { useGetCurrentUser } from '../../login/api/auth';

interface Props {
  anchorEl: null | HTMLElement;
  onClose: () => void;
  projectId: string;
  projectName: string;
  project?: any;       
  currentUser?: any;
}

export function ProjectOptionsMenu({ anchorEl, onClose, projectId, projectName, project }: Props) {
  const navigate = useNavigate();
  const [openAddMember, setOpenAddMember] = useState(false);

  const [openArchiveConfirm, setOpenArchiveConfirm] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
 
  const { mutate: archiveProjectMutate } = useArchiveProject();
  const { mutate: deleteProjectMutate } = useDeleteProject();
  const { showToast } = useContext(ToastContext)!;

  const { data: currentUser } = useGetCurrentUser();
  const isOwner = project?.owner_id === currentUser?.user_id; 
  const members = project?.project_members || [];
  const isAdmin = members.some(
    (m: any) => m.user_id === currentUser?.user_id && m.role === 'admin'
  );
  const canManage = isOwner || isAdmin;
  const canDelete = isOwner;

  const handleSettingsClick = () => {
    onClose();
    navigate(ROUTES.projectDetailsSettings(projectId));
  };

  const handleArchiveClick = () => {
    onClose();
    setOpenArchiveConfirm(true);
  };
 
  const handleArchiveConfirm = () => {
    archiveProjectMutate(projectId, {
      onSuccess: () => {
        showToast("Dự án đã được lưu trữ thành công", "success");
        setOpenArchiveConfirm(false);
      },
      onError: (error: any) => {
        const message = error.response?.data?.message || "Lưu trữ dự án thất bại";
        showToast(message, "error");
      },
    });
  };

  const handleDeleteClick = () => {
    onClose();
    setOpenDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    deleteProjectMutate(projectId, {
      onSuccess: () => {
        showToast("Dự án đã được xóa vĩnh viễn", "success");
        setOpenDeleteConfirm(false);
        navigate('/home');         
      },
      onError: (error: any) => {
        const message = error.response?.data?.message || "Xóa dự án thất bại";
        showToast(message, "error");
      },
    });
  };
  
  return (
    <>
    <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={onClose}
      slotProps={{ paper: { sx: { width: 280, borderRadius: '8px' } } }}>
      {canManage && (
        <MenuItem onClick={() => setOpenAddMember(true)} sx={{ py: 1.2 }}>
          <PersonAddIcon fontSize="small" sx={{ mr: 1.5 }} /> Thêm thành viên
        </MenuItem>
      )}
      <AddMemberModal
        open={openAddMember}
        onClose={() => setOpenAddMember(false)}
        projectName={projectName}
        projectId={projectId}
        />

      <MenuItem onClick={onClose} sx={{ py: 1.2 }}>
        <StarIcon fontSize="small" sx={{ mr: 1.5 }} /> Thêm vào yêu thích
      </MenuItem>

      <MenuItem onClick={handleSettingsClick} sx={{ py: 1.2 }}>
        <SettingsIcon fontSize="small" sx={{ mr: 1.5 }} /> Cài đặt dự án
      </MenuItem>

      {(canManage || canDelete) && <Divider />}
      {canManage && (
        <MenuItem onClick={handleArchiveClick} sx={{ py: 1.2 }}>
          <ArchiveIcon fontSize="small" sx={{ mr: 1.5 }} /> Lưu trữ dự án
        </MenuItem>
      )}

      {canDelete && (
        <MenuItem onClick={handleDeleteClick} sx={{ py: 1.2, color: '#bd534a' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1.5 }} /> Xóa dự án
        </MenuItem>
      )}
    </Menu>
    <ModalConfirm
      open={openArchiveConfirm}
      setOpen={setOpenArchiveConfirm}
      title="Lưu trữ dự án"
      message={
          <>
          Dự án <strong>"{projectName}"</strong> cùng với tất cả nhiệm vụ liên quan sẽ được lưu trữ. 
          Dự án này sẽ không còn hiển thị trong danh sách dự án đang hoạt động.
          <br />
          Bạn và các thành viên sẽ không thể chỉnh sửa dự án này nữa cho đến khi khôi phục.
          <br />
          Bạn có thể khôi phục dự án từ mục <span style={{ textDecoration: "underline", color: "blue", cursor: "pointer" }}>Lưu trữ</span>.
        </>
      }
      titleButton="Lưu trữ"
      cancelButtonText="Hủy"
      onClick={handleArchiveConfirm}
      isArchive={true}
    />
    <ModalConfirm
      open={openDeleteConfirm}
      setOpen={setOpenDeleteConfirm}
      title="Xóa vĩnh viễn dự án"
      message={
        <>
          Bạn sắp xóa vĩnh viễn dự án <strong>"{projectName}"</strong> cùng với toàn bộ dữ liệu, nhiệm vụ và bình luận liên quan.
          <br />
          Hành động này <strong>không thể hoàn tác</strong>.
        </>
      }
      titleButton="Xóa"
      cancelButtonText="Hủy"
      onClick={handleDeleteConfirm}
      confirmButtonProps={{
      sx: { backgroundColor: "#d32f2f", "&:hover": { backgroundColor: "#b71c1c" } },
      }}
      isDelete={true}
    />
  </>
  );
}