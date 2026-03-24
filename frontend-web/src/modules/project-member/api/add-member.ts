import { useMutation } from "@tanstack/react-query";
import apiClient from "../../../lib/api";
import { URL_API_GET_PROJECT } from "../../../constant/config";

interface AddMemberPayload {
  invited_email: string;
  role: 'admin' | 'member';
}

interface AddMemberResponse {
  data: any;
  error: boolean;
  message: string;
}

const inviteMember = async (projectId: string, payload: AddMemberPayload): Promise<AddMemberResponse> => {
  const res = await apiClient.post(`${URL_API_GET_PROJECT}/${projectId}/invitations`, payload);
  return res.data;
};

export const useInviteMember = (projectId: string) => {
  return useMutation({
    mutationFn: (payload: AddMemberPayload) => inviteMember(projectId, payload),
  });
};