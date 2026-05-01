import { useContext, useState } from "react";
import {
  Box, Typography, TextField, Button, Avatar,
  CircularProgress, Chip, InputAdornment, Paper, Divider, Stack,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import ViewKanbanOutlinedIcon from "@mui/icons-material/ViewKanbanOutlined";
import CommentOutlinedIcon from "@mui/icons-material/CommentOutlined";
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";
import { useNavigate } from "react-router-dom";
import { lookupProject, type ProjectLookupResult } from "../project/api/lookup-project";
import { useJoinProject } from "../project/api/join-project";
import { useGetProjects } from "../project/api/get-project";
import { ToastContext } from "../../components/notification/NotifiProvider";
import { getProjectColor } from "../../utils/projectColor";
import { ROUTES } from "../../routes/urls";

export default function JoinProject() {
  const navigate = useNavigate();
  const { showToast } = useContext(ToastContext)!;
  const { mutate: joinProject, isPending: isJoining } = useJoinProject();
  const { data: myProjects = [] } = useGetProjects();

  const [projectId, setProjectId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [result, setResult] = useState<ProjectLookupResult | null>(null);
  const [isMember, setIsMember] = useState(false);
  const [joined, setJoined] = useState(false);
  const [requested, setRequested] = useState(false);

  const reset = () => {
    setProjectId(""); setNotFound(false); setResult(null);
    setIsMember(false); setJoined(false); setRequested(false);
  };

  const handleLookup = async () => {
    const trimmed = projectId.trim().toUpperCase();
    if (!trimmed) return;
    setIsLoading(true); setNotFound(false); setResult(null);
    setIsMember(false); setJoined(false); setRequested(false);
    try {
      const data = await lookupProject(trimmed);
      setResult(data);
      setIsMember(myProjects.some((p) => p.project_id === data.project_id));
    } catch { setNotFound(true); }
    finally { setIsLoading(false); }
  };

  const handleJoin = () => {
    if (!result) return;
    joinProject(result.project_id, {
      onSuccess: (data) => {
        if (data.type === "joined") { setJoined(true); 
          showToast(`Đã tham gia "${result.name}"`, "success"); }
        else { setRequested(true); 
          showToast("Đã gửi yêu cầu tham gia", "success"); }
      },
      onError: (err: any) => 
        showToast(err?.response?.data?.message || "Thao tác thất bại", "error"),
    });
  };

  const color = result ? getProjectColor(result.project_id) : null;

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}>
        <Box component="img" src="/images/microsoft-project-color.png" alt="microsoft-project-color" sx={{ width: 30, height: 30 }} />
        <Typography fontSize={20} fontWeight={600} color="#111827">Tham gia dự án</Typography>
      </Box>
      <Typography fontSize={14} color="#6b7280" mb={3}>
        Nhập mã dự án để tìm kiếm và tham gia cùng nhóm của bạn.
      </Typography>

      <Paper elevation={0} sx={{ border: "1px solid #e5e7eb", borderRadius: "10px", overflow: "hidden", minHeight: 500 }}>

        <Box sx={{ p: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, p: 1.5, mb: 3, bgcolor: "#fffbeb", border: "1px solid #fde68a", borderRadius: "8px" }}>
            <Typography fontSize={13} color="#92400e">
              💡 <strong>Mã dự án:</strong> là chuỗi 8 ký tự (ví dụ: <strong>PROJ1A2B</strong>). Bạn có thể lấy mã từ <strong>chủ sở hữu</strong> hoặc <strong> quản trị viên</strong> của dự án.
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1.5 }}>
            <TextField
              fullWidth size="small"
              placeholder="vd: PROJ1A2B"
              value={projectId}
              onChange={(e) => { setProjectId(e.target.value.toUpperCase()); setNotFound(false); setResult(null); }}
              onKeyDown={(e) => e.key === "Enter" && handleLookup()}
              slotProps={{
                input: {
                  startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: "#9ca3af", fontSize: 20 }} /></InputAdornment>,
                  inputProps: { maxLength: 8, style: { fontSize: 14 } },
                },
              }}
            />
            <Button
              variant="contained" onClick={handleLookup}
              disabled={projectId.trim().length < 4 || isLoading}
              sx={{ textTransform: "none", px: 3, flexShrink: 0, bgcolor: "#5663ee", "&:hover": { bgcolor: "#4451d4" } }}
            >
              {isLoading ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : "Tìm kiếm"}
            </Button>
          </Box>

          {notFound && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, p: 1.5, mt: 2, border: "1px solid #fecaca", borderRadius: "8px", bgcolor: "#fef2f2" }}>
              <ErrorOutlineIcon sx={{ color: "#ef4444", fontSize: 18 }} />
              <Typography fontSize={13} color="#dc2626">Không tìm thấy dự án với mã này.</Typography>
            </Box>
          )}
        </Box>

        {result && color && (
          <>
            <Divider />
            <Box sx={{ p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                <Avatar variant="rounded" sx={{ width: 40, height: 40, fontSize: 16, fontWeight: 700, bgcolor: color.bg, color: color.text, borderRadius: "8px", flexShrink: 0 }}>
                  {result.name.charAt(0).toUpperCase()}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography fontSize={14} fontWeight={600} color="#111827" noWrap>{result.name}</Typography>
                  <Typography fontSize={12} color="#9ca3af">{result.project_id}</Typography>
                </Box>
                <Chip
                  icon={result.access === "private" ? <LockOutlinedIcon sx={{ fontSize: "12px !important" }} /> : <PublicOutlinedIcon sx={{ fontSize: "12px !important" }} />}
                  label={result.access === "private" ? "Riêng tư" : "Công khai"}
                  size="small"
                  sx={{ fontSize: 11, height: 20, flexShrink: 0, bgcolor: result.access === "private" ? "#f3f4f6" : "#ecfdf5", color: result.access === "private" ? "#6b7280" : "#059669" }}
                />
              </Box>
              {result.description && <Typography fontSize={13} color="#6b7280" mb={2}>{result.description}</Typography>}

              {isMember && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, p: 1.5, bgcolor: "#f0fdf4", borderRadius: "8px", border: "1px solid #bbf7d0", mb: 2 }}>
                  <CheckCircleOutlineIcon sx={{ color: "#059669", fontSize: 18 }} />
                  <Typography fontSize={13} color="#059669" fontWeight={500}>Bạn đã là thành viên của dự án này.</Typography>
                </Box>
              )}
              {joined && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, p: 1.5, bgcolor: "#f0fdf4", borderRadius: "8px", border: "1px solid #bbf7d0", mb: 2 }}>
                  <CheckCircleOutlineIcon sx={{ color: "#059669", fontSize: 18 }} />
                  <Typography fontSize={13} color="#059669" fontWeight={500}>Đã tham gia dự án thành công!</Typography>
                </Box>
              )}
              {requested && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, p: 1.5, bgcolor: "#eff6ff", borderRadius: "8px", border: "1px solid #bfdbfe", mb: 2 }}>
                  <CheckCircleOutlineIcon sx={{ color: "#2563eb", fontSize: 18 }} />
                  <Typography fontSize={13} color="#2563eb" fontWeight={500}>Đã gửi yêu cầu. Vui lòng chờ admin xét duyệt.</Typography>
                </Box>
              )}
              {!isMember && !joined && !requested && (
                <Typography fontSize={13} color="#6b7280" mb={2}>
                  {result.access === "private" ? "🔒 Dự án riêng tư — yêu cầu sẽ được gửi đến admin để xét duyệt." : "🌐 Dự án công khai — bạn có thể tham gia ngay."}
                </Typography>
              )}

              <Box sx={{ display: "flex", gap: 1.5 }}>
                {isMember && (
                  <Button variant="contained" fullWidth onClick={() => navigate(ROUTES.projectBoard(result.project_id))}
                    sx={{ textTransform: "none", fontWeight: 600, bgcolor: "#5663ee", "&:hover": { bgcolor: "#4451d4" } }}>
                    Đến dự án
                  </Button>
                )}
                {joined && (
                  <>
                    <Button variant="contained" fullWidth onClick={() => navigate(ROUTES.projectBoard(result.project_id))}
                      sx={{ textTransform: "none", fontWeight: 600, bgcolor: "#059669", "&:hover": { bgcolor: "#047857" } }}>Đến dự án</Button>
                    <Button variant="outlined" onClick={reset} sx={{ textTransform: "none", borderColor: "#d1d5db", color: "#6b7280", flexShrink: 0 }}>Tìm dự án khác</Button>
                  </>
                )}
                {requested && (
                  <Button variant="outlined" fullWidth onClick={reset} sx={{ textTransform: "none", borderColor: "#d1d5db", color: "#6b7280" }}>Tìm dự án khác</Button>
                )}
                {!isMember && !joined && !requested && (
                  <>
                    <Button variant="contained" fullWidth onClick={handleJoin} disabled={isJoining}
                      sx={{ textTransform: "none", fontWeight: 600, bgcolor: "#5663ee", "&:hover": { bgcolor: "#4451d4" } }}>
                      {isJoining ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : result.access === "private" ? "Gửi yêu cầu tham gia" : "Tham gia ngay"}
                    </Button>
                    <Button variant="outlined" onClick={reset} sx={{ textTransform: "none", borderColor: "#d1d5db", color: "#6b7280", flexShrink: 0 }}>Hủy</Button>
                  </>
                )}
              </Box>
            </Box>
          </>
        )}

        <Divider />
        <Box sx={{ p: 3, bgcolor: "#f8fafc" }}>
          <Typography fontSize={13} fontWeight={600} color="#374151" mb={2.5}>
            Khi tham gia dự án, bạn có thể:
          </Typography>
          <Stack spacing={1.5}>
            {[
              { icon: <TaskAltOutlinedIcon sx={{ color: "#5663ee", fontSize: 22 }} />, title: "Quản lý nhiệm vụ", desc: "Tạo, chỉnh sửa và theo dõi tiến độ toàn bộ nhiệm vụ trong dự án." },
              { icon: <PeopleAltOutlinedIcon sx={{ color: "#059669", fontSize: 22 }} />, title: "Cộng tác nhóm", desc: "Giao nhiệm vụ cho thành viên và cập nhật tiến độ cùng nhau." },
              { icon: <ViewKanbanOutlinedIcon sx={{ color: "#7c3aed", fontSize: 22 }} />, title: "Kanban & Danh sách", desc: "Theo dõi công việc trực quan qua bảng Kanban hoặc danh sách." },
              { icon: <CommentOutlinedIcon sx={{ color: "#0284c7", fontSize: 22 }} />, title: "Bình luận & Tag", desc: "Thảo luận trực tiếp trên nhiệm vụ, tag đồng đội bằng @mention." },
              { icon: <NotificationsNoneOutlinedIcon sx={{ color: "#d97706", fontSize: 22 }} />, title: "Thông báo kịp thời", desc: "Nhận thông báo ngay khi có cập nhật hoặc thay đổi quan trọng." },
              { icon: <LockOpenOutlinedIcon sx={{ color: "#dc2626", fontSize: 22 }} />, title: "Phân quyền linh hoạt", desc: "Vai trò Admin và Member giúp kiểm soát quyền truy cập dễ dàng." },
            ].map((f) => (
              <Box key={f.title} sx={{ display: "flex", gap: 1.5, alignItems: "flex-start", p: 1.5, bgcolor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px" }}>
                <Box sx={{ flexShrink: 0, mt: 0.2 }}>{f.icon}</Box>
                <Box>
                  <Typography fontSize={13} fontWeight={500} color="#374151">{f.title}</Typography>
                  <Typography fontSize={12} color="#6b7280">{f.desc}</Typography>
                </Box>
              </Box>
            ))}
          </Stack>
        </Box>

      </Paper>
    </Box>
  );
}
