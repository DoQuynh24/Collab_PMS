import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Stack,
  TextField,
  Avatar,
  IconButton,
  Button,
  Tooltip,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import TuneIcon from "@mui/icons-material/Tune";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
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
import { ProjectHeader } from "./component/ProjectHeader";
import { ProjectNav } from "./component/ProjectNav";
import { toDateString } from "../../utils/formatDate";
import styles from "./ProjectDetail.module.scss";
import { useMoveStatus } from "../task-status/api/move-task-status";
import type { ITaskStatus } from "../task-status/types";
import { AddStatusColumn } from "../task-status/component/AddStatusColumn";
import { FilterModal } from "./component/FilterModal";
import { useTaskFilter } from "../task/hook/useTaskFilter";
import LoadingPage from "../../components/loading/LoadingPage";

const isColumnId = (id: string | number) => String(id).startsWith("col-");
const parseColumnId = (id: string | number) =>
  Number(String(id).replace("col-", ""));

export function ProjectDetail() {
  const { projectId } = useParams<{ projectId: string }>();

  const { data, isLoading } = useGetProjectById(projectId!);
  const project = data;
  const { data: statusData } = useGetProjectTaskStatuses(projectId!);
  const { data: tasks = [] } = useGetTasksByProject(projectId!);
  const { mutate: createTask } = useCreateTask();
  const { mutate: moveStatus } = useMoveStatus();

  const [localStatuses, setLocalStatuses] = useState<ITaskStatus[]>([]);
  const [openAdd, setOpenAdd] = useState<number | null>(null);
  const [activeColumnId, setActiveColumnId] = useState<number | null>(null);

  const { setFilters, filterTasks } = useTaskFilter(tasks);

  useEffect(() => {
    if (statusData?.data) {
      setLocalStatuses(statusData.data);
    }
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
    });
  };

  const handleDragStart = (event: DragStartEvent) => {
    if (isColumnId(event.active.id)) {
      setActiveColumnId(parseColumnId(event.active.id));
    } else {
      handleTaskDragStart(event);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveColumnId(null);

    if (!over) return;

    if (isColumnId(active.id)) {
      let targetColumnSortableId = String(over.id);

      if (!isColumnId(over.id)) {
        const overTaskId = String(over.id).startsWith("task-")
          ? Number(String(over.id).replace("task-", ""))
          : null;
        if (overTaskId === null) return;
        const overTask = tasks.find((t) => t.task_id === overTaskId);
        if (!overTask) return;
        targetColumnSortableId = toColumnSortableId(overTask.status_id);
      }

      const oldIndex = statuses.findIndex(
        (s) => toColumnSortableId(s.id) === String(active.id)
      );
      const newIndex = statuses.findIndex(
        (s) => toColumnSortableId(s.id) === targetColumnSortableId
      );
      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;

      const reordered = arrayMove(statuses, oldIndex, newIndex);
      setLocalStatuses(reordered);

      if (projectId) {
        moveStatus({
          project_id: projectId,
          ordered_ids: reordered.map((s) => s.id),
        });
      }
      return;
    }

    handleTaskDragEnd(event);
  };
  const activeColumn = activeColumnId
    ? statuses.find((s) => s.id === activeColumnId)
    : null;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden", minWidth: 0 }}>
      <ProjectHeader projectName={project?.name} projectId={projectId} />
      <ProjectNav projectId={projectId} />

      <Box sx={{ flexShrink: 0, px: 2, pt: 2 }}>
        <Stack direction="row" alignItems="center" spacing={2} className={styles.boardHeader}>
          <TextField size="small" placeholder="Tìm kiếm nhiệm vụ" />

          <Stack direction="row" spacing={-1} alignItems="center">
            {project?.project_members?.slice(0, 5).map((member) => (
              <Tooltip key={member.user_id} title={member.user?.name || "Member"}>
                <Avatar
                  src={member.user?.picture}
                  alt={member.user?.name}
                  sx={{ width: 32, height: 32, border: "2px solid white", boxShadow: "0 0 0 1px rgba(0,0,0,0.1)" }}
                >
                  {member.user?.name?.charAt(0).toUpperCase()}
                </Avatar>
              </Tooltip>
            ))}
            {project?.project_members && project.project_members.length > 5 && (
              <Tooltip title={`${project.project_members.length - 5} người khác`}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: "#5663ee", fontSize: "0.875rem", border: "2px solid white" }}>
                  +{project.project_members.length - 5}
                </Avatar>
              </Tooltip>
            )}
          </Stack>

          <FilterModal
            projectMembers={projectMembers}
            onFilterChange={setFilters}
            statuses={statuses}    
          />

          <Box className={styles.rightActions}>
            <Button variant="outlined" size="small" endIcon={<KeyboardArrowDownIcon />} className={styles.groupButton}>
              Nhóm
            </Button>
            <Tooltip title="Tùy chỉnh hiển thị">
              <IconButton className={styles.filterButton}><TuneIcon fontSize="small" /></IconButton>
            </Tooltip>
            <Tooltip title="Tùy chọn">
              <IconButton className={styles.filterButton}><MoreHorizIcon fontSize="small" /></IconButton>
            </Tooltip>
          </Box>
        </Stack>
      </Box>
        
      <Box sx={{ flex: 1,  overflowX: "auto",  overflowY: "hidden", minHeight: 0, px: 2, pb: 2,  scrollbarWidth: "none" }}>
        <DndContext
          sensors={sensors}
          collisionDetection={activeColumnId ? closestCenter : closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={statuses.map((s) => toColumnSortableId(s.id))}
            strategy={horizontalListSortingStrategy}
          >
            <Stack direction="row" spacing={2} className={styles.boardColumns}>
              {statuses.map((status) => {
                const columnTasks = filterTasks(status.id);
                return (
                  <BoardColumn
                    key={status.id}
                    status={status}
                    tasks={columnTasks}
                    projectMembers={projectMembers}
                    projectId={projectId}
                    isAddOpen={openAdd === status.id}
                    onOpenAdd={() => setOpenAdd(status.id)}
                    onCloseAdd={() => setOpenAdd(null)}
                    onCreateTask={handleCreateTask}
                  />
                );
              })}
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
      </Box>
    </Box>
  );
}

export default ProjectDetail;