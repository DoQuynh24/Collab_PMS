import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../../lib/api";
import { URL_API_AUTH_ME } from "../../../constant/config";

const updateProfile = async (data: { name: string }) => {
  const res = await apiClient.patch(URL_API_AUTH_ME, data);
  return res.data;
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['current-user'] });
    },
  });
};
