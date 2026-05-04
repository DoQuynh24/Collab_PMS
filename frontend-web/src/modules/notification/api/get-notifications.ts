import { useQuery } from "@tanstack/react-query";
import apiClient from "../../../lib/api";
import { URL_API_NOTIFICATIONS } from "../../../constant/config";
import type { INotification } from "../types";

const getNotifications = async (): Promise<INotification[]> => {
  const res = await apiClient.get(URL_API_NOTIFICATIONS);
  return res.data;
};

export const useGetNotifications = () => {
  return useQuery<INotification[]>({
    queryKey: ["notifications"],
    queryFn: getNotifications,
    enabled: !!localStorage.getItem("access_token"),
    refetchInterval: 30_000,
    staleTime: 10_000,
  });
};
