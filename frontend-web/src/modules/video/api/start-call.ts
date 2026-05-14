import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../lib/api';
import { videoKeys } from './video-keys';
import type { StartCallResponse } from '../types';

export function useStartCall() {
  const qc = useQueryClient();
  return useMutation<StartCallResponse, Error, { project_id: string }>({
    mutationFn: ({ project_id }) =>
      apiClient.post<StartCallResponse>('/video/start', { project_id }).then((r) => r.data),
    onSuccess: (_, { project_id }) => {
      qc.invalidateQueries({ queryKey: videoKeys.activeRoom(project_id) });
    },
  });
}
