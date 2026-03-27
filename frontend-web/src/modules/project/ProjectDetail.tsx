import { useState } from "react";
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
import AddIcon from "@mui/icons-material/Add";
import FilterListIcon from "@mui/icons-material/FilterList";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import TuneIcon from "@mui/icons-material/Tune";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { useParams } from "react-router-dom";
import { DndContext, DragOverlay } from "@dnd-kit/core";
import { useGetProjectById } from "./api/get-project-id";
import { useGetProjectTaskStatuses } from "../task-status/api/get-project-task-status";
import { useGetTasksByProject } from "../task/api/get-task-by-project";
import { useCreateTask } from "../task/api/add-task";
import { BoardColumn } from "../task/component/BoardColumn";
import { ProjectHeader } from "./component/ProjectHeader";
import { ProjectNav } from "./component/ProjectNav";
import { toDateString } from "../../utils/formatDate";
import styles from "./ProjectDetail.module.scss";
import { useBoardDnd } from "../task/component/useBoardDnd";

export function ProjectDetail() {
  const { projectId } = useParams<{ projectId: string }>();

  const { data, isLoading } = useGetProjectById(projectId!);
  const project = data;
  const { data: statusData } = useGetProjectTaskStatuses(projectId!);
  const { data: tasks = [] } = useGetTasksByProject(projectId!);
  const { mutate: createTask } = useCreateTask();
  const statuses = statusData?.data;

  const [openAdd, setOpenAdd] = useState<number | null>(null);

  const {
    activeTask,
    sensors,
    collisionDetection,
    handleDragStart,
    handleDragEnd,
  } = useBoardDnd(tasks);

  if (isLoading) return <Typography>Đang tải...</Typography>;

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

  return (
    <Box>
      <ProjectHeader projectName={project?.name} projectId={projectId} />
      <ProjectNav projectId={projectId} />

      <Box sx={{ p: 2 }}>
        <Stack direction="row" alignItems="center" spacing={2} className={styles.boardHeader}>
          <TextField size="small" placeholder="Tìm kiếm" />

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

          <IconButton className={styles.filterButton}>
            <FilterListIcon />
            <Typography fontSize={14} color="#545454">Bộ lọc</Typography>
          </IconButton>

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

        <DndContext
          sensors={sensors}
          collisionDetection={collisionDetection}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <Stack direction="row" spacing={2} className={styles.boardColumns}>
            {statuses?.map((status) => {
              const columnTasks = tasks
                .filter((t) => t.status_id === status.id)
                .sort((a, b) => a.order_index - b.order_index);

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

            <Box className={styles.addColumn}>
              <AddIcon />
            </Box>
          </Stack>

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
            ) : null}
          </DragOverlay>
        </DndContext>
      </Box>
    </Box>
  );
}

export default ProjectDetail;