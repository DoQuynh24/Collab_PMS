import * as XLSXStyle from "xlsx-js-style";
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
  exporterName?: string;
  hideCompleted?: boolean;
  doneStatusId?: number | null;
}

const PRIORITY_LABELS: Record<number, string> = { 1: 'LOW', 2: 'MEDIUM', 3: 'HIGH' };

const toMMDDYYYY = (dateStr?: string): string => {
  if (!dateStr) return 'Không có';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 'Không có';
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${mm}/${dd}/${yyyy}`;
};

const isOverdue = (deadline?: string): boolean => {
  if (!deadline) return false;
  return new Date(deadline) < new Date();
};

const enc = (r: number, c: number) => XLSXStyle.utils.encode_cell({ r, c });

const THIN = { style: 'thin', color: { rgb: 'AAAAAA' } };
const ALL_BORDER = { top: THIN, bottom: THIN, left: THIN, right: THIN };

const s = (extra: object = {}) => ({ border: ALL_BORDER, ...extra });

export function useExportTasksCsv() {
  const exportCsv = ({
    tasks,
    statuses,
    projectMembers,
    projectName,
    exporterName,
    hideCompleted = false,
    doneStatusId = null,
  }: ExportOptions) => {
    let visibleTasks = hideCompleted && doneStatusId
      ? tasks.filter(t => t.status_id !== doneStatusId)
      : [...tasks];

    const statusOrder = statuses.map(s => s.id);
    visibleTasks.sort((a, b) => {
      const ai = statusOrder.indexOf(a.status_id);
      const bi = statusOrder.indexOf(b.status_id);
      if (ai !== bi) return ai - bi;
      return a.order_index - b.order_index;
    });

    const now = new Date();
    const exportDateTime = now.toLocaleString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

    const HEADERS = ['STT', 'TASK-ID', 'Tiêu đề', 'Trạng thái', 'Độ ưu tiên', 'Người thực hiện', 'Hạn hoàn thành', 'Ngày tạo'];
    const COL_WIDTHS = [6, 12, 40, 18, 14, 22, 18, 14];
    const NUM_COLS = HEADERS.length;

    const ws: any = {};
    const merges: any[] = [];
    let r = 0;

    const cell = (row: number, col: number, value: any, style: object = {}) => {
      ws[enc(row, col)] = { v: value, t: typeof value === 'number' ? 'n' : 's', s: style };
    };

    const metaRows: [string, string][] = [
      ['Dự án: ', projectName ?? ''],
      ['Người xuất: ', exporterName ?? ''],
      ['Ngày xuất: ', exportDateTime],
    ];
    for (const [label, value] of metaRows) {
      ws[enc(r, 0)] = { v: label + value, t: 's', s: { font: { sz: 13, italic: true } } };
      for (let c = 1; c < NUM_COLS; c++) ws[enc(r, c)] = { v: '', t: 's', s: {} };
      merges.push({ s: { r, c: 0 }, e: { r, c: NUM_COLS - 1 } });
      r++;
    }    r++;

    const hStyle = s({
      font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 12 },
      fill: { patternType: 'solid', fgColor: { rgb: '5663EE' } },
      alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
    });
    HEADERS.forEach((h, c) => cell(r, c, h, hStyle));
    r++;

    let stt = 1;
    for (const status of statuses) {
      const statusTasks = visibleTasks.filter(t => t.status_id === status.id);
      if (statusTasks.length === 0) continue;

      for (const t of statusTasks) {
        const overdue = isOverdue(t.deadline);
        const base = s({ alignment: { vertical: 'center', wrapText: false } });
        const center = s({ alignment: { horizontal: 'center', vertical: 'center' } });

        cell(r, 0, stt++, center);
        cell(r, 1, `TASK-${t.task_id}`, base);
        cell(r, 2, t.title, base);
        cell(r, 3, status.name.toUpperCase(), base);
        cell(r, 4, PRIORITY_LABELS[t.priority_id] ?? '', base);
        cell(r, 5, projectMembers.find(m => m.user_id === t.assignee_id)?.user?.name ?? 'Không có', base);

        const deadlineStyle = overdue
          ? s({
              fill: { patternType: 'solid', fgColor: { rgb: 'FF0000' } },
              font: { color: { rgb: 'FFFFFF' }, bold: true },
              alignment: { horizontal: 'center', vertical: 'center' },
            })
          : s({ alignment: { horizontal: 'center', vertical: 'center' } });
        cell(r, 6, toMMDDYYYY(t.deadline), deadlineStyle);
        cell(r, 7, toMMDDYYYY(t.created_at), s({ alignment: { horizontal: 'center', vertical: 'center' } }));
        r++;
      }

      const subStyle = s({
        font: { bold: true, italic: true, sz: 11 },
        fill: { patternType: 'solid', fgColor: { rgb: 'EEF0FF' } },
        alignment: { vertical: 'center' },
      });
      cell(r, 0, '', s());
      cell(r, 1, '', s());
      cell(r, 2, `Tổng ${status.name.toUpperCase()}: ${statusTasks.length} nhiệm vụ`, subStyle);
      for (let c = 3; c < NUM_COLS; c++) cell(r, c, '', subStyle);
      merges.push({ s: { r, c: 2 }, e: { r, c: NUM_COLS - 1 } });
      r++;
    }

    r++;

    ws[enc(r, 0)] = { v: 'Chú thích:', t: 's', s: { font: { bold: true, sz: 12 } } };
    for (let c = 1; c < NUM_COLS; c++) ws[enc(r, c)] = { v: '', t: 's', s: {} };
    merges.push({ s: { r, c: 0 }, e: { r, c: NUM_COLS - 1 } });
    r++;

    cell(r, 0, '', {
      fill: { patternType: 'solid', fgColor: { rgb: 'FF0000' } },
      border: ALL_BORDER,
    });
    cell(r, 1, 'Nhiệm vụ quá hạn', { font: { sz: 11 } });
    merges.push({ s: { r, c: 1 }, e: { r, c: 4 } });
    for (let c = 2; c < NUM_COLS; c++) ws[enc(r, c)] = { v: '', t: 's', s: {} };

    ws['!ref'] = XLSXStyle.utils.encode_range({ s: { r: 0, c: 0 }, e: { r, c: NUM_COLS - 1 } });
    ws['!cols'] = COL_WIDTHS.map(w => ({ wch: w }));
    ws['!merges'] = merges;

    const wb = XLSXStyle.utils.book_new();
    XLSXStyle.utils.book_append_sheet(wb, ws, 'Nhiệm vụ');

    const safeProjectName = (projectName ?? 'tasks').replace(/[/\\?%*:|"<>]/g, '-');
    const dateStr = now.toISOString().slice(0, 10);
    XLSXStyle.writeFile(wb, `${safeProjectName}-${dateStr}.xlsx`);
  };

  return { exportCsv };
}
