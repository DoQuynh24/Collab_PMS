import { useQuery } from "@tanstack/react-query";
import apiClient from "../../../lib/api";
import { URL_API_NOTIFICATIONS } from "../../../constant/config";

const getUnreadCount = async (): Promise<number> => {
  const res = await apiClient.get(`${URL_API_NOTIFICATIONS}/unread-count`);
  return res.data.count;
};

export const useGetUnreadCount = () => {
  return useQuery<number>({
    queryKey: ["notifications-unread"],
    queryFn: getUnreadCount,
    enabled: !!localStorage.getItem("access_token"),
    refetchInterval: 30_000,
    staleTime: 10_000,
  });
};
