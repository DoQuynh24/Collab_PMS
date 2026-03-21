import { Menu, MenuItem, Divider } from '@mui/material';
import { PersonAdd as PersonAddIcon, Star as StarIcon, Delete as DeleteIcon,
  Settings as SettingsIcon, Archive as ArchiveIcon } from '@mui/icons-material';
import { AddMemberModal } from '../../project-member/component/AddMemberFormModal';
import { useState } from 'react';

interface Props {
  anchorEl: null | HTMLElement;
  onClose: () => void;
  projectId: string;
  projectName: string;
  
}

export function ProjectOptionsMenu({ anchorEl, onClose, projectId, projectName }: Props) {

  const [openAddMember, setOpenAddMember] = useState(false);
  
  return (
    <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={onClose}
      slotProps={{ paper: { sx: { width: 280, borderRadius: '8px' } } }}>
      <MenuItem onClick={() => setOpenAddMember(true)} sx={{ py: 1.2 }}>
        <PersonAddIcon fontSize="small" sx={{ mr: 1.5 }} /> Thêm thành viên
      </MenuItem>
      <AddMemberModal
        open={openAddMember}
        onClose={() => setOpenAddMember(false)}
        projectName={projectName}
        projectId={projectId}
        />

      <MenuItem onClick={onClose} sx={{ py: 1.2 }}>
        <StarIcon fontSize="small" sx={{ mr: 1.5 }} /> Thêm vào yêu thích
      </MenuItem>

      <MenuItem onClick={onClose} sx={{ py: 1.2 }}>
        <SettingsIcon fontSize="small" sx={{ mr: 1.5 }} /> Cài đặt dự án
      </MenuItem>

      <Divider />
      <MenuItem onClick={onClose} sx={{ py: 1.2 }}>
        <ArchiveIcon fontSize="small" sx={{ mr: 1.5 }} /> Lưu trữ dự án
      </MenuItem>

      <MenuItem onClick={onClose} sx={{ py: 1.2, color: '#bd534a' }}>
        <DeleteIcon fontSize="small" sx={{ mr: 1.5 }} /> Xóa dự án
      </MenuItem>
    </Menu>
  );
}