import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../lib/api';
import { URL_API_ATTACHMENTS } from '../../../constant/config';
import type { IAttachment } from '../types';

const getAttachments = async (taskId: number): Promise<IAttachment[]> => {
  const res = await apiClient.get(`${URL_API_ATTACHMENTS}/tasks/${taskId}`);
  return res.data;
};

export const useGetAttachments = (taskId: number) => {
  return useQuery<IAttachment[]>({
    queryKey: ['attachments', taskId],
    queryFn: () => getAttachments(taskId),
    enabled: !!taskId,
  });
};
