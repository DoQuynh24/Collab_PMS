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

export type RoleKey = 'admin' | 'member';

export const ROLES: { key: RoleKey; label: string }[] = [
  { key: 'admin', label: 'Quản trị viên' },
  { key: 'member', label: 'Thành viên' },
];

export const getMemberRoleLabel = (userId: number, ownerId?: number, role?: RoleKey): string => {
  if (userId === ownerId) return 'Chủ sở hữu';
  return ROLES.find(r => r.key === role)?.label ?? 'Thành viên';
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