import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../lib/api';
import { meetingKeys } from './get-meetings';
import type { CreateMeetingData, Meeting } from '../types/index';

export function useCreateMeeting() {
  const qc = useQueryClient();
  return useMutation<Meeting, Error, CreateMeetingData>({
    mutationFn: (payload) =>
      apiClient.post<Meeting>('/meetings', payload).then((r) => r.data),
    onSuccess: (_, { project_id }) => {
      qc.invalidateQueries({ queryKey: meetingKeys.byProject(project_id) });
    },
  });
}
