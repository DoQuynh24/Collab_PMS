import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../../lib/api";
import { URL_API_NOTIFICATIONS } from "../../../constant/config";

const markOneRead = async (id: number): Promise<void> => {
  await apiClient.patch(`${URL_API_NOTIFICATIONS}/${id}/read`);
};

export const useMarkOneRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markOneRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-unread"] });
    },
  });
};
