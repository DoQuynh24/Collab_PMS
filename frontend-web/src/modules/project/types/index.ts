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
  project_members?: Array<{
    member_id: number;
    project_id: string;
    user_id: number;
    role: 'admin' | 'member';
    created_at: string;
    user?: {
      user_id: number;
      name: string;
      picture?: string;
      email: string;
    };
  }>;
}

export type CreateProjectPayload = Omit<
  IProject,
  "project_id" | "status" | "owner_id" | "created_at" | "updated_at"
>;