import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../../lib/api";
import { URL_API_GET_PROJECT } from "../../../constant/config";

const removeMember = async ({
  projectId,
  memberId,
}: {
  projectId: string;
  memberId: number;
}) => {
  const res = await apiClient.delete(
    `${URL_API_GET_PROJECT}/${projectId}/members/${memberId}`
  );
  return res.data;
};

export const useRemoveMember = (projectId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (memberId: number) => removeMember({ projectId, memberId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
    },
  });
};