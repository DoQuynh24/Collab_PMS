export interface ICommentUser {
  user_id: number;
  name: string;
  picture?: string;
  email?: string;
}

export interface IComment {
  comment_id: number;
  task_id: number;
  user_id: number;
  content: string;
  file_url?: string;
  created_at: string;
  parent_id?: number | null;
  user?: ICommentUser;
  parent?: {
    comment_id: number;
    user?: ICommentUser;
  } | null;
}
