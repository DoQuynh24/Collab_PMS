import { Box, Typography, IconButton, Tooltip, Popover, TextField, InputAdornment, MenuItem, Select, Avatar, Button} from '@mui/material';
import { Settings as SettingsIcon, PersonAdd as PersonAddIcon, Share as ShareIcon } from '@mui/icons-material';
import { useContext, useState } from 'react';
import LockIcon from '@mui/icons-material/Lock';
import PublicIcon from '@mui/icons-material/Public';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import SearchIcon from '@mui/icons-material/Search';
import { AddMemberModal } from '../../project-member/component/AddMemberFormModal';
import ProjectSettingsMenu from './setting/ProjectSettingMenu';
import { getProjectColor } from '../../../utils/projectColor';
import { useGetProjectById } from '../api/get-project-id';
import { useUpdateProject } from '../api/update-project';
import { useGetCurrentUser } from '../../login/api/auth';
import { useInviteMember } from '../../project-member/api/add-member';
import { ToastContext } from '../../../components/notification/NotifiProvider';
import { PROJECT_ACCESS_OPTIONS } from '../../../constant';

interface Props {
  projectName?: string;
  projectId?: string;
}

export function ProjectHeader({ projectName, projectId }: Props) {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [openAddMember, setOpenAddMember] = useState(false);
    const [copied, setCopied] = useState(false);
    const [copiedId, setCopiedId] = useState(false);
    const [settingsAnchorEl, setSettingsAnchorEl] = useState<null | HTMLElement>(null);
    const [inviteEmail, setInviteEmail] = useState('');

    const { data: project } = useGetProjectById(projectId!);
    const { data: currentUser } = useGetCurrentUser();
    const { mutate: updateProject } = useUpdateProject(projectId!);
    const { mutate: inviteMember, isPending: isInviting } = useInviteMember(projectId!);
    const { showToast } = useContext(ToastContext)!;

    const members = project?.project_members ?? [];
    const isOwner = project?.owner_id === currentUser?.user_id;
    const isAdmin = members.some((m: any) => m.user_id === currentUser?.user_id && m.role === 'admin');
    const canManage = isOwner || isAdmin;

    const currentAccess = project?.access ?? 'private';
    const shareUrl = `${window.location.origin}/projects/${projectId}`;

    const handleCopy = () => {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    const handleAccessChange = (newAccess: string) => {
      updateProject({ access: newAccess as 'public' | 'private' }, {
        onSuccess: () => showToast('Đã cập nhật quyền truy cập', 'success'),
        onError: () => showToast('Cập nhật thất bại', 'error'),
      });
    };

    const handleInvite = () => {
      if (!inviteEmail.trim()) return;
      inviteMember({ invited_email: inviteEmail.trim(), role: 'member' }, {
        onSuccess: () => {
          showToast(`Đã gửi lời mời đến ${inviteEmail}`, 'success');
          setInviteEmail('');
        },
        onError: (err: any) => showToast(err?.response?.data?.message || 'Gửi lời mời thất bại', 'error'),
      });
    };

    return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.5, borderBottom: '1px solid #e0e0e0', paddingTop: '0px' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar
          variant="rounded"
          sx={{
            width: 32, height: 32,
            fontSize: 14, fontWeight: 700,
            bgcolor: getProjectColor(projectId ?? "").bg,
            color: getProjectColor(projectId ?? "").text,
            borderRadius: "6px",
          }}
        >
          {projectName?.charAt(0).toUpperCase() ?? "P"}
        </Avatar>
        <Typography fontWeight={600} fontSize={20}>{projectName}</Typography>
        <Tooltip title={copiedId ? "Đã sao chép!" : `Mã dự án — Sao chép`}>
          <Box
            onClick={() => {
              if (projectId) {
                navigator.clipboard.writeText(projectId);
                setCopiedId(true);
                setTimeout(() => setCopiedId(false), 2000);
              }
            }}
            sx={{
              display: 'flex', alignItems: 'center', gap: 0.5,
              px: 1, py: 0.3, borderRadius: '4px',
              bgcolor: '#f3f4f6', cursor: 'pointer',
              '&:hover': { bgcolor: '#e5e7eb' },
              transition: 'background 0.15s',
            }}
          >
            <Typography fontSize={11} color="#6b7280" sx={{letterSpacing: 0.5 }}>
              {projectId}
            </Typography>
            {copiedId
              ? <CheckIcon sx={{ fontSize: 12, color: '#059669' }} />
              : <ContentCopyIcon sx={{ fontSize: 12, color: '#9ca3af' }} />
            }
          </Box>
        </Tooltip>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Tooltip title="Chia sẻ">
          <IconButton 
            size="small" 
            onClick={(e) => setAnchorEl(e.currentTarget)}
            sx={{ border: '1px solid #d3d3d3', borderRadius: '6px', p: '5px', color: '#018b13' }}
          >
            <ShareIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Popover
          open={Boolean(anchorEl)}
          anchorEl={anchorEl}
          onClose={() => setAnchorEl(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          slotProps={{ paper: { sx: { width: 500, borderRadius: '8px', p: 2 } } }}
        >
          <Typography fontWeight={600} fontSize={16} mb={2}>Chia sẻ dự án</Typography>

          {canManage && (
            <>
              <Typography fontSize={13} color="#555" mb={1}>Mời thành viên qua email</Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  fullWidth size="small"
                  placeholder="Nhập địa chỉ email..."
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: '#9ca3af' }} /></InputAdornment> } }}
                />
                <Button variant="contained" size="small" onClick={handleInvite} disabled={!inviteEmail.trim() || isInviting}
                  sx={{ textTransform: 'none', bgcolor: '#5663ee', '&:hover': { bgcolor: '#4451d4' }, flexShrink: 0, px: 2 }}>
                  Mời
                </Button>
              </Box>
            </>
          )}

          <Typography fontSize={13} fontWeight={500} color="#555" mb={1}>
            Quyền truy cập dự án
          </Typography>
          <Select
            fullWidth
            size="small"
            value={currentAccess}
            onChange={e => canManage && handleAccessChange(e.target.value)}
            disabled={!canManage}
            sx={{ mb: 2, borderRadius: '6px' }}
          >
            {PROJECT_ACCESS_OPTIONS.map(opt => (
              <MenuItem key={opt.value} value={opt.value}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  {opt.value === 'private'
                    ? <LockIcon fontSize="small" sx={{ mt: 0.3}} />
                    : <PublicIcon fontSize="small" sx={{ mt: 0.3 }} />
                  }
                  <Box>
                    <Typography fontSize={14} fontWeight={500}>{opt.label}</Typography>
                    <Typography fontSize={12} color="#888">{opt.description}</Typography>
                  </Box>
                </Box>
              </MenuItem>
            ))}
          </Select>
          <Typography fontSize={13} color="#555" mb={1}>
            Nếu dự án "Công khai" bất kỳ ai có liên kết đều có thể xem dự án này.
          </Typography>
          <TextField
            fullWidth size="small" value={shareUrl}
            slotProps={{
              input: {
                readOnly: true,
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title={copied ? "Đã sao chép!" : "Sao chép"}>
                      <IconButton size="small" onClick={handleCopy}>
                        {copied ? <CheckIcon fontSize="small" sx={{ color: '#4CAF50' }} /> : <ContentCopyIcon fontSize="small" sx={{ color: '#555' }} />}
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ),
              },
            }}
            sx={{ '& .MuiInputBase-input': { fontSize: 13, color: '#555' } }}
          />
        </Popover>

        <Tooltip title="Thêm thành viên">
          <IconButton size="small" sx={{ border: '1px solid #d3d3d3', borderRadius: '6px', p: '5px', color: '#5663ee'  }}>
            <PersonAddIcon fontSize="small" onClick={() => setOpenAddMember(true)}/>
          </IconButton>
        </Tooltip>
        <Tooltip title="Cài đặt dự án">
          <IconButton 
            size="small" 
            sx={{ border: '1px solid #d3d3d3', borderRadius: '6px', p: '5px', color: '#626469' }}
            onClick={(e) => setSettingsAnchorEl(e.currentTarget)}
          >
            <SettingsIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
        <AddMemberModal
          open={openAddMember}
          onClose={() => setOpenAddMember(false)}
          projectName={projectName}
          projectId={projectId}
        />
        
        <ProjectSettingsMenu
          anchorEl={settingsAnchorEl}
          onClose={() => setSettingsAnchorEl(null)}
          projectId={projectId}
          projectName={projectName}
        />
    </Box>
  );
}