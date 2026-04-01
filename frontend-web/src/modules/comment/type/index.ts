export interface IComment {
  comment_id: number;
  task_id: number;
  user_id: number;
  content: string;
  file_url?: string;
  created_at: string;
  user?: {
    user_id: number;
    name: string;
    picture?: string;
    email: string;
  };
}