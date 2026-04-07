import { ListItemButton, ListItemText, Tooltip, IconButton } from '@mui/material';
import { MoreHoriz as MoreHorizIcon } from '@mui/icons-material';
import { useState } from 'react';
import { ProjectOptionsMenu } from '../ProjectOptionsMenu';

interface Props {
  project: any;
  isSelected: boolean;
  onNavigate: () => void;
}

export function ProjectItem({ project, isSelected, onNavigate }: Props) {
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
      />
    </>
  );
}