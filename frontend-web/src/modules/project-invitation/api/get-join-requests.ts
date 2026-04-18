import { useQuery } from "@tanstack/react-query";
import apiClient from "../../../lib/api";
import { URL_API_GET_PROJECT } from "../../../constant/config";

export interface IJoinRequest {
  invitation_id: number;
  token: string;
  invited_email: string;
  created_at: string;
  invitedBy: {
    user_id: number;
    name: string;
    email: string;
    picture?: string;
  };
}

const getJoinRequests = async (projectId: string): Promise<IJoinRequest[]> => {
  const res = await apiClient.get(`${URL_API_GET_PROJECT}/${projectId}/invitations/join-requests`);
  return res.data;
};

export const useGetJoinRequests = (projectId: string, enabled: boolean) => {
  return useQuery<IJoinRequest[]>({
    queryKey: ["join-requests", projectId],
    queryFn: () => getJoinRequests(projectId),
    enabled: enabled && !!projectId,
  });
};
