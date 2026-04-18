import { useContext, useState } from "react";
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableHead, TableRow, Stack, Avatar, Chip, Button,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import GroupAddOutlinedIcon from "@mui/icons-material/GroupAddOutlined";
import { useGetJoinRequests } from "../../../../project-invitation/api/get-join-requests";
import { useApproveJoinRequest, useRejectJoinRequest } from "../../../../project-invitation/api/handle-join-request";
import { ToastContext } from "../../../../../components/notification/NotifiProvider";

interface Props {
  projectId: string;
}

export function JoinRequestTab({ projectId }: Props) {
  const { data: joinRequests = [], isLoading } = useGetJoinRequests(projectId, true);
  const { mutate: approve } = useApproveJoinRequest(projectId);
  const { mutate: reject } = useRejectJoinRequest(projectId);
  const { showToast } = useContext(ToastContext)!;
  const [handledTokens, setHandledTokens] = useState<Set<string>>(new Set());

  const handleApprove = (token: string) => {
    approve(token, {
      onSuccess: () => { showToast("Đã chấp nhận yêu cầu", "success"); markHandled(token); },
      onError: () => showToast("Thao tác thất bại", "error"),
    });
  };

  const handleReject = (token: string) => {
    reject(token, {
      onSuccess: () => { showToast("Đã từ chối yêu cầu", "success"); markHandled(token); },
      onError: () => showToast("Thao tác thất bại", "error"),
    });
  };

  const markHandled = (token: string) =>
    setHandledTokens((prev) => new Set(prev).add(token));

  if (isLoading) return null;

  if (joinRequests.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 10, color: "#9ca3af", border: "1px dashed #e5e7eb", borderRadius: "8px" }}>
        <GroupAddOutlinedIcon sx={{ fontSize: 44, mb: 1, opacity: 0.35 }} />
        <Typography fontSize={14}>Không có yêu cầu tham gia nào</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography fontSize={14} color="#555" mb={3}>
        Danh sách người dùng đã gửi yêu cầu tham gia dự án. Chấp nhận để thêm họ vào dự án với vai trò thành viên.
      </Typography>

      <Paper elevation={0} sx={{ border: "1px solid #e5e7eb", borderRadius: "8px", overflow: "hidden" }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "#f8fafc" }}>
              <TableCell sx={{ fontWeight: 600, fontSize: 13 }}>Người yêu cầu</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: 13 }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: 13 }}>Thời gian gửi</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: 13, width: 280 }}>Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {joinRequests.map((req) => (
              <TableRow key={req.invitation_id} hover>
                <TableCell>
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Avatar src={req.invitedBy?.picture} sx={{ width: 34, height: 34, fontSize: 13 }}>
                      {req.invitedBy?.name?.charAt(0)}
                    </Avatar>
                    <Typography fontSize={14} fontWeight={500}>{req.invitedBy?.name}</Typography>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Typography fontSize={13} color="#6b7280">{req.invited_email}</Typography>
                </TableCell>
                <TableCell>
                  <Typography fontSize={13} color="#6b7280">
                    {new Date(req.created_at).toLocaleDateString("vi-VN", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </Typography>
                </TableCell>
                <TableCell>
                  {handledTokens.has(req.token) ? (
                    <Chip label="Đã xử lý" size="small" sx={{ fontSize: 12, height: 24, bgcolor: "#f3f4f6", color: "#6b7280" }} />
                  ) : (
                    <Stack direction="row" spacing={1}>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<CheckIcon fontSize="small" />}
                        onClick={() => handleApprove(req.token)}
                        sx={{ textTransform: "none", fontSize: 12, bgcolor: "#059669", "&:hover": { bgcolor: "#047857" }, px: 1.5 }}
                      >
                        Chấp nhận
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<CloseIcon fontSize="small" />}
                        onClick={() => handleReject(req.token)}
                          sx={{ textTransform: "none", fontSize: 12, color: "#bd534a", borderColor: "#fca5a5", "&:hover": { bgcolor: "#fef2f2", borderColor: "#bd534a" }, px: 1.5 }}
                        >
                        Từ chối
                      </Button>
                    </Stack>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}
