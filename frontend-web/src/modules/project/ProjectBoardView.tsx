import { useState, useEffect, useContext } from "react";
import {
  Box,
  Typography,
  Stack,
} from "@mui/material";
import { useParams } from "react-router-dom";
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
import { BoardColumn, toColumnSortableId } from "../task/component/BoardColumn";
import { GroupedBoardView } from "./GroupedBoardView";
import { ProjectHeader } from "./component/ProjectHeader";
import { ProjectNav } from "./component/ProjectNav";
import { ProjectToolbar } from "./component/ProjectToolbar";
import { AddStatusColumn } from "../task-status/component/AddStatusColumn";
import { useTaskFilter } from "../task/hook/useTaskFilter";
import { useMoveStatus } from "../task-status/api/move-task-status";
import LoadingPage from "../../components/loading/LoadingPage";
import { ToastContext } from "../../components/notification/NotifiProvider";
import { toDateString } from "../../utils/formatDate";
import { type GroupBy } from "../../constant";
import { type DisplaySettings, DEFAULT_DISPLAY_SETTINGS } from "./component/DisplaySettingsPopover";
import type { ITaskStatus } from "../task-status/types";
import styles from "./ProjectBoardView.module.scss";

export function ProjectBoardView() {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: project, isLoading } = useGetProjectById(projectId!);
  const { data: statusData } = useGetProjectTaskStatuses(projectId!);
  const { data: tasks = [] } = useGetTasksByProject(projectId!);
  const { mutate: createTask } = useCreateTask();
  const { mutate: moveStatus } = useMoveStatus();
  const { showToast } = useContext(ToastContext)!;

  const [localStatuses, setLocalStatuses] = useState<ITaskStatus[]>([]);
  const [openAdd, setOpenAdd] = useState<number | null>(null);
  const [activeColumnId, setActiveColumnId] = useState<number | null>(null);
  const [groupBy, setGroupBy] = useState<GroupBy>('none');

  const [displaySettings, setDisplaySettings] = useState<DisplaySettings>(() => {
    try {
      const saved = localStorage.getItem(`display-settings-${projectId}`);
      return saved ? JSON.parse(saved) : DEFAULT_DISPLAY_SETTINGS;
    } catch {
      return DEFAULT_DISPLAY_SETTINGS;
    }
  });

  const handleDisplaySettingsChange = (s: DisplaySettings) => {
    setDisplaySettings(s);
    localStorage.setItem(`display-settings-${projectId}`, JSON.stringify(s));
  };

  const { setFilters, filterTasks, filteredTasks } = useTaskFilter(tasks);
  useEffect(() => {
    if (statusData?.data)
      setLocalStatuses(statusData.data);
    }, [statusData]);

  const statuses = localStatuses;

  const {
    activeTask,  
    sensors,
    handleDragStart: handleTaskDragStart,
    handleDragEnd: handleTaskDragEnd,
  } = useBoardDnd(tasks);

  if (isLoading) return <LoadingPage />;

  const projectMembers = project?.project_members || [];

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
      />

      <Box sx={{ flex: 1, overflowX: groupBy === 'none' ? "auto" : "hidden", overflowY: "hidden", minHeight: 0, px: 2, pb: 2, scrollbarWidth: "none" }}>
        {groupBy === 'none' ? (
          <DndContext sensors={sensors}
            collisionDetection={activeColumnId ? closestCenter : closestCorners}
            onDragStart={handleDragStart} onDragEnd={handleDragEnd}
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
                    tasks={filterTasks(status.id)}
                    projectMembers={projectMembers}
                    projectId={projectId}
                    isAddOpen={openAdd === status.id}
                    onOpenAdd={() => setOpenAdd(status.id)}
                    onCloseAdd={() => setOpenAdd(null)}
                    onCreateTask={handleCreateTask}
                    displaySettings={displaySettings}
                  />
                )
                )}
                <AddStatusColumn projectId={projectId!} />
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
            tasks={filteredTasks}
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