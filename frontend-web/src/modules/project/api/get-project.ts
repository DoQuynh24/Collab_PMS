import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { IProject } from "../types"; 
import apiClient from "../../../lib/api";
import { URL_API_GET_PROJECT } from "../../../constant/config";

interface ProjectsResponse {
  data: IProject[];
  count: number;
  error: boolean;
  message: string;
  timestamp: string;
}

interface GetProjectsParams {
  pageIndex?: number;
  pageSize?: number;
  search?: string;
  status?: 'active' | 'archived';
  access?: 'private' | 'public';
}

const getProjects = async (
  params: GetProjectsParams,
): Promise<ProjectsResponse> => {
  const res = await apiClient.get(URL_API_GET_PROJECT, {
    params,
  });

  return res.data;
};

export const useGetProjects = (
  params: GetProjectsParams = {}, 
  config?: Omit<
    UseQueryOptions<
      ProjectsResponse,
      Error,
      ProjectsResponse,
      [string, GetProjectsParams]
    >,
    "queryKey" | "queryFn"
  >,
) => {
  return useQuery<
    ProjectsResponse,
    Error,
    ProjectsResponse,
    [string, GetProjectsParams]
  >({
    queryKey: ["projects", params],
    queryFn: () => getProjects(params),
    enabled: !!localStorage.getItem("access_token"), 
    retry: false,
    ...config,
  });
};