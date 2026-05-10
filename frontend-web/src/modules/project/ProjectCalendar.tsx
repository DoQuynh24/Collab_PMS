import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Tooltip, Avatar } from '@mui/material';
import { CalendarNav } from '../../components/CalendarNav';import { useGetProjectById } from './api/get-project-id';
import { useGetTasksByProject } from '../task/api/get-task-by-project';
import { useGetProjectTaskStatuses } from '../task-status/api/get-project-task-status';
import { ProjectHeader } from './component/ProjectHeader';
import { ProjectNav } from './component/ProjectNav';
import TaskDetailModal from '../task/TaskDetailModal';
import LoadingPage from '../../components/loading/LoadingPage';
import { PRIORITIES, WEEKDAYS } from '../../constant';
import type { ITask } from '../task/types';
import { FilterModal, type FilterValues } from './component/modal/FilterModal';
import styles from './ProjectCalendar.module.scss';

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export default function ProjectCalendar() {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: project, isLoading } = useGetProjectById(projectId!);
  const { data: tasks = [] } = useGetTasksByProject(projectId!);
  const { data: statusData } = useGetProjectTaskStatuses(projectId!);

  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedTask, setSelectedTask] = useState<ITask | null>(null);
  const [filters, setFilters] = useState<FilterValues>({ assignees: [], priorities: [], statuses: [] });

  if (isLoading) return <LoadingPage />;

  const members = project?.project_members ?? [];

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  };

  const goToday = () => { setCurrentYear(today.getFullYear()); setCurrentMonth(today.getMonth()); };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const tasksByDate: Record<string, ITask[]> = {};
  const filteredTasks = tasks.filter(t => {
    if (filters.assignees.length > 0) {
      const isUnassigned = filters.assignees.includes(-1) && !t.assignee_id;
      const isAssigned = t.assignee_id && filters.assignees.includes(t.assignee_id);
      if (!isUnassigned && !isAssigned) return false;
    }
    if (filters.priorities.length > 0 && !filters.priorities.includes(t.priority_id)) return false;
    if (filters.statuses.length > 0 && !filters.statuses.includes(t.status_id)) return false;
    return true;
  });
  filteredTasks.forEach(task => {
    if (!task.deadline) return;
    const key = task.deadline.slice(0, 10);
    if (!tasksByDate[key]) tasksByDate[key] = [];
    tasksByDate[key].push(task);
  });

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const isToday = (day: number) =>
    day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();

  const dateKey = (day: number) =>
    `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', minWidth: 0 }}>
      <ProjectHeader projectName={project?.name} projectId={projectId} />
      <ProjectNav projectId={projectId} />

      <Box sx={{ flex: 1, overflowY: 'auto', p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <CalendarNav
            year={currentYear}
            month={currentMonth}
            onPrev={prevMonth}
            onNext={nextMonth}
            onToday={goToday}
          />
          <FilterModal
            projectMembers={members}
            statuses={statusData?.data ?? []}
            onFilterChange={setFilters}
          />
        </Box>

        <Box className={styles.grid}>
          {WEEKDAYS.map(d => (
            <Box key={d} className={styles.weekdayHeader}>
              <Typography fontSize={12} fontWeight={600} color="#6b7280">{d}</Typography>
            </Box>
          ))}

          {cells.map((day, idx) => {
            if (!day) return <Box key={`empty-${idx}`} className={styles.emptyCell} />;

            const key = dateKey(day);
            const dayTasks = tasksByDate[key] ?? [];
            const isCurrentDay = isToday(day);
            const isPast = new Date(currentYear, currentMonth, day) < new Date(today.getFullYear(), today.getMonth(), today.getDate());

            return (
              <Box key={key} className={`${styles.dayCell} ${isPast && !isCurrentDay ? styles.pastDay : ''}`}>
                <Box className={styles.dayNumber}>
                  <Box
                    sx={{
                      width: 26, height: 26, borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      bgcolor: isCurrentDay ? '#5663ee' : 'transparent',
                      color: isCurrentDay ? '#fff' : isPast ? '#9ca3af' : '#111827',
                      fontWeight: isCurrentDay ? 700 : 400,
                      fontSize: 13,
                    }}
                  >
                    {day}
                  </Box>
                </Box>

                <Box className={styles.taskList}>
                  {dayTasks.slice(0, 3).map(task => {
                    const priority = PRIORITIES.find(p => p.id === task.priority_id);
                    const assignee = members.find((m: any) => m.user_id === task.assignee_id);
                    return (
                      <Tooltip
                        key={task.task_id}
                        title={`${task.title}`}
                        placement="top"
                      >
                        <Box
                          className={styles.taskChip}
                          onClick={() => setSelectedTask(task)}
                          sx={{
                            borderLeft: `3px solid ${priority?.color ?? '#5663ee'}`,
                            '&:hover': { bgcolor: '#f0f0ff' },
                          }}
                        >
                          <Typography fontSize={11} fontWeight={500} color="#111827" noWrap sx={{ flex: 1 }}>
                            {task.title}
                          </Typography>
                          {assignee && (
                            <Avatar
                              src={(assignee as any).user?.picture}
                              sx={{ width: 16, height: 16, fontSize: 8, flexShrink: 0 }}
                            >
                              {(assignee as any).user?.name?.charAt(0).toUpperCase()}
                            </Avatar>
                          )}
                        </Box>
                      </Tooltip>
                    );
                  })}
                  {dayTasks.length > 3 && (
                    <Typography fontSize={11} color="#6b7280" sx={{ pl: 0.5 }}>
                      +{dayTasks.length - 3} nhiệm vụ
                    </Typography>
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
          <Typography fontSize={12} color="#6b7280">Độ ưu tiên:</Typography>
          {PRIORITIES.map(p => (
            <Box key={p.id} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 3, height: 14, borderRadius: 1, bgcolor: p.color }} />
              <Typography fontSize={12} color="#6b7280">{p.name}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {selectedTask && (
        <TaskDetailModal
          open
          onClose={() => setSelectedTask(null)}
          task={selectedTask}
          projectMembers={members}
          projectId={projectId}
          projectOwnerId={project?.owner_id}
        />
      )}
    </Box>
  );
}
