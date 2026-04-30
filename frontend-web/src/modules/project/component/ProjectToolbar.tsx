import {
  Box,
  Stack,
  TextField,
  Avatar,
  Tooltip,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import TuneIcon from "@mui/icons-material/Tune";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import CheckIcon from "@mui/icons-material/Check";
import { useState } from "react";
import type { ITaskStatus } from "../../task-status/types";
import { FilterModal } from "./modal/FilterModal";
import { GROUP_OPTIONS, type GroupBy } from "../../../constant";

interface ProjectMember {
  user_id: number;
  user?: { name?: string; picture?: string };
}

interface Props {
  projectMembers: ProjectMember[];
  statuses: ITaskStatus[];
  onFilterChange: (filters: any) => void;
  showGroupButton?: boolean;
  groupBy?: GroupBy;
  onGroupByChange?: (g: GroupBy) => void;
}

export function ProjectToolbar({
  projectMembers,
  statuses,
  onFilterChange,
  showGroupButton = false,
  groupBy = 'none',
  onGroupByChange,
}: Props) {
  const [groupAnchor, setGroupAnchor] = useState<null | HTMLElement>(null);
  const currentGroupLabel = GROUP_OPTIONS.find(o => o.value === groupBy)?.label ?? 'Nhóm';

  return (
    <Box sx={{ px: 1, py: 2.5, bgcolor: "#fff" }}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ width: "100%" }}>

        <Stack direction="row" alignItems="center" spacing={2} sx={{ flexGrow: 1 }}>
          <TextField
            size="small"
            placeholder="Tìm kiếm nhiệm vụ"
            sx={{ width: 240 }}
          />

          <Stack direction="row" spacing={-1} alignItems="center">
            {projectMembers.slice(0, 5).map((member) => (
              <Tooltip key={member.user_id} title={member.user?.name || "Member"}>
                <Avatar
                  src={member.user?.picture}
                  alt={member.user?.name}
                  sx={{
                    width: 32,
                    height: 32,
                    border: "2px solid white",
                    boxShadow: "0 0 0 1px rgba(0,0,0,0.1)",
                  }}
                >
                  {member.user?.name?.charAt(0).toUpperCase()}
                </Avatar>
              </Tooltip>
            ))}
            {projectMembers.length > 5 && (
              <Tooltip title={`${projectMembers.length - 5} người khác`}>
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: "#5663ee",
                    fontSize: "0.875rem",
                    border: "2px solid white",
                  }}
                >
                  +{projectMembers.length - 5}
                </Avatar>
              </Tooltip>
            )}
          </Stack>

          <FilterModal
            projectMembers={projectMembers}
            onFilterChange={onFilterChange}
            statuses={statuses}
          />
        </Stack>

        <Stack direction="row" alignItems="center" spacing={1}>
          {showGroupButton && (
            <>
              <Button
                variant="outlined"
                size="small"
                endIcon={<KeyboardArrowDownIcon />}
                onClick={(e) => setGroupAnchor(e.currentTarget)}
                sx={{
                  textTransform: "none",
                  borderRadius: "6px",
                  fontSize: "14px",
                  borderColor: groupBy !== 'none' ? "#5663ee" : "#d1d5db",
                  color: groupBy !== 'none' ? "#5663ee" : "#555",
                  bgcolor: groupBy !== 'none' ? "#eef0ff" : "transparent",
                }}
              >
                {groupBy !== 'none' ? currentGroupLabel : 'Nhóm'}
              </Button>
              <Menu
                anchorEl={groupAnchor}
                open={Boolean(groupAnchor)}
                onClose={() => setGroupAnchor(null)}
                slotProps={{ paper: { sx: { borderRadius: '8px', minWidth: 180 } } }}
              >
                <Box sx={{ px: 2, py: 1 }}>
                  <Typography fontSize={11} fontWeight={600} color="#9ca3af" letterSpacing={0.5}>NHÓM THEO</Typography>
                </Box>
                {GROUP_OPTIONS.map(opt => (
                  <MenuItem key={opt.value}
                    onClick={() => { onGroupByChange?.(opt.value); setGroupAnchor(null); }}
                    sx={{ fontSize: 13, gap: 1.5, py: 1 }}
                  >
                    <CheckIcon sx={{ fontSize: 16, opacity: groupBy === opt.value ? 1 : 0, color: '#5663ee' }} />
                    {opt.label}
                  </MenuItem>
                ))}
              </Menu>
            </>
          )}

          <Tooltip title="Tùy chỉnh hiển thị">
            <IconButton sx={{ borderRadius: "6px", padding: "5px", border: "1px solid #d3d3d3" }}>
              <TuneIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Tùy chọn">
            <IconButton sx={{ borderRadius: "6px", padding: "5px", border: "1px solid #d3d3d3" }}>
              <MoreHorizIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>
    </Box>
  );
}