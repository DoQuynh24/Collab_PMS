import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../../lib/api";
import { URL_API_GET_PROJECT } from "../../../constant/config";

const joinProject = async (projectId: string) => {
  const res = await apiClient.post(`${URL_API_GET_PROJECT}/${projectId}/join`);
  return res.data;
};

export const useJoinProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: joinProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
};
