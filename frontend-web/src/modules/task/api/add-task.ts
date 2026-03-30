import { useMutation, useQueryClient } from "@tanstack/react-query";
import { URL_API_GET_TASK } from "../../../constant/config";
import type { ITask, CreateTaskPayload } from "../types";
import type { MutationConfig } from "../../../lib/react-query";
import apiClient from "../../../lib/api";

export const createTask = async (data: CreateTaskPayload): Promise<ITask> => {
  const response = await apiClient.post(URL_API_GET_TASK, data);
  return response.data;
};

type UseCreateTaskOptions = {
  config?: MutationConfig<typeof createTask>;
};

export const useCreateTask = ({ config }: UseCreateTaskOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTask,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tasks"],
      });
    },
    ...config,
  });
};