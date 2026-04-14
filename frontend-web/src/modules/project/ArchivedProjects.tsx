import { useContext, useMemo, useState } from "react";
import {
  Box, Typography, Avatar, Chip, CircularProgress,
  Paper, Table, TableBody, TableCell, TableHead, TableRow,
  TextField, Tooltip, Stack, InputAdornment,
} from "@mui/material";
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import SearchIcon from "@mui/icons-material/Search";
import { useGetArchivedProjects } from "./api/get-archived-projects";
import { useRestoreProject } from "./api/restore-project";
import { useDeleteProject } from "./api/delete-project";
import { useGetCurrentUser } from "../login/api/auth";
import { ToastContext } from "../../components/notification/NotifiProvider";
import { PROJECT_ACCESS_OPTIONS } from "../../constant";
import type { IProject } from "./types";
import { getProjectColor } from "../../utils/projectColor";
import { ArchivedProjectActionMenu } from "./component/ArchivedProjectActionMenu";
import styles from "./ArchivedProjects.module.scss";

export default function ArchivedProjects() {
  const { data: projects = [], isLoading } = useGetArchivedProjects();
  const { data: currentUser } = useGetCurrentUser();
  const { mutate: restore } = useRestoreProject();
  const { mutate: deleteProject } = useDeleteProject();
  const { showToast } = useContext(ToastContext)!;

  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () => projects.filter((p) => p.name.toLowerCase().includes(search.toLowerCase())),
    [projects, search]
  );

  const handleRestore = (project: IProject) => {
    restore(project.project_id, {
      onSuccess: () => showToast(`Đã khôi phục "${project.name}"`, "success"),
      onError: () => showToast("Khôi phục thất bại", "error"),
    });
  };

  const handleDelete = (project: IProject) => {
    deleteProject(project.project_id, {
      onSuccess: () => showToast(`Đã xóa "${project.name}"`, "success"),
      onError: () => showToast("Xóa thất bại", "error"),
    });
  };

  return (
    <Box>
      <Box className={styles.header}>
        <ArchiveOutlinedIcon sx={{ color: "#6b7280", fontSize: 24 }} />
        <Typography fontSize={20} fontWeight={600} color="#111827">
          Kho lưu trữ
        </Typography>
      </Box>

      <Typography className={styles.subtitle}>
        Các dự án này hiện không còn hiển thị trong không gian làm việc chính. Bạn có thể khôi phục dự án để tiếp tục làm việc, chỉnh sửa và quản lý như bình thường, hoặc xóa vĩnh viễn toàn bộ dữ liệu liên quan.
      </Typography>

      <Box className={styles.search}>
        <TextField
          size="small"
          placeholder="Tìm kiếm dự án..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: 320 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "#9ca3af", fontSize: 20 }} />
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
          <CircularProgress size={32} />
        </Box>
      ) : filtered.length === 0 ? (
        <Box className={styles.emptyBox}>
          <ArchiveOutlinedIcon sx={{ fontSize: 44, mb: 1, opacity: 0.35 }} />
          <Typography fontSize={14}>
            {search ? "Không tìm thấy dự án phù hợp" : "Kho lưu trữ trống"}
          </Typography>
        </Box>
      ) : (
        <Paper elevation={0} className={styles.table}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#f8fafc" }}>
                <TableCell sx={{ fontWeight: 600, fontSize: 13, color: "#374151" }}>Tên dự án</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: 13, color: "#374151" }}>Quyền truy cập</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: 13, color: "#374151" }}>Ngày tạo</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: 13, color: "#374151" }}>Thành viên</TableCell>
                <TableCell sx={{ width: 48 }} />
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((project) => {
                const color = getProjectColor(project.project_id);
                const isOwner = project.owner_id === currentUser?.user_id;
                const isAdmin = project.project_members?.some(
                  (m) => m.user_id === currentUser?.user_id && m.role === "admin"
                );
                const canRestore = isOwner || !!isAdmin;
                const accessOption = PROJECT_ACCESS_OPTIONS.find((o) => o.value === project.access);

                return (
                  <TableRow key={project.project_id} hover>
                    <TableCell>
                      <Box className={styles.projectCell}>
                        <Avatar
                          variant="rounded"
                          className={styles.projectAvatar}
                          sx={{ bgcolor: color.bg, color: color.text }}
                        >
                          {project.name.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography className={styles.projectName}>{project.name}</Typography>
                          {project.description && (
                            <Typography className={styles.projectDesc}>{project.description}</Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={`${accessOption?.icon} ${accessOption?.label}`}
                        size="small"
                        className={styles.accessChip}
                        sx={{
                          bgcolor: project.access === "private" ? "#f3f4f6" : "#ecfdf5",
                          color: project.access === "private" ? "#6b7280" : "#059669",
                        }}
                      />
                    </TableCell>

                    <TableCell>
                      <Typography fontSize={13} color="#6b7280">
                        {new Date(project.created_at).toLocaleDateString("vi-VN", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Stack direction="row" className={styles.memberStack}>
                        {(project.project_members ?? []).slice(0, 5).map((m) => (
                          <Tooltip key={m.member_id} title={m.user?.name ?? ""}>
                            <Avatar src={m.user?.picture} className={styles.memberAvatar}>
                              {m.user?.name?.charAt(0).toUpperCase()}
                            </Avatar>
                          </Tooltip>
                        ))}
                        {(project.project_members?.length ?? 0) > 5 && (
                          <Avatar className={styles.memberOverflow}>
                            +{(project.project_members?.length ?? 0) - 5}
                          </Avatar>
                        )}
                      </Stack>
                    </TableCell>

                    <TableCell align="right">
                      <ArchivedProjectActionMenu
                        project={project}
                        canRestore={canRestore}
                        isOwner={isOwner}
                        onRestore={() => handleRestore(project)}
                        onDelete={() => handleDelete(project)}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Paper>
      )}
    </Box>
  );
}
