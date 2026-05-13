import { useContext, useState } from "react";
import { Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useParams } from "react-router-dom";
import { useGetProjectById } from "./api/get-project-id";
import { useGetProjectTaskStatuses } from "../task-status/api/get-project-task-status";
import { useGetTasksByProject } from "../task/api/get-task-by-project";
import { useCreateTask } from "../task/api/add-task";
import { useTaskFilter } from "../task/hook/useTaskFilter";
import { useExportTasksCsv } from "../task/hook/useExportTasksCsv";
import { useGetCurrentUser } from "../login/api/auth";
import { ProjectHeader } from "./component/ProjectHeader";
import { ProjectNav } from "./component/ProjectNav";
import { ProjectToolbar } from "./component/ProjectToolbar";
import AddTaskInline from "../task/component/AddTaskInline";
import styles from "./ProjectListView.module.scss";
import LoadingPage from "../../components/loading/LoadingPage";
import TaskRow from "../task/component/TaskRow";
import { toDateString } from "../../utils/formatDate";
import { useTaskActionConfirm } from "../task/hook/useTaskActionConfirm";
import { ToastContext } from "../../components/notification/NotifiProvider";
import { ModalConfirm } from "../../components/modal/modalConfirm";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import TaskActionBar from "./component/modal/ActionBar";

export default function ProjectListView() {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: project, isLoading } = useGetProjectById(projectId!);
  const { data: statusData } = useGetProjectTaskStatuses(projectId!);
  const { data: tasks = [] } = useGetTasksByProject(projectId!);
  const { mutate: createTask } = useCreateTask();

  const statuses = statusData?.data ?? [];
  const projectMembers = project?.project_members || [];

  const { filters, setFilters, filterTasks, searchText, setSearchText } = useTaskFilter(tasks);
  const filteredTasks = statuses.flatMap((s) => filterTasks(s.id));
  const { exportCsv } = useExportTasksCsv();
  const { data: currentUser } = useGetCurrentUser();

  const [checkedIds, setCheckedIds] = useState<Set<number>>(new Set());
  const [addingTask, setAddingTask] = useState(false);
  const [hideCompleted, setHideCompleted] = useState(() =>
    localStorage.getItem(`hide-completed-list-${projectId}`) === 'true'
  );
  const [exportConfirmOpen, setExportConfirmOpen] = useState(false);

  const { confirmArchive, confirmDelete, taskActionModals } = useTaskActionConfirm(() => setCheckedIds(new Set()));

  const { showToast } = useContext(ToastContext)!;

  const [sortField, setSortField] = useState<"title" | "priority" | "status" | "deadline" | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (!sortField) return 0;
    const dir = sortDir === "asc" ? 1 : -1;
    switch (sortField) {
      case "title":
        return (a.task_id - b.task_id) * dir;
      case "priority":
        return ((a.priority_id ?? 99) - (b.priority_id ?? 99)) * dir;
      case "status":
        return ((a.status_id ?? 0) - (b.status_id ?? 0)) * dir;
      case "deadline":
        if (!a.deadline && !b.deadline) return 0;
        if (!a.deadline) return 1 * dir;
        if (!b.deadline) return -1 * dir;
        return (new Date(a.deadline).getTime() - new Date(b.deadline).getTime()) * dir;
      default:
        return 0;
    }
  });

  const toggleCheck = (id: number) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setCheckedIds(
      checkedIds.size === visibleTasks.length
        ? new Set()
        : new Set(visibleTasks.map((t) => t.task_id))
    );
  };

  const handleCreateTask = (
    title: string,
    statusId: number,
    priorityId: number,
    deadline?: Date | null,
    assigneeId?: number | null
  ) => {
    if (!projectId) return;
    createTask({
      project_id: projectId,
      title,
      status_id: statusId,
      priority_id: priorityId,
      deadline: deadline ? toDateString(deadline) : undefined,
      assignee_id: assigneeId ?? undefined,
    }, {
      onSuccess: () => {
        showToast("Đã thêm nhiệm vụ mới", "success");
        setAddingTask(false);
      },
      onError: () => showToast("Thêm nhiệm vụ thất bại", "error"),
      });
  };

  if (isLoading) return <LoadingPage />;

  const defaultStatusId = statuses[0]?.id;
  const doneStatusId = statuses.length > 0 ? statuses[statuses.length - 1].id : null;

  const visibleTasks = hideCompleted && doneStatusId
    ? sortedTasks.filter(t => t.status_id !== doneStatusId)
    : sortedTasks;

  const isFilterActive = filters.assignees.length > 0 || filters.priorities.length > 0 || filters.statuses.length > 0;

  const doExport = () => {
    const exportTasks = hideCompleted && doneStatusId
      ? filteredTasks.filter(t => t.status_id !== doneStatusId)
      : filteredTasks;

    exportCsv({
      tasks: exportTasks,
      statuses,
      projectMembers,
      projectName: project?.name,
      exporterName: currentUser?.name,
      hideCompleted,
      doneStatusId,
    });
  };

  const handleExportCsv = () => {
    if (isFilterActive) {
      setExportConfirmOpen(true);
    } else {
      doExport();
    }
  };

  const handleToggleHideCompleted = () => {
    const next = !hideCompleted;
    setHideCompleted(next);
    localStorage.setItem(`hide-completed-list-${projectId}`, String(next));
  };

  return (
    <div className={styles.wrapper}>
      <ProjectHeader projectName={project?.name} projectId={projectId} />
      <ProjectNav projectId={projectId} />
      <ProjectToolbar
        projectMembers={projectMembers}
        statuses={statuses}
        onFilterChange={setFilters}
        searchText={searchText}
        onSearchChange={setSearchText}
        showGroupButton={false}
        showMoreOptions
        hideCompleted={hideCompleted}
        onToggleHideCompleted={handleToggleHideCompleted}
        onExportCsv={handleExportCsv}
      />

      {checkedIds.size > 0 && (
        <TaskActionBar
          checkedIds={checkedIds}
          totalCount={visibleTasks.length}
          projectId={projectId!}
          projectMembers={projectMembers}
          onSelectAll={() => setCheckedIds(new Set(visibleTasks.map((t) => t.task_id)))}
          onClearAll={() => setCheckedIds(new Set())}
          onArchive={() => checkedIds.forEach((id) => confirmArchive(id))}
          onDelete={() => checkedIds.forEach((id) => confirmDelete(id))}
          tasks={visibleTasks}
        />
      )}

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead className={styles.thead}>
            <tr>
              <th className={styles.checkCol}>
                <input
                  type="checkbox"
                  checked={checkedIds.size === visibleTasks.length && visibleTasks.length > 0}
                  onChange={toggleAll}
                />
              </th>
              <th className={styles.workCol} onClick={() => handleSort("title")}>
                <span className={styles.sortHeader}>
                  Nhiệm vụ
                  {sortField === "title"
                    ? sortDir === "asc" ? <ArrowUpwardIcon className={styles.sortIconActive} /> : <ArrowDownwardIcon className={styles.sortIconActive} />
                    : <UnfoldMoreIcon className={styles.sortIconDefault} />
                  }
                </span>
              </th>
              <th className={styles.assigneeCol}>Người thực hiện</th>
              <th className={styles.priorityCol} onClick={() => handleSort("priority")}>
                <span className={styles.sortHeader}>
                  Ưu tiên
                  {sortField === "priority"
                    ? sortDir === "asc" ? <ArrowUpwardIcon className={styles.sortIconActive} /> : <ArrowDownwardIcon className={styles.sortIconActive} />
                    : <UnfoldMoreIcon className={styles.sortIconDefault} />
                  }
                </span>
              </th>
              <th className={styles.statusCol} onClick={() => handleSort("status")}>
                <span className={styles.sortHeader}>
                  Trạng thái
                  {sortField === "status"
                    ? sortDir === "asc" ? <ArrowUpwardIcon className={styles.sortIconActive} /> : <ArrowDownwardIcon className={styles.sortIconActive} />
                    : <UnfoldMoreIcon className={styles.sortIconDefault} />
                  }
                </span>
              </th>
              <th className={styles.deadlineCol} onClick={() => handleSort("deadline")}>
                <span className={styles.sortHeader}>
                  Hạn hoàn thành
                  {sortField === "deadline"
                    ? sortDir === "asc" ? <ArrowUpwardIcon className={styles.sortIconActive} /> : <ArrowDownwardIcon className={styles.sortIconActive} />
                    : <UnfoldMoreIcon className={styles.sortIconDefault} />
                  }
                </span>
              </th>
            </tr>
          </thead>
          <tbody className={styles.tbody}>
            {visibleTasks.map((task) => (
              <TaskRow
                key={task.task_id}
                task={task}
                statuses={statuses}
                projectMembers={projectMembers}
                projectId={projectId!}
                checked={checkedIds.has(task.task_id)}
                onCheck={toggleCheck}
              />
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ position: "relative" }}>
        {addingTask && defaultStatusId && (
          <div style={{
            position: "absolute",
            bottom: "100%",
            left: 0,
            right: 0,
            padding: "0 16px 8px",
            zIndex: 10,
          }}>
            <AddTaskInline
              statusId={defaultStatusId}
              projectMembers={projectMembers}
              onSubmit={handleCreateTask}
              onClose={() => setAddingTask(false)}
            />
          </div>
        )}

        <div className={styles.footer}>
          <div className={styles.footerActions}>
            <Button
              className={styles.createBtn}
              startIcon={<AddIcon sx={{ fontSize: 16 }} />}
              onClick={() => setAddingTask(true)}
            >
              Tạo nhiệm vụ mới
            </Button>
            <span className={styles.countInfo}>
              {visibleTasks.length} / {tasks.length} nhiệm vụ
            </span>
          </div>
        </div>
      </div>

      {taskActionModals}

      <ModalConfirm
        open={exportConfirmOpen}
        setOpen={setExportConfirmOpen}
        title="Xuất dữ liệu theo bộ lọc"
        message={
          <>
            Bạn đang áp dụng <strong>bộ lọc</strong> — file Excel sẽ chỉ chứa các nhiệm vụ đang được lọc, không phải toàn bộ dự án.
            <br />
            Bạn có muốn tiếp tục xuất không?
          </>
        }
        titleButton="Xuất"
        cancelButtonText="Hủy"
        onClick={doExport}
      />
    </div>
  );
}