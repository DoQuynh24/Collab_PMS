import apiClient from "../../../lib/api";
import { URL_API_GET_PROJECT } from "../../../constant/config";

export interface ProjectLookupResult {
  project_id: string;
  name: string;
  access: "private" | "public";
  status: "active" | "archived";
  description?: string;
}

export const lookupProject = async (projectId: string): Promise<ProjectLookupResult> => {
  const res = await apiClient.get(`${URL_API_GET_PROJECT}/lookup/${projectId}`);
  return res.data;
};
