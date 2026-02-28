export interface IUser {
  user_id: number;
  name: string;
  email: string;
  picture?: string;
  google_id?: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  user: IUser;
  message?: string;
  error?: boolean;
}