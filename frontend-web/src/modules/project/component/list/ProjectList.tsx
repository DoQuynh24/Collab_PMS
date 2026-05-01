import { 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Collapse, 
  List, 
  Box,
  Tooltip,
} from '@mui/material';
import { 
  ExpandLess, ExpandMore, Add as AddIcon,
} from '@mui/icons-material';
import { useState } from 'react';

import { useNavigate, useLocation } from 'react-router-dom';
import { ProjectFormModal } from '../modal/ProjectFormModal'; 
import { ProjectItem } from './ProjectItem';
import { useGetProjects } from '../../api/get-project';
import { ROUTES } from '../../../../routes/urls';

export default function ProjectList({ open }: { open: boolean }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [projectsOpen, setProjectsOpen] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [openModal, setOpenModal] = useState(false); 
  const { data: projects = [], isLoading } = useGetProjects();
  
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
            projectsOpen ? <ExpandLess sx={{ color: '#ffffff'}}  /> : <ExpandMore sx={{ color: '#ffffff'}}/>
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
            <ListItemText primary="Dự án của tôi" sx={{ flexGrow: 1, color: '#fff' }} />
            <Tooltip title="Thêm dự án" arrow>
              <AddIcon
                fontSize="small"
                onClick={(e) => { e.stopPropagation(); setOpenModal(true); }}
                sx={{ color: '#fff', opacity: 0.8, cursor: "pointer", "&:hover": {
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
            <ListItemText primary="Đang tải..." sx={{ pl: 4, opacity: 0.6, color: '#fff' }} />
          ) : projects.length === 0 ? (
            <ListItemText primary="Chưa có dự án" sx={{ pl: 4, opacity: 0.6, color: '#fff' }} />
          ) : (
            projects.map((project: any) => (
              <ProjectItem
                key={project.project_id}
                project={project}
                isSelected={location.pathname === ROUTES.projectBoard(project.project_id)}
                onNavigate={() => navigate(ROUTES.projectBoard(project.project_id))}
              />
            ))
          )}
        </List>
      </Collapse>
    </>
  );
}