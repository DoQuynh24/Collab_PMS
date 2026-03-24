import { useMutation } from "@tanstack/react-query";
import apiClient from "../../../lib/api";
import { URL_API_GET_INVITATION } from "../../../constant/config";

interface AcceptInvitationResponse {
  message: string;
  project_id: string;
}

const acceptInvitation = async (token: string): Promise<AcceptInvitationResponse> => {
  const res = await apiClient.patch(`${URL_API_GET_INVITATION}/accept/${token}`);
  return res.data;
};

export const useAcceptInvitation = () => {
  return useMutation({
    mutationFn: (token: string) => acceptInvitation(token),
  });
};