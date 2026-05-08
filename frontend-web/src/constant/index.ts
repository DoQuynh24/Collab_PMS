export const PRIORITIES = [
  { id: 1, name: "LOW", color: "#3B82F6" },
  { id: 2, name: "MEDIUM", color: "#ff9800" },
  { id: 3, name: "HIGH", color: "#f44336" },
];

export const FILTER_TABS = [
  { key: "assignee", label: "Người thực hiện", placeholder: "Tìm người thực hiện..." },
  { key: "priority", label: "Độ ưu tiên", placeholder: "Tìm độ ưu tiên..." },
  { key: "status",   label: "Trạng thái", placeholder: "Tìm trạng thái..." },
];

export const VISIBILITY_OPTIONS = [
  { value: 'anyone', label: 'Bất kỳ ai' },
  { value: 'members', label: 'Thành viên dự án' },
  { value: 'only_me', label: 'Chỉ mình tôi' },
];

export type RoleKey = 'admin' | 'member';

export const ROLES: { key: RoleKey; label: string }[] = [
  { key: 'admin', label: 'Quản trị viên' },
  { key: 'member', label: 'Thành viên' },
];

export const getMemberRoleLabel = (userId: number, ownerId?: number, role?: RoleKey): string => {
  if (userId === ownerId) return 'Chủ sở hữu';
  return ROLES.find(r => r.key === role)?.label ?? 'Thành viên';
};

export const WEEKDAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

export type GroupBy = 'none' | 'assignee' | 'priority';

export const GROUP_OPTIONS: { value: GroupBy; label: string }[] = [
  { value: 'none', label: 'Không nhóm' },
  { value: 'assignee', label: 'Người thực hiện' },
  { value: 'priority', label: 'Độ ưu tiên' },
];

export const MONTHS = [
  'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
  'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12',
];

export type NotificationType =
  | 'join_request_received'
  | 'join_request_approved'
  | 'join_request_rejected'
  | 'new_comment'
  | 'assigned_task'
  | 'status_changed'
  | 'deadline_upcoming';

export const NOTIFICATION_ICON_COLOR: Record<NotificationType, string> = {
  join_request_received: '#5663ee',
  join_request_approved: '#16a34a',
  join_request_rejected: '#ef4444',
  new_comment: '#f59e0b',
  assigned_task: '#0ea5e9',
  status_changed: '#8b5cf6',
  deadline_upcoming: '#ef4444',
};

export const NOTIFICATION_BG: Record<NotificationType, string> = {
  join_request_received: '#eef0ff',
  join_request_approved: '#f0fdf4',
  join_request_rejected: '#fef2f2',
  new_comment: '#fffbeb',
  assigned_task: '#f0f9ff',
  status_changed: '#f5f3ff',
  deadline_upcoming: '#fef2f2',
};

export const PROJECT_ACCESS = {
  PRIVATE: 'private' as const,
  PUBLIC: 'public' as const,
} as const;

export type ProjectAccessType = typeof PROJECT_ACCESS[keyof typeof PROJECT_ACCESS];

export const PROJECT_ACCESS_OPTIONS = [
  {
    value: PROJECT_ACCESS.PRIVATE,
    label: 'Riêng tư',
    icon: '🔒',
    description: 'Chỉ admin và thành viên được thêm mới có thể truy cập.',
  },
  {
    value: PROJECT_ACCESS.PUBLIC,
    label: 'Công khai',
    icon: '🌍',
    description: 'Mọi người có thể xem, tạo và chỉnh sửa công việc trong dự án.',
  },
];