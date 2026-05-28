import { Box, Typography, Stack, Avatar, Collapse, IconButton } from "@mui/material";
import {
  DndContext, DragOverlay, closestCorners,
  PointerSensor, useSensor, useSensors,
  type DragStartEvent, type DragEndEvent,
} from "@dnd-kit/core";
import { useState } from "react";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import { BoardColumn } from "../task/component/BoardColumn";
import { useMoveTask } from "../task/api/move-task";
import type { ITask } from "../task/types";
import type { ITaskStatus } from "../task-status/types";
import type { GroupBy } from "../../constant";
import { PRIORITIES } from "../../constant";
import styles from "./ProjectBoardView.module.scss";
import type { DisplaySettings } from "./component/DisplaySettingsPopover";

interface ProjectMember {
  user_id: number;
  user?: { name?: string; picture?: string; email?: string };
}

interface Props {
  groupBy: GroupBy;
  tasks: ITask[];
  allTasks: ITask[];
  statuses: ITaskStatus[];
  projectMembers: ProjectMember[];
  projectId?: string;
  onCreateTask: (title: string, statusId: number, priorityId: number, deadline?: Date | null, assigneeId?: number | null) => void;
  displaySettings?: DisplaySettings;
  doneStatusId?: number | null;
}

const toDropId = (groupKey: string, statusId: number) => `grp-${groupKey}-s-${statusId}`;
const parseStatusFromDropId = (id: string): number | null => {
  const m = String(id).match(/^grp-.+-s-(\d+)$/);
  return m ? Number(m[1]) : null;
};

export function GroupedBoardView({ groupBy, tasks, allTasks, statuses, projectMembers, projectId, onCreateTask, displaySettings, doneStatusId }: Props) {
  const [activeTask, setActiveTask] = useState<ITask | null>(null);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const { mutate: moveTask } = useMoveTask();

  const toggleCollapse = (key: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragStart = (event: DragStartEvent) => {
    const str = String(event.active.id);
    if (!str.startsWith('task-')) return;
    const taskId = Number(str.replace('task-', ''));
    const found = allTasks.find(t => t.task_id === taskId);
    if (found) setActiveTask(found);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);
    if (!over || !active) return;

    const draggedTaskId = Number(String(active.id).replace('task-', ''));
    const draggedTask = allTasks.find(t => t.task_id === draggedTaskId);
    if (!draggedTask) return;

    let targetStatusId: number | null = null;

    const overId = String(over.id);
    if (overId.startsWith('grp-')) {
      targetStatusId = parseStatusFromDropId(overId);
    } else if (overId.startsWith('task-')) {
      const overTaskId = Number(overId.replace('task-', ''));
      const overTask = allTasks.find(t => t.task_id === overTaskId);
      if (overTask) targetStatusId = overTask.status_id;
    }

    if (!targetStatusId) return;

    const columnTasks = allTasks
      .filter(t => t.status_id === targetStatusId && t.task_id !== draggedTask.task_id)
      .sort((a, b) => a.order_index - b.order_index);

    moveTask({
      task_id: draggedTask.task_id,
      status_id: targetStatusId,
      order_index: columnTasks.length,
    });
  };

  const groups = groupBy === 'assignee'
    ? [
        ...projectMembers.map(m => ({
          key: String(m.user_id),
          label: m.user?.name ?? '',
          picture: m.user?.picture,
          color: undefined as string | undefined,
          tasks: tasks.filter(t => t.assignee_id === m.user_id),
        })),
        { key: 'unassigned', label: 'Chưa phân công', picture: undefined, color: undefined, tasks: tasks.filter(t => !t.assignee_id) },
      ]
    : PRIORITIES.map(p => ({
        key: String(p.id),
        label: p.name,
        picture: undefined,
        color: p.color,
        tasks: tasks.filter(t => t.priority_id === p.id),
      }));

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <Box sx={{ overflowY: 'auto', height: '100%', pr: 1 }}>
        {groups.filter(g => g.tasks.length > 0).map(group => {
          const isCollapsed = collapsedGroups.has(group.key);
          return (
          <Box key={group.key} sx={{ mb: 2 }}>
            <Box
              onClick={() => toggleCollapse(group.key)}
              sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1, px: 0.5, borderBottom: '2px solid #e5e7eb', mb: 1, cursor: 'pointer', userSelect: 'none', '&:hover': { bgcolor: '#f8fafc' }, borderRadius: '4px' }}
            >
              <IconButton size="small" sx={{ p: 0.3 }}>
                {isCollapsed
                  ? <KeyboardArrowRightIcon fontSize="small" sx={{ color: '#6b7280' }} />
                  : <KeyboardArrowDownIcon fontSize="small" sx={{ color: '#6b7280' }} />
                }
              </IconButton>
              {group.color ? (
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: group.color, flexShrink: 0 }} />
              ) : (
                <Avatar src={group.picture} sx={{ width: 26, height: 26, fontSize: 11 }}>
                  {group.label.charAt(0).toUpperCase()}
                </Avatar>
              )}
              <Typography fontSize={13} fontWeight={600} color="#374151">{group.label}</Typography>
              <Typography fontSize={12} color="#9ca3af" sx={{ bgcolor: '#f3f4f6', px: 1, borderRadius: '10px' }}>
                {group.tasks.length}
              </Typography>
            </Box>

            <Collapse in={!isCollapsed} timeout={200}>
              <Box sx={{ overflowX: 'auto', overflowY: 'hidden', scrollbarWidth: 'none' }}>
                <Stack direction="row" spacing={2} className={styles.boardColumns}>
                  {statuses.map(status => (
                    <BoardColumn
                      key={status.id}
                      status={status}
                      tasks={group.tasks.filter(t => t.status_id === status.id)}
                      projectMembers={projectMembers}
                      projectId={projectId}
                      isAddOpen={false}
                      onOpenAdd={() => {}}
                      onCloseAdd={() => {}}
                      onCreateTask={onCreateTask}
                      droppableId={toDropId(group.key, status.id)}
                      displaySettings={displaySettings}
                      doneStatusId={doneStatusId}
                      alwaysShowAddTask={status.id === statuses[0]?.id}
                    />
                  ))}
                </Stack>
              </Box>
            </Collapse>
          </Box>
        )}
      )}
      </Box>

      <DragOverlay>
        {activeTask && (
          <Box sx={{ background: "#fff", borderRadius: "8px", padding: "12px", boxShadow: "0 8px 24px rgba(0,0,0,0.2)", cursor: "grabbing", minWidth: 200 }}>
            <Typography fontSize={14} fontWeight={500}>{activeTask.title}</Typography>
            <Typography fontSize={13} color="#6b6f76" mt={0.5}>TASK-{activeTask.task_id}</Typography>
          </Box>
        )}
      </DragOverlay>
    </DndContext>
  );
}
