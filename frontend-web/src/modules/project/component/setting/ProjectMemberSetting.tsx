import { useContext, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Stack,
  Avatar,
  Chip,
  Select,
  MenuItem,
  Tooltip,
  IconButton,
  TextField,
} from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useGetProjectById } from "../../api/get-project-id";
import { useGetCurrentUser } from "../../../login/api/auth";
import { useRemoveMember } from "../../../project-member/api/remove-member";
import { useUpdateMember } from "../../../project-member/api/update-member";
import { AddMemberModal } from "../../../project-member/component/AddMemberFormModal";
import { useNavigate, useParams } from "react-router-dom";
import { ROLES, type RoleKey } from "../../../../constant";
import { ToastContext } from "../../../../components/notification/NotifiProvider";
import { ModalConfirm } from "../../../../components/modal/modalConfirm";
import LoadingPage from "../../../../components/loading/LoadingPage";

export function ProjectMemberSettings() {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [openAddMember, setOpenAddMember] = useState(false);
  const [filterRole, setFilterRole] = useState<RoleKey | "all">("all"); 

  const { data: project, isLoading } = useGetProjectById(projectId!);
  const { data: currentUser } = useGetCurrentUser();
  const { mutate: removeMember } = useRemoveMember(projectId!);
  const { mutate: updateMember } = useUpdateMember(projectId!);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  
  const isOwner = project?.owner_id === currentUser?.user_id;
  const members = project?.project_members || [];
  const isAdmin = members.some(
    (m: any) => m.user_id === currentUser?.user_id && m.role === "admin"
  );
  const canAddMember = isOwner || isAdmin

  const { showToast } = useContext(ToastContext)!;

  const handleBack = () => {
    navigate(`/projects/${projectId}`);
  };

  const handleDeleteClick = (member: any) => {
    setSelectedMember(member);
    setOpenDeleteConfirm(true);
  };

  const handleDeleteSuccess = () => {
    if (selectedMember) {
      removeMember(selectedMember.member_id, {
        onSuccess: () => {
          showToast("Đã xóa thành viên ra khỏi dự án", "success");
          setOpenDeleteConfirm(false);
          setSelectedMember(null);
        },
        onError: () => {
          showToast("Xóa thành viên thất bại", "error");
        },
      });
    }
  };

  const filteredMembers = members.filter((member: any) => {
    const matchesRole = filterRole === "all" || member.role === filterRole;
    
    const matchesSearch = 
      !searchTerm || 
      member.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesRole && matchesSearch;
  });

  if (isLoading) return <LoadingPage />;

  return (
    <Box >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Tooltip title="Quay lại">
            <IconButton onClick={handleBack}>
              <ArrowBackIcon />
            </IconButton>
          </Tooltip>
          <Typography variant="h5" fontWeight={600}>Quyền truy cập</Typography>
        </Box>
      </Box>

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Typography color="#555" width="80%">
          Bất kỳ ai có quyền truy cập vào Collab "{project?.name}" đều có thể tìm kiếm, xem, tạo và chỉnh sửa các công việc của dự án này. 
          Thành viên được thêm vào dự án sẽ có quyền truy cập đầy đủ để quản lý nhiệm vụ, bình luận và cập nhật tiến độ.
        </Typography>
        {canAddMember && (
          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            onClick={() => setOpenAddMember(true)}
            sx={{ bgcolor: "#2563eb", "&:hover": { bgcolor: "#1d4ed8" }, textTransform: "none" }}
          >
            Thêm thành viên
          </Button>
          )}
      </Box>

      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          <TextField 
            size="small" 
            placeholder="Tìm kiếm thành viên..." 
            sx={{ width: 320 }} 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Select
            size="small"
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value as RoleKey | "all")}
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="all">Tất cả vai trò</MenuItem>
            {ROLES.map((r) => (
              <MenuItem key={r.key} value={r.key}>
                {r.label}
              </MenuItem>
            ))}
          </Select>
        </Box>

        <Paper elevation={0} sx={{ border: "1px solid #e5e7eb", borderRadius: "8px", overflow: "hidden" }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#f8fafc" }}>
                <TableCell sx={{ fontWeight: 600, fontSize: 14 }}>Tên thành viên</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: 14 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: 14 }}>Vai trò</TableCell>
                {canAddMember && <TableCell sx={{ fontWeight: 600, fontSize: 14, width: 120 }}>Hành động</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredMembers.map((member: any) => (
                  <TableRow key={member.member_id} hover>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar 
                          src={member.user?.picture} 
                          sx={{ width: 36, height: 36 }}
                        >
                          {member.user?.name?.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography fontWeight={500}>
                            {member.user?.name}
                          </Typography>
                          {member.user_id === project?.owner_id && (
                            <Chip label="Chủ sở hữu" size="small" sx={{ height: 20, fontSize: 11, bgcolor: "#eff6ff", color: "#2563eb" }} />
                          )}
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography color="#6b7280">{member.user?.email || "—"}</Typography>
                    </TableCell>
                    <TableCell>
                      {canAddMember && member.user_id !== project?.owner_id ? (
                        <Select
                          size="small"
                          value={member.role}
                          onChange={(e) => updateMember({
                            memberId: member.member_id,
                            payload: { role: e.target.value as "admin" | "member" },
                          })}
                          sx={{ minWidth: 130 }}
                        >
                          {ROLES.map((r) => (
                            <MenuItem key={r.key} value={r.key}>
                              {r.label}
                            </MenuItem>
                          ))}
                        </Select>
                      ) : (
                        <Chip
                          label={member.role === "admin" ? "Quản trị viên" : "Thành viên"}
                          size="small"
                          sx={{ bgcolor: "#f3f4f6", fontSize: 13 }}
                        />
                      )}
                    </TableCell>
                    {canAddMember && (
                      <TableCell>
                        {member.user_id !== project?.owner_id && (
                          <Button
                            size="small"
                            color="error"
                            onClick={() => handleDeleteClick(member)}
                            sx={{ textTransform: "none", fontSize: 13 }}
                          >
                            Xóa
                          </Button>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </Paper>
      </Box>
      <AddMemberModal
        open={openAddMember}
        onClose={() => setOpenAddMember(false)}
        projectName={project?.name}
        projectId={projectId}
      />

      <ModalConfirm
        open={openDeleteConfirm}
        setOpen={setOpenDeleteConfirm}
        title="Xóa thành viên"
        message={
          <>Bạn sắp xóa <strong>{selectedMember?.user?.name || "thành viên này"}</strong> ra khỏi dự án. 
          Người này sẽ không thể tiếp tục làm việc tại dự án này nữa.<br />
          Hành động này không thể hoàn tác.</>
        }
        titleButton="Xóa"
        cancelButtonText="Hủy"
        onClick={handleDeleteSuccess}
        confirmButtonProps={{
          sx: { backgroundColor: "#d32f2f", "&:hover": { backgroundColor: "#b71c1c" } },
        }}
        isDelete={true}
      />
    </Box>
  );
}

export default ProjectMemberSettings;