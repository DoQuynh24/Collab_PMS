import { useQuery } from "@tanstack/react-query";
import apiClient from "../../../lib/api";
import { URL_API_SEARCH_USER } from "../../../constant/config";

interface UserSearchResult {
  user_id: number;
  name: string;
  email: string;
  picture?: string;
}

const searchUsers = async (q: string): Promise<UserSearchResult[]> => {
  const res = await apiClient.get(`${URL_API_SEARCH_USER}/search?q=${q}`);
  return res.data;
};

export const useSearchUsers = (q: string) => {
  return useQuery({
    queryKey: ['users-search', q],
    queryFn: () => searchUsers(q),
    enabled: q.length >= 2,
  });
};