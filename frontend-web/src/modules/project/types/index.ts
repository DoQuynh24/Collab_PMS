export interface IProject {
  project_id: string;
  name: string;
  description?: string | null;
  start_date: string;
  end_date?: string | null;
  access: 'private' | 'public';
  status: 'active' | 'archived';
  owner_id: number;
  created_at: string;
  updated_at?: string;
}

export type CreateProjectPayload = Omit<
  IProject,
  "project_id" | "status" | "owner_id" | "created_at" | "updated_at"
>;