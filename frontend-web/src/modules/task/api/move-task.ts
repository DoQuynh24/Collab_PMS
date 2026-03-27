import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../../lib/api";
import type { MutationConfig } from "../../../lib/react-query";
import type { MoveTaskPayload } from "../types";
import { URL_API_GET_TASK } from "../../../constant/config";

export const moveTask = async (data: MoveTaskPayload) => {
  const { task_id, ...payload } = data;

  const response = await apiClient.patch(
    `${URL_API_GET_TASK}/${task_id}/move`,
    payload
  );

  return response.data;
};

type UseMoveTaskOptions = {
  config?: MutationConfig<typeof moveTask>;
};

export const useMoveTask = ({ config }: UseMoveTaskOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: moveTask,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tasks"],
      });
    },

    ...config,
  });
};