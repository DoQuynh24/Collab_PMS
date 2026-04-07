import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../../lib/api";
import { URL_API_GET_PROJECT } from "../../../constant/config";

interface UpdateProjectPayload {
  access?: 'public' | 'private';
  name?: string;
  description?: string;
  start_date?:string;
  end_date?: string;
}

const updateProject = async (projectId: string, payload: UpdateProjectPayload) => {
  const res = await apiClient.patch(`${URL_API_GET_PROJECT}/${projectId}`, payload);
  return res.data;
};

export const useUpdateProject = (projectId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateProjectPayload) => updateProject(projectId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
    },
  });
};