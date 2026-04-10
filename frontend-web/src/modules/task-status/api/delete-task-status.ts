import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../../lib/api";
import { URL_API_GET_PROJECT_TASK } from "../../../constant/config";

const deleteStatus = async (statusId: number) => {
  const response = await apiClient.delete(`${URL_API_GET_PROJECT_TASK}/${statusId}`);
  return response.data;
};

export const useDeleteStatus = (projectId: string) => {  
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["project", projectId, "task-status"],  
      });
    },
  });
};