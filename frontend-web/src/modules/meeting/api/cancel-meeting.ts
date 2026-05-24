import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../lib/api';
import { URL_API_MEETINGS } from '../../../constant/config';
import { meetingKeys } from './get-meetings';

export function useCancelMeeting(projectId: string) {
  const qc = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: (meetingId) =>
      apiClient.delete(`${URL_API_MEETINGS}/${meetingId}`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: meetingKeys.byProject(projectId) });
    },
  });
}
