import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../lib/api';
import { videoKeys } from './video-keys';

export function useEndCall() {
  const qc = useQueryClient();
  return useMutation<void, Error, { roomId: number; projectId: string }>({
    mutationFn: ({ roomId }) =>
      apiClient.post(`/video/${roomId}/end`).then((r) => r.data),
    onSuccess: (_, { projectId }) => {
      qc.invalidateQueries({ queryKey: videoKeys.activeRoom(projectId) });
    },
  });
}
