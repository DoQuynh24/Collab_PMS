import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../../lib/api";
import { URL_API_GET_PROJECT } from "../../../constant/config";

export const deleteProject = async (projectId: string) => {
  const response = await apiClient.delete(`${URL_API_GET_PROJECT}/${projectId}`);
  return response.data;
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
};