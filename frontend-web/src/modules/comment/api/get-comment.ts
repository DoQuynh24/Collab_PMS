import { useQuery } from "@tanstack/react-query";
import apiClient from "../../../lib/api";
import { URL_API_GET_COMMENT } from "../../../constant/config";
import type { IComment } from "../type";

const getComments = async (taskId: number): Promise<IComment[]> => {
  const res = await apiClient.get(`${URL_API_GET_COMMENT}/tasks/${taskId}`);
  return res.data;
};

export const useGetComments = (taskId: number) => {
  return useQuery({
    queryKey: ["comments", taskId],
    queryFn: () => getComments(taskId),
    enabled: !!taskId,
    select: (data: any[]) => 
      data.map((comment) => ({
        ...comment,
        parent: comment.parent ? {
          ...comment.parent,
          user: comment.parent.user || null,
        } : null,
      })),
  });
};