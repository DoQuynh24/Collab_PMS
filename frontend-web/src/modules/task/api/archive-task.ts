import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../../lib/api";
import { URL_API_GET_TASK } from "../../../constant/config";

export const archiveTask = async (taskId: number) => {
  const response = await apiClient.patch(`${URL_API_GET_TASK}/${taskId}/archive`);
  return response.data;
};

export const useArchiveTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: archiveTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
};