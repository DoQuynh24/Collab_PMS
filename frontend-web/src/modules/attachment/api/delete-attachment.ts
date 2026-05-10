import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../lib/api';
import { URL_API_ATTACHMENTS } from '../../../constant/config';

const deleteAttachment = async (attachmentId: number): Promise<void> => {
  await apiClient.delete(`${URL_API_ATTACHMENTS}/${attachmentId}`);
};

export const useDeleteAttachment = (taskId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (attachmentId: number) => deleteAttachment(attachmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attachments', taskId] });
    },
  });
};
