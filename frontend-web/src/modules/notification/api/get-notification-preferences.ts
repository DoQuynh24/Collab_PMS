import { useQuery } from "@tanstack/react-query";
import apiClient from "../../../lib/api";
import { URL_API_NOTIFICATIONS } from "../../../constant/config";

export interface INotificationPreference {
  assigned_inapp: boolean;
  assigned_email: boolean;
  status_inapp: boolean;
  status_email: boolean;
  comment_inapp: boolean;
  mention_inapp: boolean;
  mention_email: boolean;
  project_inapp: boolean;
  project_email: boolean;
}

const getNotificationPreferences = async (projectId: string): Promise<INotificationPreference> => {
  const res = await apiClient.get(`${URL_API_NOTIFICATIONS}/preferences/${projectId}`);
  return res.data;
};

export const useGetNotificationPreferences = (projectId: string) => {
  return useQuery<INotificationPreference>({
    queryKey: ["notification-preferences", projectId],
    queryFn: () => getNotificationPreferences(projectId),
    enabled: !!projectId && !!localStorage.getItem("access_token"),
  });
};
