import { useState } from "react";
import { 
  Box, 
  Avatar, 
  Typography, 
  IconButton, 
  Tooltip, 
  Button, 
  Stack 
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import RepeatIcon from '@mui/icons-material/Repeat';
import { useDeleteComment } from "../api/delete-comment";
import { useGetCurrentUser } from "../../login/api/auth";
import type { IComment, ICommentUser } from "../type/index";
import { ModalConfirm } from "../../../components/modal/modalConfirm";
import { useAddComment } from "../api/add-comment";
import MentionInput from "./MentionInput";
import CommentContent from "./CommentContent";

interface Props {
  comment: IComment;
  taskId: number;
  projectMembers?: ICommentUser[];
}

export default function CommentCard({ comment, taskId, projectMembers = [] }: Props) {
  const [openConfirm, setOpenConfirm] = useState(false);
  const [showReply, setShowReply] = useState(false);
  const [replyContent, setReplyContent] = useState("");

  const { data: currentUser } = useGetCurrentUser();
  const { mutate: deleteComment } = useDeleteComment();   
  const { mutate: addComment } = useAddComment();

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

  const handleReplySubmit = () => {
    if (!replyContent.trim()) return;

    addComment({
      taskId: taskId,
      content: replyContent.trim(),
      parent_id: comment.comment_id,      
    });

    setReplyContent("");
    setShowReply(false);
  };

  return (
    <>
      <Box
        sx={{ 
          display: "flex", 
          gap: 1.5, 
          mb: 2,
          pl: comment.parent_id ? 7 : 0,     
        }}
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

            {comment.parent && comment.parent.user && (
              <Typography fontSize={13} color="#6b7280">
                đã trả lời @{comment.parent.user.name}
              </Typography>
            )}

            <Typography fontSize={12} color="#9ca3af" sx={{ ml: "auto" }}>
              {formatDate(comment.created_at)}
            </Typography>

            <Tooltip title="Trả lời">
              <IconButton
                size="small"
                onClick={() => {
                  if (!showReply) {
                    setReplyContent(`@${comment.user?.name}\u200B `);
                  } else {
                    setReplyContent("");
                  }
                  setShowReply(!showReply);
                }}
                sx={{ color: "#2563eb" }}
              >
                <RepeatIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            {isOwner && (
              <Tooltip title="Xóa bình luận">
                <IconButton
                  size="small"
                  onClick={handleDeleteClick}
                  sx={{ color: "#e53935" }}
                >
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>

          <Box
            sx={{
              bgcolor: "#f9fafb",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              px: 1.5,
              py: 1,
            }}
          >
            <CommentContent content={comment.content} />
          </Box>

          {showReply && (
            <Box sx={{ mt: 2, }}>
              <Stack direction="row" spacing={1.5} alignItems="flex-start">
                <Avatar 
                  src={currentUser?.picture} 
                  sx={{ width: 32, height: 32 }}
                >
                  {currentUser?.name?.charAt(0) || "U"}
                </Avatar>

                <Box sx={{ flex: 1 }}>
                  <MentionInput
                    value={replyContent}
                    onChange={setReplyContent}
                    placeholder={`Trả lời ${comment.user?.name}... (gõ @ để tag)`}
                    members={projectMembers}
                    minRows={1}
                    size="small"
                  />
                  <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={handleReplySubmit}
                      disabled={!replyContent.trim()}
                      sx={{
                        bgcolor: "#2563eb",
                        "&:hover": { bgcolor: "#1d4ed8" },
                        textTransform: "none",
                        px: 4,
                      }}
                    >
                      Trả lời
                    </Button>
                    <Button
                      variant="text"
                      size="small"
                      onClick={() => {
                        setReplyContent("");
                        setShowReply(false);
                      }}
                      sx={{ color: "#6b7280", textTransform: "none", fontWeight: 500 }}
                    >
                      Hủy
                    </Button>
                  </Stack>
                </Box>
              </Stack>
            </Box>
          )}
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