import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import apiClient from "../../../lib/api";
import { URL_API_GET_PROJECT } from "../../../constant/config";
import type { ITask } from "../types";

type TaskResponse = ITask[];

const getTasksByProject = async (
  projectId: string
): Promise<TaskResponse> => {
  const res = await apiClient.get(
    `${URL_API_GET_PROJECT}/${projectId}/tasks`
  );

  return res.data;
};

export const useGetTasksByProject = (
  projectId: string,
  config?: Omit<
    UseQueryOptions<TaskResponse, Error, TaskResponse, [string, string]>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery({
    queryKey: ["tasks", projectId],
    queryFn: () => getTasksByProject(projectId),
    enabled: !!projectId,
    ...config,
  });
};