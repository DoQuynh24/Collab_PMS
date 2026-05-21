import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../lib/api';
import type { MeetingSchedule } from '../types/index';

export const meetingKeys = {
  byProject: (projectId: string) => ['meetings', projectId] as const,
};

export function useGetMeetings(projectId: string) {
  return useQuery<MeetingSchedule[]>({
    queryKey: meetingKeys.byProject(projectId),
    queryFn: async () => {
      const { data } = await apiClient.get<MeetingSchedule[]>(`/meetings/project/${projectId}`);
      return data;
    },
    enabled: !!projectId,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}
