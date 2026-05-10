export interface IAttachment {
  id: number;
  task_id: number;
  uploaded_by: number;
  file_name: string;
  file_url: string;
  public_id?: string;
  file_type: 'image' | 'document' | 'other';
  mime_type: string;
  file_size: number;
  created_at: string;
  uploader?: {
    user_id: number;
    name: string;
    picture?: string;
  };
}
