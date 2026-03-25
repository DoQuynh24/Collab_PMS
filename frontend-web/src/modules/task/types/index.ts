export interface ITask {
  task_id: number;
  project_id: string;
  title: string;
  description?: string;
  deadline?: string;
  assignee_id?: number;
  created_by: number;
  creator?: {
    user_id: number;
    name: string;
    email: string;
    picture?: string;
  };
  priority_id: number;
  status_id: number;
  order_index: number;
  created_at:string;
}

export interface CreateTaskPayload {
  project_id: string;
  title: string;
  description?: string;
  deadline?: string;
  assignee_id?: number;
  priority_id: number;
  status_id: number;
}

export interface MoveTaskPayload {
  task_id: number;
  status_id: number;
  order_index: number;
}