import { useState, useEffect, useContext } from "react";
import {
  Box,
  Typography,
  Stack,
} from "@mui/material";
import { useParams, useSearchParams } from "react-router-dom";
import {
  closestCenter,
  closestCorners,
  DndContext,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";

import { useGetProjectById } from "./api/get-project-id";
import { useGetProjectTaskStatuses } from "../task-status/api/get-project-task-status";
import { useGetTasksByProject } from "../task/api/get-task-by-project";
import { useCreateTask } from "../task/api/add-task";
import { useBoardDnd } from "../task/hook/useBoardDnd";
import { useTaskFilter } from "../task/hook/useTaskFilter";
import { useExportTasksCsv } from "../task/hook/useExportTasksCsv";
import { useGetCurrentUser } from "../login/api/auth";
import { BoardColumn, toColumnSortableId } from "../task/component/BoardColumn";
import TaskDetailModal from "../task/TaskDetailModal";
import { GroupedBoardView } from "./GroupedBoardView";
import { ProjectHeader } from "./component/ProjectHeader";
import { ProjectNav } from "./component/ProjectNav";
import { ProjectToolbar } from "./component/ProjectToolbar";
import { AddStatusColumn } from "../task-status/component/AddStatusColumn";
import { useMoveStatus } from "../task-status/api/move-task-status";
import LoadingPage from "../../components/loading/LoadingPage";
import { ToastContext } from "../../components/notification/NotifiProvider";
import { toDateString } from "../../utils/formatDate";
import { type GroupBy } from "../../constant";
import { type DisplaySettings, DEFAULT_DISPLAY_SETTINGS } from "./component/DisplaySettingsPopover";
import { ModalConfirm } from "../../components/modal/modalConfirm";
import type { ITaskStatus } from "../task-status/types";
import styles from "./ProjectBoardView.module.scss";

export function ProjectBoardView() {
  const { projectId } = useParams<{ projectId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: project, isLoading } = useGetProjectById(projectId!);
  const { data: currentUser } = useGetCurrentUser();
  const { data: statusData } = useGetProjectTaskStatuses(projectId!);
  const { data: tasks = [] } = useGetTasksByProject(projectId!);
  const { mutate: createTask } = useCreateTask();
  const { mutate: moveStatus } = useMoveStatus();
  const { showToast } = useContext(ToastContext)!;

  const [localStatuses, setLocalStatuses] = useState<ITaskStatus[]>([]);
  const [openAdd, setOpenAdd] = useState<number | null>(null);
  const [activeColumnId, setActiveColumnId] = useState<number | null>(null);
  const [groupBy, setGroupBy] = useState<GroupBy>('none');

  const [hideCompleted, setHideCompleted] = useState(() =>
    localStorage.getItem(`hide-completed-${projectId}`) === 'true'
  );
  const [exportConfirmOpen, setExportConfirmOpen] = useState(false);

  const [displaySettings, setDisplaySettings] = useState<DisplaySettings>(() => {
    try {
      const saved = localStorage.getItem(`display-settings-${projectId}`);
      return saved ? JSON.parse(saved) : DEFAULT_DISPLAY_SETTINGS;
    } catch {
      return DEFAULT_DISPLAY_SETTINGS;
    }
  });

  const { filters, setFilters, filterTasks, filteredTasks } = useTaskFilter(tasks);
  const { exportCsv } = useExportTasksCsv();

  useEffect(() => {
    if (statusData?.data)
      setLocalStatuses(statusData.data);
    }, [statusData]);

  const statuses = localStatuses;

  const urlTaskId = searchParams.get('taskId');
  const taskFromUrl = urlTaskId ? tasks.find(t => t.task_id === Number(urlTaskId)) : null;

  const doneStatusId = statuses.length > 0 ? statuses[statuses.length - 1].id : null;
  const isDoneStatus = (statusId: number) => statusId === doneStatusId;

  const {
    activeTask,
    sensors,
    handleDragStart: handleTaskDragStart,
    handleDragEnd: handleTaskDragEnd,
  } = useBoardDnd(tasks);

  const handleDisplaySettingsChange = (s: DisplaySettings) => {
    setDisplaySettings(s);
    localStorage.setItem(`display-settings-${projectId}`, JSON.stringify(s));
  };

  const handleToggleHideCompleted = () => {
    const next = !hideCompleted;
    setHideCompleted(next);
    localStorage.setItem(`hide-completed-${projectId}`, String(next));
  };

  if (isLoading) return <LoadingPage />;

  const projectMembers = project?.project_members || [];
  const isOwner = project?.owner_id === currentUser?.user_id;
  const isAdmin = projectMembers.some(
    (m: any) => Number(m.user_id) === Number(currentUser?.user_id) && m.role === 'admin'
  );
  const canManage = isOwner || isAdmin;

  const doExport = () => {
    exportCsv({
      tasks: filteredTasks.filter(t => !(hideCompleted && isDoneStatus(t.status_id))),
      statuses,
      projectMembers,
      projectName: project?.name,
      exporterName: currentUser?.name,
      hideCompleted,
      doneStatusId,
    });
  };

  const isFilterActive = filters.assignees.length > 0 || filters.priorities.length > 0 || filters.statuses.length > 0;

  const handleExportCsv = () => {
    if (isFilterActive) {
      setExportConfirmOpen(true);
    } else {
      doExport();
    }
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
    },{ onSuccess: () => {
      showToast("Đã thêm nhiệm vụ mới", "success");
      setOpenAdd(null);
    },
    onError: () => showToast("Thêm nhiệm vụ thất bại", "error"),
  });
  };

  const isColumnId = (id: string | number) => String(id).startsWith("col-");

  const handleDragStart = (event: DragStartEvent) => {
    if (isColumnId(event.active.id)) {
      setActiveColumnId(Number(String(event.active.id).replace("col-", "")));
    } else {
      handleTaskDragStart(event);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveColumnId(null);
    if (!over) return;

    if (isColumnId(active.id)) {
      let targetId = String(over.id);
      if (!isColumnId(over.id)) {
        const overTaskId = String(over.id).startsWith("task-") ? Number(String(over.id).replace("task-", "")) : null;
        if (!overTaskId) return;
        const overTask = tasks.find(t => t.task_id === overTaskId);
        if (!overTask) return;
        targetId = toColumnSortableId(overTask.status_id);
      }
      const oldIdx = statuses.findIndex(s => toColumnSortableId(s.id) === String(active.id));
      const newIdx = statuses.findIndex(s => toColumnSortableId(s.id) === targetId);
      if (oldIdx === -1 || newIdx === -1 || oldIdx === newIdx) return;
      const reordered = arrayMove(statuses, oldIdx, newIdx);
      setLocalStatuses(reordered);
      if (projectId) moveStatus({ project_id: projectId, ordered_ids: reordered.map(s => s.id) });
      return;
    }

    handleTaskDragEnd(event);
  };

  const activeColumn = activeColumnId
    ? statuses.find(s => s.id === activeColumnId)
     : null;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden", minWidth: 0 }}>
      {taskFromUrl && (
        <TaskDetailModal
          key={taskFromUrl.task_id}
          open
          onClose={() => setSearchParams({})}
          task={taskFromUrl}
          projectMembers={projectMembers}
          projectId={projectId}
        />
      )}

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
      <ProjectHeader projectName={project?.name} projectId={projectId} />
      <ProjectNav projectId={projectId} />
      <ProjectToolbar
        projectMembers={projectMembers}
        statuses={statuses}
        onFilterChange={setFilters}
        showGroupButton
        groupBy={groupBy}
        onGroupByChange={setGroupBy}
        showDisplaySettings
        displaySettings={displaySettings}
        onDisplaySettingsChange={handleDisplaySettingsChange}
        showMoreOptions
        hideCompleted={hideCompleted}
        onToggleHideCompleted={handleToggleHideCompleted}
        onExportCsv={handleExportCsv}
      />

      <Box sx={{ flex: 1, overflowX: groupBy === 'none' ? "auto" : "hidden", overflowY: "hidden", minHeight: 0, px: 2, pb: 2, scrollbarWidth: "none" }}>
        {groupBy === 'none' ? (
          <DndContext
            sensors={sensors}
            collisionDetection={activeColumnId ? closestCenter : closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={statuses.map(s => toColumnSortableId(s.id))}
              strategy={horizontalListSortingStrategy}
            >
              <Stack direction="row" spacing={2} className={styles.boardColumns}>
                {statuses.map(status => (
                  <BoardColumn
                    key={status.id}
                    status={status}
                    tasks={filterTasks(status.id).filter(t => !(hideCompleted && isDoneStatus(t.status_id)))}
                    projectMembers={projectMembers}
                    projectId={projectId}
                    isAddOpen={openAdd === status.id}
                    onOpenAdd={() => setOpenAdd(status.id)}
                    onCloseAdd={() => setOpenAdd(null)}
                    onCreateTask={handleCreateTask}
                    displaySettings={displaySettings}
                    canManage={canManage}
                  />
                )
                )}
                {canManage && <AddStatusColumn projectId={projectId!} />}
              </Stack>
            </SortableContext>

            <DragOverlay>
              {activeTask ? (
                <Box sx={{
                  background: "#fff",
                  borderRadius: "8px",
                  padding: "12px",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
                  cursor: "grabbing",
                  minWidth: 200,
                }}>
                  <Typography fontSize={14} fontWeight={500}>{activeTask.title}</Typography>
                  <Typography fontSize={13} color="#6b6f76" mt={0.5}>
                    TASK-{activeTask.task_id}
                  </Typography>
                </Box>
              ) : activeColumn ? (
                <Box sx={{
                  background: "#f4f5f7", borderRadius: "8px", padding: "16px",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.2)", cursor: "grabbing",
                  width: 260, opacity: 0.9,
                }}>
                  <Typography fontSize={13} fontWeight={700} color="#6b6f76">
                    {activeColumn.name.toUpperCase()}
                  </Typography>
                </Box>
              ) : null}
            </DragOverlay>
          </DndContext>
        ) : (
          <GroupedBoardView
            groupBy={groupBy}
            tasks={filteredTasks.filter(t => !(hideCompleted && isDoneStatus(t.status_id)))}
            allTasks={tasks}
            statuses={statuses}
            projectMembers={projectMembers}
            projectId={projectId}
            onCreateTask={handleCreateTask}
            displaySettings={displaySettings}
          />
        )}
      </Box>
    </Box>
  );
}

export default ProjectBoardView;