import { Box, Typography, IconButton, Tooltip, Popover, TextField, InputAdornment, MenuItem, Select } from '@mui/material';
import { Settings as SettingsIcon, PersonAdd as PersonAddIcon, Share as ShareIcon } from '@mui/icons-material';
import { useState } from 'react';
import LockIcon from '@mui/icons-material/Lock';
import PublicIcon from '@mui/icons-material/Public';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import { AddMemberModal } from '../../project-member/component/AddMemberFormModal';
import ProjectSettingsMenu from './setting/ProjectSettingMenu';

interface Props {
  projectName?: string;
  projectId?: string;
}

export function ProjectHeader({ projectName, projectId }: Props) {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const shareUrl = `${window.location.origin}/projects/${projectId}`;
    const [access, setAccess] = useState('public');

    const [openAddMember, setOpenAddMember] = useState(false);

    const [copied, setCopied] = useState(false);
    
    const [settingsAnchorEl, setSettingsAnchorEl] = useState<null | HTMLElement>(null);

    const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);

    };

    return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.5, borderBottom: '1px solid #e0e0e0', paddingTop: '0px' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{ width: 32, height: 32, borderRadius: '6px', overflow: 'hidden' }}>
          <Box component="img" src="/images/project.png" alt="project" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </Box>
        <Typography fontWeight={600} fontSize={20}>{projectName}</Typography>
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
          PaperProps={{ sx: { width: 420, borderRadius: '8px', p: 2 } }}
        >
        <Typography fontWeight={600} fontSize={16} mb={2}>Chia sẻ</Typography>
        
        <Typography fontSize={13} color="#555" mb={0.5}>Tên hoặc nhóm</Typography>
        <TextField fullWidth size="small" placeholder="vd: Nguyễn Văn A, Nhóm A" sx={{ mb: 2 }} />

        <Typography fontSize={13} fontWeight={500} color="#555" mb={1}>Quyền truy cập dự án</Typography>
        <Select
            fullWidth
            size="small"
            value={access}
            onChange={(e) => setAccess(e.target.value)}
            sx={{ mb: 2, borderRadius: '6px' }}
        >
        <MenuItem value="private">
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
            <LockIcon fontSize="small" sx={{ mt: 0.3 }} />
            <Box>
                <Typography fontSize={14} fontWeight={500}>Riêng tư</Typography>
                <Typography fontSize={12} color="#888">Chỉ admin và thành viên được thêm mới có thể truy cập.</Typography>
            </Box>
            </Box>
        </MenuItem>
        <MenuItem value="public">
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
            <PublicIcon fontSize="small" sx={{ mt: 0.3 }} />
            <Box>
                <Typography fontSize={14} fontWeight={500}>Công khai</Typography>
                <Typography fontSize={12} color="#888">Mọi người có thể xem, tạo và chỉnh sửa công việc trong dự án.</Typography>
            </Box>
            </Box>
        </MenuItem>
        </Select>
           
        <Typography fontSize={13} color="#555" mb={1}>
            Bất kỳ ai có liên kết đều có thể xem dự án này.
        </Typography>
        <TextField
            fullWidth
            size="small"
            value={shareUrl}
            InputProps={{
            readOnly: true,
            endAdornment: (
                <InputAdornment position="end">
                    <Tooltip title={copied ? "Đã sao chép!" : "Sao chép"}>
                    <IconButton size="small" onClick={handleCopy}>
                        {copied 
                        ? <CheckIcon fontSize="small" sx={{ color: '#4CAF50' }} />
                        : <ContentCopyIcon fontSize="small" sx={{ color: '#555' }} />
                        }
                    </IconButton>
                    </Tooltip>
                </InputAdornment>
                ),
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