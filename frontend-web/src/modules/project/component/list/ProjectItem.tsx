import { ListItemButton, ListItemText, Tooltip, IconButton, Avatar } from '@mui/material';
import { MoreHoriz as MoreHorizIcon } from '@mui/icons-material';
import { useState } from 'react';
import { ProjectOptionsMenu } from '../ProjectOptionsMenu';
import { useGetCurrentUser } from '../../../login/api/auth';
import { isProjectPath } from '../../../../routes/urls';
import { getProjectColor } from '../../../../utils/projectColor';

const ACTIVE_BG = 'rgba(255,255,255,0.18)';
const HOVER_BG = 'rgba(255,255,255,0.10)';
const TEXT_COLOR = '#ffffff';

interface Props {
  project: any;
  isSelected: boolean;
  onNavigate: () => void;
}

export function ProjectItem({ project, onNavigate }: Props) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { data: currentUser } = useGetCurrentUser();
  const isSelected = isProjectPath(location.pathname, project.project_id);
  const color = getProjectColor(project.project_id);

  return (
    <>
      <ListItemButton
        selected={isSelected}
        onClick={onNavigate}
        sx={{
          pl: 3, pr: 1, mx: 1, mb: 0.3,
          borderRadius: '10px',
          minHeight: 38,
          gap: 1,
          bgcolor: isSelected ? ACTIVE_BG : 'transparent',
          '&:hover': { bgcolor: isSelected ? ACTIVE_BG : HOVER_BG },
          '&.Mui-selected': { bgcolor: ACTIVE_BG },
          '&.Mui-selected:hover': { bgcolor: ACTIVE_BG },
          '&:hover .moreBtn': { opacity: 1 },
        }}
      >
        <Avatar
          variant="rounded"
          sx={{
            width: 20, height: 20, fontSize: 10, fontWeight: 700,
            bgcolor: color.bg, color: color.text,
            borderRadius: '4px', flexShrink: 0,
          }}
        >
          {project.name.charAt(0).toUpperCase()}
        </Avatar>
        <ListItemText
          primary={project.name}
          primaryTypographyProps={{
            fontSize: 13, noWrap: true,
            color: TEXT_COLOR,
            fontWeight: isSelected ? 600 : 400,
          }}
        />
        <Tooltip title="Tùy chọn" arrow>
          <IconButton
            size="small"
            className="moreBtn"
            onClick={(e) => { e.stopPropagation(); setAnchorEl(e.currentTarget); }}
            sx={{
              opacity: anchorEl ? 1 : 0,
              color: 'rgba(255,255,255,0.7)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.15)', color: '#fff' },
              transition: 'opacity 0.15s',
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
