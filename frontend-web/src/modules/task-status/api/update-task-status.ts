import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../../lib/api";
import { URL_API_GET_PROJECT_TASK } from "../../../constant/config";

const updateStatus = async ({ statusId, payload }: {
  statusId: number;
  payload: { name: string };
}) => {
  const response = await apiClient.patch(`${URL_API_GET_PROJECT_TASK}/${statusId}`, payload);
  return response.data;
};

export const useUpdateStatus = (projectId: string) => { 
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["project", projectId, "task-status"],   
      });
    },
  });
};