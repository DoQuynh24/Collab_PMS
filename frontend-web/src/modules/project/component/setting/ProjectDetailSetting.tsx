import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Stack,
  Button,
  Paper,
  Tooltip,
  IconButton,
  Select,
  MenuItem,
} from "@mui/material";

import { useGetProjectById } from "../../api/get-project-id";
import { useGetCurrentUser } from "../../../login/api/auth";
import { useUpdateProject } from "../../api/update-project";
import { useNavigate, useParams } from "react-router-dom";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { PROJECT_ACCESS, PROJECT_ACCESS_OPTIONS, type ProjectAccessType } from "../../../../constant";
import LoadingPage from "../../../../components/loading/LoadingPage";


export function ProjectDetailSettings() {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  
  const { data: project, isLoading } = useGetProjectById(projectId!);
  const { data: currentUser } = useGetCurrentUser();
  const { mutate: updateProject } = useUpdateProject(projectId!);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [access, setAccess] = useState<ProjectAccessType>(PROJECT_ACCESS.PRIVATE); 

  const isOwner = project?.owner_id === currentUser?.user_id;

  useEffect(() => {
    if (project) {
      setName(project.name || "");
      setDescription(project.description || "");
      setAccess(project.access || PROJECT_ACCESS.PRIVATE);
    }
  }, [project]);

  const handleSave = () => {
    updateProject({ 
      name, 
      description, 
      access 
    });
  };

  const handleBack = () => {
    navigate(`/projects/${projectId}`);
  };

  if (isLoading) return <LoadingPage />;

  return (
    <Paper elevation={0} >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <Tooltip title="Quay lại">
          <IconButton onClick={handleBack}>
            <ArrowBackIcon />
          </IconButton>
        </Tooltip>
        <Typography variant="h6" fontWeight={600}>Cài đặt chung</Typography>
      </Box>

      <Stack spacing={3} sx={{ width:"800px", margin:"0px auto" }}>
        <Box>
          <Typography fontWeight={600} mb={1}>Tên dự án</Typography>
          <TextField fullWidth value={name} onChange={(e) => setName(e.target.value)} disabled={!isOwner} />
        </Box>

        <Box>
          <Typography fontWeight={600} mb={1}>Mô tả</Typography>
          <TextField fullWidth multiline rows={4} value={description} onChange={(e) => setDescription(e.target.value)} disabled={!isOwner} />
        </Box>

        <Box>
          <Typography fontSize={13} fontWeight={500} color="#555" mb={1}>
            Quyền truy cập dự án
          </Typography>
          <Select
            fullWidth
            size="small"
            value={access}
            onChange={(e) => setAccess(e.target.value as typeof PROJECT_ACCESS.PRIVATE | typeof PROJECT_ACCESS.PUBLIC)}
            sx={{ mb: 2, borderRadius: '6px' }}
            disabled={!isOwner}
          >
            {PROJECT_ACCESS_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  <span>{option.icon}</span>
                  <Box>
                    <Typography fontSize={14} fontWeight={500}>{option.label}</Typography>
                    <Typography fontSize={12} color="#888">{option.description}</Typography>
                  </Box>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </Box>

        <Box>
          <Typography fontWeight={600} mb={1}>Ngày bắt đầu</Typography>
          <Typography>
            {project?.start_date
              ? new Date(project.start_date).toLocaleDateString("vi-VN")
              : "—"}
          </Typography>
        </Box>

        {isOwner && (
          <Button
            variant="contained"
            onClick={handleSave}
            sx={{ bgcolor: "#5663ee", "&:hover": { bgcolor: "#4451d4" }, mt: 2 }}
          >
            Lưu thay đổi
          </Button>
        )}
      </Stack>
    </Paper>
  );
}

export default ProjectDetailSettings;