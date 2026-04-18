import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../../lib/api";
import { URL_API_GET_PROJECT } from "../../../constant/config";

const approveJoinRequest = async ({ projectId, token }: { projectId: string; token: string }) => {
  const res = await apiClient.patch(`${URL_API_GET_PROJECT}/${projectId}/invitations/join-requests/${token}/approve`);
  return res.data;
};

const rejectJoinRequest = async ({ projectId, token }: { projectId: string; token: string }) => {
  const res = await apiClient.patch(`${URL_API_GET_PROJECT}/${projectId}/invitations/join-requests/${token}/reject`);
  return res.data;
};

export const useApproveJoinRequest = (projectId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (token: string) => approveJoinRequest({ projectId, token }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["join-requests", projectId] });
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
    },
  });
};

export const useRejectJoinRequest = (projectId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (token: string) => rejectJoinRequest({ projectId, token }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["join-requests", projectId] });
    },
  });
};
