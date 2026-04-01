import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../../lib/api";
import { URL_API_GET_COMMENT } from "../../../constant/config";

const deleteComment = async (commentId: number) => {
  const res = await apiClient.delete(`${URL_API_GET_COMMENT}/${commentId}`);
  return res.data;
};

export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments"] });
    },
  });
};