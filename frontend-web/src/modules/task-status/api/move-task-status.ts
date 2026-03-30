import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../../lib/api";
import { URL_API_GET_PROJECT_TASK } from "../../../constant/config";

interface ReorderPayload {
  project_id: string;
  ordered_ids: number[];
}

const reorderStatuses = async (payload: ReorderPayload) => {
  const response = await apiClient.patch(`${URL_API_GET_PROJECT_TASK}/reorder`, payload);
  return response.data;
};

export const useMoveStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reorderStatuses,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ["project", variables.project_id, "task-status"] 
      });
    },
  });
};