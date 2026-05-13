import { useState, useMemo, useEffect, useRef } from "react";
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

function useDebounce<T>(value: T, delay = 200): T {
  const [debounced, setDebounced] = useState(value);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setDebounced(value), delay);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [value, delay]);

  return debounced;
}

export function useTaskFilter(tasks: ITask[]) {
  const [filters, setFilters] = useState<FilterValues>(DEFAULT_FILTERS);
  const [searchText, setSearchText] = useState('');

  const debouncedSearch = useDebounce(searchText, 200);

  const filteredTasks = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    return tasks
      .filter((t) => filters.assignees.length === 0 || filters.assignees.includes(t.assignee_id ?? -1))
      .filter((t) => filters.priorities.length === 0 || filters.priorities.includes(t.priority_id))
      .filter((t) => filters.statuses.length === 0 || filters.statuses.includes(t.status_id))
      .filter((t) => !q || t.title.toLowerCase().includes(q) || `task-${t.task_id}`.includes(q));
  }, [tasks, filters, debouncedSearch]);

  const filterTasks = useMemo(() => {
    return (statusId: number) =>
      filteredTasks
        .filter((t) => t.status_id === statusId)
        .sort((a, b) => a.order_index - b.order_index);
  }, [filteredTasks]);

  return { filters, setFilters, filterTasks, filteredTasks, searchText, setSearchText };
}
