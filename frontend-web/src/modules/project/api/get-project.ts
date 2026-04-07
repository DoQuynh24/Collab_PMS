import { useQuery } from "@tanstack/react-query";
import type { IProject } from "../types"; 
import apiClient from "../../../lib/api";
import { URL_API_GET_PROJECT } from "../../../constant/config";

interface ProjectsResponse {
  data: IProject[];
  count?: number;
  error?: boolean;
  message?: string;
  timestamp?: string;
}

const getProjects = async () => {
  try {
    const res = await apiClient.get(URL_API_GET_PROJECT);
    const projectsArray = Array.isArray(res.data) 
      ? res.data 
      : (res.data?.data || []);
    return { data: projectsArray };   
  } catch (error: any) {
    throw error;
  }
};

export const useGetProjects = () => {
  return useQuery<ProjectsResponse, Error, IProject[]>({
    queryKey: ["projects"],
    queryFn: getProjects,
    select: (response) => response.data || [],  
    enabled: !!localStorage.getItem("access_token"),
  });
};