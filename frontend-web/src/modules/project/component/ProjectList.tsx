import { 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Collapse, 
  List, 
  Box,
  Tooltip,
  IconButton,
} from '@mui/material';
import { 
  ExpandLess, ExpandMore, Add as AddIcon,
  MoreHoriz as MoreHorizIcon,
} from '@mui/icons-material';
import { useState } from 'react';

import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../lib/api';
import { ProjectFormModal } from '../component/ProjectFormModal'; 
import { ProjectOptionsMenu } from './ProjectOptionsMenu';

function ProjectItem({ project, isSelected, onNavigate }: { 
  project: any; 
  isSelected: boolean; 
  onNavigate: () => void;
  }) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  return (
    <>
      <ListItemButton
        selected={isSelected}
        onClick={onNavigate}
        sx={{ pl: 4, pr: 1, '&:hover .moreBtn': { opacity: 1 } }}
      >
        <ListItemText
          primary={project.name}
          primaryTypographyProps={{ noWrap: true, fontSize: '0.875rem' }}
        />
        <Tooltip title="Tùy chọn" arrow>
          <IconButton
            size="small"
            className="moreBtn"
            onClick={(e) => { e.stopPropagation(); setAnchorEl(e.currentTarget); }}
            sx={{ opacity: anchorEl ? 1 : 0, transition: "transform 0.2s ease", 
              "&:hover": {
                background: "transparent",
                transform: "scale(1.15)", 
              }  }}
          >
            <MoreHorizIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </ListItemButton>

      <ProjectOptionsMenu
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        projectId={project.project_id}
        projectName={project.name}
      />
    </>
  );
}
export default function ProjectList({ open }: { open: boolean }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [projectsOpen, setProjectsOpen] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [openModal, setOpenModal] = useState(false); 

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await apiClient.get('/projects');
      return res.data;
    },
    enabled: !!localStorage.getItem('access_token') && open, 
  });

  return (
    <>
      <ListItemButton
        onClick={() => setProjectsOpen(!projectsOpen)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        sx={{ justifyContent: open ? "initial" : "center", px: 2.5 }}
      >
        <ListItemIcon sx={{ minWidth: 0, mr: open ? 3 : "auto", justifyContent: "center" }}>
          {hovered && open ? (
            projectsOpen ? <ExpandLess /> : <ExpandMore />
          ) : (
            <Box
              component="img"
              src="/images/project.png"
              alt="Project"
              sx={{ width: 22, height: 22, borderRadius: '4px' }}
            />
          )}
        </ListItemIcon>

        {open && (
          <>
            <ListItemText primary="Dự án của tôi" sx={{ flexGrow: 1 }} />
            <Tooltip title="Thêm dự án" arrow>
              <AddIcon
                fontSize="small"
                onClick={(e) => { e.stopPropagation(); setOpenModal(true); }}
                sx={{ opacity: 0.8, cursor: "pointer", "&:hover": {
                background: "transparent",
                transform: "scale(1.15)", } }}
              />
            </Tooltip>
          </>
        )}
      </ListItemButton>

      <ProjectFormModal open={openModal} onClose={() => setOpenModal(false)} />
      
      <Collapse in={projectsOpen && open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {isLoading ? (
            <ListItemText primary="Đang tải..." sx={{ pl: 4, opacity: 0.6 }} />
          ) : projects.length === 0 ? (
            <ListItemText primary="Chưa có dự án" sx={{ pl: 4, opacity: 0.6 }} />
          ) : (
            projects.map((project: any) => (
              <ProjectItem
                key={project.project_id}
                project={project}
                isSelected={location.pathname === `/projects/${project.project_id}`}
                onNavigate={() => navigate(`/projects/${project.project_id}`)}
              />
            ))
          )}
        </List>
      </Collapse>
    </>
  );
}