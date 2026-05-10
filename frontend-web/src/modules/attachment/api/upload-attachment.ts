import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../lib/api';
import { URL_API_ATTACHMENTS } from '../../../constant/config';
import type { IAttachment } from '../types';

export const uploadAttachment = async (taskId: number, file: File): Promise<IAttachment> => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await apiClient.post(`${URL_API_ATTACHMENTS}/tasks/${taskId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const useUploadAttachment = (taskId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => uploadAttachment(taskId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attachments', taskId] });
    },
  });
};
