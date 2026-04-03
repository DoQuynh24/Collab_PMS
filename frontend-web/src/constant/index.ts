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

