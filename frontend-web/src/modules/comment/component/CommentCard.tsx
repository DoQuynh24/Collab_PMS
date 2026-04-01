import { useState } from "react";
import { Box, Avatar, Typography, IconButton, Tooltip } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { useDeleteComment } from "../api/delete-comment";
import { useGetCurrentUser } from "../../login/api/auth";
import type { IComment } from "../type";
import { ModalConfirm } from "../../../components/modal/modalConfirm";

interface Props {
  comment: IComment;
  taskId: number;                   
}

export default function CommentCard({ comment, taskId }: Props) {
  const [hovered, setHovered] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);

  const { data: currentUser } = useGetCurrentUser();
  const { mutate: deleteComment } = useDeleteComment();   

  const isOwner = currentUser?.user_id === comment.user_id;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDeleteClick = () => {
    setOpenConfirm(true);
  };

  const handleConfirmDelete = () => {
    deleteComment(comment.comment_id);   
    setOpenConfirm(false);
  };

  return (
    <>
      <Box
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        sx={{ display: "flex", gap: 1.5, mb: 2 }}
      >
        <Avatar
          src={comment.user?.picture}
          sx={{ width: 32, height: 32, fontSize: 13, flexShrink: 0 }}
        >
          {comment.user?.name?.charAt(0).toUpperCase()}
        </Avatar>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
            <Typography fontSize={13} fontWeight={600} color="#111827">
              {comment.user?.name}
            </Typography>
            <Typography fontSize={12} color="#9ca3af">
              {formatDate(comment.created_at)}
            </Typography>

            {isOwner && hovered && (
              <Tooltip title="Xóa bình luận">
                <IconButton
                  size="small"
                  onClick={handleDeleteClick}
                  sx={{ ml: "auto", color: "#9ca3af", "&:hover": { color: "#e53935" } }}
                >
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>

          <Box
            sx={{
              fontSize: 14,
              color: "#374151",
              bgcolor: "#f9fafb",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              px: 1.5,
              py: 1,
              wordBreak: "break-word",
              whiteSpace: "pre-wrap",
            }}
          >
            {comment.content}
          </Box>
        </Box>
      </Box>

      <ModalConfirm
        open={openConfirm}
        setOpen={setOpenConfirm}
        title="Xóa bình luận"
        message={<>Bạn có chắc chắn muốn xóa bình luận này không? 
                <br/>
                Hành động này không thể hoàn tác.</>}
        titleButton="Xóa"
        cancelButtonText="Hủy"
        isDelete={true}
        onClick={handleConfirmDelete}
        confirmButtonProps={{
            sx: { backgroundColor: "#d32f2f", "&:hover": { backgroundColor: "#b71c1c" } },
        }}
      />
    </>
  );
}