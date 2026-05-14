import { useMutation } from '@tanstack/react-query';
import apiClient from '../../../lib/api';

export function useLeaveCall() {
  return useMutation<void, Error, { roomId: number }>({
    mutationFn: ({ roomId }) =>
      apiClient.post(`/video/${roomId}/leave`).then((r) => r.data),
  });
}
