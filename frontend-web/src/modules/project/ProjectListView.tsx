import { useContext, useState } from "react";
import { Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useParams } from "react-router-dom";
import { useGetProjectById } from "./api/get-project-id";
import { useGetProjectTaskStatuses } from "../task-status/api/get-project-task-status";
import { useGetTasksByProject } from "../task/api/get-task-by-project";
import { useCreateTask } from "../task/api/add-task";
import { useTaskFilter } from "../task/hook/useTaskFilter";
import { ProjectHeader } from "./component/ProjectHeader";
import { ProjectNav } from "./component/ProjectNav";
import { ProjectToolbar } from "./component/ProjectToolbar";
import AddTaskInline from "../task/component/AddTaskInline";
import styles from "./ProjectListView.module.scss";
import LoadingPage from "../../components/loading/LoadingPage";
import TaskRow from "../task/component/TaskRow";
import { toDateString } from "../../utils/formatDate";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import ArchiveIcon from "@mui/icons-material/Archive";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import { IconButton } from "@mui/material";
import { useTaskActionConfirm } from "../task/hook/useTaskActionConfirm";
import { ToastContext } from "../../components/notification/NotifiProvider";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";

export default function ProjectListView() {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: project, isLoading } = useGetProjectById(projectId!);
  const { data: statusData } = useGetProjectTaskStatuses(projectId!);
  const { data: tasks = [] } = useGetTasksByProject(projectId!);
  const { mutate: createTask } = useCreateTask();

  const statuses = statusData?.data ?? [];
  const projectMembers = project?.project_members || [];

  const { setFilters, filterTasks } = useTaskFilter(tasks);
  const filteredTasks = statuses.flatMap((s) => filterTasks(s.id));

  const [checkedIds, setCheckedIds] = useState<Set<number>>(new Set());
  const [addingTask, setAddingTask] = useState(false);

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
      checkedIds.size === sortedTasks.length
        ? new Set()
        : new Set(sortedTasks.map((t) => t.task_id))
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

  return (
    <div className={styles.wrapper}>
      <ProjectHeader projectName={project?.name} projectId={projectId} />
      <ProjectNav projectId={projectId} />
      <ProjectToolbar
        projectMembers={projectMembers}
        statuses={statuses}
        onFilterChange={setFilters}
        showGroupButton={false}
      />

      {checkedIds.size > 0 && (
        <div className={styles.actionBar}>
          <span className={styles.actionBarCount}>{checkedIds.size} đã chọn</span>
          <span className={styles.actionBarDivider}>|</span>
          <Button
            size="small"
            className={styles.actionBarBtn}
            onClick={() => {
              if (checkedIds.size === filteredTasks.length) {
                setCheckedIds(new Set());
              } else {
                setCheckedIds(new Set(sortedTasks.map((t) => t.task_id)));
              }
            }}
            startIcon={<CheckBoxIcon sx={{ fontSize: 16 }} />}
          >
            {checkedIds.size === sortedTasks.length ? "Bỏ chọn tất cả" : "Chọn tất cả"}
          </Button>

          <span className={styles.actionBarDivider}>|</span>

          <Button
            size="small"
            className={styles.actionBarBtn}
            onClick={() => checkedIds.forEach((id) => confirmArchive(id)) }
            startIcon={<ArchiveIcon sx={{ fontSize: 16 }} />}
          >
            Lưu trữ
          </Button>

          <Button
            size="small"
            className={styles.actionBarBtn}
            onClick={() => checkedIds.forEach((id) => confirmDelete(id))} 
            startIcon={<DeleteIcon sx={{ fontSize: 16 }} />}
          >
            Xóa
          </Button>

          <span className={styles.actionBarDivider}>|</span>

          <IconButton
            size="small"
            className={styles.actionBarBtn}
            onClick={() => setCheckedIds(new Set())}
          >
            <CloseIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </div>
      )}

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead className={styles.thead}>
            <tr>
              <th className={styles.checkCol}>
                <input
                  type="checkbox"
                  checked={checkedIds.size === sortedTasks.length && sortedTasks.length > 0}
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
            {sortedTasks.map((task) => (
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
              {filteredTasks.length} / {tasks.length} nhiệm vụ
            </span>
          </div>
        </div>
      </div>

      {taskActionModals}
    </div>
  );
}