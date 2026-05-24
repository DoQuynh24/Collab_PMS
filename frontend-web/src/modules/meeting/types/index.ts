export interface MeetingParticipant {
  id: number;
  meeting_id: number;
  user_id: number;
  user?: {
    user_id: number;
    name: string;
    picture?: string;
    email: string;
  };
}

export interface MeetingSchedule {
  id: number;
  project_id: string;
  title: string;
  description: string | null;
  start_time: string;
  created_by: number;
  status: 'scheduled' | 'cancelled' | 'completed';
  reminder_sent: boolean;
  created_at: string;
  creator?: { user_id: number; name: string; picture?: string };
  participants: MeetingParticipant[];
}

export type Meeting = MeetingSchedule;

export interface CreateMeetingPayload {
  project_id: string;
  title: string;
  description?: string;
  start_time: string;
  participant_ids: number[];
}

export type CreateMeetingData = CreateMeetingPayload;

export interface CheckMeetingConflictsPayload {
  project_id: string;
  start_time: string;
  participant_ids: number[];
}

export interface ParticipantMeetingConflict {
  user_id: number;
  has_conflict: boolean;
}
