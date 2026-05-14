import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../lib/api';
import { videoKeys } from './video-keys';
import type { VideoRoom } from '../types';

export function useActiveRoom(projectId: string) {
  return useQuery<VideoRoom | null>({
    queryKey: videoKeys.activeRoom(projectId),
    queryFn: async () => {
      const { data } = await apiClient.get<VideoRoom>(`/video/active/${projectId}`);
      return data ?? null;
    },
    enabled: !!projectId,
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchInterval: 3000,
  });
}
