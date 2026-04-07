import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../../lib/api";
import { URL_API_GET_PROJECT } from "../../../constant/config";

export const archiveProject = async (projectId: string) => {
  const response = await apiClient.patch(`${URL_API_GET_PROJECT}/${projectId}/archive`);
  return response.data;
};

export const useArchiveProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: archiveProject,
    onSuccess: (_, projectId) => {
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
};