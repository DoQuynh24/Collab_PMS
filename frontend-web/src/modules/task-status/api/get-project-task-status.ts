import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { ITaskStatus } from "../types";
import apiClient from "../../../lib/api";
import { URL_API_GET_PROJECT } from "../../../constant/config";

interface ProjectTaskStatusResponse {
  data: ITaskStatus[];
  error: boolean;
  message: string;
  timestamp: string;
}

const getProjectTaskStatuses = async (
  projectId: string
): Promise<ProjectTaskStatusResponse> => {
  const res = await apiClient.get(`${URL_API_GET_PROJECT}/${projectId}/project-task-statuses`);
  return res.data;
};

export const useGetProjectTaskStatuses = (
  projectId: string,
  config?: Omit<
    UseQueryOptions<
      ProjectTaskStatusResponse,
      Error,
      ProjectTaskStatusResponse,
      [string, string, string]
    >,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery<
    ProjectTaskStatusResponse,
    Error,
    ProjectTaskStatusResponse,
    [string, string, string]
  >({
    queryKey: ["project", projectId, "task-status"],
    queryFn: () => getProjectTaskStatuses(projectId),
    enabled: !!localStorage.getItem("access_token") && !!projectId,
    retry: false,
    ...config,
  });
};