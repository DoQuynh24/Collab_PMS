import { useState } from "react";
import {
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import type { ITask } from "../types";
import { useMoveTask } from "../api/move-task";

export const toSortableId = (taskId: number) => `task-${taskId}`;

const parseTaskId = (id: string | number): number | null => {
  const str = String(id);
  if (str.startsWith("task-")) return Number(str.replace("task-", ""));
  return null;
};

export function useBoardDnd(tasks: ITask[]) {
  const [activeTask, setActiveTask] = useState<ITask | null>(null);
  const { mutate: moveTask } = useMoveTask();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const taskId = parseTaskId(event.active.id);
    if (taskId === null) return;
    const found = tasks.find((t) => t.task_id === taskId);
    if (found) setActiveTask(found);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);
    if (!over || !active) return;

    const draggedTaskId = parseTaskId(active.id);
    if (draggedTaskId === null) return;
    const draggedTask = tasks.find((t) => t.task_id === draggedTaskId);
    if (!draggedTask) return;

    const overTaskId = parseTaskId(over.id);
    const overTask = overTaskId !== null
      ? tasks.find((t) => t.task_id === overTaskId)
      : null;
    const targetStatusId = overTask ? overTask.status_id : Number(over.id);
    if (!targetStatusId) return;

    const columnTasks = tasks
      .filter((t) => t.status_id === targetStatusId && t.task_id !== draggedTask.task_id)
      .sort((a, b) => a.order_index - b.order_index);

    let newOrderIndex = columnTasks.length; 
    if (overTask) {
      const idx = columnTasks.findIndex((t) => t.task_id === overTask.task_id);
      if (idx !== -1) newOrderIndex = idx;
    }

    moveTask({
      task_id: draggedTask.task_id,
      status_id: targetStatusId,
      order_index: newOrderIndex,
    });
  };

  return {
    activeTask,
    sensors,
    collisionDetection: closestCorners,
    handleDragStart,
    handleDragEnd,
  };
}