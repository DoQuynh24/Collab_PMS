import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  useMediaQuery,
} from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { useGetProjectById } from "../../api/get-project-id";
import { useGetCurrentUser } from "../../../login/api/auth";
import { useUpdateProject } from "../../api/update-project";
import { ToastContext } from "../../../../components/notification/NotifiProvider";
import { PROJECT_ACCESS, PROJECT_ACCESS_OPTIONS, type ProjectAccessType } from "../../../../constant";
import LoadingPage from "../../../../components/loading/LoadingPage";
import { ROUTES } from "../../../../routes/urls";

export function ProjectDetailSettings() {
  const isMobile = useMediaQuery("(max-width:900px)");
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();

  const { data: project, isLoading } = useGetProjectById(projectId!);
  const { data: currentUser } = useGetCurrentUser();
  const { mutate: updateProject, isPending } = useUpdateProject(projectId!);

  const { showToast } = useContext(ToastContext)!;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [access, setAccess] = useState<ProjectAccessType>(PROJECT_ACCESS.PRIVATE);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const isOwner = project?.owner_id === currentUser?.user_id;
  const canEdit = isOwner || project?.project_members?.some(
    (m: any) => m.user_id === currentUser?.user_id && m.role === "admin"
  );

  const hasChanges = 
    name !== (project?.name || "") ||
    description !== (project?.description || "") ||
    access !== (project?.access || PROJECT_ACCESS.PRIVATE) ||
    startDate !== (project?.start_date ? project.start_date.split("T")[0] : "") ||
    endDate !== (project?.end_date ? project.end_date.split("T")[0] : "");

  useEffect(() => {
    if (project) {
      setName(project.name || "");
      setDescription(project.description || "");
      setAccess(project.access || PROJECT_ACCESS.PRIVATE);
      setStartDate(project.start_date ? project.start_date.split("T")[0] : "");
      setEndDate(project.end_date ? project.end_date.split("T")[0] : "");
    }
  }, [project]);

  const handleSave = () => {
    updateProject(
      {
        name,
        description,
        access,
        start_date: startDate,
        end_date: endDate || undefined,
      },
      {
        onSuccess: () => showToast("Cập nhật dự án thành công", "success"),
        onError: () => showToast("Cập nhật dự án thất bại", "error"),
      }
    );
  };

  const handleBack = () => {
    navigate(ROUTES.projectDetail(projectId!));
  };

  const handleCancel = () => {
    setName(project?.name || "");
    setDescription(project?.description || "");
    setAccess(project?.access || PROJECT_ACCESS.PRIVATE);
    setStartDate(project?.start_date ? project.start_date.split("T")[0] : "");
    setEndDate(project?.end_date ? project.end_date.split("T")[0] : "");
  };

  if (isLoading) return <LoadingPage />;

  return (
    <Paper elevation={0} >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Tooltip title="Quay lại dự án">
          <IconButton onClick={handleBack}>
            <ArrowBackIcon />
          </IconButton>
        </Tooltip>
        <Typography variant="h5" fontWeight={700}>
          Chi tiết dự án
        </Typography>
      </Box>

      <Stack spacing={3} sx={{ border: "1px solid #e5e7eb", borderRadius: { xs: "18px", sm: "12px" }, p: { xs: 2, sm: 4 } }}>
        <Box>
          <Typography fontWeight={600} mb={1}>Tên dự án</Typography>
          <TextField
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={!canEdit}
          />
        </Box>

        <Box>
          <Typography fontWeight={600} mb={1}>Mô tả</Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Thêm mô tả dự án..."
            disabled={!canEdit}
          />
        </Box>

        <Box>
          <Typography fontWeight={600} mb={1}>Quyền truy cập</Typography>
          <Select
            fullWidth
            value={access}
            onChange={(e) => setAccess(e.target.value as ProjectAccessType)}
            disabled={!canEdit}
          >
            {PROJECT_ACCESS_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  {option.icon}
                  <Box>
                    <Typography fontWeight={500}>{option.label}</Typography>
                    <Typography fontSize={12} color="#666">{option.description}</Typography>
                  </Box>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </Box>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <Box sx={{ flex: 1 }}>
            <Typography fontWeight={600} mb={1}>Ngày bắt đầu</Typography>
            <TextField
              fullWidth
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              disabled={!canEdit}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography fontWeight={600} mb={1}>Ngày kết thúc</Typography>
            <TextField
              fullWidth
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              disabled={!canEdit}
              InputLabelProps={{ shrink: true }}
            />
            <Typography 
              fontSize={13} 
              color="#d32f2f" 
              sx={{ mt: 1, fontStyle: 'italic' }}
            >
              * Khi tới ngày kết thúc, dự án sẽ được chuyển vào kho lưu trữ. 
              Tất cả các hoạt động sẽ được tạm dừng. Bạn có thể khôi phục lại dự án ở Kho lưu trữ.
            </Typography>
          </Box>
          
        </Stack>

        {canEdit && (
          <Stack direction={{ xs: "column-reverse", sm: "row" }} justifyContent="flex-end" spacing={2} sx={{ mt: 4 }}>
            <Button
              variant="outlined"
              onClick={handleCancel}
              disabled={isPending}
              fullWidth={isMobile}
              sx={{ px: 4 }}
            >
              Hủy
            </Button>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={!hasChanges || isPending}
              fullWidth={isMobile}
              sx={{ bgcolor: "#5663ee", "&:hover": { bgcolor: "#4451d4" }, px: 4 }}
            >
              {isPending ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </Stack>
        )}
      </Stack>
    </Paper>
  );
}
export default ProjectDetailSettings;
