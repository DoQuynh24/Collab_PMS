import {
  Box,
  Stack,
  TextField,
  Avatar,
  Tooltip,
  Button,
  IconButton,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import TuneIcon from "@mui/icons-material/Tune";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import type { ITaskStatus } from "../../task-status/types";
import { FilterModal } from "./modal/FilterModal";

interface ProjectMember {
  user_id: number;
  user?: { name?: string; picture?: string };
}

interface Props {
  projectMembers: ProjectMember[];
  statuses: ITaskStatus[];
  onFilterChange: (filters: any) => void;
  showGroupButton?: boolean;
}

export function ProjectToolbar({
  projectMembers,
  statuses,
  onFilterChange,
  showGroupButton = false,
}: Props) {
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
            <Button
              variant="outlined"
              size="small"
              endIcon={<KeyboardArrowDownIcon />}
              sx={{
                textTransform: "none",
                borderRadius: "6px",
                borderColor: "#d1d5db",
                color: "#555",
                fontSize: "14px",
              }}
            >
              Nhóm
            </Button>
          )}

          <Tooltip title="Tùy chỉnh hiển thị">
            <IconButton sx={{ borderRadius: "6px", padding: "5px", gap: "5px", border: "1px solid #d3d3d3"}}>
              <TuneIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Tùy chọn">
            <IconButton sx={{ borderRadius: "6px", padding: "5px", gap: "5px", border: "1px solid #d3d3d3"}}>
              <MoreHorizIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>
    </Box>
  );
}