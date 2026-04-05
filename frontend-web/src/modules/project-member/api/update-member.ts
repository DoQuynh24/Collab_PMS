import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../../lib/api";
import { URL_API_GET_PROJECT } from "../../../constant/config";

interface UpdateMemberPayload {
  role: "admin" | "member";
}

const updateMember = async ({
  projectId,
  memberId,
  payload,
}: {
  projectId: string;
  memberId: number;
  payload: UpdateMemberPayload;
}) => {
  const res = await apiClient.patch(
    `${URL_API_GET_PROJECT}/${projectId}/members/${memberId}`,
    payload
  );
  return res.data;
};

export const useUpdateMember = (projectId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ memberId, payload }: { memberId: number; payload: UpdateMemberPayload }) =>
      updateMember({ projectId, memberId, payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
    },
  });
};