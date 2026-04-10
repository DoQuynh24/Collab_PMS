import { ListItemButton, ListItemText, Tooltip, IconButton } from '@mui/material';
import { MoreHoriz as MoreHorizIcon } from '@mui/icons-material';
import { useState } from 'react';
import { ProjectOptionsMenu } from '../ProjectOptionsMenu';
import { useGetCurrentUser } from '../../../login/api/auth';
import { isProjectPath } from '../../../../routes/urls';

interface Props {
  project: any;
  isSelected: boolean;
  onNavigate: () => void;
}

export function ProjectItem({ project, onNavigate }: Props) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { data: currentUser } = useGetCurrentUser();

  const isSelected = isProjectPath(location.pathname, project.project_id);

  return (
    <>
      <ListItemButton
        selected={isSelected}
        onClick={onNavigate}
        sx={{ 
          pl: 4, 
          pr: 1, 
          '&:hover .moreBtn': { opacity: 1 },
          bgcolor: isSelected ? 'action.selected' : 'transparent'  
        }}
      >
        <ListItemText
          primary={project.name}
        />
        <Tooltip title="Tùy chọn" arrow>
          <IconButton
            size="small"
            className="moreBtn"
            onClick={(e) => { e.stopPropagation(); setAnchorEl(e.currentTarget); }}
            sx={{
              opacity: anchorEl ? 1 : 0,
              transition: "transform 0.2s ease",
              "&:hover": { background: "transparent", transform: "scale(1.15)" },
            }}
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
        project={project}
        currentUser={currentUser} 
      />
    </>
  );
}