import * as XLSX from "xlsx";
import type { ITask } from "../types";
import type { ITaskStatus } from "../../task-status/types";

interface ProjectMember {
  user_id: number;
  user?: { name?: string };
}

interface ExportOptions {
  tasks: ITask[];
  statuses: ITaskStatus[];
  projectMembers: ProjectMember[];
  projectName?: string;
  hideCompleted?: boolean;
  doneStatusId?: number | null;
}

const PRIORITY_LABELS: Record<number, string> = { 1: 'LOW', 2: 'MEDIUM', 3: 'HIGH' };

const toMMDDYYYY = (dateStr?: string): string => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${mm}/${dd}/${yyyy}`;
};

const COL_WIDTHS = [12, 40, 16, 12, 20, 16, 12];

export function useExportTasksCsv() {
  const exportCsv = ({
    tasks,
    statuses,
    projectMembers,
    projectName,
    hideCompleted = false,
    doneStatusId = null,
  }: ExportOptions) => {
    const visibleTasks = hideCompleted && doneStatusId
      ? tasks.filter(t => t.status_id !== doneStatusId)
      : tasks;

    const headers = ['ID', 'Tiêu đề', 'Trạng thái', 'Độ ưu tiên', 'Người thực hiện', 'Hạn hoàn thành', 'Ngày tạo'];

    const rows = visibleTasks.map(t => [
      `TASK-${t.task_id}`,
      t.title,
      statuses.find(s => s.id === t.status_id)?.name ?? '',
      PRIORITY_LABELS[t.priority_id] ?? '',
      projectMembers.find(m => m.user_id === t.assignee_id)?.user?.name ?? '',
      toMMDDYYYY(t.deadline),
      toMMDDYYYY(t.created_at),
    ]);

    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

    ws['!cols'] = COL_WIDTHS.map(w => ({ wch: w }));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Nhiệm vụ');

    const fileName = `${projectName ?? 'tasks'}-${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  return { exportCsv };
}
