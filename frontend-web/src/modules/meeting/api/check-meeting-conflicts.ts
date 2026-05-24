import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../lib/api';
import { URL_API_MEETINGS } from '../../../constant/config';
import type {
  CheckMeetingConflictsPayload,
  ParticipantMeetingConflict,
} from '../types';

export const meetingConflictKeys = {
  all: ['meeting-conflicts'] as const,
  check: (payload: CheckMeetingConflictsPayload) => [
    ...meetingConflictKeys.all,
    payload.project_id,
    payload.start_time,
    [...payload.participant_ids].sort((a, b) => a - b).join(','),
  ] as const,
};

async function checkMeetingConflicts(payload: CheckMeetingConflictsPayload) {
  const { data } = await apiClient.post<ParticipantMeetingConflict[]>(
    `${URL_API_MEETINGS}/conflicts/check`,
    payload,
  );
  return data;
}

export function useCheckMeetingConflicts(
  payload: CheckMeetingConflictsPayload | null,
  enabled = true,
) {
  return useQuery<ParticipantMeetingConflict[]>({
    queryKey: payload ? meetingConflictKeys.check(payload) : meetingConflictKeys.all,
    queryFn: () => checkMeetingConflicts(payload!),
    enabled: Boolean(payload && payload.participant_ids.length > 0 && enabled),
    staleTime: 15_000,
  });
}
