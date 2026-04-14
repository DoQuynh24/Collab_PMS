import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../../lib/api";
import { URL_API_GET_PROJECT } from "../../../constant/config";

const restoreProject = async (projectId: string) => {
  const res = await apiClient.patch(`${URL_API_GET_PROJECT}/${projectId}/restore`);
  return res.data;
};

export const useRestoreProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: restoreProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
};
