import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Box, Typography, Tooltip, Avatar, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { CalendarNav } from '../../components/CalendarNav';
import { useGetProjectById } from './api/get-project-id';
import { useGetTasksByProject } from '../task/api/get-task-by-project';
import { useGetProjectTaskStatuses } from '../task-status/api/get-project-task-status';
import { ProjectHeader } from './component/ProjectHeader';
import { ProjectNav } from './component/ProjectNav';
import TaskDetailModal from '../task/TaskDetailModal';
import LoadingPage from '../../components/loading/LoadingPage';
import { PRIORITIES, WEEKDAYS } from '../../constant';
import type { ITask } from '../task/types';
import { FilterModal, type FilterValues } from './component/modal/FilterModal';
import { CreateMeetingModal } from '../meeting/component/CreateMeetingModal';
import { MeetingDetailPopover } from '../meeting/component/MeetingDetailPopover';
import { useGetCurrentUser } from '../login/api/auth';
import { useVideoCall } from '../video/context/VideoCallContext';
import { useStartCall } from '../video/api/start-call';
import styles from './ProjectCalendar.module.scss';
import type { MeetingSchedule } from '../meeting/types/index';
import { useGetMeetings } from '../meeting/api/get-meetings';

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export default function ProjectCalendar() {
  const { projectId } = useParams<{ projectId: string }>();
  const [searchParams] = useSearchParams();
  const meetingIdFromUrl = searchParams.get('meetingId');
  const { data: project, isLoading } = useGetProjectById(projectId!);
  const { data: tasks = [] } = useGetTasksByProject(projectId!);
  const { data: statusData } = useGetProjectTaskStatuses(projectId!);
  const { data: meetings = [] } = useGetMeetings(projectId!);
  const { data: currentUser } = useGetCurrentUser();
  const { setActiveCall } = useVideoCall();
  const { mutate: startCall } = useStartCall();

  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedTask, setSelectedTask] = useState<ITask | null>(null);
  const [filters, setFilters] = useState<FilterValues>({ assignees: [], priorities: [], statuses: [] });
  const [openCreateMeeting, setOpenCreateMeeting] = useState(false);
  const [meetingPopover, setMeetingPopover] = useState<{ meeting: MeetingSchedule; anchor: HTMLElement } | null>(null);

  const members = project?.project_members ?? [];

  useEffect(() => {
    if (!meetingIdFromUrl || meetings.length === 0) return;
    const targetMeeting = meetings.find((m) => m.id === Number(meetingIdFromUrl));
    if (!targetMeeting) return;
    const fakeAnchor = document.createElement('div');
    fakeAnchor.style.position = 'fixed';
    fakeAnchor.style.top = '50%';
    fakeAnchor.style.left = '50%';
    document.body.appendChild(fakeAnchor);
    setMeetingPopover({ meeting: targetMeeting, anchor: fakeAnchor });
    const meetingDate = new Date(targetMeeting.start_time);
    setCurrentYear(meetingDate.getFullYear());
    setCurrentMonth(meetingDate.getMonth());
    return () => { document.body.removeChild(fakeAnchor); };
  }, [meetingIdFromUrl, meetings]);

  const memberMap: Record<number, { name: string; picture?: string }> = {};
  members.forEach((m: any) => {
    if (m.user) memberMap[m.user_id] = { name: m.user.name, picture: m.user.picture };
  });

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

  const meetingsByDate: Record<string, MeetingSchedule[]> = {};
  meetings.forEach(m => {
    const key = new Date(m.start_time).toISOString().slice(0, 10);
    if (!meetingsByDate[key]) meetingsByDate[key] = [];
    meetingsByDate[key].push(m);
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

  const handleStartMeetingCall = (meeting: MeetingSchedule) => {
    if (!currentUser) return;
    startCall(
      { project_id: projectId!, meeting_id: meeting.id },
      {
        onSuccess: (data) => setActiveCall({
          ...data,
          channelName: data.channelName,
          userName: currentUser.name,
          memberMap,
          isHost: true,
          projectId: projectId!,
        }),
      },
    );
  };

  if (isLoading) return <LoadingPage />;

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
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined" size="small" startIcon={<AddIcon />}
              onClick={() => setOpenCreateMeeting(true)}
              sx={{ textTransform: 'none', borderColor: '#5663ee', color: '#5663ee', '&:hover': { bgcolor: '#eef0ff' } }}
            >
              Đặt lịch họp
            </Button>
            <FilterModal
              projectMembers={members}
              statuses={statusData?.data ?? []}
              onFilterChange={setFilters}
            />
          </Box>
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
            const dayMeetings = meetingsByDate[key] ?? [];
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
                  {dayMeetings.map(meeting => {
                    const startTime = new Date(meeting.start_time);
                    const isNow = startTime <= new Date();
                    const isCancelled = meeting.status === 'cancelled';
                    const isCompleted = meeting.status === 'completed';
                    const chipBg = isCancelled ? '#fef2f2' : isCompleted ? '#f3f4f6' : isNow ? '#f0fdf4' : '#eef0ff';
                    const chipBorder = isCancelled ? '#fca5a5' : isCompleted ? '#d1d5db' : isNow ? '#86efac' : '#c7d2fe';
                    const dotColor = isCancelled ? '#ef4444' : isCompleted ? '#9ca3af' : isNow ? '#16a34a' : '#5663ee';
                    const textColor = isCancelled ? '#dc2626' : isCompleted ? '#6b7280' : isNow ? '#15803d' : '#4338ca';
                    const statusLabel = isCancelled ? '❌ Đã hủy' : isCompleted ? '✓ Đã kết thúc' : isNow ? '🟢 Đang diễn ra' : '';
                    const tooltipTitle = `📅 ${meeting.title} — ${startTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}${statusLabel ? ` (${statusLabel})` : ''}`;
                    return (
                      <Tooltip key={`m-${meeting.id}`} title={tooltipTitle} placement="top">
                        <Box
                          onClick={(e) => setMeetingPopover({ meeting, anchor: e.currentTarget })}
                          sx={{
                            display: 'flex', alignItems: 'center', gap: 0.5,
                            px: 0.8, py: 0.3, borderRadius: '4px', cursor: 'pointer',
                            bgcolor: chipBg, border: `1px solid ${chipBorder}`,
                            '&:hover': { opacity: 0.85 }, mb: 0.3,
                            textDecoration: isCancelled ? 'line-through' : 'none',
                            opacity: isCancelled || isCompleted ? 0.75 : 1,
                          }}
                        >
                          <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: dotColor, flexShrink: 0 }} />
                          <Typography fontSize={11} fontWeight={500} color={textColor} noWrap sx={{ flex: 1 }}>
                            {startTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} {meeting.title}
                          </Typography>
                        </Box>
                      </Tooltip>
                    );
                  })}

                  {dayTasks.slice(0, 3).map(task => {
                    const priority = PRIORITIES.find(p => p.id === task.priority_id);
                    const assignee = members.find((m: any) => m.user_id === task.assignee_id);
                    return (
                      <Tooltip key={task.task_id} title={task.title} placement="top">
                        <Box
                          className={styles.taskChip}
                          onClick={() => setSelectedTask(task)}
                          sx={{ borderLeft: `3px solid ${priority?.color ?? '#5663ee'}`, '&:hover': { bgcolor: '#f0f0ff' } }}
                        >
                          <Typography fontSize={11} fontWeight={500} color="#111827" noWrap sx={{ flex: 1 }}>
                            {task.title}
                          </Typography>
                          {assignee && (
                            <Avatar src={(assignee as any).user?.picture} sx={{ width: 16, height: 16, fontSize: 8, flexShrink: 0 }}>
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

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mt: 2, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#5663ee' }} />
            <Typography fontSize={12} color="#6b7280">Lịch họp</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#16a34a' }} />
            <Typography fontSize={12} color="#6b7280">Đang diễn ra</Typography>
          </Box>
          <Typography fontSize={12} color="#6b7280">Độ ưu tiên:</Typography>
          {PRIORITIES.map(p => (
            <Box key={p.id} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 3, height: 14, borderRadius: 1, bgcolor: p.color }} />
              <Typography fontSize={12} color="#6b7280">{p.name}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      <CreateMeetingModal
        open={openCreateMeeting}
        onClose={() => setOpenCreateMeeting(false)}
        projectId={projectId!}
        projectMembers={members}
        ownerId={project?.owner_id}
      />

      <MeetingDetailPopover
        meeting={meetingPopover?.meeting ?? null}
        anchorEl={meetingPopover?.anchor ?? null}
        onClose={() => setMeetingPopover(null)}
        currentUserId={currentUser?.user_id}
        projectId={projectId!}
        onStartCall={handleStartMeetingCall}
      />

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
