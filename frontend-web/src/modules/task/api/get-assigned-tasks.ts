import { useQuery } from "@tanstack/react-query";
import apiClient from "../../../lib/api";
import { URL_API_GET_TASK } from "../../../constant/config";
import type { ITask } from "../types";

const getAssignedTasks = async (): Promise<ITask[]> => {
  const res = await apiClient.get(`${URL_API_GET_TASK}/assigned-to-me`);
  return res.data;
};

export const useGetAssignedTasks = () => {
  return useQuery<ITask[]>({
    queryKey: ["tasks", "assigned-to-me"],
    queryFn: getAssignedTasks,
    enabled: !!localStorage.getItem("access_token"),
  });
};
