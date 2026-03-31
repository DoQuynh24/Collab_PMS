import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../../lib/api";
import { URL_API_GET_TASK } from "../../../constant/config";

export const deleteTask = async (taskId: number) => {
  const response = await apiClient.delete(`${URL_API_GET_TASK}/${taskId}`);
  return response.data;
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
};