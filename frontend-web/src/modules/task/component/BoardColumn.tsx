import { Box, Typography } from "@mui/material";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import AddTaskInline from "./AddTaskInline";
import TaskCard from "./TaskCard";
import type { ITask } from "../types";
import { toSortableId } from "../hook/useBoardDnd";
import styles from "../../project/ProjectBoardView.module.scss";
import type { DisplaySettings } from "../../project/component/DisplaySettingsPopover";

interface ProjectMember {
  user_id: number;
  user?: { name?: string; picture?: string; email?: string };
}

interface Props {
  status: { id: number; name: string };
  tasks: ITask[];
  projectMembers: ProjectMember[];
  projectId?: string;
  isAddOpen: boolean;
  onOpenAdd: () => void;
  onCloseAdd: () => void;
  onCreateTask: (
    title: string,
    statusId: number,
    priorityId: number,
    deadline?: Date | null,
    assigneeId?: number | null
  ) => void;
  droppableId?: string | number;
  displaySettings?: DisplaySettings;
  canManage?: boolean;
  doneStatusId?: number | null;
}

export const toColumnSortableId = (statusId: number) => `col-${statusId}`;

export function BoardColumn({
  status,
  tasks,
  projectMembers,
  projectId,
  isAddOpen,
  onOpenAdd,
  onCloseAdd,
  onCreateTask,
  droppableId,
  displaySettings,
  canManage = false,
  doneStatusId,
}: Props) {
  const { setNodeRef: setDropRef, isOver } = useDroppable({ id: droppableId ?? status.id });

  const {
    attributes,
    listeners,
    setNodeRef: setSortRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: toColumnSortableId(status.id), disabled: !canManage });

  const isBacklog = status.name.toLowerCase() === "backlog";

  return (
    <div
      ref={setSortRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        zIndex: isDragging ? 999 : "auto",
      }}
    >
      <div
        ref={setDropRef}
        style={{
          borderRadius: 8,
          transition: "background-color 0.15s ease",
          backgroundColor: isOver ? "rgba(86,99,238,0.05)" : "transparent",
        }}
      >
        <Box className={styles.boardColumn}>
          <Typography className={styles.columnTitle}
            {...(canManage ? { ...attributes, ...listeners } : {})}
            sx={{
              cursor: canManage ? "grab" : "default",
              userSelect: "none",
              ...(canManage && { "&:active": { cursor: "grabbing" } }),
            }}
          >
            {status.name.toUpperCase()}
          </Typography>

          <Box className={styles.taskList}>
            {!isAddOpen && (
              <Box
                className={`${styles.createTask} ${isBacklog ? styles.alwaysShow : ""}`}
                onClick={onOpenAdd}
              >
                + Thêm nhiệm vụ
              </Box>
            )}

            {isAddOpen && (
              <AddTaskInline
                statusId={status.id}
                projectMembers={projectMembers}
                onSubmit={(title, statusId, priorityId, deadline, assigneeId) => {
                  onCreateTask(title, statusId, priorityId, deadline, assigneeId);
                  onCloseAdd();
                }}
                onClose={onCloseAdd}
              />
            )}

            <SortableContext
              items={tasks.map((t) => toSortableId(t.task_id))}
              strategy={verticalListSortingStrategy}
            >
              {tasks.map((task) => (
                <TaskCard
                  key={task.task_id}
                  task={task}
                  projectMembers={projectMembers}
                  projectId={projectId}
                  displaySettings={displaySettings}
                  doneStatusId={doneStatusId}
                />
              ))}
            </SortableContext>
          </Box>
        </Box>
      </div>
    </div>
  );
}