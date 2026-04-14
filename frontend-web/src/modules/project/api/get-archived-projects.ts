import { useQuery } from "@tanstack/react-query";
import type { IProject } from "../types";
import apiClient from "../../../lib/api";
import { URL_API_GET_PROJECT } from "../../../constant/config";

const getArchivedProjects = async (): Promise<IProject[]> => {
  const res = await apiClient.get(`${URL_API_GET_PROJECT}/archived`);
  return Array.isArray(res.data) ? res.data : (res.data?.data || []);
};

export const useGetArchivedProjects = () => {
  return useQuery<IProject[]>({
    queryKey: ["projects", "archived"],
    queryFn: getArchivedProjects,
    enabled: !!localStorage.getItem("access_token"),
  });
};
