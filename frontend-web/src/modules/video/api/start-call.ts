import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../lib/api';
import { videoKeys } from './video-keys';
import type { StartCallResponse } from '../types';

export function useStartCall() {
  const qc = useQueryClient();
  return useMutation<StartCallResponse, Error, { project_id: string; meeting_id?: number }>({
    mutationFn: ({ project_id, meeting_id }) =>
      apiClient.post<StartCallResponse>('/video/start', { project_id, meeting_id }).then((r) => r.data),
    onSuccess: (_, { project_id }) => {
      qc.invalidateQueries({ queryKey: videoKeys.activeRoom(project_id) });
    },
  });
}
