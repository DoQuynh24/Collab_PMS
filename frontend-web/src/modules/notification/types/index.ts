import type { NotificationType } from '../../../constant';

export interface INotification {
  id: number;
  user_id: number;
  type: NotificationType;
  title: string;
  body: string;
  project_id?: string;
  is_read: boolean;
  created_at: string;
}
