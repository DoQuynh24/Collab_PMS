import { Box, IconButton, Menu, MenuItem, Avatar, Typography, Divider, CircularProgress } from '@mui/material';
import { useState } from 'react';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import AddIcon from '@mui/icons-material/Add';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useNavigate } from 'react-router-dom';
import { ProjectFormModal } from '../modules/project/component/modal/ProjectFormModal';
import { useGetProjects } from '../modules/project/api/get-project';
import { getProjectColor } from '../utils/projectColor';
import { ROUTES } from '../routes/urls';

export function HeaderMenu() {
  const navigate = useNavigate();
  const [projectAnchor, setProjectAnchor] = useState<null | HTMLElement>(null);
  const [openModal, setOpenModal] = useState(false);

  const { data: projects = [], isLoading } = useGetProjects();

  const handleProjectClick = (projectId: string) => {
    setProjectAnchor(null);
    navigate(ROUTES.projectBoard(projectId));
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', ml: 10, gap: 0.5 }}>
      <IconButton
        color="inherit"
        onClick={(e) => setProjectAnchor(e.currentTarget)}
        sx={{ px: 1.5, py: 0.5, fontSize: 14, fontWeight: 500, borderRadius: '6px', '&:hover': { bgcolor: 'rgba(255,255,255,0.15)' } }}
      >
        Dự án
        <ArrowDropDownIcon sx={{ fontSize: 18, ml: 0.3 }} />
      </IconButton>

      <Menu
        anchorEl={projectAnchor}
        open={Boolean(projectAnchor)}
        onClose={() => setProjectAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{ paper: { sx: { width: 280, borderRadius: '8px', mt: 0.5 } } }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography fontSize={11} fontWeight={600} color="#9ca3af" letterSpacing={0.5}>
            DỰ ÁN CỦA TÔI
          </Typography>
        </Box>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <CircularProgress size={20} />
          </Box>
        ) : projects.length === 0 ? (
          <MenuItem disabled sx={{ fontSize: 13, color: '#9ca3af' }}>Chưa có dự án nào</MenuItem>
        ) : (
          projects.slice(0, 6).map((project) => {
            const color = getProjectColor(project.project_id);
            return (
              <MenuItem
                key={project.project_id}
                onClick={() => handleProjectClick(project.project_id)}
                sx={{ py: 1, px: 2, gap: 1.5 }}
              >
                <Avatar
                  variant="rounded"
                  sx={{ width: 24, height: 24, fontSize: 11, fontWeight: 700, bgcolor: color.bg, color: color.text, borderRadius: '4px', flexShrink: 0 }}
                >
                  {project.name.charAt(0).toUpperCase()}
                </Avatar>
                <Typography fontSize={13} noWrap sx={{ flex: 1 }}>{project.name}</Typography>
              </MenuItem>
            );
          })
        )}

        {projects.length > 0 && (
          <>
            <Divider sx={{ my: 0.5 }} />
            <MenuItem
              onClick={() => { setProjectAnchor(null); navigate('/home'); }}
              sx={{ py: 1, px: 2, gap: 1.5, color: '#5663ee' }}
            >
              <OpenInNewIcon sx={{ fontSize: 16 }} />
              <Typography fontSize={13} fontWeight={500}>Xem tất cả dự án</Typography>
            </MenuItem>
          </>
        )}
      </Menu>

      <IconButton
        color="inherit"
        onClick={() => setOpenModal(true)}
        sx={{ px: 1.5, py: 0.5, fontSize: 14, fontWeight: 500, borderRadius: '6px', '&:hover': { bgcolor: 'rgba(255,255,255,0.15)' }, display: 'flex', alignItems: 'center', gap: 0.5 }}
      >
        <AddIcon sx={{ fontSize: 18 }} />
        Tạo mới
      </IconButton>

      <ProjectFormModal open={openModal} onClose={() => setOpenModal(false)} />
    </Box>
  );
}
