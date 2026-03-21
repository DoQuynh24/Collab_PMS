import { useState } from "react";
import {
  Box,
  Typography,
  Stack,
  TextField,
  Avatar,
  IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import FilterListIcon from "@mui/icons-material/FilterList";
import { useParams } from "react-router-dom";
import { useGetProjectById } from "./api/get-project-id";
import styles from "./ProjectDetail.module.scss";
import { useGetProjectTaskStatuses } from "../task-status/api/get-project-task-status";
import AddTaskInline from "../task-status/component/AddTaskInline";
import TaskCard from "../task-status/component/TaskCard";
import { useCreateTask } from "../task/api/add-task";
import { useGetTasksByProject } from "../task/api/get-task-by-project";
import { toDateString } from "../../utils/formatDate";
import { Button } from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import TuneIcon from "@mui/icons-material/Tune";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { Tooltip } from "@mui/material";


export function ProjectDetail() {
  const { projectId } = useParams<{ projectId: string }>();

  const { isLoading } = useGetProjectById(projectId!);
  const { data: statusData } = useGetProjectTaskStatuses(projectId!);
  
  const { data: tasks = [] } = useGetTasksByProject(projectId!);

  const { mutate: createTask } = useCreateTask();

  const statuses = statusData?.data;

  const [openAdd, setOpenAdd] = useState<number | null>(null);

  if (isLoading) return <Typography>Đang tải...</Typography>;

  const handleCreateTask = (title: string, statusId: number,  priorityId: number, deadline?: Date | null) => {
    if (!projectId) return;

    createTask({
      project_id: projectId,
      title,
      status_id: statusId,
      priority_id: priorityId,
      deadline: deadline ? toDateString(deadline) : undefined,
    });
  };

  return (
    <Box >
      <Stack
        direction="row"
        alignItems="center"
        spacing={2}
        className={styles.boardHeader}
      >
        <TextField size="small" placeholder="Tìm kiếm" />
        <Avatar className={styles.avatar} />
        <IconButton className={styles.filterButton}>
          <FilterListIcon />
          <Typography fontSize={14} color="#545454">Bộ lọc</Typography>
        </IconButton>
        <Box className={styles.rightActions}>
          <Button
            variant="outlined"
            size="small"
            endIcon={<KeyboardArrowDownIcon />}
            className={styles.groupButton}
          >
            Nhóm
          </Button>
          <Tooltip title="Tùy chỉnh hiển thị">
            <IconButton className={styles.filterButton}>
              <TuneIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Tùy chọn">
            <IconButton className={styles.filterButton}>
              <MoreHorizIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Stack>

      <Stack direction="row" spacing={2} className={styles.boardColumns}>
        {statuses?.map((status) => {
          const isBacklog =
            status.name.toLowerCase() === "backlog";
            const columnTasks = tasks.filter(
            (task) => task.status_id === status.id
          );

          return (
           <Box key={status.id} className={styles.boardColumn}>
              <Typography className={styles.columnTitle}>
                {status.name.toUpperCase()}
              </Typography>

              <Box className={styles.taskList}>

                {openAdd !== status.id && (
                  <Box
                    className={`${styles.createTask} ${
                      isBacklog ? styles.alwaysShow : ""
                    }`}
                    onClick={() => setOpenAdd(status.id)}
                  >
                    + Thêm nhiệm vụ
                  </Box>
                )}

                {openAdd === status.id && (
                  <AddTaskInline
                    statusId={status.id}
                    onSubmit={(title, statusId, priorityId, deadline) => {
                      handleCreateTask(title, statusId, priorityId, deadline);
                      setOpenAdd(null);
                    }}
                    onClose={() => setOpenAdd(null)}
                  />
                )}

                {columnTasks.map((task) => (
                  <TaskCard
                    key={task.task_id}
                    title={task.title}
                    code={`TASK-${task.task_id}`}
                    priorityId={task.priority_id}
                  />
                ))}
              </Box>
            </Box>
          );
        })}

        <Box className={styles.addColumn}>
          <AddIcon />
        </Box>
      </Stack>
    </Box>
  );
}

export default ProjectDetail;