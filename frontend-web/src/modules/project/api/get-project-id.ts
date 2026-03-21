import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { IProject } from "../types"; 
import apiClient from "../../../lib/api";
import { URL_API_GET_PROJECT } from "../../../constant/config";

interface ProjectDetailResponse {
  data: IProject;
  error: boolean;
  message: string;
  timestamp: string;
}

const getProjectById = async (projectId: string): Promise<ProjectDetailResponse> => {
  const res = await apiClient.get(`${URL_API_GET_PROJECT}/${projectId}`);
  return res.data;
};

export const useGetProjectById = (
  projectId: string,
  config?: Omit<
    UseQueryOptions<ProjectDetailResponse, Error, ProjectDetailResponse, [string, string]>,
    "queryKey" | "queryFn"
  >,
) => {
  return useQuery<ProjectDetailResponse, Error, ProjectDetailResponse, [string, string]>({
    queryKey: ["project", projectId],
    queryFn: () => getProjectById(projectId),
    enabled: !!localStorage.getItem("access_token") && !!projectId,
    retry: false,
    ...config,
  });
};