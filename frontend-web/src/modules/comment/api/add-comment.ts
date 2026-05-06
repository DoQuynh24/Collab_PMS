import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../../lib/api";
import { URL_API_GET_COMMENT } from "../../../constant/config";

interface AddCommentPayload {
  taskId: number;
  content: string;
  parent_id?: number | null;
  mentioned_user_ids?: number[];
}

const addComment = async ({ taskId, content, parent_id, mentioned_user_ids }: AddCommentPayload) => {
  const res = await apiClient.post(`${URL_API_GET_COMMENT}/tasks/${taskId}`, {
    content,
    parent_id: parent_id || null,
    mentioned_user_ids: mentioned_user_ids ?? [],
  });
  return res.data;
};

export const useAddComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addComment,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ["comments", variables.taskId] 
      });
    },
  });
};