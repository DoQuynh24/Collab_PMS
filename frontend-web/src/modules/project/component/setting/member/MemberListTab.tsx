import { useContext, useState } from "react";
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell,
  TableHead, TableRow, Stack, Avatar, Chip, Select, MenuItem, TextField,
} from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { useRemoveMember } from "../../../../project-member/api/remove-member";
import { useUpdateMember } from "../../../../project-member/api/update-member";
import { AddMemberModal } from "../../../../project-member/component/AddMemberFormModal";
import { ROLES, type RoleKey } from "../../../../../constant";
import { ToastContext } from "../../../../../components/notification/NotifiProvider";
import { ModalConfirm } from "../../../../../components/modal/modalConfirm";

interface Props {
  projectId: string;
  projectName?: string;
  members: any[];
  ownerId?: number;
  canManage: boolean;
}

export function MemberListTab({ projectId, projectName, members, ownerId, canManage }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<RoleKey | "all">("all");
  const [openAddMember, setOpenAddMember] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);

  const { mutate: removeMember } = useRemoveMember(projectId);
  const { mutate: updateMember } = useUpdateMember(projectId);
  const { showToast } = useContext(ToastContext)!;

  const filtered = members.filter((m: any) => {
    const matchRole = filterRole === "all" || m.role === filterRole;
    const matchSearch = !searchTerm
      || m.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      || m.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchRole && matchSearch;
  });

  const handleDeleteSuccess = () => {
    if (!selectedMember) return;
    removeMember(selectedMember.member_id, {
      onSuccess: () => {
        showToast("Đã xóa thành viên ra khỏi dự án", "success");
        setOpenDeleteConfirm(false);
        setSelectedMember(null);
      },
      onError: () => showToast("Xóa thành viên thất bại", "error"),
    });
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography fontSize={14} color="#555">
          Thành viên được thêm vào dự án sẽ có quyền truy cập đầy đủ để quản lý nhiệm vụ, bình luận và cập nhật tiến độ.
        </Typography>
        {canManage && (
          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            onClick={() => setOpenAddMember(true)}
            sx={{ bgcolor: "#2563eb", "&:hover": { bgcolor: "#1d4ed8" }, textTransform: "none", flexShrink: 0, ml: 2 }}
          >
            Thêm thành viên
          </Button>
        )}
      </Box>

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
            <MenuItem key={r.key} value={r.key}>{r.label}</MenuItem>
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
              {canManage && <TableCell sx={{ fontWeight: 600, fontSize: 14, width: 120 }}>Hành động</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((member: any) => (
              <TableRow key={member.member_id} hover>
                <TableCell>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar src={member.user?.picture} sx={{ width: 36, height: 36 }}>
                      {member.user?.name?.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography fontWeight={500}>{member.user?.name}</Typography>
                      {member.user_id === ownerId && (
                        <Chip label="Chủ sở hữu" size="small" sx={{ height: 20, fontSize: 11, bgcolor: "#eff6ff", color: "#2563eb" }} />
                      )}
                    </Box>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Typography color="#6b7280">{member.user?.email || "—"}</Typography>
                </TableCell>
                <TableCell>
                  {canManage && member.user_id !== ownerId ? (
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
                        <MenuItem key={r.key} value={r.key}>{r.label}</MenuItem>
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
                {canManage && (
                  <TableCell>
                    {member.user_id !== ownerId && (
                      <Button
                        size="small"
                        color="error"
                        onClick={() => { setSelectedMember(member); setOpenDeleteConfirm(true); }}
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

      <AddMemberModal
        open={openAddMember}
        onClose={() => setOpenAddMember(false)}
        projectName={projectName}
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
