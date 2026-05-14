import { useMutation } from '@tanstack/react-query';
import apiClient from '../../../lib/api';
import type { JoinCallResponse } from '../types';

export function useJoinCall() {
  return useMutation<JoinCallResponse, Error, { channel_name: string }>({
    mutationFn: ({ channel_name }) =>
      apiClient.post<JoinCallResponse>('/video/join', { channel_name }).then((r) => r.data),
  });
}
