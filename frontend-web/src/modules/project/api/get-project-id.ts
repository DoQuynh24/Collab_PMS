import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { IProject } from "../types"; 
import apiClient from "../../../lib/api";
import { URL_API_GET_PROJECT } from "../../../constant/config";

const getProjectById = async (projectId: string): Promise<IProject> => {
  const res = await apiClient.get(`${URL_API_GET_PROJECT}/${projectId}`, {
    params: {
      relations: 'owner,project_members,project_members.user' 
    }
  });
  return res.data;
};

export const useGetProjectById = (
  projectId: string,
  config?: Omit<
    UseQueryOptions<IProject, Error, IProject, [string, string]>,
    "queryKey" | "queryFn"
  >,
) => {
  return useQuery<IProject, Error, IProject, [string, string]>({
    queryKey: ["project", projectId],
    queryFn: () => getProjectById(projectId),
    enabled: !!localStorage.getItem("access_token") && !!projectId,
    retry: false,
    ...config,
  });
};