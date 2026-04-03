import { useState } from "react";
import type { ITask } from "../types";

export interface FilterValues {
  assignees: number[];
  priorities: number[];
  statuses: number[];
}

const DEFAULT_FILTERS: FilterValues = {
  assignees: [],
  priorities: [],
  statuses: [],
};

export function useTaskFilter(tasks: ITask[]) {
  const [filters, setFilters] = useState<FilterValues>(DEFAULT_FILTERS);

  const filterTasks = (statusId: number) =>
    tasks
      .filter((t) => t.status_id === statusId)
      .filter((t) => filters.assignees.length === 0 || filters.assignees.includes(t.assignee_id ?? -1))
      .filter((t) => filters.priorities.length === 0 || filters.priorities.includes(t.priority_id))
      .filter((t) => filters.statuses.length === 0 || filters.statuses.includes(t.status_id))
      .sort((a, b) => a.order_index - b.order_index);

  return { filters, setFilters, filterTasks };
}