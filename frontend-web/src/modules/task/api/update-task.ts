import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ITask } from "../types";
import type { MutationConfig } from "../../../lib/react-query";
import apiClient from "../../../lib/api";
import { URL_API_GET_TASK } from "../../../constant/config";

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  deadline?: string;
  assignee_id?: number | null;
  priority_id?: number;
  status_id?: number;
}

export const updateTask = async (variables: {
  taskId: number;
  payload: UpdateTaskPayload;
}): Promise<ITask> => {
  const { taskId, payload } = variables;
  const response = await apiClient.patch(`${URL_API_GET_TASK}/${taskId}`, payload);
  return response.data;
};

type UseUpdateTaskOptions = {
  config?: MutationConfig<typeof updateTask>;
};

export const useUpdateTask = ({ config }: UseUpdateTaskOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTask,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tasks"],
      });
    },
    ...config,
  });
};