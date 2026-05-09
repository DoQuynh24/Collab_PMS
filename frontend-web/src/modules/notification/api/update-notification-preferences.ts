import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../../lib/api";
import { URL_API_NOTIFICATIONS } from "../../../constant/config";
import type { INotificationPreference } from "./get-notification-preferences";

const updateNotificationPreferences = async (
  projectId: string,
  data: Partial<INotificationPreference>
): Promise<INotificationPreference> => {
  const res = await apiClient.put(`${URL_API_NOTIFICATIONS}/preferences/${projectId}`, data);
  return res.data;
};

export const useUpdateNotificationPreferences = (projectId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<INotificationPreference>) =>
      updateNotificationPreferences(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-preferences", projectId] });
    },
  });
};
