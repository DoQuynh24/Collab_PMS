import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../../lib/api";
import { URL_API_GET_PROJECT_TASK } from "../../../constant/config";

interface AddStatusPayload {
  project_id: string;
  name: string;
}

const addStatus = async (payload: AddStatusPayload) => {
  const response = await apiClient.post(URL_API_GET_PROJECT_TASK, payload);
  return response.data;
};

export const useAddStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addStatus,
    onSuccess: (_, variables) => {
    queryClient.invalidateQueries({ 
        queryKey: ["project", variables.project_id, "task-status"] 
    });
    },
  });
};